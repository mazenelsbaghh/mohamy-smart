export const ADMIN_COMPLAINT_STEPS = [
  'التصنيف',
  'مسودة الوقائع',
  'تحليل المخالفات',
  'صياغة الطلبات',
  'تجميع الشكوى النهائية'
];

export const LEGAL_WARNING_STEPS = [
  'التصنيف والتحليل',
  'صياغة الإنذار',
  'تجميع المذكرة النهائية'
];

export const DEFENSE_MEMO_STEPS = [
  'مراجعة الوقائع',
  'التحليل القانوني',
  'تحليل الدفوع',
  'صياغة الطلبات',
  'تجميع المذكرة النهائية'
];

export const WORKFLOW_TAB_CLASSNAMES = {
  base: "w-full overflow-x-auto",
  tabList: "w-full p-1 bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl mb-4 gap-1",
  tab: "flex-1 px-3 py-3 min-h-[44px] justify-center rounded-lg data-[hover=true]:app-surface-soft dark:data-[hover=true]:app-surface-soft transition-colors z-0",
  tabContent: "font-bold text-[13px] app-text-subtle dark:app-text-subtle group-data-[selected=true]:text-[var(--main-color)] dark:group-data-[selected=true]:text-white relative z-10",
  panel: "pt-4 pb-2 px-0",
  cursor: "w-full h-full bg-orange-50 dark:bg-orange-950/40 rounded-lg shadow-none border-0",
} as const;

export const WORKFLOW_TAB_PROPS = {
  disableAnimation: true,
  variant: 'light' as const,
  color: 'primary' as const,
};
