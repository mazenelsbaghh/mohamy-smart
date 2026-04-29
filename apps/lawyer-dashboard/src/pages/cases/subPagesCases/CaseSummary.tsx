import { CustomCard } from'@mohamy/shared-ui';
import { useState } from'react';
import { Link } from'react-router-dom';
import { useAppSelector } from'../../../hooks/reduxHooks';
import type { DraftWorkflowState } from'../../../redux/shared/workflowTypes';
import { isWorkflowCompleted as sharedIsWorkflowCompleted } from'../../../redux/shared/workflowUtils';

import {
 IoAlertCircleOutline, IoCheckmarkCircle, IoCalendarOutline,
 IoChevronDownOutline, IoArrowBackOutline,
} from'react-icons/io5';
import { WORKFLOW_CATALOG } from'./analysis/workflowCatalog';
import { WORKFLOW_STAGES, extractSnippet } from'./analysis/workflowSummaryHelpers';

type TCaseSummary = {
 caseId: string;
 facts: string;
}

function isWorkflowCompleted(draftKey: string, draftState: DraftWorkflowState): boolean {
 return sharedIsWorkflowCompleted(draftState.outputs, draftKey) || draftState.status === 'Completed';
}

function getVersionTime(version: { createdAt?: string | null; updatedAt?: string | null }) {
 return Date.parse(version.updatedAt ?? version.createdAt ??"");
}

function buildVersionLabels(versions: Array<{ id?: number | string; createdAt?: string | null; updatedAt?: string | null }>) {
 const ascending = [...versions].sort((a, b) => getVersionTime(a) - getVersionTime(b));
 return new Map(ascending.map((version, index) => [String(version.id), `نسخة ${index + 1}`]));
}

