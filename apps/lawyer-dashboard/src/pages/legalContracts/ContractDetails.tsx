import React, { useEffect } from'react';
import { useParams, useNavigate } from'react-router-dom';
import { useDispatch, useSelector } from'react-redux';
import type { AppDispatch, RootState } from'../../redux/store';
import { fetchContractDetails, clearCurrentContract } from'../../redux/legalContracts/legalContractsSlice';
import { Card, CardBody, Button, Skeleton } from'@heroui/react';
import { motion } from'framer-motion';
import { FiArrowRight, FiCopy, FiPrinter } from'react-icons/fi';
import { sileo } from"sileo";

type ContractSection = {
 title: string;
 lines: string[];
};

const normalizeSectionTitle = (title: string) => title.replace(/_/g,' ').trim();
const CONTRACT_MARKER_TITLES = new Set([
 'عنوان العقد',
 'افتتاحية وأطراف',
 'البند التمهيدي',
 'بنود العقد',
 'التوقيعات',
]);

const isClauseHeading = (value: string) =>
 /^(?:البند\s+(?:التمهيدي|الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|الحادي عشر|الثاني عشر|الثالث عشر|الرابع عشر|الخامس عشر|السادس عشر|السابع عشر|الثامن عشر|التاسع عشر|العشرون|الحادي والعشرون|الثاني والعشرون|الثالث والعشرون|الرابع والعشرون|الخامس والعشرون))$/.test(value.trim());

const parseContractSections = (content: string): ContractSection[] => {
 const sections: ContractSection[] = [];
 let current: ContractSection | null = null;

 content.split(/\r?\n/).forEach((rawLine) => {
 const line = rawLine.trim();
 const match = line.match(/^===\s*(.+?)\s*===$/);
 if (match) {
 if (current) sections.push(current);
 current = { title: normalizeSectionTitle(match[1]), lines: [] };
 return;
 }
 if (!current) {
 current = { title:'العقد', lines: [] };
 }
 current.lines.push(rawLine);
 });

 if (current) sections.push(current);
 return sections.filter(section => section.title || section.lines.some(line => line.trim()));
};

const renderContractLine = (line: string, index: number) => {
 const trimmed = line.trim();
 if (!trimmed) return null;
 const isClause = isClauseHeading(trimmed);
 const isSignature = /^(?:الطرف|الاسـ|الاسم|التوقيـ|التوقيع|الرقم القومي|الشاهد|الشهـ|الشهود)/.test(trimmed);
 return (
 <p
 key={`${trimmed}-${index}`}
 className={[
 'whitespace-pre-wrap text-[1.32rem] font-bold leading-[2.15] text-black print:text-black md:text-[1.45rem]',
 isClause ?'mt-4 text-center underline underline-offset-4 leading-10' :'text-justify',
 isSignature ?'text-center leading-[1.9]' :'',
 ].filter(Boolean).join(' ')}
 >
 {trimmed}
 </p>
 );
};

