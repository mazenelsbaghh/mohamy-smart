import React from 'react';
import { Progress } from '@heroui/react';
import { IoCheckmark, IoClose } from 'react-icons/io5';

interface ParallelDefenseProgressProps {
  tracking: {
    isRunning: boolean;
    totalDefenses: number;
    completedCount: number;
    failedCount: number;
    defenseJobMap: Record<string, string>;
  };
  defenseNames: Record<string, string>;
  defenseAnalysisJobs: Record<string, { status?: string; id: string }>;
}

type DefenseStatus = 'completed' | 'failed' | 'processing' | 'pending';

const getDefenseStatus = (
  defenseId: string,
  defenseJobMap: Record<string, string>,
  defenseAnalysisJobs: Record<string, { status?: string; id: string }>,
): DefenseStatus => {
  const jobId = defenseJobMap[defenseId];
  if (!jobId) return 'pending';

  const job = defenseAnalysisJobs[jobId];
  if (!job) return 'pending';

  const status = job.status?.toLowerCase();
  if (status === 'completed') return 'completed';
  if (status === 'failed') return 'failed';
  if (status === 'processing' || status === 'queued') return 'processing';

  return 'pending';
};

const ParallelDefenseProgress: React.FC<ParallelDefenseProgressProps> = ({
  tracking,
  defenseNames,
  defenseAnalysisJobs,
}) => {
  const { totalDefenses, completedCount, failedCount, defenseJobMap, isRunning } = tracking;
  const progressValue = totalDefenses > 0 ? ((completedCount + failedCount) / totalDefenses) * 100 : 0;
  const allDone = totalDefenses > 0 && (completedCount + failedCount) >= totalDefenses;

  const defenseIds = Object.keys(defenseNames);

  return (
    <div className="rounded-xl border app-border app-surface p-5 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-bold text-[var(--title-color)]">تحليل الدفوع</span>
        </div>
        <span className="text-xs font-bold text-[var(--main-color)]">
          {completedCount}/{totalDefenses}
        </span>
      </div>

      {/* Progress Bar */}
      <Progress
        size="sm"
        value={progressValue}
        isIndeterminate={isRunning && !allDone && progressValue === 0}
        color="primary"
        aria-label="تقدم تحليل الدفوع"
        className="w-full"
        classNames={{
          indicator: allDone
            ? failedCount > 0
              ? 'bg-[var(--danger-color)]'
              : 'bg-[var(--success-color)]'
            : 'bg-[var(--main-color)]',
          track: 'app-surface-muted',
        }}
      />

      {/* Defense List */}
      <div className="flex flex-col gap-2.5 mt-2">
        {defenseIds.map((defenseId) => {
          const status = getDefenseStatus(defenseId, defenseJobMap, defenseAnalysisJobs);
          const name = defenseNames[defenseId] ?? defenseId;

          return (
            <div
              key={defenseId}
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                status === 'pending' ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Status Circle */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  status === 'completed'
                    ? 'bg-[var(--success-color)] text-white'
                    : status === 'failed'
                      ? 'bg-[var(--danger-color)] text-white'
                      : status === 'processing'
                        ? 'bg-amber-100 dark:bg-amber-900/40'
                        : 'app-surface-muted'
                }`}
              >
                {status === 'completed' && <IoCheckmark className="w-3 h-3" />}
                {status === 'failed' && <IoClose className="w-3 h-3" />}
                {status === 'processing' && (
                  <div className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse" />
                )}
                {status === 'pending' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                )}
              </div>

              {/* Defense Name */}
              <span
                className={`text-sm font-medium truncate ${
                  status === 'pending'
                    ? 'app-text-muted dark:text-white/70'
                    : 'text-[var(--title-color)] dark:text-white'
                }`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParallelDefenseProgress;
