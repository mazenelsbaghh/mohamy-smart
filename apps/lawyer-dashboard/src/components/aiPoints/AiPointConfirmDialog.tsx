import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import type { AiPointBalance, AiRepeatIntent } from '../../redux/aiJobs/aiPointTypes';

type AiPointConfirmDialogProps = {
  isOpen: boolean;
  repeatIntent: AiRepeatIntent;
  pointCost: number;
  balance?: AiPointBalance | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const titleByIntent: Record<AiRepeatIntent, string> = {
  RetryAfterFailure: 'تأكيد إعادة المحاولة',
  RegenerateAfterSuccess: 'تأكيد إعادة التوليد',
  StartOver: 'تأكيد بدء نسخة جديدة',
};

export function AiPointConfirmDialog({
  isOpen,
  repeatIntent,
  pointCost,
  balance,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: AiPointConfirmDialogProps) {
  const pointsLabel = pointCost === 1 ? 'نقطة واحدة' : `${pointCost} نقاط`;

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }} placement="center" dir="rtl">
      <ModalContent>
        <ModalHeader className="font-tajawal">{titleByIntent[repeatIntent]}</ModalHeader>
        <ModalBody className="font-tajawal text-right">
          <p>سيتم إنشاء طلب ذكاء اصطناعي جديد.</p>
          <p>سيتم خصم {pointsLabel} من رصيدك إذا اكتملت النتيجة بنجاح.</p>
          <p>لن يتم خصم أي نقاط إذا فشلت المحاولة.</p>
          {balance && <p className="text-sm text-[var(--text-muted)]">الرصيد المتاح الآن: {balance.available} نقطة</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onCancel} className="font-tajawal">
            إلغاء
          </Button>
          <Button color="warning" isLoading={isSubmitting} onPress={onConfirm} className="font-tajawal">
            تأكيد والمتابعة
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