const ContractDetails: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const dispatch = useDispatch<AppDispatch>();

 const { currentContract, isFetchingDetail, error } = useSelector((state: RootState) => state.legalContracts);

 useEffect(() => {
 if (id) {
 dispatch(fetchContractDetails(id));
 }
 return () => {
 dispatch(clearCurrentContract());
 };
 }, [id, dispatch]);

 const handleCopy = async () => {
 if (currentContract?.generatedContent) {
 try {
 await navigator.clipboard.writeText(currentContract.generatedContent);
 sileo.success({ title:'تم نسخ النص بنجاح' });
 } catch {
 sileo.error({ title:'فشل نسخ النص' });
 }
 }
 };

 const handlePrint = () => {
 window.print();
 };

 if (isFetchingDetail && !currentContract) {
 return (
 <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
 <Skeleton className="h-12 w-1/3 rounded-lg" />
 <Card>
 <CardBody className="space-y-4">
 <Skeleton className="h-6 w-1/4 rounded-lg" />
 <Skeleton className="h-4 w-full rounded-lg" />
 <Skeleton className="h-4 w-5/6 rounded-lg" />
 <Skeleton className="h-4 w-full rounded-lg" />
 <Skeleton className="h-4 w-3/4 rounded-lg" />
 </CardBody>
 </Card>
 </div>
 );
 }

 const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
 const isStuck = currentContract?.status ==='DraftingRequested' && 
 (Date.now() - new Date(currentContract.createdAtUtc).getTime() > STUCK_THRESHOLD_MS);

 if (error || !currentContract || currentContract.status ==='Failed' || isStuck) {
 return (
 <div className="w-full flex flex-col items-center justify-center p-12 text-center">
 <div className="text-[var(--danger-color)] mb-4 text-6xl">⚠️</div>
 <h2 className="text-2xl font-bold mb-2">
 {currentContract?.status ==='Failed' || isStuck ?'فشل في توليد العقد' :'تعذر تحميل العقد'}
 </h2>
 <p className="app-text-subtle mb-6 max-w-md mx-auto">
 {isStuck 
 ?'استغرق توليد هذا العقد وقتاً أطول من المتوقع (انتهت المهلة). قد يكون ذلك بسبب ضغط على خوادم الذكاء الاصطناعي أو لأن تفاصيل العقد معقدة جداً.' 
 : (error ||'لم يتم العثور على العقد المطلوب أو فشلت صياغته.')}
 </p>
 <div className="flex gap-3">
 <Button variant="flat" onPress={() => navigate('/legal-contracts')}>
 العودة لقائمة العقود
 </Button>
 <Button color="primary" onPress={() => navigate('/legal-contracts/new')}>
 محاولة إنشاء عقد جديد
 </Button>
 </div>
 </div>
 );
 }

 const sections = parseContractSections(currentContract.generatedContent);

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="w-full max-w-5xl mx-auto p-4 md:p-6"
 >
 {/* Header Actions */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
 <div className="flex items-center gap-3">
 <Button 
 isIconOnly 
 variant="light" 
 onPress={() => navigate('/legal-contracts')}
 aria-label="العودة"
 >
 <FiArrowRight size={20} />
 </Button>
 <div>
 <h1 className="text-2xl font-bold text-[var(--title-color)]">
 {currentContract.contractTypeName}
 </h1>
 <p className="text-sm app-text-subtle">
 الموكل: {currentContract.clientName} | تاريخ الإنشاء: {new Date(currentContract.createdAtUtc).toLocaleDateString('ar-EG')}
 </p>
 </div>
 </div>

 <div className="flex gap-2">
 <Button variant="flat" startContent={<FiCopy />} onPress={handleCopy}>
 نسخ النص
 </Button>
 <Button color="primary" startContent={<FiPrinter />} onPress={handlePrint}>
 طباعة
 </Button>
 </div>
 </div>

 {/* Main Document Body */}
 <Card className="print:shadow-none print:border-none shadow-sm border app-border dark:border-zinc-800">
 <CardBody className="p-0">
 <article
 className="contract-print-surface bg-[color-mix(in_srgb,var(--bg-color)_50%,white)] px-5 py-6 dark:bg-zinc-950 print:bg-white md:px-10 md:py-10"
 dir="rtl"
 >
 <style>{`
 @media print {
   @page { size: A4; margin: 12mm 18mm 14mm; }
   body { background: white !important; }
   .contract-print-footer { position: fixed; bottom: 5mm; left: 18mm; right: 18mm; display: flex !important; justify-content: space-between; font-family: "Traditional Arabic", Arial, sans-serif; font-size: 16pt; font-weight: 700; color: #000; }
   .contract-print-page { box-shadow: none !important; border: 0 !important; padding: 0 !important; max-width: none !important; }
 }
 `}</style>
 <div className="contract-print-page relative mx-auto max-w-4xl bg-white px-6 py-8 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10 print:shadow-none print:ring-0 md:px-12 md:py-12">
 {sections.map((section, sectionIndex) => {
 const isTitle = section.title ==='عنوان العقد' || sectionIndex === 0;
 const isMarkerOnly = CONTRACT_MARKER_TITLES.has(section.title);
 return (
 <section key={`${section.title}-${sectionIndex}`} className={sectionIndex === 0 ?'' :'mt-2'}>
 {!isMarkerOnly && (
 <h2 className="mb-3 text-center text-[1.35rem] font-bold text-black underline underline-offset-4 print:text-black">
 {section.title}
 </h2>
 )}
 <div className={isTitle ?'text-center' :'text-right'}>
 {section.lines.map((line, lineIndex) => {
 const trimmed = line.trim();
 if (!trimmed) return null;
 if (isTitle) {
 return (
 <p
 key={`${trimmed}-${lineIndex}`}
 className={[
 'text-center font-bold text-black print:text-black',
 lineIndex === 0 ?'text-[2rem] leading-[1.8] md:text-[2.35rem]' :'text-[1.55rem] leading-[1.7] md:text-[1.75rem]',
 ].join(' ')}
 >
 {trimmed}
 </p>
 );
 }
 return renderContractLine(line, lineIndex);
 })}
 </div>
 </section>
 );
 })}
 <div className="contract-print-footer pointer-events-none mt-10 hidden border-t border-transparent pt-3 text-[1rem] font-bold text-black print:flex">
 <span>الطرف الثاني</span>
 <span>الطرف الأول</span>
 </div>
 </div>
 </article>
 </CardBody>
 </Card>

 {/* Metadata Footer */}
 <div className="mt-8 pt-4 border-t app-border-strong dark:border-zinc-800 text-sm app-text-subtle flex justify-between print:hidden">
 <span>تم الإنشاء بواسطة الذكاء الاصطناعي (نموذج: {currentContract.modelIdentifier ||'افتراضي'})</span>
 <span>رقم العقد المرجعي: {currentContract.contractId}</span>
 </div>
 </motion.div>
 );
};

export default ContractDetails;
