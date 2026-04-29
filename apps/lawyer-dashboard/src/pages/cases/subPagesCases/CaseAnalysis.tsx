import { CustomCard } from'@mohamy/shared-ui';
import { useState, useEffect } from 'react';

import { Link, useNavigate } from'react-router-dom';
import {
 IoArrowBackOutline, IoWarningOutline, IoDocumentTextOutline,
 IoCheckmarkCircle, IoFlash, IoList, IoBriefcaseOutline, IoPeopleOutline, IoAddOutline,
} from'react-icons/io5';

import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import { WORKFLOW_CATALOG } from'./analysis/workflowCatalog';
import { resetAiJobs } from '../../../redux/aiJobs/aiJobsSlice';
import { WORKFLOW_THUNKS_MAP, isWorkflowCompleted as sharedIsWorkflowCompleted, buildWorkflowHref as sharedBuildHref } from'../../../redux/shared/workflowUtils';

import api from '../../../APIs/api';
import type { DraftWorkflowState } from'../../../redux/shared/workflowTypes';

type DbSnapshot = {
 id: number;
 caseId: string;
 workflowType: string;
 outputsJson: string;
 currentStep: number;
 label: string | null;
 createdAt: string;
};

async function createSnapshotInDb(workflowKey: string, caseId: string, state: DraftWorkflowState) {
 try {
 const hasData = Object.values(state.outputs).some(v => v != null && v !== '' && (typeof v !== 'object' || Object.keys(v as object).length > 0));
 if (!hasData) return;

 await api.post('/WorkflowSnapshots', {
 caseId,
 workflowType: workflowKey,
 outputsJson: JSON.stringify(state.outputs),
 currentStep: state.currentStep ?? 1,
 });
 	} catch {
  import('sileo').then(({ sileo }) => sileo.error({ title: "فشل في حفظ مسودة التحليل مؤقتاً" }));
 	}
}



