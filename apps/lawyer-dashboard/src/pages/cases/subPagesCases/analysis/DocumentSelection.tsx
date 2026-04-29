import { CustomCard, Container } from '@mohamy/shared-ui';
import { IoWarningOutline, IoArrowBackOutline } from 'react-icons/io5';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxHooks';
import { useEffect, useState, useCallback } from 'react';
import thunkGetSingleCase from '../../../../redux/cases/thunk/thunkGetSingleCase';
import CaseHeaderBanner from '../../../../components/header/CaseHeaderBanner';
import SkeletonForm from '../../../../components/skeleton/SkeletonForm';
import { resetAiJobs } from '../../../../redux/aiJobs/aiJobsSlice';
import { WORKFLOW_CATALOG } from './workflowCatalog';

const DocumentSelection = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { pathname, state } = useLocation();
  const [searchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const { singleCase, loading } = useAppSelector((rootState) => rootState.cases);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadedCaseId = singleCase?.id?.toString();
  useEffect(() => {
    if (id && loadedCaseId !== id) {
      dispatch(thunkGetSingleCase({ id }));
    }
  }, [dispatch, id, loadedCaseId]);

  const facts = typeof state === 'string' && state !== '' ? state.trim() : (singleCase?.facts?.trim() || '');
  const hasFacts = Boolean(facts);
  const factsCount = facts
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean).length;

  const clearError = useCallback((link: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[link];
      return next;
    });
  }, []);

  const handleNavigateToWorkflow = async (link: string) => {
    if (!id) return;
    try {
      dispatch(resetAiJobs());
      clearError(link);

      const hasSnapshot = Boolean(searchParams.get('snapshot'));
      if (hasSnapshot) {
        navigate(`${pathname}/${link}?snapshot=${searchParams.get('snapshot')}`, { state: facts });
        return;
      }

      navigate(`${pathname}/${link}?fresh=1`, { state: facts });
    } catch {
      setErrors((prev) => ({
        ...prev,
        [link]: 'حدث خطأ أثناء بدء إصدار جديد. يرجى المحاولة مرة أخرى.',
      }));
    }
  };

  const handleResumeWorkflow = (link: string) => {
    if (!id) return;
    try {
      clearError(link);
      navigate(`${pathname}/${link}`, { state: facts });
    } catch {
      setErrors((prev) => ({
        ...prev,
        [link]: 'حدث خطأ أثناء استكمال الإصدار الحالي. يرجى المحاولة مرة أخرى.',
      }));
    }
  };

  const handleStartNew = (link: string) => {
    if (!id) return;
    try {
      clearError(link);
      navigate(`${pathname}/${link}?fresh=1`, { state: facts });
    } catch {
      setErrors((prev) => ({
        ...prev,
        [link]: 'حدث خطأ أثناء بدء إصدار جديد. يرجى المحاولة مرة أخرى.',
      }));
    }
  };

  const workflowOptions = WORKFLOW_CATALOG.map((item) => ({
    title: item.label,
    text: item.description,
    stepCount: item.totalSteps,
    link: item.route,
    icon: <item.icon className="text-4xl" />,
  }));

  return (
    <section className="py-8 min-h-screen">
      <Container>
        {loading === 'pending' && <SkeletonForm />}

        {singleCase && loading === 'succeeded' && (
          <div className="flex flex-col gap-8">
            <CaseHeaderBanner
              caseId={singleCase.id.toString()}
              title={singleCase.title}
              status={singleCase.status}
              facts={singleCase.facts}
              hideDocsButton={true}
            />

            <CustomCard className="border border-[var(--border-color)] dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 end-0 h-full w-1 bg-gradient-to-b from-[var(--main-color)] to-orange-300 opacity-80" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-2">
                <div className="pe-2">
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--title-color)] mb-3">اختر مسار العمل (Workflow) لمرحلة التقاضي</h3>
                  <p className="text-sm text-[var(--text-color)] opacity-70 leading-relaxed max-w-2xl">
                    ابدأ من الوقائع الحالية، ثم اختر المسار أو المرحلة التي تخدم هذه القضية بأسرع شكل عملي.
                  </p>
                </div>

                <div className={`shrink-0 px-6 py-4 rounded-xl text-center min-w-[160px] border shadow-sm ${
                  hasFacts
                    ? 'bg-[var(--success-soft)]/50 border-[var(--success-soft)] dark:border-green-700/50'
                    : 'bg-[var(--bg-color)] border-[var(--border-color)] dark:border-white/10'
                }`}>
                  <span className="block text-xs font-bold mb-2 text-[var(--text-color)] opacity-60">الوقائع الحالية</span>
                  <strong className={`block text-2xl font-black ${
                    hasFacts ? 'text-[var(--success-color)] dark:text-green-400' : 'text-[var(--text-color)] opacity-30'
                  }`}>
                    {hasFacts ? `${factsCount} واقعة` : 'غير جاهزة'}
                  </strong>
                </div>
              </div>
            </CustomCard>

            {!hasFacts && (
              <CustomCard className="border border-orange-200 dark:border-orange-700/50 bg-orange-50/50 dark:bg-orange-900/10 shadow-sm text-center py-10 px-4">
                <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm border border-orange-100 dark:border-orange-700/30 mb-4 mx-auto animate-pulse">
                  <IoWarningOutline className="text-3xl text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-2">لا توجد وقائع جاهزة لبدء هذا المسار.</h3>
                <p className="text-orange-700 dark:text-orange-400 text-sm mb-6 max-w-md mx-auto">
                  ارجع إلى تفاصيل القضية وأكمل الوقائع أولًا، لكي يقوم الذكاء الاصطناعي ببناء التحليل.
                </p>
                <button
                  onClick={() => navigate(id ? `/cases/${id}` : '/cases')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--main-color)] hover:opacity-90 text-white rounded-xl transition-colors text-sm font-bold shadow-sm cursor-pointer"
                >
                  <IoArrowBackOutline />
                  الرجوع لملف القضية
                </button>
              </CustomCard>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!hasFacts ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''}`}>
              {workflowOptions.map((option) => (
                <CustomCard
                  key={option.link}
                  className="border border-[var(--border-color)] dark:border-white/10 bg-[var(--white-color)] hover:border-[var(--main-color)] cursor-pointer transition-colors flex flex-col p-8 lg:p-10 group relative overflow-hidden"
                >
                  <div className="flex flex-col items-center text-center relative z-10 w-full h-full">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-[var(--main-color)] group-hover:text-white bg-[var(--bg-color)] dark:bg-white/5 text-[var(--main-color)] border border-[var(--border-color)] dark:border-white/10">
                      {option.icon}
                    </div>

                    <h4 className="text-xl font-bold text-[var(--title-color)] mb-3">{option.title}</h4>
                    <p className="text-sm text-[var(--text-color)] opacity-60 leading-relaxed mb-8 max-w-sm">
                      {option.text}
                    </p>

                    <div className="mt-auto flex flex-col items-center w-full gap-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-color)] opacity-40 bg-[var(--bg-color)] dark:bg-white/5 px-4 py-1.5 rounded-full border border-[var(--border-color)] dark:border-white/10">
                        <span>يتطلب {option.stepCount} خطوات</span>
                      </div>

                      {errors[option.link] && (
                        <div className="w-full px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-400 text-sm font-bold text-center">
                          {errors[option.link]}
                        </div>
                      )}

                      <button
                        onClick={() => void handleNavigateToWorkflow(option.link)}
                        disabled={!hasFacts}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-colors bg-[var(--main-color)] text-white hover:opacity-90 hover:shadow-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ابدأ الإعداد
                        <IoArrowBackOutline className="text-lg" />
                      </button>

                      <button
                        onClick={() => handleResumeWorkflow(option.link)}
                        disabled={!hasFacts}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-colors border border-[var(--main-color)] text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        استكمال الإصدار الحالي
                        <IoArrowBackOutline className="text-lg" />
                      </button>

                      <button
                        onClick={() => handleStartNew(option.link)}
                        disabled={!hasFacts}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-colors border border-dashed border-[var(--border-color)] dark:border-white/20 text-[var(--text-color)] opacity-60 hover:opacity-100 hover:border-[var(--main-color)] hover:text-[var(--main-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        بدء إصدار جديد
                        <IoArrowBackOutline className="text-lg" />
                      </button>
                    </div>
                  </div>
                </CustomCard>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};

export default DocumentSelection;
