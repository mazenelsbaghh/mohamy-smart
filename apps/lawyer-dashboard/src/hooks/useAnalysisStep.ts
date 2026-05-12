import { useEffect, useState, useCallback, useRef } from'react';
import { useAppDispatch, useAppSelector } from'./reduxHooks';
import type { AiStepType } from'../redux/aiJobs/aiJobsSlice';
import type { AiChargeMetadata } from'../redux/aiJobs/aiPointTypes';
import thunkSubmitAiJob from'../redux/aiJobs/thunk/thunkSubmitAiJob';
import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";

export type UseAnalysisStepOptions<T = unknown> = {
 caseId: string;
 stepType: AiStepType;
 autoSubmit?: boolean;
 inputJson?: string;
 parseResult?: (json: string) => T;
 onHydrate?: (parsed: T) => void;
};

export type UseAnalysisStepReturn<T = unknown> = {
 isLoading: boolean;
 isSubmitting: boolean;
 hasFailed: boolean;
 errorMessage: string | null;
 result: T | null;
 submit: (input?: string) => void;
 retry: () => void;
 charge: AiChargeMetadata | null;
 pointCost: number | null;
};

export function useAnalysisStep<T = unknown>({
 caseId,
 stepType,
 autoSubmit = false,
 inputJson,
 parseResult,
 onHydrate,
}: UseAnalysisStepOptions<T>): UseAnalysisStepReturn<T> {
 const dispatch = useAppDispatch();

 const [isSubmitting, setIsSubmitting] = useState(false);
 const [localError, setLocalError] = useState<string | null>(null);

 // Track if hydration has occurred to prevent infinite loops (only hydrate once per job success)
 const hydratedJobIds = useRef<Set<string>>(new Set());

 // 2. Select the specific job from Redux
 const job = useAppSelector((state) => state.aiJobs.jobs[stepType]);

 // Derived statuses
 const hasJobFailed = job?.status ==='Failed' || localError !== null;
 const isJobActive = job?.status ==='Queued' || job?.status ==='Processing';
 const isLoading = isSubmitting || isJobActive;
 const errorMessage = localError || job?.errorMessage ||'حدث خطأ غير متوقع';

 // 3. Optional result parsing
 const parsedResult: T | null = job?.status ==='Completed' && job.resultJson 
 ? (parseResult ? parseResult(job.resultJson) : parseWorkflowJobResult<T>(job.resultJson))
 : null;

 // 4. Hydration Side Effect
 useEffect(() => {
 if (job?.status ==='Completed' && parsedResult && onHydrate) {
 if (!hydratedJobIds.current.has(job.id)) {
 hydratedJobIds.current.add(job.id);
 onHydrate(parsedResult);
 }
 }
 }, [job?.status, job?.id, parsedResult, onHydrate]);

 // 5. Submission Logic
 const submit = useCallback(async () => {
 if (!caseId) return;

 setIsSubmitting(true);
 setLocalError(null);

 try {
 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType,
 inputJson: inputJson ||"{}"
 })).unwrap();
 } catch (error: unknown) {
 setLocalError(typeof error ==='string' ? error :'فشل إرسال الطلب');
 } finally {
 setIsSubmitting(false);
 }
 }, [caseId, stepType, inputJson, dispatch]);

 const retry = useCallback(async () => {
 const confirmed = window.confirm(
 'إعادة المحاولة ستنشئ طلب ذكاء اصطناعي جديد.\nسيتم خصم نقطة واحدة من رصيدك إذا اكتملت النتيجة بنجاح.\nلن يتم خصم أي نقاط إذا فشلت المحاولة.'
 );
 if (!confirmed) return;

 if (!caseId) return;
 setIsSubmitting(true);
 setLocalError(null);

 try {
 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType,
 inputJson: inputJson ||"{}",
 repeatIntent:'RetryAfterFailure',
 confirmationAcceptedAt: new Date().toISOString(),
 })).unwrap();
 } catch (error: unknown) {
 setLocalError(typeof error ==='string' ? error :'فشل إرسال الطلب');
 } finally {
 setIsSubmitting(false);
 }
 }, [caseId, stepType, inputJson, dispatch]);

 // 6. Auto-submit logic
 const hasAttemptedAutoSubmit = useRef(false);

 useEffect(() => {
 if (autoSubmit && caseId && !job && !hasAttemptedAutoSubmit.current && !isSubmitting) {
 hasAttemptedAutoSubmit.current = true;
 submit();
 }
 }, [autoSubmit, caseId, job, submit, isSubmitting]);

 return {
 isLoading,
 isSubmitting,
 hasFailed: hasJobFailed,
 errorMessage: hasJobFailed ? errorMessage : null,
 result: parsedResult,
 submit,
 retry,
 charge: job?.charge ?? null,
 pointCost: job?.charge?.pointCost ?? null,
 };
}
