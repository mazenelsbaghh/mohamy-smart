// Shared helpers for workflow stages display (used by CaseSummary and CaseAnalysis)

export const WORKFLOW_STAGES: Record<string, Array<{ outputKey: number; label: string }>> = {"defense-memo": [
  { outputKey: 1, label:'التحليل القانوني للوقائع' },
  { outputKey: 2, label:'الدفوع' },
  // outputKey 3 = per-defense analysis cache, not a displayable stage
  { outputKey: 4, label:'الطلبات الختامية' },
  { outputKey: 5, label:'المسودة النهائية' },
  ],"preparing-statement-of-claims": [
 { outputKey: 1, label:'نوع الدعوى' },
 { outputKey: 2, label:'الأطراف' },
 { outputKey: 3, label:'الموضوع' },
 { outputKey: 4, label:'الوقائع' },
 { outputKey: 5, label:'التأسيس القانوني' },
 { outputKey: 6, label:'الطلبات' },
 { outputKey: 7, label:'المسودة النهائية' },
 ],"appeal-brief": [
 { outputKey: 1, label:'بيانات الحكم' },
 { outputKey: 2, label:'تحليل التسبيب' },
 { outputKey: 3, label:'أسباب الطعن' },
 { outputKey: 4, label:'الطلبات' },
 { outputKey: 5, label:'الأسس القانونية' },
 { outputKey: 6, label:'التجميع النهائي' },
 ],"admin-complaint": [
 { outputKey: 1, label:'تصنيف الشكوى' },
 { outputKey: 2, label:'مسودة الوقائع' },
 { outputKey: 3, label:'تقييم المخالفات' },
 { outputKey: 4, label:'الطلبات' },
 { outputKey: 5, label:'الشكوى النهائية' },
 ],"ruling-analysis": [
 { outputKey: 1, label:'منطوق الحكم' },
 { outputKey: 2, label:'أسباب الحكم' },
 { outputKey: 3, label:'تقييم العيوب' },
 { outputKey: 4, label:'خلاصة الطعن' },
 ],"legal-warning": [
 { outputKey: 1, label:'تصنيف الإنذار' },
 { outputKey: 2, label:'مسودة الإنذار' },
 { outputKey: 3, label:'الإنذار النهائي' },
 ],"exec-request": [
 { outputKey: 1, label:'تصنيف الطلب' },
 { outputKey: 2, label:'مسودة الطلب' },
 { outputKey: 3, label:'الطلب النهائي' },
 ],
};

