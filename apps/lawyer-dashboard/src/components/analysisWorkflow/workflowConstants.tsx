import React from 'react';
import {
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoFlash,
  IoList,
  IoBriefcaseOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoReaderOutline,
  IoListOutline,
  IoLibraryOutline,
} from 'react-icons/io5';

export interface StepMeta {
  id: number;
  label: string;
  icon: React.ReactNode;
}

/** @deprecated Use DEFENSE_MEMO_STEP_DEFS instead */
export const DEFENSE_MEMO_STEPS = [
  'مراجعة الوقائع',
  'التحليل القانوني',
  'تحليل الدفوع',
  'صياغة الطلبات',
  'تجميع المذكرة النهائية'
];

export const DEFENSE_MEMO_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'التحليل القانوني', icon: <IoFlash /> },
  { id: 3, label: 'الدفوع', icon: <IoList /> },
  { id: 4, label: 'الطلبات', icon: <IoBriefcaseOutline /> },
  { id: 5, label: 'المذكرة النهائية', icon: <IoCheckmarkCircle /> },
];

export const STATEMENT_OF_CLAIMS_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'نوع الدعوى', icon: <IoFlash /> },
  { id: 3, label: 'الأطراف', icon: <IoPeopleOutline /> },
  { id: 4, label: 'الموضوع', icon: <IoReaderOutline /> },
  { id: 5, label: 'الوقائع', icon: <IoList /> },
  { id: 6, label: 'الأساس القانوني', icon: <IoShieldCheckmarkOutline /> },
  { id: 7, label: 'الطلبات', icon: <IoBriefcaseOutline /> },
  { id: 8, label: 'الصحيفة', icon: <IoCheckmarkCircle /> },
];

export const APPEAL_BRIEF_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'بيانات الحكم', icon: <IoDocumentTextOutline /> },
  { id: 3, label: 'تحليل الأسباب', icon: <IoFlash /> },
  { id: 4, label: 'أوجه الطعن', icon: <IoListOutline /> },
  { id: 5, label: 'الطلبات', icon: <IoBriefcaseOutline /> },
  { id: 6, label: 'السند القانوني', icon: <IoLibraryOutline /> },
  { id: 7, label: 'صحيفة الاستئناف', icon: <IoCheckmarkCircle /> },
];

/** @deprecated Use ADMIN_COMPLAINT_STEP_DEFS instead */
export const ADMIN_COMPLAINT_STEPS = [
  'التصنيف',
  'مسودة الوقائع',
  'تحليل المخالفات',
  'صياغة الطلبات',
  'تجميع الشكوى النهائية'
];

export const ADMIN_COMPLAINT_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'بيانات الجهة والأساس', icon: <IoDocumentTextOutline /> },
  { id: 3, label: 'سرد الوقائع', icon: <IoListOutline /> },
  { id: 4, label: 'تحليل المخالفات', icon: <IoFlash /> },
  { id: 5, label: 'صياغة الطلبات', icon: <IoBriefcaseOutline /> },
  { id: 6, label: 'الشكوى النهائية', icon: <IoCheckmarkCircle /> },
];

export const RULING_ANALYSIS_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'منطوق الحكم', icon: <IoDocumentTextOutline /> },
  { id: 3, label: 'أسباب الحكم', icon: <IoListOutline /> },
  { id: 4, label: 'تقييم العيوب', icon: <IoFlash /> },
  { id: 5, label: 'خلاصة الطعن', icon: <IoCheckmarkCircle /> },
];

/** @deprecated Use LEGAL_WARNING_STEP_DEFS instead */
export const LEGAL_WARNING_STEPS = [
  'التصنيف والتحليل',
  'صياغة الإنذار',
  'تجميع المذكرة النهائية'
];

export const LEGAL_WARNING_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'تصنيف الإنذار', icon: <IoDocumentTextOutline /> },
  { id: 3, label: 'صياغة المتن', icon: <IoFlash /> },
  { id: 4, label: 'الإنذار النهائي', icon: <IoCheckmarkCircle /> },
];

export const EXEC_REQUEST_STEP_DEFS: StepMeta[] = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'تصنيف الطلب', icon: <IoDocumentTextOutline /> },
  { id: 3, label: 'صياغة المبررات', icon: <IoFlash /> },
  { id: 4, label: 'الطلب النهائي', icon: <IoCheckmarkCircle /> },
];

export const WORKFLOW_TAB_CLASSNAMES = {
  base: "w-full overflow-x-auto",
  tabList: "w-full p-1 bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl mb-4 gap-1",
  tab: "flex-1 px-3 py-3 min-h-[44px] justify-center rounded-lg data-[hover=true]:app-surface-soft dark:data-[hover=true]:app-surface-soft transition-colors z-0",
  tabContent: "font-bold text-[13px] app-text-subtle dark:app-text-subtle group-data-[selected=true]:text-[var(--main-color)] dark:group-data-[selected=true]:text-white relative z-10",
  panel: "pt-4 pb-2 px-0",
  cursor: "w-full h-full bg-orange-50 dark:bg-[var(--accent-soft)] rounded-lg shadow-none border-0",
} as const;

export const WORKFLOW_TAB_PROPS = {
  disableAnimation: true,
  variant: 'light' as const,
  color: 'primary' as const,
};
