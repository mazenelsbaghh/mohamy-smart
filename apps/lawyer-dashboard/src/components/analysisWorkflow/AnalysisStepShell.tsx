import React from'react';
import { Button, Card, CardBody } from'@heroui/react';
import { IoAlertCircleOutline, IoReload } from'react-icons/io5';
import SmartAnalysisLoader from'../skeleton/SmartAnalysisLoader';
import { AiPointChargeStatus, AiPointCostBadge } from '../aiPoints';
import type { AiChargeMetadata } from '../../redux/aiJobs/aiPointTypes';

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
 charge?: AiChargeMetadata | null;
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
 charge,
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
 <Card className="w-full bg-[var(--danger-soft)] border-[var(--danger-soft)] min-h-[300px] flex items-center justify-center shadow-sm">
 <CardBody className="flex flex-col items-center justify-center p-8 text-center">
 <IoAlertCircleOutline className="w-16 h-16 text-danger mb-4" />
 <h3 className="text-xl font-bold text-[var(--danger-color)] font-tajawal mb-2">
 فشل في استخراج البيانات
 </h3>
 <p className="text-[var(--danger-color)] opacity-80 font-tajawal mb-6 max-w-md">
 {errorMessage ||'تعذّر على الذكاء الاصطناعي معالجة البيانات. أعد المحاولة أو تحقق من صحة الوقائع.'}
 </p>
 <div className="mb-5">
 <AiPointChargeStatus charge={charge} />
 </div>
 
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

 return (
 <>
 <div className="mb-3">
 <AiPointCostBadge charge={charge} />
 </div>
 {children}
 </>
 );
};
