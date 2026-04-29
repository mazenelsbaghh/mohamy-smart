import usePageTitle from '../../hooks/usePageTitle';
import { CustomCard, Container } from'@mohamy/shared-ui';
import'./CaseDetails.css';

import HeadTitle from"../../components/headTitle/HeadTitle";
import Breadcrumbs from"../../components/common/Breadcrumbs";
import { Tab, Tabs } from"@heroui/react";
import CaseDetailsComponent from"./subPagesCases/CaseDetailsComponent";
import CaseAnalysis from"./subPagesCases/CaseAnalysis";
import CaseSummary from"./subPagesCases/CaseSummary";
import SnapshotsHistory from"./subPagesCases/SnapshotsHistory";
import thunkGetSingleCase from"../../redux/cases/thunk/thunkGetSingleCase";
import { clearSingleCase, setSingleCase } from"../../redux/cases/casesSlice";
import type { TCase } from"../../redux/cases/casesSlice";
import { useAppDispatch, useAppSelector } from"../../hooks/reduxHooks";
import { useEffect, useState, useCallback } from"react";
import { useParams, useNavigate, useLocation } from"react-router-dom";
import SkeletonForm from"../../components/skeleton/SkeletonForm";
import { CustomButton } from'@mohamy/shared-ui';
import { LuFileText, LuSparkles, LuLayoutTemplate, LuArrowRight, LuHistory } from"react-icons/lu";
import api from '../../APIs/api';

// Workflow thunks – needed to pre-fetch workflow states so CaseAnalysis shows correct status
import { smartAnalysisThunks } from"../../redux/analysis/smartAnalysisSlice";
import { statementOfClaimsThunks } from"../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice";
import { appealBriefThunks } from"../../redux/appealBrief/appealBriefSlice";
import { adminComplaintThunks } from"../../redux/adminComplaint/adminComplaintSlice";
import { rulingAnalysisThunks } from"../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice";
import { legalWarningThunks } from"../../redux/legalWarning/legalWarningSlice";
import { execRequestThunks } from"../../redux/execRequest/execRequestSlice";