export function extractSnippet(workflowKey: string, outputKey: number, output: unknown): string {
 if (!output) return'';
 const obj = output as Record<string, unknown>;

 if (workflowKey ==='defense-memo') {
 if (outputKey === 1) {
 const arr = obj.legalFactsSummary as string[] | undefined;
 if (arr?.length) return arr.slice(0, 2).join(' •');
 return (obj.caseType as string) ||'';
 }
 if (outputKey === 2) {
 const f = (obj.defensesFormal as unknown[])?.length ?? 0;
 const s = (obj.defensesSubstantive as unknown[])?.length ?? 0;
 const e = (obj.defensesEvidentiary as unknown[])?.length ?? 0;
 return `${f + s + e} دفع — شكلية: ${f} • موضوعية: ${s} • مستندية: ${e}`;
 }
 if (outputKey === 4) {
 const prayers = obj.finalPrayers as { requestText: string }[] | undefined;
 if (prayers?.length) return prayers.slice(0, 2).map(p => p.requestText).join(' •');
 }
 if (outputKey === 5) return ((obj.introduction as string) ||'').slice(0, 200);
 }

 if (workflowKey ==='preparing-statement-of-claims') {
 if (outputKey === 1) return `${obj.caseMainType ||''}${obj.caseSubType ?' —' + obj.caseSubType :''}`;
 if (outputKey === 2) {
 const parties = obj.parties as { name: string; role: string }[] | undefined;
 if (parties?.length) return parties.slice(0, 3).map(p => `${p.name} (${p.role})`).join(' •');
 }
 if (outputKey === 3) return (obj.subjectTitle as string) ||'';
 if (outputKey === 4) return ((obj.factsNarrative as string) ||'').slice(0, 200);
 if (outputKey === 5) {
 const texts = obj.legalTexts as { lawName: string; articleNumber: string }[] | undefined;
 if (texts?.length) return texts.slice(0, 3).map(t => `${t.lawName} م ${t.articleNumber}`).join(' •');
 }
 if (outputKey === 6) {
 const reqs = obj.principalRequests as { requestText: string }[] | undefined;
 if (reqs?.length) return reqs.slice(0, 2).map(r => r.requestText).join(' •');
 }
 if (outputKey === 7 && typeof output ==='string') return (output as string).slice(0, 200);
 }

 if (workflowKey ==='appeal-brief') {
 if (outputKey === 1) {
 const jd = obj.judgmentData as Record<string, string> | undefined;
 if (jd?.courtName) return `${jd.courtName}${jd.caseNumber ?' —' + jd.caseNumber :''}`;
 return ((obj.courtInformation as string) ||'').slice(0, 150);
 }
 if (outputKey === 2) return ((obj.analysis as string) ||'').slice(0, 200);
 if (outputKey === 3) {
 const g = obj.grounds as string[] | undefined;
 if (g?.length) return g.slice(0, 2).join(' •');
 }
 if (outputKey === 4) {
 const r = (obj.substantiveRequests as string[] | undefined) || (obj.requests as string[] | undefined);
 if (r?.length) return r.slice(0, 2).join(' •');
 }
 if (outputKey === 5) {
 const l = obj.laws as string[] | undefined;
 if (l?.length) return l.slice(0, 2).join(' •');
 }
 if (outputKey === 6) return ((obj.fullAppealText as string) ||'').slice(0, 200);
 }

 if (workflowKey ==='admin-complaint') {
 if (outputKey === 1) return `${obj.complaintType ||''} — ${obj.targetAuthority ||''}`;
 if (outputKey === 2) return ((obj.factsSummary as string) ||'').slice(0, 200);
 if (outputKey === 3) {
 const v = obj.violations as { description: string }[] | undefined;
 if (v?.length) return v.slice(0, 2).map(x => x.description).join(' •');
 }
 if (outputKey === 4) {
 const r = obj.requests as string[] | undefined;
 if (r?.length) return r.slice(0, 2).join(' •');
 }
 if (outputKey === 5) return ((obj.documentText as string) ||'').slice(0, 200);
 }

 if (workflowKey ==='ruling-analysis') {
 if (outputKey === 1) {
 const pts = obj.verdictPoints as string[] | undefined;
 if (pts?.length) return pts.slice(0, 2).join(' •');
 return ((obj.verdictSummary as string) ||'').slice(0, 200);
 }
 if (outputKey === 2) {
 const pts = obj.reasoningPoints as string[] | undefined;
 if (pts?.length) return pts.slice(0, 2).join(' •');
 }
 if (outputKey === 3) {
 const d = obj.defects as { description: string }[] | undefined;
 if (d?.length) return d.slice(0, 2).map(x => x.description).join(' •');
 }
 if (outputKey === 4) {
 const viable = obj.isAppealViable as boolean | undefined;
 return `${viable !== undefined ? (viable ?'الطعن مجدي' :'الطعن غير مجدي') :''} — ${(obj.conclusion as string) ||''}`.slice(0, 200);
 }
 }

 if (workflowKey ==='legal-warning') {
 if (outputKey === 1) return `${obj.warningType ||''} — ${(obj.legalBasis as Record<string, string> | undefined)?.description ||''}`;
 if (outputKey === 2) {
 const pts = obj.keyPoints as string[] | undefined;
 if (pts?.length) return pts.slice(0, 2).join(' •');
 return ((obj.warningBody as string) ||'').slice(0, 200);
 }
 if (outputKey === 3) return ((obj.documentText as string) ||'').slice(0, 200);
 }

 if (workflowKey ==='exec-request') {
 if (outputKey === 1) return `${obj.requestType ||''} — ${obj.executionGrounds ||''}`.slice(0, 200);
 if (outputKey === 2) {
 const args = obj.keyArguments as string[] | undefined;
 if (args?.length) return args.slice(0, 2).join(' •');
 return ((obj.requestBody as string) ||'').slice(0, 200);
 }
 if (outputKey === 3) return ((obj.documentText as string) ||'').slice(0, 200);
 }

 for (const key of Object.keys(obj)) {
 const val = obj[key];
 if (typeof val ==='string' && val.length > 5) return val.slice(0, 200);
 if (Array.isArray(val) && val.length > 0 && typeof val[0] ==='string') return (val as string[]).slice(0, 2).join(' •');
 }
 return'تم الحفظ';
}
