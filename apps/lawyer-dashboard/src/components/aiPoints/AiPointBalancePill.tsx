import { Chip } from '@heroui/react';
import { Coins } from 'lucide-react';
import type { AiPointBalance } from '../../redux/aiJobs/aiPointTypes';

type AiPointBalancePillProps = {
  balance?: AiPointBalance | null;
};

export function AiPointBalancePill({ balance }: AiPointBalancePillProps) {
  if (!balance) return null;

  const isEmpty = balance.available <= 0;
  return (
    <Chip
      color={isEmpty ? 'danger' : 'success'}
      variant="flat"
      startContent={<Coins className="h-4 w-4" />}
      className="font-tajawal"
      dir="rtl"
    >
      {isEmpty ? 'رصيد غير كافٍ' : `المتاح: ${balance.available} / ${balance.limit} نقطة`}
    </Chip>
  );
}
