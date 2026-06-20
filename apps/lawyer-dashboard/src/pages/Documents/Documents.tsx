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
import thunkGetAiPointBalance from'../../redux/subscription/thunk/thunkGetAiPointBalance';

import * as pdfjsLib from'pdfjs-dist';
import JSZip from'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
 'pdfjs-dist/build/pdf.worker.min.mjs',
 import.meta.url,
).toString();

const MAX_FILE_SIZE_MB = 800;
const MAX_PDF_PAGES = 1000;
const MAX_TOTAL_FILES = 90;
const DOCUMENT_ACCEPT = '.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif';

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
 phase:'idle' |'preparing' |'uploading' |'extracting' |'processing';
 completed: number;
 total: number;
 label: string;
 detail?: string;
 percent?: number;
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

const prepareImageForOcrUpload = (file: File, maxDimension = 2200, quality = 0.86): Promise<File> => {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => {
 const image = new Image();
 image.onload = () => {
 const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
 const canvas = document.createElement('canvas');
 canvas.width = Math.max(1, Math.round(image.width * scale));
 canvas.height = Math.max(1, Math.round(image.height * scale));
 const context = canvas.getContext('2d');
 if (!context) {
 reject(new Error('تعذّر تجهيز الصورة قبل الرفع.'));
 return;
 }

 context.drawImage(image, 0, 0, canvas.width, canvas.height);
 canvas.toBlob((blob) => {
 if (!blob) {
 reject(new Error('تعذّر تحويل الصورة إلى صيغة JPEG مدعومة.'));
 return;
 }

 const baseName = file.name.replace(/\.[^.]+$/,'') ||'ocr-image';
 resolve(new File([blob], `${baseName}.jpg`, {
 type:'image/jpeg',
 lastModified: file.lastModified,
 }));
 },'image/jpeg', quality);
 };
 image.onerror = () => {
 const canUploadOriginal = ['image/jpeg','image/png','image/webp'].includes(file.type);
 if (canUploadOriginal) {
 resolve(file);
 return;
 }
 reject(new Error('صيغة الصورة غير مدعومة. من فضلك ارفع الصورة بصيغة JPG أو PNG.'));
 };
 image.src = reader.result as string;
 };
 reader.onerror = () => reject(new Error('تعذّر قراءة الصورة قبل الرفع.'));
 reader.readAsDataURL(file);
 });
};

