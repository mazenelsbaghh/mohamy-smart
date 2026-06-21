import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { IoAlertCircleOutline, IoReload } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import SmartAnalysisLoader from '../skeleton/SmartAnalysisLoader';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const isSubscriptionError = !!(errorMessage && (
    errorMessage.includes('اشتراك') ||
    errorMessage.includes('رصيد') ||
    errorMessage.includes('نقاط') ||
    errorMessage.includes('كافٍ')
  ));

  useEffect(() => {
    if (hasFailed && isSubscriptionError) {
      setIsModalOpen(true);
    }
  }, [hasFailed, errorMessage, isSubscriptionError]);

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
      <>
        <Card className="w-full bg-[var(--danger-soft)] border-[var(--danger-soft)] min-h-[300px] flex items-center justify-center shadow-sm">
          <CardBody className="flex flex-col items-center justify-center p-8 text-center">
            <IoAlertCircleOutline className="w-16 h-16 text-danger mb-4" />
            <h3 className="text-xl font-bold text-[var(--danger-color)] font-tajawal mb-2">
              {isSubscriptionError ? 'أنت غير مشترك في الباقة' : 'فشل في استخراج البيانات'}
            </h3>
            <p className="text-[var(--danger-color)] opacity-80 font-tajawal mb-6 max-w-md">
              {isSubscriptionError 
                ? (errorMessage || 'أنت غير مشترك في باقة الذكاء الاصطناعي أو انتهى رصيد نقاطك.')
                : (errorMessage || 'تعذّر على الذكاء الاصطناعي معالجة البيانات. أعد المحاولة أو تحقق من صحة الوقائع.')}
            </p>
            <div className="mb-5">
              <AiPointChargeStatus charge={charge} />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isSubscriptionError && (
                <Button 
                  onPress={() => navigate('/subscription')}
                  size="lg"
                  className="font-tajawal font-bold px-8 text-white bg-[var(--main-color)] hover:opacity-90"
                >
                  شحن الرصيد / الاشتراك
                </Button>
              )}
              {onRetry && (
                <Button 
                  color={isSubscriptionError ? "default" : "danger"} 
                  variant="flat" 
                  startContent={<IoReload className="w-5 h-5" />}
                  onPress={onRetry}
                  size="lg"
                  className="font-tajawal font-medium px-8"
                >
                  إعادة المحاولة
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          placement="center"
          backdrop="blur"
          size="md"
          classNames={{
            base: 'rounded-3xl mx-4 my-4 app-surface dark:app-surface-soft border app-border dark:app-border-strong shadow-lg font-tajawal',
            backdrop: 'bg-[#1b1b1b]/40',
          }}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 pb-0" dir="rtl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning-50 dark:bg-warning-950/30 flex items-center justify-center shrink-0">
                  <IoAlertCircleOutline className="text-xl text-warning" />
                </div>
                <span className="text-base font-bold text-[var(--title-color)]">تنبيه: أنت غير مشترك</span>
              </div>
            </ModalHeader>
            <ModalBody dir="rtl" className="py-4">
              <p className="text-sm app-text-muted leading-relaxed">
                {errorMessage || 'عذراً، يجب أن يكون لديك اشتراك نشط ورصيد كافٍ من نقاط الذكاء الاصطناعي لتتمكن من استخدام هذه الميزة وإكمال التحليل.'}
              </p>
            </ModalBody>
            <ModalFooter dir="rtl" className="flex gap-2 justify-end pt-2">
              <Button
                variant="flat"
                onPress={() => setIsModalOpen(false)}
                className="font-bold text-sm app-surface-muted hover:app-surface-soft text-[var(--title-color)] border border-transparent"
              >
                إغلاق
              </Button>
              <Button
                onPress={() => {
                  setIsModalOpen(false);
                  navigate('/subscription');
                }}
                className="font-bold text-sm text-white bg-[var(--main-color)] hover:opacity-90"
              >
                عرض باقات الاشتراك
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
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
