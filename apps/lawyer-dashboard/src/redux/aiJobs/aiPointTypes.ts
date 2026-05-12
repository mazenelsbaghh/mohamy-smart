import type { AiStepType } from './aiJobsSlice';

export type AiChargeState = 'Pending' | 'Held' | 'Charged' | 'NoCharge' | 'Restored';
export type AiRepeatIntent = 'RetryAfterFailure' | 'RegenerateAfterSuccess' | 'StartOver';
export type AiPointTransactionType = 'Hold' | 'Charge' | 'Restore' | 'NoCharge';
export type AiPointReasonCode =
  | 'Success'
  | 'Failed'
  | 'Timeout'
  | 'Cancelled'
  | 'Conflict'
  | 'StaleIgnored'
  | 'InvalidOutput'
  | 'InsufficientPoints'
  | 'ConfirmationDeclined'
  | 'Blocked';

export type AiPointBalance = {
  limit: number;
  used: number;
  held: number;
  available: number;
  subscriptionActive: boolean;
  messageAr: string;
};

export type AiChargeMetadata = {
  pointCost: number;
  chargeState: AiChargeState;
  chargedPoints: number;
  chargeReason: string | null;
  chargedAt: string | null;
  isRepeatAttempt: boolean;
  repeatKind: AiRepeatIntent | null;
  requiresConfirmation: boolean;
  balance: AiPointBalance | null;
};

export type AiPointTransaction = {
  id: string;
  createdAt: string;
  caseId: string | null;
  workflowType: string | null;
  workflowRunId: string | null;
  stepType: AiStepType;
  transactionType: AiPointTransactionType;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  reasonCode: AiPointReasonCode;
  messageAr: string;
};
