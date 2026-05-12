import { Chip } from '@heroui/react';
import type { AiChargeMetadata } from '../../redux/aiJobs/aiPointTypes';

type AiPointChargeStatusProps = {
  charge?: AiChargeMetadata | null;
};

export function AiPointChargeStatus({ charge }: AiPointChargeStatusProps) {
  if (!charge) return null;

  const color =
    charge.chargeState === 'Charged' ? 'success' :
    charge.chargeState === 'NoCharge' || charge.chargeState === 'Restored' ? 'primary' :
    'warning';

  const fallback =
    charge.chargeState === 'Charged' ? 'تم الخصم بعد اكتمال الطلب بنجاح.' :
    charge.chargeState === 'NoCharge' ? 'لم يتم خصم أي نقاط.' :
    charge.chargeState === 'Restored' ? 'تم استرجاع النقاط.' :
    'في انتظار اكتمال الطلب.';

  return (
    <Chip color={color} variant="flat" className="font-tajawal" dir="rtl">
      {charge.chargeReason || fallback}
    </Chip>
  );
}
