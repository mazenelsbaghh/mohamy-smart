import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, Container } from'@mohamy/shared-ui';
import'./Documents.css';
import HeadTitle from'../../components/headTitle/HeadTitle';


import { FiUpload } from'react-icons/fi';
import { BsFileEarmarkText, BsStars } from'react-icons/bs';
import { useEffect, useRef, useState, useCallback } from'react';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import thunkOcrExtract from'../../redux/ocr/thunk/thunkOcrExtract';
import { setOcrResults, setManualText, clearOcrSession } from'../../redux/ocr/ocrSlice';

import { sileo } from"sileo";
import { Skeleton, useDisclosure } from'@heroui/react';
import FormModal from'../../components/ui/form/FormModal';
import AddNewCaseFromOCRForm from'../../components/forms/AddNewCaseFromOCRForm';
import thunkGenerateCase from'../../redux/ocr/thunk/thunkGenerateCase';
import { IoMdAdd } from'react-icons/io';
import { MdOutlineClear } from'react-icons/md';
import thunkGetAllCaseType from'../../redux/caseType/thunk/thunkGetAllCaseType';

import * as pdfjsLib from'pdfjs-dist';
import JSZip from'jszip';

// Use CDN to ensure the worker loads correctly in production without Vite bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const MAX_FILE_SIZE_MB = 800;
const MAX_PDF_PAGES = 1000;
const MAX_TOTAL_FILES = 90;
const DOCUMENT_ACCEPT = '.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

type TPreparedProcessingFile = {
 file: File;
 sourceType:'image' |'pdf' |'word';
 pageNumber?: number;
 totalPages?: number;
 extractedText?: string;
};

type TResult = {
 file: File | null;
 imageUrl: string;
 text: string;
 fileType:'image' |'pdf' |'pdf-page' |'word';
 pageNumber?: number;
 totalPages?: number;
 fileName?: string;
};

type TProcessingStatus = {
 phase:'idle' |'preparing' |'processing';
 completed: number;
 total: number;
 label: string;
};

const fileToPreviewDataUrl = (file: File, maxWidth = 900): Promise<string> => {
 return new Promise((resolve) => {
 const reader = new FileReader();
 reader.onload = () => {
 const image = new Image();
 image.onload = () => {
 const scale = Math.min(1, maxWidth / image.width);
 const canvas = document.createElement('canvas');
 canvas.width = Math.max(1, Math.round(image.width * scale));
 canvas.height = Math.max(1, Math.round(image.height * scale));
 const context = canvas.getContext('2d');
 if (!context) {
 resolve(reader.result as string);
 return;
 }
 context.drawImage(image, 0, 0, canvas.width, canvas.height);
 resolve(canvas.toDataURL('image/jpeg', 0.76));
 };
 image.onerror = () => resolve(reader.result as string);
 image.src = reader.result as string;
 };
 reader.onerror = () => resolve('');
 reader.readAsDataURL(file);
 });
};

const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

const isPdfFile = (file: File) =>
 file.type ==='application/pdf' || getExtension(file.name) ==='pdf';

const isWordFile = (file: File) =>
 file.type ==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 || getExtension(file.name) ==='docx';

const isSupportedImageFile = (file: File) => {
 const extension = getExtension(file.name);
 return file.type.startsWith('image/') || ['jpg','jpeg','png','webp'].includes(extension);
};

const normalizeSupportedFile = (file: File): File => {
 if (isPdfFile(file) && file.type !=='application/pdf') {
 return new File([file], file.name ||'document.pdf', { type:'application/pdf', lastModified: file.lastModified });
 }

 if (!file.type && isSupportedImageFile(file)) {
 const extension = getExtension(file.name);
 const mimeType = extension ==='jpg' ?'image/jpeg' : `image/${extension}`;
 return new File([file], file.name, { type: mimeType, lastModified: file.lastModified });
 }

 return file;
};

