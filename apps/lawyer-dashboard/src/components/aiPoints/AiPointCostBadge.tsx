import { Chip } from '@heroui/react';
import { Coins } from 'lucide-react';
import type { AiChargeMetadata } from '../../redux/aiJobs/aiPointTypes';

type AiPointCostBadgeProps = {
  charge?: AiChargeMetadata | null;
  pointCost?: number | null;
};

export function AiPointCostBadge({ charge, pointCost }: AiPointCostBadgeProps) {
  const cost = charge?.pointCost ?? pointCost ?? null;
  if (cost === null || cost <= 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 font-tajawal" dir="rtl">
      <Chip
        size="sm"
        variant="flat"
        color="warning"
        startContent={<Coins className="h-4 w-4" />}
        className="font-tajawal"
      >
        تكلفة هذا الطلب: {cost === 1 ? 'نقطة واحدة' : `${cost} نقاط`}
      </Chip>
      <span className="text-xs text-[var(--text-muted)]">
        سيتم الخصم فقط إذا اكتملت النتيجة بنجاح.
      </span>
    </div>
  );
}
