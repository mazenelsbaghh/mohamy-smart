import React from'react';
import { Button, Card, CardBody } from'@heroui/react';
import { IoAlertCircleOutline, IoReload } from'react-icons/io5';
import SmartAnalysisLoader from'../skeleton/SmartAnalysisLoader';

export type AnalysisStepShellProps = {
 isLoading: boolean;
 hasFailed: boolean;
 errorMessage?: string | null;
 onRetry?: () => void;
 loadingTitle?: string;
 loadingSubtitle?: string;
 steps?: string[];
 currentStepIndex?: number;
 children: React.ReactNode;
};

export const AnalysisStepShell: React.FC<AnalysisStepShellProps> = ({
 isLoading,
 hasFailed,
 errorMessage,
 onRetry,
 loadingTitle,
 loadingSubtitle,
 steps,
 currentStepIndex,
 children,
}) => {
 if (isLoading) {
 return (
 <SmartAnalysisLoader 
 title={loadingTitle} 
 subtitle={loadingSubtitle} 
 steps={steps}
 activeStepIndex={currentStepIndex}
 />
 );
 }

 if (hasFailed) {
 return (
 <Card className="w-full bg-danger-50 border-danger-200 min-h-[300px] flex items-center justify-center shadow-sm">
 <CardBody className="flex flex-col items-center justify-center p-8 text-center">
 <IoAlertCircleOutline className="w-16 h-16 text-danger mb-4" />
 <h3 className="text-xl font-bold text-danger-800 font-tajawal mb-2">
 فشل في استخراج البيانات
 </h3>
 <p className="text-danger-600 font-tajawal mb-6 max-w-md">
 {errorMessage ||'تعذّر على الذكاء الاصطناعي معالجة البيانات. أعد المحاولة أو تحقق من صحة الوقائع.'}
 </p>
 
 {onRetry && (
 <Button 
 color="danger" 
 variant="flat" 
 startContent={<IoReload className="w-5 h-5" />}
 onPress={onRetry}
 size="lg"
 className="font-tajawal font-medium px-8"
 >
 إعادة المحاولة
 </Button>
 )}
 </CardBody>
 </Card>
 );
 }

 return <>{children}</>;
};