const extractTextFromDocx = async (file: File): Promise<string> => {
 const zip = await JSZip.loadAsync(await file.arrayBuffer());
 const documentXml = await zip.file('word/document.xml')?.async('text');
 if (!documentXml) throw new Error('لا يمكن قراءة محتوى ملف Word.');

 const xml = new DOMParser().parseFromString(documentXml,'application/xml');
 const paragraphs = Array.from(xml.getElementsByTagName('w:p'));
 const lines = paragraphs.map((paragraph) => {
 return Array.from(paragraph.getElementsByTagName('w:t'))
 .map((node) => node.textContent ??'')
 .join('');
 }).map((line) => line.trim()).filter(Boolean);

 return lines.join('\n');
};

const Documents = () => {

 const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  usePageTitle('المستندات');

 const dispatch = useAppDispatch();
 const { caseType } = useAppSelector((state) => state.caseType);
 const { loading, ocrResults: persistedResults, manualText } = useAppSelector((state) => state.ocr);

 const documentInputRef = useRef<HTMLInputElement | null>(null);
 const imageInputRef = useRef<HTMLInputElement | null>(null);
 const processingToastIdRef = useRef<string | undefined>(undefined);
 const abortControllerRef = useRef<AbortController | null>(null);
 const [results, setResults] = useState<TResult[]>([]);
 const [processingStatus, setProcessingStatus] = useState<TProcessingStatus>({
 phase:'idle',
 completed: 0,
 total: 0,
 label:'',
 });

 const handleCancelProcessing = useCallback(() => {
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 abortControllerRef.current = null;
 }
 setProcessingStatus({ phase:'idle', completed: 0, total: 0, label:'' });
 if (processingToastIdRef.current) {
 sileo.dismiss(processingToastIdRef.current);
 processingToastIdRef.current = undefined;
 }
 sileo.error({ title:'🛑 تم إلغاء المعالجة' });
 }, []);

 const handleDocumentClick = () => {
 documentInputRef.current?.click();
 };

 const handleImageClick = () => {
 imageInputRef.current?.click();
 };
 const convertPdfToImages = async (
 pdfFile: File,
 onProgress?: (completedPages: number, totalPages: number) => void
 ): Promise<File[]> => {
 const arrayBuffer = await pdfFile.arrayBuffer();
 const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
 const numPages = Math.min(pdf.numPages, MAX_PDF_PAGES);
 if (pdf.numPages > MAX_PDF_PAGES) {
 sileo.error({ title: `ملف PDF يحتوي على ${pdf.numPages} صفحة. سيتم معالجة أول ${MAX_PDF_PAGES} صفحة فقط.` });
 }
 const imageFiles: File[] = [];

 for (let i = 1; i <= numPages; i++) {
 const page = await pdf.getPage(i);
 const viewport = page.getViewport({ scale: 2.0 });
 const canvas = document.createElement('canvas');
 const context = canvas.getContext('2d');
 canvas.height = viewport.height;
 canvas.width = viewport.width;

 await page.render({ canvasContext: context!, viewport: viewport } as Parameters<typeof page.render>[0]).promise;

 const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve,'image/png'));
 if (blob) {
 const fileName = `${pdfFile.name.replace(/\.pdf$/i,'')}_page_${i}.png`;
 const file = new File([blob], fileName, { type:'image/png' });
 imageFiles.push(file);
 }

 onProgress?.(i, numPages);
 }

 return imageFiles;
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

 const selectedFiles = e.target.files ? Array.from(e.target.files).map(normalizeSupportedFile) : [];

 if (selectedFiles.length === 0) return;

 if (selectedFiles.length > MAX_TOTAL_FILES) {
 sileo.error({ title: `الحد الأقصى ${MAX_TOTAL_FILES} ملفات في المرة الواحدة` });
 return;
 }

 const oversized = selectedFiles.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
 if (oversized) {
 sileo.error({ title: `الملف"${oversized.name}" يتجاوز الحد الأقصى (${MAX_FILE_SIZE_MB} ميجابايت)` });
 return;
 }

 let allFilesToProcess: TPreparedProcessingFile[] = [];

 for (const file of selectedFiles) {
 if (isPdfFile(file)) {
 try {
 setProcessingStatus({
 phase:'preparing',
 completed: 0,
 total: 0,
 label: `جاري تجهيز صفحات ${file.name}...`,
 });

 const extractedImages = await convertPdfToImages(file, (completedPages, totalPages) => {
 setProcessingStatus({
 phase:'preparing',
 completed: completedPages,
 total: totalPages,
 label: `جاري تجهيز PDF: تم تجهيز ${completedPages} من ${totalPages} صفحة`,
 });
 });

 allFilesToProcess = [
 ...allFilesToProcess,
 ...extractedImages.map((preparedFile, index) => ({
 file: preparedFile,
 sourceType:'pdf' as const,
 pageNumber: index + 1,
 totalPages: extractedImages.length,
 })),
 ];
 } catch {
 sileo.error({ title:"تعذّر قراءة الملف: " + file.name + ". تأكد أن الملف بصيغة PDF صحيحة." });
 }
 } else if (isSupportedImageFile(file)) {
 allFilesToProcess.push({
 file,
 sourceType:'image',
 });
 } else if (isWordFile(file)) {
 try {
 const extractedText = await extractTextFromDocx(file);
 allFilesToProcess.push({
 file,
 sourceType:'word',
 extractedText,
 });
 } catch {
 sileo.error({ title:"تعذّر قراءة ملف Word: " + file.name + ". تأكد أن الملف بصيغة DOCX." });
 }
 } else {
 sileo.error({ title:"يدعم النظام الصور وملفات PDF و Word بصيغة DOCX فقط: JPG, PNG, WEBP, PDF, DOCX" });
 }
 }

 if (allFilesToProcess.length === 0) {
 setProcessingStatus({
 phase:'idle',
 completed: 0,
 total: 0,
 label:'',
 });
 e.target.value ="";
 return;
 }

 await handleUpload(allFilesToProcess);
 e.target.value ="";
 };
 const handleUpload = async (selectedFiles: TPreparedProcessingFile[]) => {
 // Create a new AbortController for this processing session
 const controller = new AbortController();
 abortControllerRef.current = controller;

 setProcessingStatus({
 phase:'processing',
 completed: 0,
 total: selectedFiles.length,
 label: `جاري معالجة الملفات: تم إنجاز 0 من ${selectedFiles.length}`,
 });

 const accumulated: TResult[] = [];

 for (const [index, preparedFile] of selectedFiles.entries()) {
 // Check if processing was cancelled
 if (controller.signal.aborted) break;

 const { file, sourceType, pageNumber, totalPages } = preparedFile;
 const isImage = file.type.startsWith("image/");

 try {
 if (sourceType ==='word') {
 accumulated.push({
 file,
 imageUrl:'',
 text: preparedFile.extractedText ||'',
 fileType:'word',
 fileName: file.name,
 });
 } else {
 const ocrPromise = dispatch(thunkOcrExtract(file)).unwrap();
 const dataUrlPromise = isImage ? fileToPreviewDataUrl(file) : Promise.resolve('');

 const [pageTexts, dataUrl] = await Promise.all([ocrPromise, dataUrlPromise]);

 if (controller.signal.aborted) break;

 if (isImage) {
 accumulated.push({
 file,
 imageUrl: dataUrl,
 text: pageTexts[0] ||"",
 fileType: sourceType ==='pdf' ?"pdf-page" :"image",
 pageNumber,
 totalPages,
 fileName: file.name,
 });
 } else {
 pageTexts.forEach((text, pageIdx) => {
 accumulated.push({
 file,
 imageUrl:"",
 text: text ||"",
 fileType:"pdf-page",
 pageNumber: pageNumber ?? pageIdx + 1,
 totalPages: totalPages ?? pageTexts.length,
 fileName: file.name,
 });
 });
 }
 }
 } catch (errorMessage) {
 if (controller.signal.aborted) break;
 sileo.error({ title: `حدث خطأ أثناء معالجة الملف: ${file.name}\n ${errorMessage}` });
 let errorImageUrl ='';
 if (isImage) {
 try { errorImageUrl = await fileToPreviewDataUrl(file); } catch { /* swallow */ }
 }
 accumulated.push({
 file,
 imageUrl: errorImageUrl,
 text:"— حدث خطأ أثناء استخراج النص —",
 fileType: sourceType ==='word' ?"word" : isImage ?"image" :"pdf",
 fileName: file.name,
 });
 }

 setResults([...accumulated]);
 const completed = index + 1;
 setProcessingStatus({
 phase:'processing',
 completed,
 total: selectedFiles.length,
 label: sourceType ==='pdf'
 ? `جاري معالجة PDF: تم إنجاز ${completed} من ${selectedFiles.length} صفحة`
 : sourceType ==='word'
 ? `جاري قراءة ملفات Word: تم إنجاز ${completed} من ${selectedFiles.length} ملف`
 : `جاري معالجة الصور: تم إنجاز ${completed} من ${selectedFiles.length} صورة`,
 });
 }

 // If cancelled, don't override the cancel handler's cleanup
 if (controller.signal.aborted) return;

 abortControllerRef.current = null;
 setProcessingStatus({ phase:'idle', completed: 0, total: 0, label:'' });

 // حفظ النتائج في Redux للاستعادة عند العودة للصفحة
 dispatch(setOcrResults(accumulated.map(r => ({
 fileName: r.fileName || r.file?.name ||'',
 text: r.text,
 fileType: r.fileType,
 pageNumber: r.pageNumber,
 totalPages: r.totalPages,
 imageUrl: r.imageUrl,
 }))));

 sileo.success({ title:"تم استخراج النصوص بنجاح" });
 };

 const { generatedCase } = useAppSelector((state) => state.ocr);

 const getAllText = async () => {
 const ocrText = results.map((r) => r.text).join('\n');
 const allText = [ocrText, manualText].filter(t => t.trim()).join('\n\n---\n\n');
 if (!allText.trim()) {
 sileo.error({ title:"لا يوجد نص لتحليله — أرفع مستنداً أو أضف نصاً يدوياً" });
 return;
 }
 // لو عندنا generated case خلاص → افتح الـ modal بس
 if (generatedCase) {
 onOpen();
 return;
 }
 // لو مفيش → كلم الباك
 await dispatch(thunkGenerateCase({ revisedText: allText, availableCaseTypes: caseType })).unwrap()
 .then(() => {
 onOpen();
 }).catch((err) => {
 sileo.error({ title: err });
 });
 };

 const handleClearSession = () => {
 dispatch(clearOcrSession());
 setResults([]);
 };

 // استعادة النتائج المحفوظة عند العودة للصفحة
 useEffect(() => {
 if (persistedResults.length > 0 && results.length === 0) {
 setResults(persistedResults.map(r => ({
 file: null,
 imageUrl: r.imageUrl ||'',
 text: r.text,
 fileType: r.fileType,
 pageNumber: r.pageNumber,
 totalPages: r.totalPages,
 fileName: r.fileName,
 })));
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 useEffect(() => {
 dispatch(thunkGetAllCaseType());
 }, [dispatch]);

 useEffect(() => {
 if (processingStatus.phase ==='idle' || !processingStatus.label) {
 if (processingToastIdRef.current) {
 sileo.dismiss(processingToastIdRef.current);
 processingToastIdRef.current = undefined;
 }
 return;
 }

 processingToastIdRef.current = sileo.show({
 title: `${processingStatus.label ||''}`,
 description:'اضغط هنا لإلغاء العملية',
 type:'loading',
 duration: null,
 position:'top-center',
 onClick: () => handleCancelProcessing(),
 } as Parameters<typeof sileo.show>[0]);
 }, [processingStatus, handleCancelProcessing]);

 return (
 <section className='documents'>
 <Container>
 <HeadTitle title='إدارة المستندات' />

 <div className="flex flex-wrap justify-center items-center">
 <div className="w-full flex justify-end">
 <div className="w-full sm:w-6/12 md:w-4/12 lg:max-w-3/12">
 <CustomButton
 type='button'
 text='إضافة قضية جديدة'
 size='md'
 radius='full'
 variant='solid'
 color='primary'
 endContent={<IoMdAdd />}
 onClick={onOpen}
 fullWidth
 />
	 </div>

	 </div>
 <div className="documents-box mt-4">
 <input
 type="file"
 ref={documentInputRef}
 accept={DOCUMENT_ACCEPT}
 multiple
 onChange={handleFileChange}
 aria-label="اختيار ملفات PDF أو Word"
 />
 <input
 type="file"
 ref={imageInputRef}
 accept={IMAGE_ACCEPT}
 multiple
 onChange={handleFileChange}
 aria-label="اختيار صور المستندات"
 />
  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-5 w-full max-w-3xl px-4 justify-center md:justify-start">
  <div className="icon">
  <FiUpload />
  </div>
  <div className="text">
  <h3>ارفع مستند القضية وسنحوّله إلى قضية ذكية</h3>
  <p>ارفع صورة أو ملف PDF أو Word لأي مستند قانوني (صحيفة دعوى، حكم، محضر…)</p>
  <p style={{ marginTop:'4px', fontSize:'0.8rem' }}>سيقوم النظام تلقائيًا باستخراج النص من المستند، ثم يمكنك تحليله بالذكاء الاصطناعي وإنشاء قضية جديدة من محتواه مباشرةً.</p>
  <p style={{ marginTop:'4px', fontSize:'0.8rem', opacity: 0.7 }}>الصيغ المدعومة: JPG، PNG، WEBP، PDF، DOCX</p>
  </div>
  </div>
 <div className="btn mt-10 w-full flex flex-col sm:flex-row justify-center gap-3 px-4">
 <CustomButton
 type='button'
 text='اختر PDF أو Word'
 size='lg'
 radius='md'
 color='primary'
 startContent={<FiUpload />}
 onClick={handleDocumentClick}
 />
 <CustomButton
 type='button'
 text='اختر صورة'
 size='lg'
 radius='md'
 color='primary'
 variant='bordered'
 startContent={<FiUpload />}
 onClick={handleImageClick}
 />
 </div>
 </div>
 </div>

 {/* نص يدوي إضافي */}
 <div className="mt-6">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-sm font-semibold text-[var(--main-color)]">نص إضافي</span>
 <span className="text-xs app-text-muted">(اختياري — يُضاف للتحليل مع نصوص المستندات)</span>
 </div>
 <textarea
 value={manualText}
 onChange={(e) => dispatch(setManualText(e.target.value))}
 placeholder="أضف أي معلومات أو ملاحظات إضافية تريد تضمينها في التحليل..."
 dir="rtl"
 rows={4}
 className="w-full rounded-xl border app-border app-surface p-3 text-sm leading-relaxed resize-y focus:outline-none focus:border-[var(--main-color)] transition-colors text-[var(--title-color)]"
 />
 </div>

 {/* زر التحليل لما يكون في نص يدوي بدون صور */}
 {results.length === 0 && manualText.trim() && (
 <div className="mt-4 flex flex-col items-center gap-2">
 <div className="w-full sm:w-6/12 lg:w-4/12">
 <CustomButton
 type='button'
 text={loading ==="pending" ?"جارٍ الإنشاء..." :"تحليل النص وإنشاء قضية جديدة"}
 size="lg"
 radius="md"
 color="primary"
 onClick={() => getAllText()}
 isDisabled={loading ==="pending" || processingStatus.phase !=='idle'}
 startContent={<BsStars />}
 fullWidth
 />
 </div>
 {processingStatus.phase !=='idle' && (
 <p className="text-xs app-text-muted">في انتظار اكتمال استخراج النصوص…</p>
 )}
 </div>
 )}

 {/* Results */}
 {results.length > 0 && (
 <div className="mt-8 space-y-8">
 {results.map((item, idx) => (
 <div
 key={idx}
 className="document flex-col md:flex-row"
 >
 {item.fileType ==='image' && item.imageUrl ? (
 <img
 src={item.imageUrl}
 alt={item.fileName || item.file?.name || ''}
 className="w-full md:w-1/2"
 />
 ) : item.fileType ==='pdf-page' && item.imageUrl ? (
 <img
 src={item.imageUrl}
 alt={item.fileName || item.file?.name || `صفحة ${item.pageNumber || idx + 1}`}
 className="w-full md:w-1/2"
 />
 ) : item.fileType ==='pdf-page' ? (
 <div className='w-full md:w-1/2 flex justify-center items-center'>
 <div className="pdf-page-indicator">
 <BsFileEarmarkText />
 <span>صفحة {item.pageNumber} من {item.totalPages}</span>
 </div>
 </div>
 ) : item.fileType ==='word' ? (
 <div className='w-full md:w-1/2 flex justify-center items-center'>
 <div className="pdf-page-indicator">
 <BsFileEarmarkText />
 <span>{item.fileName ||'ملف Word'}</span>
 </div>
 </div>
 ) : (
 <div className='w-full md:w-1/2 flex justify-center items-center'>
 <BsFileEarmarkText className="doc-file-icon" />
 </div>
 )}
 <div className='extracted-text w-full md:w-1/2 h-[80vh]'>
 {!item.text && item.text !=="" ? (
 <Skeleton className="rounded-lg h-full">
 <div className="h-full rounded-lg bg-default-300" />
 </Skeleton>
 ) : (
 <textarea
 value={item.text}
 onChange={(e) => {
 const updatedResults = [...results];
 updatedResults[idx].text = e.target.value;
 setResults(updatedResults);
 dispatch(setOcrResults(updatedResults.map(r => ({
 fileName: r.fileName || r.file?.name ||'',
 text: r.text,
 fileType: r.fileType,
 pageNumber: r.pageNumber,
 totalPages: r.totalPages,
 imageUrl: r.imageUrl,
 }))));
 }}
 className="h-full"
 />
 )}
 </div>
 </div>
 ))}

 <div className="flex justify-center gap-3 flex-wrap">
 <div className="w-full sm:w-6/12 lg:w-4/12">
 <CustomButton
 type='button'
 text={loading ==="pending" ?"جارٍ الإنشاء..." : processingStatus.phase !=='idle' ?"في انتظار استخراج النصوص..." :"تحليل المستند تفصيلياً وإنشاء قضية جديدة"}
 size="lg"
 radius="md"
 color="primary"
 onClick={() => getAllText()}
 isDisabled={loading ==="pending" || processingStatus.phase !=='idle'}
 startContent={<BsStars />}
 fullWidth
 />
 </div>
 <div>
 <CustomButton
 type='button'
 text="مسح النتائج"
 size="lg"
 radius="md"
 color="danger"
 variant="solid"
 onClick={handleClearSession}
 startContent={<MdOutlineClear />}
 />
 </div>
 </div>
 </div>
 )}

 <FormModal isOpen={isOpen} onOpenChange={onOpenChange} title='إضافة قضية جديد' size='2xl' >
 <AddNewCaseFromOCRForm onClose={onClose} />
 </FormModal>
 </Container>
 </section >
 );
};

export default Documents;
