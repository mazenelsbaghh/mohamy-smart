import { useEffect, useMemo, useRef, useState, useCallback } from'react';
import { sanitizeHtml } from"@mohamy/shared-utils";
import {
 Document,
 Packer,
 Paragraph,
 TextRun,
 AlignmentType,
 BorderStyle,
 UnderlineType,
} from'docx';
import { IoCloudDownloadOutline, IoCheckmarkCircleOutline, IoSaveOutline, IoSparklesOutline, IoRefreshOutline } from'react-icons/io5';
import SmartAnalysisLoader from'../../../../../../components/skeleton/SmartAnalysisLoader';
import {
 UnifiedStepShell,
 AnalysisStageDocumentCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { hydrateStep, smartAnalysisThunks } from'../../../../../../redux/analysis/smartAnalysisSlice';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import type { AiRepeatIntent } from '../../../../../../redux/aiJobs/aiPointTypes';
import { DEFENSE_MEMO_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';
import { AiPointConfirmDialog } from '../../../../../../components/aiPoints';
import MemoConfirmModal from'./MemoConfirmModal';

type TDefense = {
 id: string;
 defenseTitle: string;
 basisFromCase: string;
 scope: string;
 strength:'Strong' |'Medium' |'Weak';
};
type TDefenses = {
 defensesFormal: TDefense[];
 defensesSubstantive: TDefense[];
 defensesEvidentiary: TDefense[];
};
type TFactAnalysis = {
 caseType: string;
 caseNumber: string;
 courtName: string;
 legalFactsSummary: string[];
 defendantsPositions: { defendantName: string; relationshipToClient: string; positionSummary: string }[];
 evidenceMap: { source: string; proves: string; doesNotProve: string; limitations: string }[];
 legalAndTechnicalReviewPoints: string[];
 potentialLegalCharacterization: {
 chargeDescription: string;
 elementsReliedUpon: string[];
 elementsLackingProof: string[];
 };
};
type TFinalRequirements = { id: string; requestLevel: string; requestText: string };
type TDefenseExplanation = {
 introduction: string;
 factualBasis: string;
 legalTextsFull: { lawName: string; articleNumber: string; fullText: string }[];
 legalTextsUnavailableReason: string;
 linkingTextsToFacts: string;
 cassationPrecedentsFull: { appealNumber: string; judicialYear: string; sessionDate: string; fullText: string }[];
 cassationPrecedentsUnavailableReason: string;
 legalApplication: string;
 counterArgumentsAndResponse: string;
 legalEffectOfAcceptance: string;
 strengthsAndRisks: string;
};
type TSummary = {
 caseId: string;
 caseNumber: string;
 caseType: string;
 courtName: string;
 clientName: string;
 apponentName: string;
 factAnalysis: TFactAnalysis;
 defenses: TDefenses;
 finalRequirements: { finalPrayers: TFinalRequirements[] };
 explanationsCache: Record<string, TDefenseExplanation>;
 defendingParty:'client' |'opponent';
} | null;

type DefenseMemoSnapshot = {
 id: string;
 createdAt: string;
 memoHtml: string;
 markdown: string;
 outputs?: Record<string, unknown>;
 currentStep?: number;
 lastSavedAt?: string | null;
};

type DocxRun = { text: string; bold?: boolean; underline?: boolean };



const FONT ='Traditional Arabic';
const BODY_SIZE = 32;
const HEADING_SIZE = 36;
const LINE_SPACING = 360;


const bodyPara = (runs: { text: string; bold?: boolean; underline?: boolean }[], alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.JUSTIFIED) =>
 new Paragraph({
 alignment,
 spacing: { after: 80, line: LINE_SPACING },
 children: runs.map(r => new TextRun({
 text: r.text,
 bold: r.bold ?? true,
 underline: r.underline ? { type: UnderlineType.SINGLE } : undefined,
 size: BODY_SIZE,
 font: FONT,
 })),
 });

const dividerPara = () => new Paragraph({
 spacing: { before: 200, after: 200 },
 border: { bottom: { style: BorderStyle.SINGLE, size: 1, space: 1, color:'999999' } },
 children: [],
});



const stripHtmlTags = (html: string): string => {
 const tmp = document.createElement('div');
 tmp.innerHTML = html;
 return tmp.textContent || tmp.innerText ||'';
};

const markdownEscape = (value: string | undefined | null) => (value || '').trim();
const normalizeMemoCourtName = (value: string | undefined | null) => {
 const trimmed = (value ||'').trim();
 return trimmed ==='بدون محكمة' ?'' : trimmed;
};

const buildMarkdown = (summary: TSummary, memoHtml: string): string => {
 const facts = summary?.factAnalysis?.legalFactsSummary || [];
 const defenses = summary?.defenses ? [
 ...(summary.defenses.defensesFormal || []),
 ...(summary.defenses.defensesSubstantive || []),
 ...(summary.defenses.defensesEvidentiary || []),
 ] : [];
 const requests = summary?.finalRequirements?.finalPrayers || [];
 return [
 `# مذكرة دفاع${summary?.caseNumber ? ` - ${summary.caseNumber}` : ''}`,
 '',
 '## الوقائع',
 facts.length ? facts.map((fact) => `- ${markdownEscape(fact)}`).join('\n') : markdownEscape(stripHtmlTags(memoHtml)),
 '',
 '## الدفوع',
 defenses.length ? defenses.map((defense, index) => {
 const explanation = summary?.explanationsCache?.[defense.id];
 const legalTexts = explanation?.legalTextsFull || [];
 const precedents = explanation?.cassationPrecedentsFull || [];
 return [
 `${index + 1}. ${markdownEscape(defense.defenseTitle)}`,
 `   - الأساس: ${markdownEscape(defense.basisFromCase)}`,
 ...legalTexts.map((text) => `   حيث نصت المادة ${markdownEscape(text.articleNumber)} من ${markdownEscape(text.lawName)} على أنه: ${markdownEscape(text.fullText)}`),
 ...precedents.map((precedent) => `   وفي ذلك قضت محكمة النقض بأنه: ${markdownEscape(precedent.fullText)} (طعن ${markdownEscape(precedent.appealNumber)} لسنة ${markdownEscape(precedent.judicialYear)} - جلسة ${markdownEscape(precedent.sessionDate)}).`),
 explanation?.legalApplication ? `   ${markdownEscape(explanation.legalApplication)}` : '',
 ].filter(Boolean).join('\n');
 }).join('\n\n') : '- لا توجد دفوع محددة.',
 '',
 '## الطلبات',
 requests.length ? requests.map((request) => `- ${markdownEscape(request.requestLevel)}: ${markdownEscape(request.requestText)}`).join('\n') : '- لا توجد طلبات ختامية.',
 '',
 ].join('\n');
};

const snapshotsKey = (caseId?: string) => `defense-memo:snapshots:${caseId || 'unknown'}`;

const readSnapshots = (caseId?: string): DefenseMemoSnapshot[] => {
 try {
 const raw = window.localStorage.getItem(snapshotsKey(caseId));
 const parsed = raw ? JSON.parse(raw) : [];
 return Array.isArray(parsed) ? parsed : [];
 } catch {
 return [];
 }
};

const writeSnapshots = (caseId: string | undefined, snapshots: DefenseMemoSnapshot[]) => {
 window.localStorage.setItem(snapshotsKey(caseId), JSON.stringify(snapshots));
};

const buildDocxFromHtml = (html: string): Document => {
 const paragraphs: Paragraph[] = [];
 const container = document.createElement('div');
 container.innerHTML = html;

 const appendDocxParagraph = (
 runs: DocxRun[],
 alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
 size = BODY_SIZE,
 spacingAfter = 80,
 ) => {
 const lines: DocxRun[][] = [[]];
 runs.forEach((run) => {
 const parts = run.text.split(/\r?\n/);
 parts.forEach((part, index) => {
 if (index > 0) lines.push([]);
 if (part) lines[lines.length - 1].push({ ...run, text: part });
 });
 });

 lines
 .filter(line => line.some(run => run.text.trim()))
 .forEach(line => {
 paragraphs.push(new Paragraph({
 alignment,
 spacing: { after: spacingAfter, line: LINE_SPACING },
 children: line.map(r => new TextRun({
 text: r.text,
 bold: r.bold ?? false,
 underline: r.underline ? { type: UnderlineType.SINGLE } : undefined,
 size,
 font: FONT,
 })),
 }));
 });
 };

 const blockSelector ='p, h1, h2, h3, h4, h5, h6, hr, div, ul, ol, li';
 const blockElements = container.querySelectorAll(blockSelector);
 const blockNodes: Element[] = [];
 const pushElementBlocks = (element: Element) => {
 const tag = element.tagName.toLowerCase();
 const nestedBlocks = Array.from(element.children).filter(child => child.matches(blockSelector));
 if (tag ==='div' && nestedBlocks.length > 0) {
 nestedBlocks.forEach(pushElementBlocks);
 return;
 }
 blockNodes.push(element);
 };
 container.childNodes.forEach((node) => {
 if (node.nodeType === Node.TEXT_NODE) {
 const text = node.textContent?.trim();
 if (text) {
 const wrapper = document.createElement('p');
 wrapper.textContent = text;
 blockNodes.push(wrapper);
 }
 } else if (node.nodeType === Node.ELEMENT_NODE) {
 pushElementBlocks(node as Element);
 }
 });

 if (blockNodes.length === 0 && blockElements.length > 0) {
 blockElements.forEach((el) => blockNodes.push(el));
 }

 for (const block of blockNodes) {
 const tagName = block.tagName.toLowerCase();

 if (tagName ==='hr') {
 paragraphs.push(dividerPara());
 continue;
 }

 const isHeading = ['h1','h2','h3','h4','h5','h6'].includes(tagName);
 const textContent = block.textContent?.trim() ||'';

 if (!textContent && tagName !=='p') continue;

 if (isHeading) {
 const runs: DocxRun[] = [];
 block.childNodes.forEach((child) => {
 if (child.nodeType === Node.TEXT_NODE) {
 const t = child.textContent?.trim();
 if (t) runs.push({ text: t, bold: true });
 } else if (child.nodeType === Node.ELEMENT_NODE) {
 const el = child as Element;
 const childTag = el.tagName.toLowerCase();
 const isBold = childTag ==='strong' || childTag ==='b';
 const isUnderlined = childTag ==='u';
 runs.push({ text: el.textContent ||'', bold: isBold, underline: isUnderlined });
 }
 });
 if (runs.length > 0 && runs.some(r => r.text)) {
 const isMajorHeading = tagName ==='h1' || tagName ==='h2';
 const isCategoryHeading = tagName ==='h3';
 const headingSize = isMajorHeading ? HEADING_SIZE : tagName ==='h4' ? BODY_SIZE + 2 : BODY_SIZE;
 const headingAlignment = tagName ==='h4' ? AlignmentType.RIGHT : AlignmentType.CENTER;
 appendDocxParagraph(
 runs.map(r => ({ ...r, bold: true, underline: isMajorHeading || isCategoryHeading || r.underline })),
 headingAlignment,
 headingSize,
 120,
 );
 }
 continue;
 }

 const runs: DocxRun[] = [];
 if (tagName ==='li') {
 runs.push({ text:'- ', bold: false });
 }
 const collectRuns = (node: Node, inherited: Omit<DocxRun, 'text'> = {}) => {
 if (node.nodeType === Node.TEXT_NODE) {
 const t = node.textContent ||'';
 if (t) runs.push({ text: t, bold: inherited.bold ?? false, underline: inherited.underline });
 } else if (node.nodeType === Node.ELEMENT_NODE) {
 const el = node as Element;
 const elTag = el.tagName.toLowerCase();
 if (elTag ==='strong' || elTag ==='b') {
 el.childNodes.forEach(child => collectRuns(child, { ...inherited, bold: true }));
 } else if (elTag ==='u') {
 el.childNodes.forEach(child => collectRuns(child, { ...inherited, underline: true }));
 } else if (elTag ==='br') {
 runs.push({ text:'\n' });
 } else {
 el.childNodes.forEach(child => collectRuns(child, inherited));
 }
 }
 };
 block.childNodes.forEach(child => collectRuns(child));

 if (runs.length === 0 && textContent) {
 runs.push({ text: textContent, bold: false });
 }

 const nonEmptyRuns = runs.filter(r => r.text || r.bold);
 if (nonEmptyRuns.length > 0) {
 appendDocxParagraph(nonEmptyRuns, AlignmentType.JUSTIFIED);
 }
 }

 if (paragraphs.length === 0) {
 paragraphs.push(bodyPara([{ text: stripHtmlTags(html) }]));
 }

 return new Document({
 sections: [{
 properties: {
 page: {
 margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
 },
 },
 children: paragraphs,
 }],
 });
};

const FinalNote = ({ caseId, isActiveTab }: { caseId?: string; isActiveTab?: boolean }) => {
 const dispatch = useAppDispatch();
 const smartOutputs = useAppSelector((state) => state.smartAnalysis.outputs);
 const loadingState = useAppSelector((state) => state.smartAnalysis.loadingState);
 const singleCase = useAppSelector((state) => state.cases.singleCase);
 const aiJob = useAppSelector((state) => state.aiJobs.jobs['DefenseMemoDraft']);
 const aiPointBalance = useAppSelector((state) => state.subscription.aiPointBalance);

 const factAnalysis = smartOutputs[1];
 const defenses = smartOutputs[2];
 const explanationsCache = useMemo(() => smartOutputs[3] || {}, [smartOutputs]);
 const finalRequirements = smartOutputs[4];
 const memoHtml = (smartOutputs[5] as string | undefined) ||'';

 const summary = useMemo(() => (factAnalysis || defenses || finalRequirements) ? ({
 caseId:'',
 caseNumber: factAnalysis?.caseNumber ||'',
 caseType: factAnalysis?.caseType ||'',
 courtName: normalizeMemoCourtName(factAnalysis?.courtName || singleCase?.court),
 clientName: singleCase?.clientName ||'',
 apponentName: singleCase?.apponentName ||'',
 factAnalysis,
 defenses,
 finalRequirements,
 explanationsCache,
 defendingParty: (singleCase as unknown as { defendingParty?: string })?.defendingParty ||'client',
 } as TSummary) : null, [factAnalysis, defenses, finalRequirements, explanationsCache, singleCase]);
 const editorRef = useRef<HTMLDivElement>(null);
 const [generationError, setGenerationError] = useState<string | null>(null);
 const [snapshots, setSnapshots] = useState<DefenseMemoSnapshot[]>([]);
 const [isRegenConfirmOpen, setIsRegenConfirmOpen] = useState(false);
 const [repeatIntent, setRepeatIntent] = useState<AiRepeatIntent>('RegenerateAfterSuccess');
 const [isMemoConfirmOpen, setIsMemoConfirmOpen] = useState(false);
 const hasAutoSubmitted = useRef(false);
 const lastSnapshotContentRef = useRef('');

 const isGenerating = aiJob?.status ==='Queued' || aiJob?.status ==='Processing';
 const hasContent = !!memoHtml;
 const memoPointCost = aiJob?.charge?.pointCost ?? 1;

 const hasApprovedDefenses = useMemo(() => {
 if (!defenses || !explanationsCache) return false;
 const allDefenses = [
 ...(defenses.defensesFormal || []),
 ...(defenses.defensesSubstantive || []),
 ...(defenses.defensesEvidentiary || []),
 ];
 return allDefenses.some(d => explanationsCache[d.id]);
 }, [defenses, explanationsCache]);

 const lastSavedState = useAppSelector((state) => state.smartAnalysis.lastSavedAt);
 const lastSavedStr = lastSavedState
 ? new Date(lastSavedState).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 :'محفوظة تلقائياً';

 const isSaving = loadingState.isAutoSaving;

 useEffect(() => {
 setSnapshots(readSnapshots(caseId));
 }, [caseId]);

 const handleSaveBackend = useCallback(async (payload: unknown) => {
 if (!caseId) return;
 await dispatch(smartAnalysisThunks.saveDraftStep({
 routeId: caseId,
 stepNumber: 5,
 payload
 })).unwrap();
 }, [dispatch, caseId]);

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: handleSaveBackend
 });

 const handleSave = () => {
 if (editorRef.current?.innerHTML) {
 handleSaveBackend(editorRef.current.innerHTML);
 }
 };

 const buildAiInputJson = useCallback((filteredDefenseIds?: string[], filteredRequestIds?: string[]) => {
 if (!defenses || !explanationsCache || !caseId) return'';

 const allDefenses = [
 ...(defenses.defensesFormal || []).map(d => ({ ...d, type:'Formal' })),
 ...(defenses.defensesSubstantive || []).map(d => ({ ...d, type:'Substantive' })),
 ...(defenses.defensesEvidentiary || []).map(d => ({ ...d, type:'Evidentiary' })),
 ];

 const defensePool = filteredDefenseIds
 ? allDefenses.filter(d => filteredDefenseIds.includes(d.id))
 : allDefenses;

 const approvedDefenses = defensePool
 .filter(d => explanationsCache[d.id])
 .map(d => {
 const exp = explanationsCache[d.id];
 return {
 defenseTitle: d.defenseTitle,
 basisFromCase: d.basisFromCase,
 type: d.type,
 explanation: {
 introduction: exp.introduction ||'',
 factualBasis: exp.factualBasis ||'',
 legalTexts: (exp.legalTextsFull || []).map(t => ({
 lawName: t.lawName,
 articleNumber: t.articleNumber,
 fullText: t.fullText,
 })),
 linkingTextsToFacts: exp.linkingTextsToFacts ||'',
 cassationPrecedents: (exp.cassationPrecedentsFull || []).map(p => ({
 appealNumber: p.appealNumber,
 judicialYear: p.judicialYear,
 sessionDate: p.sessionDate,
 fullText: p.fullText,
 })),
 legalApplication: exp.legalApplication ||'',
 counterArguments: exp.counterArgumentsAndResponse ||'',
 legalEffectOfAcceptance: exp.legalEffectOfAcceptance ||'',
 },
 };
 });

 const requestPool = filteredRequestIds
 ? (finalRequirements?.finalPrayers || []).filter(r => filteredRequestIds.includes(r.id))
 : (finalRequirements?.finalPrayers || []);

 const input = {
 caseId,
 caseNumber: factAnalysis?.caseNumber || singleCase?.number ||'',
 caseType: factAnalysis?.caseType ||'',
 courtName: normalizeMemoCourtName(factAnalysis?.courtName || singleCase?.court),
 clientName: singleCase?.clientName ||'',
 apponentName: singleCase?.apponentName ||'',
 defendingParty: (singleCase as unknown as { defendingParty?: string })?.defendingParty ||'client',
 legalFactsSummary: factAnalysis?.legalFactsSummary || [],
 defendantsPositions: (factAnalysis?.defendantsPositions || []).map(p => ({
 defendantName: p.defendantName,
 relationshipToClient: p.relationshipToClient,
 positionSummary: p.positionSummary,
 })),
 approvedDefenses,
 finalRequests: requestPool.map(r => ({
 requestLevel: r.requestLevel,
 requestText: r.requestText,
 })),
 };

 return JSON.stringify(input);
 }, [defenses, explanationsCache, factAnalysis, finalRequirements, singleCase, caseId]);

 const handleGenerateAiMemo = useCallback((filteredDefenseIds?: string[], filteredRequestIds?: string[]) => {
 if (!caseId) return;
 setGenerationError(null);
 setIsMemoConfirmOpen(false);
 const inputJson = buildAiInputJson(filteredDefenseIds, filteredRequestIds);
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'DefenseMemoDraft',
 inputJson,
 }));
 }, [dispatch, caseId, buildAiInputJson]);

 const handleOpenMemoConfirm = useCallback(() => {
 setIsMemoConfirmOpen(true);
 }, []);

 const handleMemoConfirmSubmit = useCallback((selectedDefenseIds: string[], selectedRequestIds: string[]) => {
 handleGenerateAiMemo(selectedDefenseIds, selectedRequestIds);
 }, [handleGenerateAiMemo]);

 const handleRegenerateAiMemo = useCallback(() => {
 if (!caseId) return;
 setRepeatIntent('RegenerateAfterSuccess');
 setIsRegenConfirmOpen(true);
 }, [caseId]);

 const handleRetryAiMemo = useCallback(() => {
 if (!caseId || isGenerating) return;
 setRepeatIntent('RetryAfterFailure');
 setIsRegenConfirmOpen(true);
 }, [caseId, isGenerating]);

 const performRegenerateAiMemo = useCallback(() => {
 if (!caseId || isGenerating) return;
 setIsRegenConfirmOpen(false);
 setGenerationError(null);
 const inputJson = buildAiInputJson();
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'DefenseMemoDraft',
 inputJson,
 repeatIntent,
 confirmationAcceptedAt: new Date().toISOString(),
 }));
 }, [dispatch, caseId, buildAiInputJson, repeatIntent, isGenerating]);

  // Reset the auto-submit flag when user navigates away from this tab
  // so the modal re-opens when they return
  useEffect(() => {
    if (!isActiveTab) {
      hasAutoSubmitted.current = false;
    }
  }, [isActiveTab]);

  useEffect(() => {
    if (!isActiveTab) return;
    if (hasAutoSubmitted.current) return;
    if (!hasApprovedDefenses) return;
    if (hasContent) return;
    if (isGenerating) return;
    hasAutoSubmitted.current = true;
    setIsMemoConfirmOpen(true);
  }, [isActiveTab, hasApprovedDefenses, hasContent, isGenerating]);

 useEffect(() => {
 if (memoHtml && editorRef.current && editorRef.current.innerHTML !== memoHtml) {
 editorRef.current.innerHTML = sanitizeHtml(memoHtml);
 }
 }, [memoHtml]);

 useEffect(() => {
 if (!caseId || !hasContent || !memoHtml || !summary) return;
 if (lastSnapshotContentRef.current === memoHtml) return;
 const markdown = buildMarkdown(summary, memoHtml);
 const current = readSnapshots(caseId);
 if (current[0]?.memoHtml === memoHtml) {
 lastSnapshotContentRef.current = memoHtml;
 setSnapshots(current);
 return;
 }
 const next = [{
 id: `${Date.now()}`,
 createdAt: new Date().toISOString(),
 memoHtml,
 markdown,
 outputs: smartOutputs as unknown as Record<string, unknown>,
 currentStep: 5,
 lastSavedAt: lastSavedState,
 }, ...current].slice(0, 20);
 writeSnapshots(caseId, next);
 setSnapshots(next);
 lastSnapshotContentRef.current = memoHtml;
 }, [caseId, hasContent, memoHtml, summary, smartOutputs, lastSavedState]);

 useEffect(() => {
 if (aiJob?.status ==='Failed' && aiJob.errorMessage) {
 setGenerationError(aiJob.errorMessage);
 }
 }, [aiJob]);

