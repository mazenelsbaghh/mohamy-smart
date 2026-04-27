import React, { useEffect } from'react';
import { useParams, useNavigate } from'react-router-dom';
import { useDispatch, useSelector } from'react-redux';
import type { AppDispatch, RootState } from'../../redux/store';
import { fetchContractDetails, clearCurrentContract } from'../../redux/legalContracts/legalContractsSlice';
import { Card, CardBody, Button, Skeleton } from'@heroui/react';
import { motion } from'framer-motion';
import { FiArrowRight, FiCopy, FiPrinter } from'react-icons/fi';
import { sileo } from"sileo";

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
 <CardBody className="p-8 md:p-12">
 <div 
 className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-center"
 dir="rtl"
 >
 {/* Rendering plain text with line breaks as paragraphs for basic markdown safety */}
 {currentContract.generatedContent.split('\n').map((paragraph, idx) => (
 <p key={idx} className="min-h-[1.5rem]">
 {paragraph}
 </p>
 ))}
 </div>
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