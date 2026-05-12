import { Card, CardBody } from '@heroui/react';
import type { AiPointTransaction } from '../../redux/aiJobs/aiPointTypes';

type AiPointHistoryListProps = {
  items: AiPointTransaction[];
};

export function AiPointHistoryList({ items }: AiPointHistoryListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3" dir="rtl">
      {items.map((item) => (
        <Card key={item.id} className="shadow-sm">
          <CardBody className="font-tajawal text-right">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{item.messageAr}</span>
              <span className="text-sm text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString('ar-EG')}</span>
            </div>
            <div className="mt-2 text-sm text-[var(--text-muted)]">
              {item.transactionType} - {item.points} نقطة - الرصيد بعد العملية: {item.balanceAfter}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