const handleInput = () => {
 if (editorRef.current) {
 const html = sanitizeHtml(editorRef.current.innerHTML);
 dispatch(hydrateStep({ stepNumber: 5, result: html }));
 debouncedSave(html);
 }
 };

 const downloadDocx = async () => {
 const html = editorRef.current?.innerHTML || memoHtml;
 if (!html) return;
 const doc = buildDocxFromHtml(html);
 const blob = await Packer.toBlob(doc);
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download ='مذكرة_دفاع.docx';
 a.click();
 URL.revokeObjectURL(url);
 };

 const approveAndDownload = () => {
 handleSave();
 downloadDocx();
 };

 const showGenerateButton = !hasContent && !isGenerating && summary && hasApprovedDefenses;
 const showRegenerateButton = hasContent && !isGenerating;

 const sidebarStatusValue = (() => {
 if (isGenerating) return'قيد الإنشاء بالذكاء الاصطناعي';
 if (hasContent) return'تم الإنشاء بالذكاء الاصطناعي — جاهزة للمراجعة';
 if (summary) return'جاهزة للإنشاء';
 return'قيد الانتظار';
 })();

 const sidebarStatusTone:'accent' |'success' |'danger' = (() => {
 if (isGenerating) return'accent';
 if (hasContent) return'success';
 return'accent';
 })();

 const editorStyle: React.CSSProperties = {
 padding:'clamp(20px, 4vw, 40px)',
 width:'100%',
 minHeight:'50vh',
 caretColor:'var(--main-color)',
 lineHeight: 2,
 fontSize:'1rem',
 color:'var(--title-color)',
 };

 if (isGenerating) {
 return (
 <SmartAnalysisLoader
 title="جاري إنشاء مذكرة الدفاع بالذكاء الاصطناعي..."
 subtitle="يقوم النظام بتحليل الدفوع والطلبات وصياغة مذكرة دفاع شاملة ومفصلة. قد تستغرق هذه العملية دقيقة أو أكثر."
 steps={DEFENSE_MEMO_STEPS}
 activeStepIndex={4}
 />
 );
 }

 return (
 <UnifiedStepShell
 isLoading={false}
 hasFailed={false}
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={4}
 title="المذكرة الختامية"
 actions={
 <div className="flex items-center gap-2">
 <span className="text-xs app-text-subtle">
 آخر حفظ: {lastSavedStr}
 </span>
 </div>
 }
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="حالة المذكرة"
 value={sidebarStatusValue}
 description={summary ? `القضية رقم ${summary.caseNumber} — ${summary.courtName}` :'في انتظار اكتمال البيانات'}
 tone={sidebarStatusTone}
 icon={<IoCheckmarkCircleOutline />}
 />

 {snapshots.length > 0 && (
 <div className="rounded-xl border app-border dark:app-border-strong bg-white dark:app-surface-muted p-4">
 <h3 className="text-sm font-bold text-[var(--title-color)] mb-3">نسخ التشغيل</h3>
 <div className="flex flex-col gap-2">
 {snapshots.map((snapshot, index) => (
 <button
 key={snapshot.id}
 type="button"
 onClick={() => {
 if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(snapshot.memoHtml);
 dispatch(hydrateStep({ stepNumber: 5, result: snapshot.memoHtml }));
 }}
 className="flex items-center justify-between gap-3 rounded-lg border app-border dark:app-border-strong px-3 py-2 text-xs font-bold app-text-subtle hover:border-[var(--main-color)]"
 >
 <span>نسخة {snapshots.length - index}</span>
 <span>{new Date(snapshot.createdAt).toLocaleString('ar-EG')}</span>
 </button>
 ))}
 </div>
 </div>
 )}

 {generationError && (
 <div className="p-3 rounded-lg bg-[var(--danger-soft)] dark:bg-red-950/30 border border-[var(--danger-soft)] dark:border-red-800/50 text-sm text-[var(--danger-color)] dark:text-red-300">
 <p className="font-bold mb-1">حدث خطأ أثناء الإنشاء</p>
 <p>{generationError}</p>
 <button
 onClick={handleRetryAiMemo}
 disabled={isGenerating}
 className="mt-2 px-3 py-1.5 bg-[var(--danger-soft)] dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
 >
 إعادة المحاولة
 </button>
 </div>
 )}

 <div className="flex flex-col gap-3">
 {showGenerateButton && (
 <AnalysisStageActionButton
 label="إنشاء المذكرة بالذكاء الاصطناعي"
 icon={IoSparklesOutline}
 onClick={handleOpenMemoConfirm}
 disabled={!hasApprovedDefenses}
 variant="primary"
 />
 )}

 {!hasApprovedDefenses && !hasContent && summary && (
 <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
 يجب تحليل دفع واحد على الأقل قبل إنشاء المذكرة
 </p>
 )}

 {showRegenerateButton && (
 <AnalysisStageActionButton
 label="إعادة إنشاء المذكرة"
 icon={IoRefreshOutline}
 onClick={handleRegenerateAiMemo}
 disabled={isGenerating}
 variant="secondary"
 />
 )}

 {hasContent && (
 <>
 <AnalysisStageActionButton
 label="تحميل المذكرة (.docx)"
 icon={IoCloudDownloadOutline}
 onClick={downloadDocx}
 variant="secondary"
 />

 <AnalysisStageActionButton
 label="حفظ التعديلات"
 icon={IoSaveOutline}
 onClick={handleSave}
 disabled={isSaving}
 variant="secondary"
 />

 <AnalysisStageActionButton
 label={isSaving ?'جاري الحفظ والتحميل...' :'اعتماد المذكرة'}
 icon={IoCheckmarkCircleOutline}
 onClick={approveAndDownload}
 disabled={isSaving}
 variant="primary"
 />
 </>
 )}
 </div>
 </>
 }
 >
 {hasContent && (
 <AnalysisStageDocumentCard
 label="مسودة مذكرة الدفاع"
 badge="ذكاء اصطناعي"
 badgeTone="accent"
 >
 <div
 ref={editorRef}
 style={editorStyle}
 className="memo-editor focus:ring-2 focus:ring-[var(--main-color)] focus:ring-offset-2 rounded-lg"
 contentEditable
 suppressContentEditableWarning
 dir="rtl"
 spellCheck={false}
 onInput={handleInput}
 />
 </AnalysisStageDocumentCard>
 )}

 {!hasContent && !isGenerating && (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 <IoSparklesOutline className="text-5xl text-gray-300 dark:app-text-muted mb-4" />
 <p className="text-sm app-text-subtle dark:app-text-subtle mb-2">لم يتم إنشاء المذكرة بعد</p>
 {summary && hasApprovedDefenses && (
 <p className="text-xs app-text-subtle dark:app-text-subtle">اضغط على زر"إنشاء المذكرة بالذكاء الاصطناعي" للبدء</p>
 )}
 </div>
 )}
 <AiPointConfirmDialog
 isOpen={isRegenConfirmOpen}
 onCancel={() => setIsRegenConfirmOpen(false)}
 onConfirm={performRegenerateAiMemo}
 repeatIntent={repeatIntent}
 pointCost={memoPointCost}
 balance={aiPointBalance}
 isSubmitting={isGenerating}
 />
 <MemoConfirmModal
 isOpen={isMemoConfirmOpen}
 onClose={() => setIsMemoConfirmOpen(false)}
 onConfirm={handleMemoConfirmSubmit}
 defensesFormal={defenses?.defensesFormal || []}
 defensesSubstantive={defenses?.defensesSubstantive || []}
 defensesEvidentiary={defenses?.defensesEvidentiary || []}
 explanationsCache={explanationsCache}
 finalRequests={finalRequirements?.finalPrayers || []}
 isLoading={isGenerating}
 />
 </UnifiedStepShell>
 );
};

export default FinalNote;
