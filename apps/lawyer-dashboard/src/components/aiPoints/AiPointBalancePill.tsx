import { Chip } from '@heroui/react';
import { Coins } from 'lucide-react';
import type { AiPointBalance } from '../../redux/aiJobs/aiPointTypes';

type AiPointBalancePillProps = {
  balance?: AiPointBalance | null;
};

export function AiPointBalancePill({ balance }: AiPointBalancePillProps) {
  const isInactive = !balance || !balance.subscriptionActive;
  const isEmpty = isInactive || balance.available <= 0;

  return (
    <Chip
      color={isInactive ? 'warning' : isEmpty ? 'danger' : 'success'}
      variant="flat"
      startContent={<Coins className="h-4 w-4" />}
      className="font-tajawal"
      dir="rtl"
    >
      {isInactive ? (
        <span className="text-xs font-semibold">غير مشترك</span>
      ) : isEmpty ? (
        <span className="text-xs font-semibold">رصيد غير كافٍ (٠)</span>
      ) : (
        <span className="text-xs">
          <span className="hidden sm:inline">المتاح: </span>
          {balance.available} / {balance.limit} نقطة
        </span>
      )}
    </Chip>
  );
}