const CaseSummary = ({ caseId, facts }: TCaseSummary) => {
 const [expandedWorkflowStages, setExpandedWorkflowStages] = useState<Record<string, boolean>>({});
 const [expandedStep, setExpandedStep] = useState<Record<string, number | null>>({});

 const smartAnalysis = useAppSelector((s) => s.smartAnalysis);
 const statementOfClaims = useAppSelector((s) => s.preparingStatementOfClaimsSlice);
 const appealBrief = useAppSelector((s) => s.appealBrief);
 const adminComplaint = useAppSelector((s) => s.adminComplaint);
 const rulingAnalysis = useAppSelector((s) => s.rulingAnalysis);
 const legalWarning = useAppSelector((s) => s.legalWarning);
 const execRequest = useAppSelector((s) => s.execRequest);

 const drafts = [
 { key:"defense-memo", state: smartAnalysis, isSaved: Boolean(smartAnalysis.workflowId || smartAnalysis.outputs[1]?.legalFactsSummary || smartAnalysis.outputs[2]?.defensesFormal || ((smartAnalysis.outputs[4] as { finalPrayers?: unknown[] } | null | undefined)?.finalPrayers?.length ?? 0) > 0 || smartAnalysis.outputs[5]) },
 { key:"preparing-statement-of-claims", state: statementOfClaims, isSaved: Boolean(statementOfClaims.workflowId || statementOfClaims.outputs[1]?.caseMainType || statementOfClaims.outputs[5]?.legalTexts || statementOfClaims.outputs[6] || statementOfClaims.outputs[7] || statementOfClaims.currentStep === 7 || statementOfClaims.status ==='Completed') },
 { key:"appeal-brief", state: appealBrief, isSaved: Boolean(appealBrief.workflowId || appealBrief.outputs[1] || appealBrief.outputs[6]) },
 { key:"admin-complaint", state: adminComplaint, isSaved: Boolean(adminComplaint.workflowId || adminComplaint.outputs[1] || adminComplaint.outputs[5]) },
 { key:"ruling-analysis", state: rulingAnalysis, isSaved: Boolean(rulingAnalysis.workflowId || rulingAnalysis.outputs[1] || rulingAnalysis.outputs[4]) },
 { key:"legal-warning", state: legalWarning, isSaved: Boolean(legalWarning.workflowId || legalWarning.outputs[1] || legalWarning.outputs[3]) },
 { key:"exec-request", state: execRequest, isSaved: Boolean(execRequest.workflowId || execRequest.outputs[1] || execRequest.outputs[3]) },
 ].filter(d => d.isSaved);

 // ─── No saved workflows yet ───
 if (drafts.length === 0) {
 return (
 <div className='flex flex-col gap-6 mt-2'>
 <CustomCard className="border shadow-sm text-center py-10 px-4" style={{ borderColor: "var(--accent-soft-strong)", backgroundColor: "var(--accent-soft)" }}>
 <IoAlertCircleOutline className="mx-auto text-4xl text-[var(--main-color)] mb-4" />
 <h3 className="text-lg font-bold text-[var(--title-color)] mb-2">لا يوجد ملخص محفوظ لهذه القضية حتى الآن.</h3>
 <p className="text-[var(--main-color)] text-sm">ابدأ تحليلًا جديدًا أولًا، ثم ستظهر آخر نتيجة محفوظة هنا تلقائيًا.</p>
 </CustomCard>
 </div>
 );
 }

 return (
 <div className='flex flex-col gap-6 mt-2'>
 {/* Workflow summary cards */}
 {drafts.map((draft) => {
 const catalogItem = WORKFLOW_CATALOG.find(w => w.id === draft.key);
 if (!catalogItem) return null;
 const workflowOutputs = draft.state.outputs as Record<number, unknown>;

 const isCompleted = isWorkflowCompleted(draft.key, draft.state);
 const stagesOpen = expandedWorkflowStages[draft.key] ?? false;
 const workflowStages = WORKFLOW_STAGES[draft.key] ?? [];
 const completedCount = workflowStages.filter(s => Boolean(workflowOutputs[s.outputKey])).length;
 const lastSavedStr = draft.state.lastSavedAt
 ? `آخر حفظ: ${new Date(draft.state.lastSavedAt).toLocaleString('ar-EG', { dateStyle:'short', timeStyle:'short' })}`
 :'محفوظة تلقائياً';
  const allVersions = [...(draft.state.workflowVersions ?? [])].sort((a, b) => getVersionTime(b) - getVersionTime(a));
  const latestVersionId = draft.state.workflowId ?? allVersions[0]?.id ?? null;
  const versionCount = allVersions.length;
  const archivedVersions = allVersions.filter((version) => version.id !== latestVersionId);
  const versionLabels = buildVersionLabels(allVersions);

 const borderColor = isCompleted ?'border-[var(--info-soft)]' :'border-[var(--success-soft)]';
 const bgColor = isCompleted ?'bg-[var(--info-soft)]/40' :'bg-[var(--success-soft)]/40';
 const accentBg = isCompleted ?'bg-[var(--blue-color)]' :'bg-[var(--success-color)]';
 const iconBg = isCompleted ?'bg-[var(--info-soft)] border-[var(--info-soft)]' :'bg-[var(--success-soft)] border-[var(--success-soft)]';
 const iconColor = isCompleted ?'text-[var(--blue-color)]' :'text-[var(--success-color)]';
 const titleColor = isCompleted ?'text-[var(--blue-color)]' :'text-[var(--success-color)]';
 const textColor = isCompleted ?'text-[var(--blue-color)]' :'text-[var(--success-color)]';
 const metaColor = isCompleted ?'text-[var(--blue-color)]/70' :'text-[var(--success-color)]/70';
 const btnClass = isCompleted ?'bg-[var(--blue-color)] hover:brightness-110' :'bg-[var(--success-color)] hover:brightness-110';
 const dotColor = isCompleted ?'bg-[var(--blue-color)] border-[var(--blue-color)]' :'bg-[var(--success-color)] border-[var(--success-color)]';
 const lineColor = isCompleted ?'bg-[var(--info-soft)]' :'bg-[var(--success-soft)]';

 return (
 <CustomCard key={draft.key} className={`border ${borderColor} ${bgColor} shadow-sm relative overflow-hidden`}>
 <div className={`absolute top-0 end-0 w-1 h-full ${accentBg} rounded-r-lg`} />

 {/* Header row */}
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
 <div className="flex items-start gap-4">
 <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0 border`}>
 <IoCheckmarkCircle className={`text-2xl ${iconColor}`} />
 </div>
 <div>
 <h3 className={`text-base font-bold ${titleColor} mb-1`}>
 {isCompleted
 ? `منجزة: ${catalogItem.label} — اكتملت جميع المراحل`
 : `مسودة: ${catalogItem.label} — ${completedCount}/${workflowStages.length} مراحل`}
 </h3>
 <p className={`text-sm ${textColor} leading-relaxed mb-2 opacity-90 max-w-xl`}>
 {isCompleted
 ?'تم إنجاز هذا المسار بالكامل. اضغط على أي مرحلة لعرض ما تم فيها.'
 :'مسار قيد الإنجاز. اضغط على المراحل المكتملة لعرض تفاصيلها.'}
 </p>
 <div className="flex items-center gap-3 flex-wrap">
 <span className={`flex items-center gap-1.5 text-xs font-semibold ${metaColor}`}>
 <IoCalendarOutline />
 {lastSavedStr}
 </span>
 {versionCount > 0 && (
 <span className={`text-xs font-semibold ${metaColor}`}>
 محفوظ كـ {versionCount} نسخة مستقلة
 </span>
 )}
 {workflowStages.length > 0 && (
 <button
 type="button"
 onClick={() => setExpandedWorkflowStages(prev => ({ ...prev, [draft.key]: !prev[draft.key] }))}
 className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-colors
 ${stagesOpen ?'app-surface border app-border-strong text-[var(--title-color)]' :'app-surface-soft border app-border app-text-subtle hover:bg-[var(--surface-color)]'}`}
 >
 المراحل ({completedCount}/{workflowStages.length})
 <IoChevronDownOutline className={`transition-transform duration-200 ${stagesOpen ?'rotate-180' :''}`} />
 </button>
 )}
 </div>
 </div>
 </div>
 <Link
 to={`/cases/${caseId}/document-selection/${catalogItem.route}${draft.key ==='defense-memo' || !latestVersionId ? '' : `?workflowId=${latestVersionId}`}`}
 state={facts}
 className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-white ${btnClass} transition-colors shadow-sm shrink-0 min-w-[180px]`}
 >
 {isCompleted ?'مراجعة النتائج' :'استكمال المسار'}
 <IoArrowBackOutline />
 </Link>
 </div>

 {archivedVersions.length > 0 && (
 <div className="px-2 pt-2 flex flex-wrap gap-2">
 {archivedVersions.map((version) => {
  const versionId = String(version.id);
  const href = `/cases/${caseId}/document-selection/${catalogItem.route}?snapshot=${versionId}`;

 return (
 <Link
 key={versionId}
 to={href}
 state={facts}
 className="inline-flex items-center gap-1 rounded-full border app-border px-3 py-1 text-[11px] font-bold app-text-subtle hover:border-[var(--main-color)]"
 >
 <span>{versionLabels.get(versionId) ??'نسخة'}</span>
 <span>{new Date(version.createdAt ?? version.updatedAt ?? '').toLocaleDateString('ar-EG')}</span>
 </Link>
 );
 })}
 </div>
 )}

 {/* Stages Timeline */}
 {stagesOpen && workflowStages.length > 0 && (
 <div className="mt-4 pt-4 border-t app-border px-2">
 <div className="flex flex-col">
 {workflowStages.map((stageDef, idx) => {
 const hasOutput = Boolean(workflowOutputs[stageDef.outputKey]);
 const isStepOpen = expandedStep[draft.key] === stageDef.outputKey;
 const snippet = hasOutput ? extractSnippet(draft.key, stageDef.outputKey, workflowOutputs[stageDef.outputKey]) : null;
 const isLast = idx === workflowStages.length - 1;

 return (
 <div key={stageDef.outputKey} className="flex gap-3">
 {/* Dot + line */}
 <div className="flex flex-col items-center shrink-0 mt-2.5">
 <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${hasOutput ? dotColor :'app-surface border-[var(--border-strong)]'}`} />
 {!isLast && (
 <div className={`w-0.5 flex-1 mt-1 ${hasOutput ? lineColor :'bg-[var(--border-strong)]'}`} style={{ minHeight:'20px' }} />
 )}
 </div>
 {/* Stage row */}
 <div className={`flex-1 mb-2 rounded-lg border ${hasOutput ?'app-border app-surface' :'app-border app-surface-soft'}`}>
 <button
 type="button"
 disabled={!hasOutput}
 onClick={() => {
 if (!hasOutput) return;
 setExpandedStep(prev => ({ ...prev, [draft.key]: prev[draft.key] === stageDef.outputKey ? null : stageDef.outputKey }));
 }}
 className={`w-full flex items-center gap-2 px-3 py-2 text-end rounded-lg ${hasOutput ?'cursor-pointer hover:bg-[var(--surface-soft)]' :'cursor-default'}`}
 >
 <span className={`text-sm font-semibold flex-1 ${hasOutput ?'text-[var(--title-color)]' :'app-text-muted'}`}>
 {stageDef.label}
 </span>
 {hasOutput
 ? <IoChevronDownOutline className={`app-text-muted text-xs shrink-0 transition-transform duration-200 ${isStepOpen ?'rotate-180' :''}`} />
 : <span className="text-[10px] app-text-muted shrink-0">لم تُكتمل</span>}
 </button>
 {isStepOpen && snippet && (
 <div className="px-3 pb-2.5">
 <p className="text-xs app-text-subtle leading-relaxed app-surface-soft p-2.5 rounded-md border app-border whitespace-pre-line">
 {snippet}
 </p>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </CustomCard>
 );
 })}
 </div>
 );
};

export default CaseSummary;
