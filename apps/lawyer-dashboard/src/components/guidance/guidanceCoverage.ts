import { guidanceRoutes } from'./guidanceRoutes';
import { guidanceContent, type GuidanceKey, type PageGuidanceContent } from'./guidanceContent';

export type GuidanceCoverageIssue = {
 key: GuidanceKey;
 field: string;
 message: string;
};

const placeholderPatterns = [
 /\[.+\]/,
 /TODO/i,
 /ACTION REQUIRED/i,
 /lorem/i,
 /هذا هو أول زر أو منطقة/,
 /اتبع هذه الخطوة داخل الصفحة/,
];

const isMeaningfulText = (value: string | undefined) => {
 const text = value?.trim() ??'';
 return text.length >= 8 && !placeholderPatterns.some((pattern) => pattern.test(text));
};

const pushIssue = (
 issues: GuidanceCoverageIssue[],
 key: GuidanceKey,
 field: string,
 message: string,
) => {
 issues.push({ key, field, message });
};

const validateContent = (content: PageGuidanceContent, issues: GuidanceCoverageIssue[]) => {
 const { key } = content;

 if (!isMeaningfulText(content.title)) {
 pushIssue(issues, key,'title','عنوان الإرشاد غير مكتمل أو عام.');
 }

 if (!isMeaningfulText(content.summary)) {
 pushIssue(issues, key,'summary','ملخص الإرشاد غير مكتمل أو عام.');
 }

 if (!content.primaryActions.length) {
 pushIssue(issues, key,'primaryActions','لا توجد إجراءات رئيسية للصفحة.');
 }

 const steps = content.tourSteps ?? [];
 if (!steps.length) {
 pushIssue(issues, key,'tourSteps','لا توجد خطوات جولة مخصصة للصفحة.');
 }

 steps.forEach((step, index) => {
 const stepLabel = `tourSteps[${index}]`;
 if (!isMeaningfulText(step.title)) {
 pushIssue(issues, key, `${stepLabel}.title`, 'عنوان الخطوة غير واضح.');
 }
 if (!isMeaningfulText(step.body)) {
 pushIssue(issues, key, `${stepLabel}.body`, 'شرح الخطوة غير واضح.');
 }
 if (!step.targetText && !step.targetSelector) {
 pushIssue(issues, key, `${stepLabel}.target`, 'الخطوة لا تحتوي على هدف يمكن التركيز عليه.');
 }
 if (step.tone ==='ai' && !content.ai) {
 pushIssue(issues, key, `${stepLabel}.ai`, 'خطوة AI بدون بيانات إرشاد AI للصفحة.');
 }
 });

 if (content.ai) {
 if (!isMeaningfulText(content.ai.whenToUse)) {
 pushIssue(issues, key,'ai.whenToUse','شرح وقت استخدام AI غير مكتمل.');
 }
 if (!content.ai.requiredInputs.length) {
 pushIssue(issues, key,'ai.requiredInputs','لا توجد مدخلات مطلوبة لاستخدام AI.');
 }
 if (!isMeaningfulText(content.ai.expectedOutput)) {
 pushIssue(issues, key,'ai.expectedOutput','الناتج المتوقع من AI غير واضح.');
 }
 if (!isMeaningfulText(content.ai.reviewNote)) {
 pushIssue(issues, key,'ai.reviewNote','تنبيه مراجعة المحامي غير واضح.');
 }
 }
};

export const getGuidanceCoverageIssues = () => {
 const issues: GuidanceCoverageIssue[] = [];
 const registeredKeys = new Set<GuidanceKey>(guidanceRoutes.map((route) => route.key));

 registeredKeys.add('notFound');

 registeredKeys.forEach((key) => {
 const content = guidanceContent[key];
 if (!content) {
 pushIssue(issues, key,'content','لا يوجد محتوى إرشادي لهذا المسار.');
 return;
 }
 validateContent(content, issues);
 });

 return issues;
};