const CaseAnalysis = ({ caseId, facts }: { caseId: string; facts: string }) => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();

 const [dbSnapshots, setDbSnapshots] = useState<DbSnapshot[]>([]);

 // Load snapshots from database
 useEffect(() => {
  if (!caseId) return;
  api.get(`/WorkflowSnapshots/case/${caseId}`)
   .then((res) => {
    const data = res?.data?.data;
    if (Array.isArray(data)) setDbSnapshots(data);
   })
	.catch(() => {});
 }, [caseId]);

 const smartAnalysis = useAppSelector((s) => s.smartAnalysis);
 const statementOfClaims = useAppSelector((s) => s.preparingStatementOfClaimsSlice);
 const appealBrief = useAppSelector((s) => s.appealBrief);
 const adminComplaint = useAppSelector((s) => s.adminComplaint);
 const rulingAnalysis = useAppSelector((s) => s.rulingAnalysis);
 const legalWarning = useAppSelector((s) => s.legalWarning);
 const execRequest = useAppSelector((s) => s.execRequest);

  const workflowThunks = WORKFLOW_THUNKS_MAP;

 // Workflow states are fetched by the parent CaseDetails page on mount

 const drafts = [
 { key:"defense-memo", state: smartAnalysis, isSaved: Boolean(smartAnalysis.workflowId || smartAnalysis.outputs[1]?.legalFactsSummary || smartAnalysis.outputs[2]?.defensesFormal || ((smartAnalysis.outputs[4] as { finalPrayers?: unknown[] } | null | undefined)?.finalPrayers?.length ?? 0) > 0 || smartAnalysis.outputs[5]) },
 { key:"preparing-statement-of-claims", state: statementOfClaims, isSaved: Boolean(statementOfClaims.workflowId || statementOfClaims.outputs[1]?.caseMainType || statementOfClaims.outputs[5]?.legalTexts || statementOfClaims.outputs[6] || statementOfClaims.outputs[7] || statementOfClaims.currentStep === 7 || statementOfClaims.status ==='Completed') },
 { key:"appeal-brief", state: appealBrief, isSaved: Boolean(appealBrief.workflowId || appealBrief.outputs[1] || appealBrief.outputs[6]) },
 { key:"admin-complaint", state: adminComplaint, isSaved: Boolean(adminComplaint.workflowId || adminComplaint.outputs[1] || adminComplaint.outputs[5]) },
 { key:"ruling-analysis", state: rulingAnalysis, isSaved: Boolean(rulingAnalysis.workflowId || rulingAnalysis.outputs[1] || rulingAnalysis.outputs[4]) },
 { key:"legal-warning", state: legalWarning, isSaved: Boolean(legalWarning.workflowId || legalWarning.outputs[1] || legalWarning.outputs[3]) },
 { key:"exec-request", state: execRequest, isSaved: Boolean(execRequest.workflowId || execRequest.outputs[1] || execRequest.outputs[3]) },
 ].filter(d => d.isSaved);

  const hasExistingAnalysis = drafts.length > 0;

  const isWorkflowCompletedLocal = (draftKey: string, draftState: DraftWorkflowState) => {
  return sharedIsWorkflowCompleted(draftState.outputs, draftKey) || draftState.status === 'Completed';
  };

 const out = (draftState: DraftWorkflowState, n: number): Record<string, unknown> | null => draftState.outputs[n] as Record<string, unknown> | null;

 const getAnalysisStage = (draftKey: string, draftState: DraftWorkflowState) => {
 if (draftKey ==="defense-memo") {
 if (out(draftState, 5)) return { label:'المسودة النهائية', icon: <IoDocumentTextOutline className="text-lg" /> };
 const fp = (out(draftState, 4)?.finalPrayers as unknown[] | undefined) || [];
 if (fp.length > 0) return { label:'الطلبات الختامية', icon: <IoBriefcaseOutline className="text-lg" /> };
 const def = out(draftState, 2);
 if (def?.defensesFormal) {
 const total = ((def.defensesFormal as unknown[] | undefined)?.length || 0) + ((def.defensesSubstantive as unknown[] | undefined)?.length || 0) + ((def.defensesEvidentiary as unknown[] | undefined)?.length || 0);
 return { label: `${total} دفع`, icon: <IoList className="text-lg" /> };
 }
 if (out(draftState, 1)?.legalFactsSummary) return { label:'التحليل القانوني', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 } else if (draftKey ==="preparing-statement-of-claims") {
 if (isWorkflowCompletedLocal(draftKey, draftState)) return { label:'المسودة النهائية', icon: <IoDocumentTextOutline className="text-lg" /> };
 if (out(draftState, 6)) return { label:'الطلبات', icon: <IoBriefcaseOutline className="text-lg" /> };
 if (out(draftState, 5)?.legalTexts) return { label:'التأسيس القانوني', icon: <IoList className="text-lg" /> };
 if (out(draftState, 4)?.factsNarrative) return { label:'الوقائع', icon: <IoList className="text-lg" /> };
 if (out(draftState, 3)?.subjectTitle) return { label:'الموضوع', icon: <IoDocumentTextOutline className="text-lg" /> };
 if ((out(draftState, 2)?.parties as unknown[] | undefined)?.length) return { label:'الأطراف', icon: <IoPeopleOutline className="text-lg" /> };
 if (out(draftState, 1)?.caseMainType) return { label:'نوع الدعوى', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 } else if (draftKey ==="appeal-brief") {
 if (draftState.outputs[6]) return { label:'التجميع النهائي', icon: <IoDocumentTextOutline className="text-lg" /> };
 if (draftState.outputs[5]) return { label:'الأسس القانونية', icon: <IoList className="text-lg" /> };
 if (draftState.outputs[1]) return { label:'بيانات الحكم', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 } else if (draftKey ==="admin-complaint") {
 if (draftState.outputs[5]) return { label:'الشكوى النهائية', icon: <IoDocumentTextOutline className="text-lg" /> };
 if (draftState.outputs[3]) return { label:'تقييم المخالفات', icon: <IoList className="text-lg" /> };
 if (draftState.outputs[1]) return { label:'تصنيف الشكوى', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 } else if (draftKey ==="ruling-analysis") {
 if (draftState.outputs[4]) return { label:'خلاصة الطعن', icon: <IoDocumentTextOutline className="text-lg" /> };
 if (draftState.outputs[3]) return { label:'تقييم العيوب', icon: <IoList className="text-lg" /> };
 if (draftState.outputs[2]) return { label:'أسباب الحكم', icon: <IoList className="text-lg" /> };
 if (draftState.outputs[1]) return { label:'منطوق الحكم', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 } else if (draftKey ==="legal-warning") {
 if (draftState.outputs[3]) return { label:'الإنذار النهائي', icon: <IoDocumentTextOutline className="text-lg" /> };
 if (draftState.outputs[2]) return { label:'مسودة الإنذار', icon: <IoBriefcaseOutline className="text-lg" /> };
 if (draftState.outputs[1]) return { label:'تصنيف الإنذار', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 } else if (draftKey ==="exec-request") {
 if (draftState.outputs[3]) return { label:'الطلب النهائي', icon: <IoDocumentTextOutline className="text-lg" /> };
 if (draftState.outputs[2]) return { label:'مسودة الطلب', icon: <IoBriefcaseOutline className="text-lg" /> };
 if (draftState.outputs[1]) return { label:'تصنيف الطلب', icon: <IoFlash className="text-lg" /> };
 if (draftState.workflowId) return { label:'مراجعة الوقائع', icon: <IoFlash className="text-lg" /> };
 }
 return { label:'قيد التقدم', icon: <IoDocumentTextOutline className="text-lg" /> };
 };

 const hasCompleted = drafts.some(d => isWorkflowCompletedLocal(d.key, d.state));

 const factsCount = facts?.split(/\n+/).map(i => i.trim()).filter(Boolean).length ?? 0;
 const hasFacts = factsCount > 0;
 const formattedFactsCount = new Intl.NumberFormat('en-US').format(factsCount);
 const canStartAnalysis = Boolean(caseId && hasFacts);

  const buildHref = (route: string, workflowId?: number | null) => sharedBuildHref(route, workflowId ?? null, caseId);

 const refreshSnapshots = async (): Promise<void> => {
 try {
 const res = await api.get(`/WorkflowSnapshots/case/${caseId}`);
 if (Array.isArray(res?.data?.data)) setDbSnapshots(res.data.data);
 } catch { /* ignore */ }
 };

  const handleStartNewVersion = async (workflowKey: string, route: string) => {
  if (!canStartAnalysis) return;

  dispatch(resetAiJobs());

  if (workflowKey === 'defense-memo' || workflowKey === 'preparing-statement-of-claims') {
  const draft = drafts.find(d => d.key === workflowKey);
  if (draft) {
  if (workflowKey === 'defense-memo') {
  await createSnapshotInDb('defense-memo', caseId, smartAnalysis);
  } else {
  await createSnapshotInDb('preparing-statement-of-claims', caseId, statementOfClaims);
  }
  await refreshSnapshots();
  }
  navigate(`/cases/${caseId}/document-selection/${route}?fresh=1`, { state: facts });
  return;
  }

 const thunks = workflowThunks[workflowKey as keyof typeof workflowThunks];
 if (!thunks) {
 navigate(`/cases/${caseId}/document-selection/${route}`, { state: facts });
 return;
 }

 try {
 const created = await dispatch(thunks.startWorkflow({ caseId })).unwrap();
 navigate(`/cases/${caseId}/document-selection/${route}?workflowId=${created.id}`, { state: facts });
 } catch (error) {
 import('sileo').then(({ sileo }) => sileo.error({ title: typeof error === 'string' ? error : 'تعذر بدء نسخة جديدة من المسار' }));
 }
 };

 if (!caseId) {
 return (
 <div className='flex flex-col gap-6 mt-2'>
 <CustomCard className="border shadow-sm text-center py-10 px-4" style={{ borderColor:"var(--danger-soft)", backgroundColor:"color-mix(in srgb, var(--danger-soft) 65%, var(--surface-color) 35%)" }}>
 <IoWarningOutline className="mx-auto text-4xl text-[var(--danger-color)] mb-4" />
 <h3 className="text-lg font-bold text-[var(--title-color)] mb-2">تعذر فتح مسار التحليل لهذه القضية.</h3>
 <p className="app-text-muted text-sm">أعد تحميل الصفحة ثم حاول مرة أخرى.</p>
 </CustomCard>
 </div>
 );
 }

 return (
 <div className='flex flex-col gap-6 mt-2'>
 {/* Header */}
 <CustomCard className="border app-border shadow-sm">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">التحليل القانوني الذكي</span>
 <h2 className="text-xl font-bold text-[var(--title-color)] mb-2">
 {hasCompleted ?'تم إنجاز مسارات في هذه القضية' : hasExistingAnalysis ?'يوجد تحليل محفوظ لهذه القضية' :'ابدأ مساراً جديداً من الوقائع الحالية'}
 </h2>
 <p className="text-sm app-text-muted max-w-2xl leading-relaxed">
 {hasCompleted
 ?'تم إنجاز مسار واحد أو أكثر بالكامل. يمكنك مراجعة تفاصيل المراحل من تبويب ملخص القضية.'
 : hasExistingAnalysis
 ?'تم حفظ بيانات التحليل السابق. يمكنك استكمال من حيث توقفت أو بدء تحليل جديد.'
 :'اختر نوع المسار، وسنحمّل الوقائع المسجلة إلى الخطوات التالية تلقائيًا.'}
 </p>
 </div>
 <div className="app-surface-soft px-4 py-3 rounded-lg text-center min-w-[140px] border app-border">
 <span className="block text-xs app-text-muted mb-1">عدد الوقائع المسجلة</span>
 <strong className="block text-2xl text-[var(--main-color)]">{formattedFactsCount}</strong>
 </div>
 </div>
 </CustomCard>

 {!hasFacts && (
 <CustomCard className="border shadow-sm text-center py-10 px-4" style={{ borderColor:"var(--accent-soft-strong)", backgroundColor:"var(--accent-soft)" }}>
 <IoWarningOutline className="mx-auto text-4xl text-orange-500 mb-4" />
 <h3 className="text-lg font-bold text-[var(--title-color)] mb-2">لا توجد وقائع مسجلة يمكن البدء منها.</h3>
 <p className="text-[var(--main-color)] text-sm">أكمل الوقائع أولًا من تبويب التفاصيل، ثم ارجع هنا لبدء التحليل.</p>
 </CustomCard>
 )}

 {/* Workflow table */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <CustomCard className="col-span-1 lg:col-span-2 border app-border shadow-sm overflow-hidden p-0">
 <div className="px-6 pt-5 pb-4 border-b app-border">
 <h3 className="text-lg font-bold text-[var(--title-color)] mb-1">مسارات العمل</h3>
 <p className="text-sm app-text-muted leading-relaxed">
 {hasExistingAnalysis
 ?'اختر مساراً لاستكماله أو بدء مسار جديد.'
 :'اختر مسار العمل (Workflow) المناسب للبدء. سيتم حفظ المسودة تلقائياً خلال كل مرحلة.'}
 </p>
 </div>

 <div className="hidden sm:grid grid-cols-[2fr_1fr_1.5fr_auto] gap-3 px-6 py-2 app-surface-soft border-b app-border text-xs font-semibold app-text-muted text-end">
 <span>المسار</span>
 <span>الحالة</span>
 <span>المرحلة الحالية</span>
 <span />
 </div>

 <div className="divide-y app-border">
 {WORKFLOW_CATALOG.map((catalogItem, idx) => {
 const draft = drafts.find(d => d.key === catalogItem.id);
 const stage = draft ? getAnalysisStage(draft.key, draft.state) : null;
 const isCompleted = draft ? isWorkflowCompletedLocal(draft.key, draft.state) : false;
 const isInProgress = Boolean(draft && !isCompleted);
 // All 7 workflows now use the unified WorkflowSnapshots system on the backend.
 const workflowDbSnapshots = dbSnapshots.filter(s => s.workflowType === catalogItem.id);
 const archivedVersions: Array<{ id: number | string; createdAt: string; label?: string | null }> =
 workflowDbSnapshots.map(s => ({ id: s.id, createdAt: s.createdAt, label: s.label }));
 const versionCount = workflowDbSnapshots.length + (draft ? 1 : 0);
 const rowBg = idx % 2 === 0 ?'app-surface' :'app-surface-soft';

 return (
 <div
 key={catalogItem.id}
 className={`${rowBg} grid grid-cols-1 sm:grid-cols-[2fr_1fr_1.5fr_auto] gap-2 sm:gap-3 px-6 py-3.5 items-center transition-colors hover:bg-[var(--accent-soft)] cursor-pointer`}
 >
 <div className="flex items-center gap-2.5">
 <div
 className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ?'text-[var(--blue-color)]' : isInProgress ?'text-[var(--success-color)]' :'app-text-muted'}`}
 style={{ backgroundColor: isCompleted ?'var(--info-soft)' : isInProgress ?'var(--success-soft)' :'var(--surface-soft)' }}
 >
 <catalogItem.icon className="text-base" />
 </div>
 <span className="font-semibold text-sm text-[var(--title-color)]">{catalogItem.label}</span>
 </div>

 <div>
 {isCompleted ? (
 <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--info-soft)] text-[var(--blue-color)] border border-[var(--info-soft)]">
 <IoCheckmarkCircle className="text-xs" /> منجزة
 </span>
 ) : isInProgress ? (
 <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success-color)] border border-[var(--success-soft)]">
 <IoFlash className="text-xs" /> مسودة
 </span>
 ) : (
 <span className="text-xs app-text-muted">لم تبدأ</span>
 )}
 </div>

 <div className="text-xs app-text-muted">
 {stage ? (
 <div className="flex flex-col gap-1">
 <span className="flex items-center gap-1">{stage.icon}{stage.label}</span>
 {versionCount > 1 && (
 <span className="text-[11px] app-text-subtle">{versionCount} نسخة</span>
 )}
 </div>
 ) : (
 <span className="app-text-muted">—</span>
 )}
 </div>

 <div className="flex flex-col sm:items-end gap-2">
 <div className="flex flex-wrap justify-end gap-2">
            <Link
               to={buildHref(catalogItem.route, draft?.state.workflowId)}
               state={facts}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors
                ${isCompleted 
                  ? "bg-[var(--main-color)] text-white hover:brightness-95 shadow-sm" 
                  : isInProgress 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                    : canStartAnalysis 
                      ? "border border-[var(--main-color)] text-[var(--main-color)] hover:bg-[var(--accent-soft)]" 
                      : "border app-border text-[var(--text-color)] cursor-not-allowed pointer-events-none opacity-60"}`}
              onClick={(e) => { if (!canStartAnalysis && !draft) e.preventDefault(); }}
            >
              {isCompleted ? "مراجعة النسخة الحالية" : isInProgress ? "استكمال النسخة الحالية" : "ابدأ"}
              <IoArrowBackOutline />
            </Link>
            {(isInProgress || isCompleted) && (
            <button
              type="button"
              onClick={() => void handleStartNewVersion(catalogItem.id, catalogItem.route)}
              disabled={!canStartAnalysis}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                canStartAnalysis 
                  ? "border border-[var(--main-color)] text-[var(--main-color)] hover:bg-[var(--accent-soft)] bg-white dark:bg-transparent" 
                  : "border app-border text-[var(--text-color)] cursor-not-allowed opacity-60"
              }`}
            >
              بدء واحدة جديدة
              <IoAddOutline />
            </button>
            )}
          </div>

           {archivedVersions.length > 0 && (
             <button
               type="button"
               onClick={() => navigate(`/cases/${caseId}`, { state: { activeTab: 'history' } })}
               className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--main-color)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-strong)] px-3 py-1 rounded-full border border-[var(--accent-soft-strong)] transition-colors cursor-pointer mt-1"
             >
               <IoArrowBackOutline className="text-[10px]" />
               {archivedVersions.length} نسخة سابقة
             </button>
           )}
        </div>
      </div>
    );
  })}
 </div>
 <div className="px-6 py-3 border-t app-border app-surface-soft flex items-center justify-between gap-3">
 <small className="text-xs app-text-muted">يمكنك تعديل الوقائع لاحقًا قبل اعتماد النتيجة النهائية.</small>
 <Link
 to={`/cases/${caseId}/document-selection`}
 state={facts}
 aria-disabled={!canStartAnalysis}
 tabIndex={canStartAnalysis ? 0 : -1}
 className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm text-white transition-colors shrink-0
 ${!canStartAnalysis ?'cursor-not-allowed opacity-70' :'bg-[var(--main-color)] hover:bg-opacity-90 hover:shadow-md'}`}
 style={!canStartAnalysis ? { backgroundColor:"var(--border-strong)" } : undefined}
 onClick={(e) => { if (!canStartAnalysis) e.preventDefault(); }}
 >
 بدء مسار جديد
 <IoArrowBackOutline />
 </Link>
 </div>
 </CustomCard>

 {/* Side notes */}
 <div className="col-span-1 flex flex-col gap-4">
 <CustomCard className="border shadow-sm" style={{ borderColor:"var(--info-soft)", backgroundColor:"color-mix(in srgb, var(--info-soft) 70%, var(--surface-color) 30%)" }}>
 <span className="text-xs font-semibold text-[var(--blue-color)] mb-1 block">ملاحظة 1</span>
 <strong className="block text-[var(--title-color)] text-sm mb-2">سيتم استخدام الوقائع الحالية</strong>
 <p className="text-xs app-text-subtle leading-relaxed">
 <span className="font-bold">{formattedFactsCount} واقعة جاهزة للانتقال</span>. لن تحتاج إلى إعادة إدخالها مرة أخرى عند بدء الإعداد.
 </p>
 </CustomCard>

 <CustomCard className="border shadow-sm" style={{ borderColor:"var(--accent-soft-strong)", backgroundColor:"color-mix(in srgb, var(--accent-soft) 70%, var(--surface-color) 30%)" }}>
 <span className="text-xs font-semibold text-[var(--main-color)] mb-1 block">ملاحظة 2</span>
 <strong className="block text-[var(--title-color)] text-sm mb-2">المخرجات المتاحة</strong>
 <p className="text-xs app-text-subtle leading-relaxed">
 <span className="font-bold">مذكرة دفاع أو صحيفة دعوى</span>. اختر المسار الأنسب الآن، ويمكنك الرجوع وتغييره في أي وقت.
 </p>
 </CustomCard>
 </div>
 </div>
 </div>
 );
};

export default CaseAnalysis;
