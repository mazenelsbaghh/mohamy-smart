import { useEffect, useMemo, useRef, useState } from'react';
import { sanitizeHtml } from"@mohamy/shared-utils";
import { IoCheckmarkOutline, IoCloudDownloadOutline } from'react-icons/io5';
import {
 AlignmentType,
 Document,
 HeadingLevel,
 Packer,
 Paragraph,
 TextRun,
} from'docx';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageLayout,
 AnalysisStageDocumentCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { hydrateStatementStep, statementOfClaimsThunks } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import type { TCaseDetails, TLawsuitParties, TLawsuitSubjects, TLawsuitLegalBasis, TLawsuitRequests } from'../../../../../../redux/shared/workflowTypes';

type TFinalStatementOfClaims = {
 caseId: string;
};

const FinalStatementOfClaims = ({ caseId }: TFinalStatementOfClaims) => {
 const dispatch = useAppDispatch();
 const editorRef = useRef<HTMLDivElement>(null);
 const [initialized, setInitialized] = useState(false);

 const lastSavedAt = useAppSelector((state) => state.preparingStatementOfClaimsSlice.lastSavedAt);
 const lastSaved = lastSavedAt
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 const stateLoading = useAppSelector((state) => state.preparingStatementOfClaimsSlice.loadingState);
 const isSaving = stateLoading?.isAutoSaving;
 const outputs = useAppSelector((state) => state.preparingStatementOfClaimsSlice.outputs);
 const lawsuitCaseType = outputs[1] as TCaseDetails | undefined;
 const lawsuitParties = outputs[2] as TLawsuitParties | undefined;
 const lawsuitSubjects = outputs[3] as TLawsuitSubjects | undefined;
 const lawsuitFact = outputs[4] as { factsNarrative: string } | undefined;
 const lawsuitLegalBasis = outputs[5] as TLawsuitLegalBasis | undefined;
 const lawsuitRequests = outputs[6] as TLawsuitRequests | undefined;
 const normalizedLawsuitRequests = useMemo(() => lawsuitRequests
 ? {
 ...lawsuitRequests,
 principalRequests: lawsuitRequests.principalRequests ?? [],
 subsidiaryRequests: lawsuitRequests.subsidiaryRequests ?? [],
 proceduralRequests: lawsuitRequests.proceduralRequests ?? [],
 }
 : undefined, [lawsuitRequests]);

 const hasAllSections = Boolean(
 lawsuitCaseType &&
 lawsuitParties &&
 lawsuitSubjects &&
 lawsuitFact &&
 lawsuitLegalBasis &&
 normalizedLawsuitRequests,
 );

 const documentHtml = useMemo(() => {
 if (!hasAllSections || !lawsuitCaseType || !lawsuitParties || !lawsuitSubjects || !lawsuitFact || !lawsuitLegalBasis || !normalizedLawsuitRequests) {
 return'';
 }

 const claimant = lawsuitParties.parties.find((party) => party.role.includes('مدع')) ?? lawsuitParties.parties[0];
 const defendant = lawsuitParties.parties.find((party) => party.role.includes('مدعى عليه')) ?? lawsuitParties.parties[1];
 const allRequests = [
 ...normalizedLawsuitRequests.principalRequests.map((item) => ({ ...item, type:'أصلية' })),
 ...normalizedLawsuitRequests.subsidiaryRequests.map((item) => ({ ...item, type:'احتياطية' })),
 ...normalizedLawsuitRequests.proceduralRequests.map((item) => ({ ...item, type:'إجرائية' })),
 ];

 return `
 <p style="text-align:center;font-size:18px;font-weight:700;margin-bottom:8px;">بسم الله الرحمن الرحيم</p>
 <p style="text-align:center;font-size:16px;font-weight:700;margin-bottom:4px;">${lawsuitCaseType.courtType ||'المحكمة المختصة'}</p>
 <p style="text-align:center;font-size:14px;color:#666;margin-bottom:16px;">${lawsuitCaseType.caseMainType} / ${lawsuitCaseType.caseSubType}</p>

 <h2 style="text-align:center;font-size:22px;font-weight:800;margin-bottom:20px;">صحيفة دعوى</h2>

 <div style="margin-bottom:16px;">
 <div style="margin-bottom:6px;">
 <span style="font-weight:700;">المدعي /</span>
 <span style="margin-right:8px;">${claimant?.name ??'---'}</span>
 <span style="color:#666;">(${claimant?.legalCapacity ?? claimant?.role ??'مدع'})</span>
 </div>
 <div>
 <span style="font-weight:700;">ضــد /</span>
 <span style="margin-right:8px;">${defendant?.name ??'---'}</span>
 <span style="color:#666;">(${defendant?.legalCapacity ?? defendant?.role ??'مدعى عليه'})</span>
 </div>
 </div>

 <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />

 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">أولاً: نوع الدعوى والاختصاص</h3>
 <p style="margin-bottom:8px;">${lawsuitCaseType.justificationSummary}</p>
 <p style="margin-bottom:4px;"><strong>الطبيعة الإجرائية:</strong> ${lawsuitCaseType.proceduralNature}</p>
 <p style="margin-bottom:16px;"><strong>صفة الاستعجال:</strong> ${lawsuitCaseType.isUrgentOrSummary}</p>

 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">ثانياً: أطراف الدعوى</h3>
 ${lawsuitParties.parties.map((party, index) => `
 <p style="margin-bottom:8px;">
 <strong>${index + 1}. ${party.name}</strong> - ${party.role} - ${party.legalCapacity}<br />
 العنوان: ${party.address ||'غير مذكور'}${party.nationalId ? `<br />الرقم القومي: ${party.nationalId}` :''}
 </p>
 `).join('')}

 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">ثالثاً: موضوع الدعوى</h3>
 <p style="margin-bottom:4px;"><strong>${lawsuitSubjects.subjectTitle}</strong></p>
 <p style="margin-bottom:16px;">${lawsuitSubjects.subjectFullText}</p>

 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">رابعاً: الوقائع</h3>
 ${lawsuitFact.factsNarrative
 .split(/\n+/)
 .map((paragraph) => paragraph.trim())
 .filter(Boolean)
 .map((paragraph) => `<p style="margin-bottom:8px;">${paragraph}</p>`)
 .join('')}

 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">خامساً: الأساس القانوني</h3>
 ${lawsuitLegalBasis.legalTexts.map((text, index) => `
 <p style="margin-bottom:8px;">
 <strong>${index + 1}. ${text.lawName} - المادة ${text.articleNumber}</strong><br />
 ${text.articleText}${text.applicationNotes ? `<br />ملاحظات التطبيق: ${text.applicationNotes}` :''}
 </p>
 `).join('')}

 ${lawsuitLegalBasis.cassationRulings.length > 0 ? `
 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">سادساً: أحكام النقض المؤيدة</h3>
 ${lawsuitLegalBasis.cassationRulings.map((ruling, index) => `
 <p style="margin-bottom:8px;">
 <strong>${index + 1}. ${ruling.court}</strong><br />
 الطعن رقم ${ruling.appealNumber} لسنة ${ruling.judicialYear} - جلسة ${ruling.sessionDate}<br />
 ${ruling.rulingText}${ruling.applicationNotes ? `<br />ملاحظات التطبيق: ${ruling.applicationNotes}` :''}
 </p>
 `).join('')}
 ` :''}

 <h3 style="font-size:17px;font-weight:700;margin-bottom:10px;">الطلبات</h3>
 <p style="margin-bottom:8px;">يلتمس الطالب الحكم له بالطلبات الآتية:</p>
 ${allRequests.map((request, index) => `
 <p style="margin-bottom:6px;padding-right:12px;">
 ${index + 1}. <strong>(${request.type})</strong> ${request.requestText}${request.legalReference ? `<br />السند: ${request.legalReference}` :''}
 </p>
 `).join('')}

 <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
 <p style="text-align:center;font-weight:700;margin-bottom:8px;">ولأجل العلم ،،،</p>
 <p style="text-align:center;color:#666;">تحريرًا في: ${new Date().toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' })}</p>
 `;
 }, [
 hasAllSections,
 lawsuitCaseType,
 lawsuitParties,
 lawsuitSubjects,
 lawsuitFact,
 lawsuitLegalBasis,
 normalizedLawsuitRequests,
 ]);

 const handleSaveBackend = async (payload: unknown) => {
 if (!caseId) return;
 if (typeof payload !=='string') return;
 await dispatch(statementOfClaimsThunks.saveDraftStep({
 routeId: caseId,
 stepNumber: 7,
 payload
 })).unwrap();
 };

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: handleSaveBackend,
 });

 useEffect(() => {
 if (!editorRef.current || initialized) return;

 const draftHtml = outputs[7] as string | undefined;
 if (draftHtml) {
 editorRef.current.innerHTML = sanitizeHtml(draftHtml);
 setInitialized(true);
 } else if (documentHtml) {
 editorRef.current.innerHTML = sanitizeHtml(documentHtml);
 dispatch(hydrateStatementStep({ stepNumber: 7, result: documentHtml }));
 setInitialized(true);
 }
 }, [dispatch, documentHtml, initialized, outputs]);

 useEffect(() => {
 if (!documentHtml) {
 setInitialized(false);
 }
 }, [documentHtml]);

 const downloadDocx = async () => {
 const lines = (editorRef.current?.innerText ||'')
 .split('\n')
 .map((line) => line.trim())
 .filter(Boolean);

 const doc = new Document({
 sections: [{
 children: lines.map((line) => new Paragraph({
 alignment: AlignmentType.RIGHT,
 heading:
 line.startsWith('أولاً') ||
 line.startsWith('ثانياً') ||
 line.startsWith('ثالثاً') ||
 line.startsWith('رابعاً') ||
 line.startsWith('خامساً') ||
 line.startsWith('سادساً') ||
 line ==='الطلبات'
 ? HeadingLevel.HEADING_2
 : undefined,
 children: [new TextRun({ text: line, size: 24, font:'Arial' })],
 })),
 }],
 });

 const blob = await Packer.toBlob(doc);
 const url = URL.createObjectURL(blob);
 const anchor = document.createElement('a');
 anchor.href = url;
 anchor.download = `صحيفة_دعوى_${caseId}.docx`;
 anchor.click();
 URL.revokeObjectURL(url);
 };

 return (
 <AnalysisStepShell
 isLoading={false}
 hasFailed={false}
 >
 {!hasAllSections ? (
 <AnalysisStageLayout
 title="الصحيفة النهائية"
 sidebar={
 <AnalysisStageSidebarCard
 label="الحالة"
 value="بانتظار اكتمال المراحل"
 tone="accent"
 icon={<IoCheckmarkOutline />}
 description="أكمل كل مراحل صحيفة الدعوى أولاً حتى تظهر النسخة النهائية المجمعة."
 />
 }
 >
 <div className="text-center py-16 px-4">
 <p className="app-text-subtle font-medium text-lg">
 أكمل كل مراحل صحيفة الدعوى أولاً حتى تظهر النسخة النهائية المجمعة.
 </p>
 </div>
 </AnalysisStageLayout>
 ) : (
 <AnalysisStageLayout
 title="الصحيفة النهائية"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="الحالة"
 value={isSaving ?'جارٍ الحفظ...' : (lastSaved ?'محفوظ' :'الصحيفة جاهزة')}
 tone={isSaving ?'accent' :'success'}
 icon={<IoCheckmarkOutline />}
 valueClassName="text-lg"
 description={lastSaved ? `آخر حفظ تلقائي: ${lastSaved}` :'الصحيفة مجمعة من كل المراحل السابقة وجاهزة للمراجعة والتصدير.'}
 />
 <div className="flex flex-col gap-2">
 <AnalysisStageActionButton
 label="تحميل الصحيفة (.docx)"
 icon={IoCloudDownloadOutline}
 onClick={downloadDocx}
 />
 </div>
 </>
 }
 >
 <AnalysisStageDocumentCard label="صحيفة الدعوى" badge="مسودة جاهزة للتحرير">
 <div
 ref={editorRef}
 className="outline-none focus:ring-2 focus:ring-[var(--main-color)]/30 rounded-lg w-full transition-shadow"
 style={{ direction:'rtl', minHeight:'300px', lineHeight:'2.4' }}
 contentEditable
 suppressContentEditableWarning
 spellCheck={false}
 onInput={() => {
 if (editorRef.current) {
 const html = sanitizeHtml(editorRef.current.innerHTML);
 dispatch(hydrateStatementStep({ stepNumber: 7, result: html }));
 debouncedSave(html);
 }
 }}
 />
 </AnalysisStageDocumentCard>
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default FinalStatementOfClaims;