const CaseDetails = () => {
 const { id } = useParams();
  usePageTitle('تفاصيل القضية');
 const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [snapshotCount, setSnapshotCount] = useState(0);

  const dispatch = useAppDispatch();
  const { singleCase, loading } = useAppSelector((state) => state.cases);

  const refreshSnapshotCount = useCallback(() => {
    if (!id) return;
    api.get(`/WorkflowSnapshots/case/${id}`)
      .then((res) => {
        const data = res?.data?.data;
        if (Array.isArray(data)) setSnapshotCount(data.length);
      })
      .catch(() => { /* ignore */ });
  }, [id]);

  useEffect(() => {
    const state = location.state as Record<string, unknown> | null | undefined;

    if (state && typeof state === 'object') {
      if ('caseItem' in state) {
        dispatch(setSingleCase(state.caseItem as TCase));
      }

      if ('activeTab' in state && typeof state.activeTab === 'string') {
        setActiveTab(state.activeTab);
      }

      window.history.replaceState({}, '');
    }

    if (id) {
      dispatch(thunkGetSingleCase({ id }));
    }
    return () => {
      dispatch(clearSingleCase());
    };
  }, [dispatch, id, location.state])

  // Pre-fetch all workflow states so the CaseAnalysis tab shows correct status.
  // Runs as soon as `id` is available — does NOT wait for singleCase — so there
  // is no flash of "لم تبدأ" after a page refresh.
  // Skip when a child workflow page is starting a fresh run (?fresh=1) — in that case
  // the child resets its own slice and we must NOT overwrite it with stale DB data.
  useEffect(() => {
  const isFreshChildRun = location.search.includes('fresh=1') || location.pathname.includes('document-selection');
  if (id && !isFreshChildRun) {
  const allThunks = [
  smartAnalysisThunks,
  statementOfClaimsThunks,
  appealBriefThunks,
  adminComplaintThunks,
  rulingAnalysisThunks,
  legalWarningThunks,
  execRequestThunks,
  ];
  allThunks.forEach((thunks) => {
  dispatch(thunks.getWorkflow({ caseId: id })).catch(() => {
  // 404 = workflow not started yet – totally fine, ignore silently
  });
  if (thunks.getWorkflowVersions) {
  dispatch(thunks.getWorkflowVersions({ caseId: id })).catch(() => {
  // Some workflows may not have any versions yet.
  });
  }
  });
  }
  }, [dispatch, id, location.search, location.pathname])

  useEffect(() => {
    refreshSnapshotCount();
  }, [refreshSnapshotCount, location.pathname]);

 return (
 <div className="case-details-page pb-12">
 <Container>
 <Breadcrumbs
 items={[
 { label: 'القضايا', to: '/cases' },
 { label: singleCase?.title || 'ملف القضية' },
 ]}
 className="mb-3 mt-2"
 />
 <HeadTitle title="ملف القضية" />
 
 {loading ==='pending' && !singleCase && (
 <SkeletonForm />
 )}

 {loading ==='failed' && (
 <div className="flex flex-col items-center justify-center py-16 gap-4">
 <p className="text-lg font-bold" style={{ color:'var(--danger-color)' }}>القضية غير موجودة</p>
 <CustomButton
 type="button"
 text="العودة للقضايا"
 size="md"
 radius="full"
 color="primary"
 startContent={<LuArrowRight size={14} />}
 onClick={() => navigate('/cases')}
 />
 </div>
 )}
 
 {singleCase && loading !=='failed' && id && (
 <div className="mt-8 flex flex-col gap-6">
 <CustomCard className="border app-border shadow-sm">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex-1 min-w-0">
 <h1 className="text-xl md:text-2xl font-bold text-[var(--title-color)] mb-2 break-words">
 {singleCase.title}
 </h1>
 <p className="text-sm app-text-muted">
 راجع بيانات القضية الأساسية، ثم انتقل مباشرة إلى التفاصيل أو ابدأ مسار العمل المناسب من التبويبات أدناه.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
 <button 
 onClick={() => {
 navigate(`/cases/${id}/document-selection`, { state: singleCase.facts });
 }}
 className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-5 py-2 bg-[var(--main-color)] text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm text-sm shrink-0 cursor-pointer"
 >
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
 </svg>
 ابدأ التحليل الذكي
 </button>
 <span
 className="shrink-0 flex items-center justify-center text-sm px-4 py-2 rounded-lg font-bold border"
 style={singleCase.status === 0 || singleCase.status ==='Open'
 ? { backgroundColor:'var(--success-soft)', color:'var(--success-color)', borderColor:'color-mix(in srgb, var(--success-color) 24%, transparent)' }
 : { backgroundColor:'var(--danger-soft)', color:'var(--danger-color)', borderColor:'color-mix(in srgb, var(--danger-color) 24%, transparent)' }}
 >
 {singleCase.status === 0 || singleCase.status ==='Open' ?'متداولة' :'منتهية'}
 </span>
 </div>
 </div>
 </CustomCard>

 <div className="w-full">
  <Tabs
  aria-label="تفاصيل القضية"
  selectedKey={activeTab}
  onSelectionChange={(key) => setActiveTab(String(key))}
  variant="light"
  color="primary"
  disableAnimation={true}
  classNames={{
  base:"w-full overflow-x-auto",
  tabList:"w-full p-1 bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl mb-4 gap-1",
  tab:"flex-1 px-3 py-3 min-h-[44px] justify-center rounded-lg data-[hover=true]:app-surface-soft dark:data-[hover=true]:app-surface-soft transition-colors z-0",
  tabContent:"font-bold text-[13px] app-text-subtle dark:app-text-subtle group-data-[selected=true]:text-[var(--main-color)] relative z-10",
  panel:"pt-4 pb-2 px-0",
  cursor:"w-full h-full bg-orange-50 dark:bg-[var(--accent-soft)] rounded-lg shadow-none border-0"
  }}
  >
  <Tab key="details" aria-label="التفاصيل الأساسية" title={
  <div className="flex items-center gap-2">
  <LuFileText className="text-lg" />
  <span className="hidden md:inline text-nowrap">التفاصيل الأساسية</span>
  </div>
  }>
  <CaseDetailsComponent singleCase={singleCase} />
  </Tab>
  <Tab key="analysis" aria-label="التحليل القانوني الذكي" title={
   <div className="flex items-center gap-2">
   <LuSparkles className="text-lg" />
   <span className="hidden md:inline text-nowrap">التحليل القانوني الذكي</span>
   {snapshotCount > 0 && (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-[var(--main-color)] text-white rounded-full">{snapshotCount}</span>
   )}
   </div>
  }>
  <CaseAnalysis caseId={id} facts={singleCase.facts} />
  </Tab>
  <Tab key="summary" aria-label="ملخص القضية الذكي" title={
  <div className="flex items-center gap-2">
  <LuLayoutTemplate className="text-lg" />
  <span className="hidden md:inline text-nowrap">ملخص القضية الذكي</span>
  </div>
  }>
  <CaseSummary caseId={id} facts={singleCase.facts} />
  </Tab>
  <Tab key="history" aria-label="النسخ السابقة" title={
  <div className="flex items-center gap-2">
  <LuHistory className="text-lg" />
  <span className="hidden md:inline text-nowrap">النسخ السابقة</span>
  {snapshotCount > 0 && (
  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-[var(--main-color)] text-white rounded-full">{snapshotCount}</span>
  )}
  </div>
  }>
  <SnapshotsHistory caseId={id} />
  </Tab>
  </Tabs>
 </div>
 </div>
 )}
 </Container>
 </div>
 )
}

export default CaseDetails
