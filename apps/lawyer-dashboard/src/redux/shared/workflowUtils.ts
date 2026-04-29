import type { IWorkflowThunks } from './createWorkflowThunks';
import type { DraftWorkflowState } from './workflowTypes';
import { WORKFLOW_CATALOG } from '../../pages/cases/subPagesCases/analysis/workflowCatalog';
import { smartAnalysisThunks } from '../analysis/smartAnalysisSlice';
import { statementOfClaimsThunks } from '../analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import { appealBriefThunks } from '../appealBrief/appealBriefSlice';
import { adminComplaintThunks } from '../adminComplaint/adminComplaintSlice';
import { rulingAnalysisThunks } from '../rulingAnalysis/rulingAnalysisWorkflowSlice';
import { legalWarningThunks } from '../legalWarning/legalWarningSlice';
import { execRequestThunks } from '../execRequest/execRequestSlice';

export function isWorkflowCompleted(
  outputs: Record<number, unknown>,
  workflowKey: string,
): boolean {
  const catalogItem = WORKFLOW_CATALOG.find((w) => w.route === workflowKey || w.id === workflowKey);
  if (!catalogItem) return false;
  return !!outputs[catalogItem.totalSteps];
}

export function getDraftWorkflows(
  states: Record<string, DraftWorkflowState>,
): Array<{ key: string; state: DraftWorkflowState; isSaved: boolean }> {
  return Object.entries(states)
    .map(([key, state]) => ({
      key,
      state,
      isSaved: !!(state.workflowId || state.outputs?.[1]),
    }))
    .filter((d) => d.isSaved);
}

export const WORKFLOW_THUNKS_MAP: Record<string, IWorkflowThunks> = {
  'defense-memo': smartAnalysisThunks,
  'preparing-statement-of-claims': statementOfClaimsThunks,
  'appeal-brief': appealBriefThunks,
  'admin-complaint': adminComplaintThunks,
  'ruling-analysis': rulingAnalysisThunks,
  'legal-warning': legalWarningThunks,
  'exec-request': execRequestThunks,
};

const NON_VERSIONED_WORKFLOWS = new Set(['defense-memo', 'preparing-statement-of-claims']);

export function buildWorkflowHref(route: string, workflowId: number | null, caseId: string): string {
  const basePath = `/cases/${caseId}/document-selection/${route}`;
  if (NON_VERSIONED_WORKFLOWS.has(route)) {
    return `${basePath}?fresh=1`;
  }
  if (workflowId) {
    return `${basePath}?workflowId=${workflowId}`;
  }
  return basePath;
}
