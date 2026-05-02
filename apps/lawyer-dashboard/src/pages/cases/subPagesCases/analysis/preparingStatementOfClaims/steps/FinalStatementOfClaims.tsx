import { useEffect, useMemo, useRef, useState } from'react';
import { sanitizeHtml } from"@mohamy/shared-utils";
import { IoCheckmarkOutline, IoCloudDownloadOutline } from'react-icons/io5';
import {
 AlignmentType,
 Document,
 Packer,
 Paragraph,
 TextRun,
} from'docx';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import {
 UnifiedStepShell,
 AnalysisStageDocumentCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { hydrateStatementStep, statementOfClaimsThunks } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import type { TCaseDetails, TLawsuitParties, TLawsuitSubjects, TLawsuitLegalBasis, TLawsuitRequests } from'../../../../../../redux/shared/workflowTypes';

type TFinalStatementOfClaims = {
 caseId: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
 value && typeof value ==='object' ? value as Record<string, unknown> : {};

const asString = (value: unknown): string =>
 typeof value ==='string' ? value : value == null ? '' : String(value);

const asArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

const escapeHtml = (value: string): string =>
 value
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;')
 .replace(/'/g, '&#039;');

const splitParagraphs = (value: string): string[] =>
 value
 .split(/\n+/)
 .map((paragraph) => paragraph.trim())
 .filter(Boolean);

const isLegacyFinalDraft = (value: string): boolean =>
 Boolean(value) &&
 !value.includes('وأعلنته بالآتي') &&
 !value.includes('السند القانوني') &&
 (
 value.includes('بسم الله الرحمن الرحيم') ||
 value.includes('أولاً: نوع الدعوى والاختصاص') ||
 value.includes('ثانياً: أطراف الدعوى') ||
 value.includes('ثالثاً: موضوع الدعوى') ||
 value.includes('رابعاً: الوقائع') ||
 value.includes('ثالثاً: موضوع الدعوى ووقائعها') ||
 value.includes('ملاحظات التطبيق')
 );

const normalizeCourtName = (courtType: string): string =>
 courtType || 'المحكمة المختصة';

const createDocxParagraph = (
 text: string,
 options: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; bold?: boolean; size?: number; spacingAfter?: number } = {},
) => new Paragraph({
 alignment: options.align ?? AlignmentType.JUSTIFIED,
 bidirectional: true,
 spacing: { after: options.spacingAfter ?? 80, line: 320 },
 children: [new TextRun({
  text,
  bold: options.bold ?? true,
  font: 'Arial',
  size: options.size ?? 30,
  rightToLeft: true,
 })],
});

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
 const lawsuitCaseType = useMemo(() => {
 const raw = asRecord(outputs[1]);
 if (Object.keys(raw).length === 0) return undefined;
 return {
 caseId: asString(raw.caseId ?? raw.CaseId),
 caseMainType: asString(raw.caseMainType ?? raw.case_main_type ?? raw.CaseMainType),
 caseSubType: asString(raw.caseSubType ?? raw.case_sub_type ?? raw.CaseSubType),
 courtType: asString(raw.courtType ?? raw.court_type ?? raw.CourtType),
 proceduralNature: asString(raw.proceduralNature ?? raw.procedural_nature ?? raw.ProceduralNature),
 isUrgentOrSummary: asString(raw.isUrgentOrSummary ?? raw.is_urgent_or_summary ?? raw.IsUrgentOrSummary),
 justificationSummary: asString(raw.justificationSummary ?? raw.justification_summary ?? raw.JustificationSummary),
 } as TCaseDetails;
 }, [outputs]);

 const lawsuitParties = useMemo(() => {
 const raw = outputs[2];
 const sourceParties = Array.isArray(raw) ? raw : (asRecord(raw).parties ?? asRecord(raw).Parties);
 const parties = asArray<Record<string, unknown>>(sourceParties).map((party, index) => ({
 id: asString(party.id ?? party.Id) || String(index + 1),
 name: asString(party.name ?? party.Name),
 role: asString(party.role ?? party.Role),
 type: asString(party.type ?? party.Type),
 legalCapacity: asString(party.legalCapacity ?? party.legal_capacity ?? party.LegalCapacity),
 address: asString(party.address ?? party.Address),
 nationalId: asString(party.nationalId ?? party.national_id ?? party.NationalId),
 }));
 return parties.length > 0 ? { caseId, parties } as TLawsuitParties : undefined;
 }, [caseId, outputs]);

 const lawsuitSubjects = useMemo(() => {
 const raw = asRecord(outputs[3]);
 if (Object.keys(raw).length === 0) return undefined;
 return {
 caseId: asString(raw.caseId ?? raw.CaseId),
 subjectTitle: asString(raw.subjectTitle ?? raw.subject_title ?? raw.SubjectTitle),
 subjectFullText: asString(raw.subjectFullText ?? raw.subject_full_text ?? raw.SubjectFullText),
 } as TLawsuitSubjects;
 }, [outputs]);

 const lawsuitFact = useMemo(() => {
 const raw = asRecord(outputs[4]);
 const factsNarrative = asString(raw.factsNarrative ?? raw.facts_narrative ?? raw.FactsNarrative);
 const fallbackNarrative = lawsuitSubjects?.subjectFullText ?? '';
 const narrative = factsNarrative || fallbackNarrative;
 return narrative ? { factsNarrative: narrative } : undefined;
 }, [outputs, lawsuitSubjects]);

 const lawsuitLegalBasis = useMemo(() => {
 const raw = asRecord(outputs[5]);
 if (Object.keys(raw).length === 0) return undefined;
 const legalTexts = asArray<Record<string, unknown>>(raw.legalTexts ?? raw.legal_texts ?? raw.LegalTexts).map((text, index) => ({
 id: asString(text.id ?? text.Id) || String(index + 1),
 lawName: asString(text.lawName ?? text.law_name ?? text.LawName),
 articleNumber: asString(text.articleNumber ?? text.article_number ?? text.ArticleNumber),
 articleText: asString(text.articleText ?? text.article_text ?? text.ArticleText),
 applicationNotes: asString(text.applicationNotes ?? text.application_notes ?? text.ApplicationNotes),
 }));
 const cassationRulings = asArray<Record<string, unknown>>(raw.cassationRulings ?? raw.cassation_rulings ?? raw.CassationRulings).map((ruling, index) => ({
 id: asString(ruling.id ?? ruling.Id) || String(index + 1),
 court: asString(ruling.court ?? ruling.Court),
 appealNumber: asString(ruling.appealNumber ?? ruling.appeal_number ?? ruling.AppealNumber),
 judicialYear: asString(ruling.judicialYear ?? ruling.judicial_year ?? ruling.JudicialYear),
 sessionDate: asString(ruling.sessionDate ?? ruling.session_date ?? ruling.SessionDate),
 rulingText: asString(ruling.rulingText ?? ruling.ruling_text ?? ruling.RulingText),
 applicationNotes: asString(ruling.applicationNotes ?? ruling.application_notes ?? ruling.ApplicationNotes),
 }));
 return { caseId: asString(raw.caseId ?? raw.CaseId), legalTexts, cassationRulings } as TLawsuitLegalBasis;
 }, [outputs]);

 const normalizedLawsuitRequests = useMemo(() => {
 const raw = asRecord(outputs[6]);
 if (Object.keys(raw).length === 0) return undefined;
 const normalizeRequests = (value: unknown) => asArray<Record<string, unknown>>(value).map((request, index) => ({
 id: asString(request.id ?? request.Id) || String(index + 1),
 requestNumber: Number(request.requestNumber ?? request.request_number ?? request.RequestNumber ?? index + 1),
 requestText: asString(request.requestText ?? request.request_text ?? request.RequestText),
 legalReference: asString(request.legalReference ?? request.legal_reference ?? request.LegalReference),
 }));
 return {
 caseId: asString(raw.caseId ?? raw.CaseId),
 principalRequests: normalizeRequests(raw.principalRequests ?? raw.principal_requests ?? raw.PrincipalRequests),
 subsidiaryRequests: normalizeRequests(raw.subsidiaryRequests ?? raw.subsidiary_requests ?? raw.SubsidiaryRequests),
 proceduralRequests: normalizeRequests(raw.proceduralRequests ?? raw.procedural_requests ?? raw.ProceduralRequests),
 } as TLawsuitRequests;
 }, [outputs]);

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
  const claimantName = escapeHtml(claimant?.name || '........................................................');
  const claimantAddress = escapeHtml(claimant?.address || '........................................................');
  const claimantNationalId = claimant?.nationalId ? `، ويحمل بطاقة رقم قومي / ${escapeHtml(claimant.nationalId)}` : '';
  const defendantName = escapeHtml(defendant?.name || '........................................................');
  const defendantAddress = escapeHtml(defendant?.address || '........................................................');
  const courtName = escapeHtml(normalizeCourtName(lawsuitCaseType.courtType));
  const claimSubject = escapeHtml(lawsuitCaseType.caseSubType || lawsuitCaseType.caseMainType || lawsuitSubjects.subjectTitle || 'دعوى');
  const factsParagraphs = splitParagraphs(lawsuitFact.factsNarrative);
  const legalParagraphs = lawsuitLegalBasis.legalTexts.map((text) => {
   const parts = [];
   parts.push(`المادة رقم ${text.articleNumber} من ${text.lawName} والتي نصت على أنه: ${text.articleText}`);
   if (text.applicationNotes) {
    parts.push(`وبانزال نص المادة سالف البيان على موضوع الدعوى يتضح بأن المدعي ${text.applicationNotes}`);
   }
   return parts;
  }).flat();
  const cassationParagraphs = lawsuitLegalBasis.cassationRulings.map((ruling) => {
   const parts = [];
   parts.push(`وفي ذلك قضت ${ruling.court || 'محكمة النقض'}${ruling.appealNumber ? ` في الطعن رقم ${ruling.appealNumber}` : ''}${ruling.judicialYear ? ` لسنة ${ruling.judicialYear}` : ''}${ruling.sessionDate ? ` جلسة ${ruling.sessionDate}` : ''} بأنه: ${ruling.rulingText}`);
   if (ruling.applicationNotes) {
    parts.push(`وبانزال ما تقدم على موضوع الدعوى يتضح بأن المدعي ${ruling.applicationNotes}`);
   }
   return parts;
  }).flat();
  const requestParagraphs = allRequests.map((request, index) =>
  `${index + 1}- (${request.type}) ${request.requestText}${request.legalReference ? ` السند: ${request.legalReference}` : ''}`
  );
  const finalRequestText = requestParagraphs.length > 0
  ? requestParagraphs.join(' ')
  : `الحكم للطالب بطلباته في ${claimSubject}.`;

  return `
  <div style="font-family:Arial, sans-serif;color:#111;font-size:18px;font-weight:700;line-height:1.9;text-align:justify;direction:rtl;">
  <p style="text-align:center;font-size:21px;margin:0 0 8px;">صحيفة ${claimSubject}</p>
  <p style="margin:0 0 8px;">إنه في يوم ........................ الموافق .... / .... / ........ الساعة ........</p>
  <p style="margin:0 0 8px;">بناءً على طلب السيد / ${claimantName}</p>
  <p style="margin:0 0 8px;">المقيم / ${claimantAddress}${claimantNationalId}</p>
  <p style="margin:0 0 8px;">ومحله المختار مكتب الأستاذ / ........................................................ المحامي.</p>
  <p style="margin:0 0 8px;">أنا ................................ محضر ${courtName} قد انتقلت في تاريخه إلى حيث إقامة:</p>
  <p style="margin:0 0 8px;">السيد / ${defendantName}</p>
  <p style="margin:0 0 8px;">ويعلن في / ${defendantAddress}</p>
  <p style="margin:0 0 12px;">مخاطباً مع / ........................................................</p>
  <p style="text-align:center;font-size:20px;margin:0 0 12px;">وأعلنته بالآتي</p>
  ${factsParagraphs.map((paragraph, index) => `<p style="margin:0 0 8px;">${index + 1}- ${escapeHtml(paragraph)}</p>`).join('')}
  <p style="text-align:center;font-size:19px;margin:12px 0 8px;">السند القانوني</p>
  ${legalParagraphs.map((paragraph) => `<p style="margin:0 0 8px;">${escapeHtml(paragraph)}</p>`).join('')}
  ${cassationParagraphs.length > 0 ? '<p style="text-align:center;font-size:19px;margin:12px 0 8px;">أحكام محكمة النقض</p>' : ''}
  ${cassationParagraphs.map((paragraph) => `<p style="margin:0 0 8px;">${escapeHtml(paragraph)}</p>`).join('')}
  <p style="text-align:center;font-size:20px;margin:12px 0 8px;">بنـــاء عليــــه</p>
  <p style="margin:0 0 8px;">أنا المحضر سالف الذكر قد انتقلت إلى حيث إقامة المعلن إليه وسلمته صورة من هذه الصحيفة للعلم بما جاء بها ونفاذ مفعولها قانوناً، وكلفته بالحضور أمام ${courtName}، وذلك بجلستها التي ستنعقد علناً في تمام الساعة التاسعة وما بعدها من صباح يوم ................ الموافق .... / .... / ........ لسماع الحكم بـ: ${escapeHtml(finalRequestText)}، مع إلزام المعلن إليه بالمصروفات ومقابل أتعاب المحاماة، وشمول الحكم بالنفاذ المعجل وبلا كفالة.</p>
  <p style="text-align:left;margin:0;">ولأجل العلم /</p>
  </div>
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
 if (draftHtml && !isLegacyFinalDraft(draftHtml)) {
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
 const lines = (editorRef.current?.innerText || '')
 .split('\n')
 .map((line) => line.trim())
 .filter(Boolean);

 const doc = new Document({
 sections: [{
 properties: {
 page: {
 size: { width: 12191, height: 17123 },
 margin: { top: 567, right: 1134, bottom: 425, left: 2268 },
 },
 },
 children: lines.map((line) => createDocxParagraph(line, {
 align: line.includes('وأعلنته بالآتي') || line.includes('بنـــاء عليــــه') || line.startsWith('صحيفة ')
 ? AlignmentType.CENTER
 : line.includes('ولأجل العلم')
 ? AlignmentType.LEFT
 : AlignmentType.JUSTIFIED,
 size: line.startsWith('صحيفة ') ? 34 : 30,
 spacingAfter: line.includes('وأعلنته بالآتي') || line.includes('بنـــاء عليــــه') ? 120 : 80,
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
 <UnifiedStepShell
 isLoading={false}
 hasFailed={false}
 title="الصحيفة النهائية"
 sidebar={
 !hasAllSections ? (
 <AnalysisStageSidebarCard
 label="الحالة"
 value="بانتظار اكتمال المراحل"
 tone="accent"
 icon={<IoCheckmarkOutline />}
 description="أكمل كل مراحل صحيفة الدعوى أولاً حتى تظهر النسخة النهائية المجمعة."
 />
 ) : (
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
 )
 }
 >
 {!hasAllSections ? (
 <div className="text-center py-16 px-4">
 <p className="app-text-subtle font-medium text-lg">
 أكمل كل مراحل صحيفة الدعوى أولاً حتى تظهر النسخة النهائية المجمعة.
 </p>
 </div>
 ) : ( <AnalysisStageDocumentCard label="صحيفة الدعوى" badge="مسودة جاهزة للتحرير">
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
 )}
 </UnifiedStepShell>
 );
};

export default FinalStatementOfClaims;