const formatFileSize = (bytes?: number) => {
 if (!bytes) return '';
 const megabytes = bytes / (1024 * 1024);
 return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} م.ب`;
};

const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

const isPdfFile = (file: File) =>
 file.type ==='application/pdf' || getExtension(file.name) ==='pdf';

const isWordFile = (file: File) =>
 file.type ==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 || getExtension(file.name) ==='docx';

const isSupportedImageFile = (file: File) => {
 const extension = getExtension(file.name);
 return file.type.startsWith('image/') || ['jpg','jpeg','png','webp','heic','heif'].includes(extension);
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
  const { aiPointBalance, error: subscriptionError } = useAppSelector((state) => state.subscription);

 const documentInputRef = useRef<HTMLInputElement | null>(null);
 const imageInputRef = useRef<HTMLInputElement | null>(null);
 const abortControllerRef = useRef<AbortController | null>(null);
 const [results, setResults] = useState<TResult[]>([]);
 const [processingStatus, setProcessingStatus] = useState<TProcessingStatus>({
 phase:'idle',
 completed: 0,
 total: 0,
 label:'',
 detail:'',
 percent: undefined,
 });

 const handleCancelProcessing = useCallback(() => {
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 abortControllerRef.current = null;
 }
  setProcessingStatus({ phase: 'idle', completed: 0, total: 0, label: '', detail: '', percent: undefined });
  sileo.error({ title: '🛑 تم إلغاء المعالجة' });
  }, []);

  const validateOcrAccess = useCallback(async (): Promise<boolean> => {
    if (subscriptionError) {
      sileo.error({ title: subscriptionError });
      return false;
    }

    if (aiPointBalance) {
      if (aiPointBalance.subscriptionActive === false) {
        sileo.error({
          title: "لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي. يرجى تجديد الاشتراك لتتمكن من استخدام ميزة استخراج النصوص (OCR)."
        });
        return false;
      }
      if (aiPointBalance.available < 1) {
        sileo.error({
          title: "رصيد نقاط الذكاء الاصطناعي الخاص بك غير كافٍ لاستخراج النصوص. يرجى شحن الرصيد أولاً."
        });
        return false;
      }
      return true;
    }

    try {
      const balance = await dispatch(thunkGetAiPointBalance()).unwrap();
      if (balance.subscriptionActive === false) {
        sileo.error({
          title: "لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي. يرجى تجديد الاشتراك لتتمكن من استخدام ميزة استخراج النصوص (OCR)."
        });
        return false;
      }
      if (balance.available < 1) {
        sileo.error({
          title: "رصيد نقاط الذكاء الاصطناعي الخاص بك غير كافٍ لاستخراج النصوص. يرجى شحن الرصيد أولاً."
        });
        return false;
      }
      return true;
    } catch (err: unknown) {
      const errMsg = (err as { message?: string })?.message || String(err) || "لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي.";
      sileo.error({ title: errMsg });
      return false;
    }
  }, [dispatch, aiPointBalance, subscriptionError]);

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

  const hasOcrFiles = selectedFiles.some(f => isPdfFile(f) || isSupportedImageFile(f));
  if (hasOcrFiles) {
    const hasAccess = await validateOcrAccess();
    if (!hasAccess) {
      e.target.value = "";
      return;
    }
  }

 window.scrollTo({ top: 0, behavior: 'smooth' });

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
	 detail:'نقرأ ملف PDF ونحوّله إلى صفحات قابلة لاستخراج النص.',
	 percent: undefined,
	 });

 const extractedImages = await convertPdfToImages(file, (completedPages, totalPages) => {
	 setProcessingStatus({
	 phase:'preparing',
	 completed: completedPages,
	 total: totalPages,
	 label: `جاري تجهيز PDF: تم تجهيز ${completedPages} من ${totalPages} صفحة`,
	 detail:'هذه المرحلة تتم على جهازك قبل تحميل الصفحات للخادم.',
	 percent: Math.round((completedPages / totalPages) * 100),
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
 sileo.error({
 title:'تعذّر قراءة ملف PDF',
 description: `الملف «${file.name}» غير صالح أو محمي بكلمة مرور. جرّب فتحه وحفظ نسخة PDF جديدة ثم ارفعه مرة أخرى.`,
 duration: 8000,
 });
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
 sileo.error({
 title:'تعذّر قراءة ملف Word',
 description: `لم نتمكن من قراءة «${file.name}». تأكد أنه ملف DOCX سليم ثم حاول مرة أخرى.`,
 duration: 8000,
 });
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
	 detail:'',
	 percent: undefined,
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
	 detail:'نرتب الملفات قبل بدء التحميل.',
	 percent: undefined,
	 });

	 const accumulated: TResult[] = [...results];
 const wordFiles = selectedFiles.filter((preparedFile) => preparedFile.sourceType ==='word');
 const ocrFiles = selectedFiles.filter((preparedFile) => preparedFile.sourceType !=='word');

 for (const [index, preparedFile] of wordFiles.entries()) {
 if (controller.signal.aborted) break;
 const { file } = preparedFile;

 try {
 accumulated.push({
 file,
 imageUrl:'',
 text: preparedFile.extractedText ||'',
 fileType:'word',
 fileName: file.name,
 });
 } catch (errorMessage) {
 if (controller.signal.aborted) break;
 sileo.error({ title: `حدث خطأ أثناء معالجة الملف: ${file.name}\n ${errorMessage}` });
 accumulated.push({
 file,
 imageUrl:'',
 text:"— حدث خطأ أثناء استخراج النص —",
 fileType:'word',
 fileName: file.name,
 });
 }

 setResults([...accumulated]);
 const completed = index + 1;
	 setProcessingStatus({
	 phase:'processing',
	 completed,
	 total: selectedFiles.length,
	 label: `جاري قراءة ملفات Word: تم إنجاز ${completed} من ${selectedFiles.length} ملف`,
	 detail:'ملفات Word لا تحتاج OCR، يتم قراءة النص مباشرة.',
	 percent: Math.round((completed / selectedFiles.length) * 100),
	 });
 }

	 if (!controller.signal.aborted && ocrFiles.length > 0) {
	 const completedWords = wordFiles.length;
	 setProcessingStatus({
	 phase:'uploading',
	 completed: completedWords,
	 total: selectedFiles.length,
	 label:'جاري تحميل الملف',
	 detail: `يتم تحميل ${ocrFiles.length} صورة/صفحة للخادم. بعد التحميل سيبدأ استخراج النصوص تلقائيًا.`,
	 percent: 0,
	 });

 try {
 const previewPromises = ocrFiles.map(({ file }) => file.type.startsWith("image/") ? fileToPreviewDataUrl(file) : Promise.resolve(''));
 const uploadFilePromises = ocrFiles.map(async (preparedFile) => {
 const { file } = preparedFile;
 if (!file.type.startsWith("image/")) return file;
 return prepareImageForOcrUpload(file);
 });
	 const [pageTexts, previewUrls] = await Promise.all([
	 Promise.all(uploadFilePromises).then((uploadFiles) => dispatch(thunkOcrExtract({
	 files: uploadFiles,
	 signal: controller.signal,
	 onUploadProgress: ({ loaded, total, percent }) => {
	 setProcessingStatus({
	 phase:'uploading',
	 completed: completedWords,
	 total: selectedFiles.length,
	 label: percent !== undefined ? `جاري تحميل الملف: ${percent}%` :'جاري تحميل الملف',
	 detail: total
	 ? `تم تحميل ${formatFileSize(loaded)} من ${formatFileSize(total)}. بعد اكتمال التحميل سيبدأ استخراج النصوص.`
	 :'يتم تحميل الملف للخادم. بعد اكتمال التحميل سيبدأ استخراج النصوص.',
	 percent,
	 });
	 if (percent !== undefined && percent >= 100) {
	 setProcessingStatus({
	 phase:'extracting',
	 completed: completedWords,
	 total: selectedFiles.length,
	 label:'تم تحميل الملف، جاري استخراج النصوص',
	 detail:'الخادم يعالج صفحات المستند الآن. قد يستغرق ذلك ثواني إضافية حسب عدد الصفحات.',
	 percent: undefined,
	 });
	 }
	 },
	 })).unwrap()),
	 Promise.all(previewPromises),
	 ]);

 if (!controller.signal.aborted) {
 ocrFiles.forEach((preparedFile, index) => {
 const { file, sourceType, pageNumber, totalPages } = preparedFile;
 const isImage = file.type.startsWith("image/");
 accumulated.push({
 file,
 imageUrl: isImage ? previewUrls[index] ||'' :'',
 text: pageTexts[index] ||"",
 fileType: sourceType ==='pdf' ?"pdf-page" :"image",
 pageNumber,
 totalPages,
 fileName: file.name,
 });
 });
 setResults([...accumulated]);
	 setProcessingStatus({
	 phase:'extracting',
	 completed: selectedFiles.length,
	 total: selectedFiles.length,
	 label: `تم استخراج النصوص من ${ocrFiles.length} صورة/صفحة بنقطة OCR واحدة`,
	 detail:'يمكنك مراجعة النص أو بدء تحليل المستند.',
	 percent: 100,
	 });
 }
 } catch (errorMessage) {
  if (!controller.signal.aborted) {
  const isQuotaOrSubscriptionError = typeof errorMessage === 'string' &&
    (errorMessage.includes('اشتراك') || errorMessage.includes('نقاط') || errorMessage.includes('رصيد'));

  sileo.error({
    title: isQuotaOrSubscriptionError
      ? errorMessage
      : `حدث خطأ أثناء استخراج النصوص\n ${errorMessage}`
  });
 const errorResults = await Promise.all(ocrFiles.map(async (preparedFile) => {
 const { file, sourceType, pageNumber, totalPages } = preparedFile;
 let errorImageUrl ='';
 if (file.type.startsWith("image/")) {
 try { errorImageUrl = await fileToPreviewDataUrl(file); } catch { /* swallow */ }
 }
 return {
 file,
 imageUrl: errorImageUrl,
 text:"— حدث خطأ أثناء استخراج النص —",
 fileType: sourceType ==='pdf' ?"pdf-page" :"image",
 pageNumber,
 totalPages,
 fileName: file.name,
 } satisfies TResult;
 }));
 accumulated.push(...errorResults);
 setResults([...accumulated]);
 }
 }
 }

 // If cancelled, don't override the cancel handler's cleanup
 if (controller.signal.aborted) return;

 abortControllerRef.current = null;
	 setProcessingStatus({ phase:'idle', completed: 0, total: 0, label:'', detail:'', percent: undefined });

 // حفظ النتائج في Redux للاستعادة عند العودة للصفحة
 dispatch(setOcrResults(accumulated.map(r => ({
 fileName: r.fileName || r.file?.name ||'',
 text: r.text,
 fileType: r.fileType,
 pageNumber: r.pageNumber,
 totalPages: r.totalPages,
 imageUrl: r.imageUrl,
 }))));
 dispatch(thunkGetAiPointBalance());

 sileo.success({ title:"تم استخراج النصوص بنجاح" });
 };

 const getAllText = async () => {
 const ocrText = results.map((r) => r.text).join('\n');
 const allText = [ocrText, manualText].filter(t => t.trim()).join('\n\n---\n\n');
 if (!allText.trim()) {
 sileo.error({ title:"لا يوجد نص لتحليله — أرفع مستنداً أو أضف نصاً يدوياً" });
 return;
 }
 await dispatch(thunkGenerateCase({ revisedText: allText, availableCaseTypes: caseType })).unwrap()
 .then(() => {
 dispatch(thunkGetAiPointBalance());
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

	 const isBusy = processingStatus.phase !=='idle';
	 const progressPercent = processingStatus.percent
	 ?? (processingStatus.total > 0 ? Math.round((processingStatus.completed / processingStatus.total) * 100) : undefined);

 return (
 <section className='documents'>
 <Container>
 <HeadTitle title='إدارة المستندات' />

 <input
 type="file"
 ref={documentInputRef}
 style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }}
 accept={DOCUMENT_ACCEPT}
 multiple
 onChange={handleFileChange}
 aria-label="اختيار ملفات PDF أو Word"
 />
 <input
 type="file"
 ref={imageInputRef}
 style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }}
 accept={IMAGE_ACCEPT}
 multiple
 onChange={handleFileChange}
 aria-label="اختيار صور المستندات"
 />

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
	 {isBusy && (
	 <div className="documents-progress" role="status" aria-live="polite">
	 <div className="documents-progress__head">
	 <span className="documents-progress__phase">
	 {processingStatus.phase ==='preparing' ?'تجهيز الملف' : processingStatus.phase ==='uploading' ?'تحميل الملف' :'استخراج النصوص'}
	 </span>
	 {progressPercent !== undefined && (
	 <span className="documents-progress__percent">{Math.min(100, progressPercent)}%</span>
	 )}
	 </div>
	 <p className="documents-progress__title">{processingStatus.label}</p>
	 {processingStatus.detail && (
	 <p className="documents-progress__detail">{processingStatus.detail}</p>
	 )}
	 {progressPercent !== undefined && (
	 <div className="documents-progress__track" aria-hidden="true">
	 <span style={{ width: `${Math.min(100, progressPercent)}%` }} />
	 </div>
	 )}
	 <button type="button" className="documents-progress__cancel" onClick={handleCancelProcessing}>
	 إلغاء العملية
	 </button>
	 </div>
	 )}
	 {results.length === 0 && !isBusy && (
	 <div className="documents-box mt-4">
  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-5 w-full max-w-3xl px-4 justify-center md:justify-start">
  <div className="icon">
  <FiUpload />
  </div>
  <div className="text">
  <h3>ارفع مستند القضية وسنحوّله إلى قضية ذكية</h3>
  <p>ارفع صورة أو ملف PDF أو Word لأي مستند قانوني (صحيفة دعوى، حكم، محضر…)</p>
	  <p style={{ marginTop:'4px', fontSize:'0.8rem' }}>سيقوم النظام تلقائيًا باستخراج النص من المستند بنقطة OCR واحدة لكل دفعة رفع، ثم يمكنك تحليله بالذكاء الاصطناعي بنقطة إضافية وإنشاء قضية جديدة من محتواه مباشرةً.</p>
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
		 )}
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
 text={loading ==="pending" ?"جارٍ الإنشاء..." :"تحليل النص وإنشاء قضية جديدة (نقطة AI)"}
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
 text={loading ==="pending" ?"جارٍ الإنشاء..." : processingStatus.phase !=='idle' ?"في انتظار استخراج النصوص..." :"تحليل المستند تفصيلياً وإنشاء قضية جديدة (نقطة AI)"}
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

	 <div className="documents-add-more">
	 <p>تحتاج تضيف مستند آخر؟</p>
	 <div className="documents-add-more__actions">
	 <CustomButton
	 type='button'
	 text='إضافة PDF أو Word'
	 size='lg'
	 radius='md'
	 color='primary'
	 variant='bordered'
	 startContent={<FiUpload />}
	 onClick={handleDocumentClick}
	 isDisabled={isBusy}
	 />
	 <CustomButton
	 type='button'
	 text='إضافة صورة'
	 size='lg'
	 radius='md'
	 color='primary'
	 variant='bordered'
	 startContent={<FiUpload />}
	 onClick={handleImageClick}
	 isDisabled={isBusy}
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
