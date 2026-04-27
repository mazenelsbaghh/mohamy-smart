import type { ReactNode } from'react';
import type { IconType } from'react-icons';
import SubTitle from'../subTitle/SubTitle';
import { CustomCard } from'@mohamy/shared-ui';

type AnalysisStageLayoutProps = {
 title: string;
 actions?: ReactNode;
 children: ReactNode;
 sidebar: ReactNode;
};

type AnalysisStageSectionCardProps = {
 label: string;
 children: ReactNode;
 className?: string;
};

type AnalysisStageSidebarCardProps = {
 label: string;
 value: ReactNode;
 description: string;
 tone?:'accent' |'success' |'danger';
 icon?: ReactNode;
 valueClassName?: string;
};

type AnalysisStageActionButtonProps = {
 label: string;
 icon: IconType;
 onClick: () => void;
 disabled?: boolean;
 variant?:'primary' |'secondary';
};

type AnalysisStageDocumentCardProps = {
 label: string;
 badge: string;
 badgeTone?:'accent' |'success';
 children: ReactNode;
};

type AnalysisStageBannerProps = {
 label: string;
 children: ReactNode;
 tone?:'accent' |'success' |'danger';
 icon?: ReactNode;
};

type AnalysisStageNumberedListProps = {
 items: string[];
 emptyText?: string;
};

const toneClasses = {
 accent: {
 rail:'via-[var(--main-color)]',
 iconWrap:'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50',
 icon:'text-[var(--main-color)]',
 value:'text-[var(--title-color)]',
 badge:'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800/50',
 banner:'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50',
 bannerLabel:'text-orange-600 dark:text-orange-400',
 bannerText:'text-orange-800 dark:text-orange-200',
 },
 success: {
 rail:'via-green-400',
 iconWrap:'bg-[var(--success-soft)] dark:bg-green-950/40 border-[var(--success-soft)] dark:border-green-800/50',
 icon:'text-[var(--success-color)] dark:text-green-400',
 value:'text-[var(--success-color)] dark:text-green-400',
 badge:'bg-[var(--success-soft)] dark:bg-green-950/40 text-[var(--success-color)] dark:text-green-300 border-green-100 dark:border-green-800/50',
 banner:'bg-[var(--success-soft)] dark:bg-green-950/30 border-[var(--success-soft)] dark:border-green-800/50',
 bannerLabel:'text-[var(--success-color)] dark:text-green-400',
 bannerText:'text-green-800 dark:text-green-200',
 },
 danger: {
 rail:'via-red-400',
 iconWrap:'bg-[var(--danger-soft)] dark:bg-red-950/40 border-[var(--danger-soft)] dark:border-red-800/50',
 icon:'text-[var(--danger-color)] dark:text-[var(--danger-color)]',
 value:'text-[var(--danger-color)] dark:text-[var(--danger-color)]',
 badge:'bg-[var(--danger-soft)] dark:bg-red-950/40 text-[var(--danger-color)] dark:text-red-300 border-red-100 dark:border-red-800/50',
 banner:'bg-[var(--danger-soft)] dark:bg-red-950/30 border-[var(--danger-soft)] dark:border-red-800/50',
 bannerLabel:'text-[var(--danger-color)] dark:text-[var(--danger-color)]',
 bannerText:'text-red-800 dark:text-red-200',
 },
};

export const AnalysisStageLayout = ({
 title,
 actions,
 children,
 sidebar,
}: AnalysisStageLayoutProps) => (
 <div className="w-full mt-4 pb-12">
 <SubTitle
 title={title}
 components={actions ? <div className="w-full flex justify-end">{actions}</div> : undefined}
 />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 items-start">
 <div className="lg:col-span-2 flex flex-col gap-5">{children}</div>
 <div className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-6">{sidebar}</div>
 </div>
 </div>
);

export const AnalysisStageSectionCard = ({
 label,
 children,
 className ='',
}: AnalysisStageSectionCardProps) => (
 <CustomCard className={`border app-border dark:app-border-strong shadow-sm p-6 ${className}`.trim()}>
 <span className="block text-xs font-bold app-text-subtle dark:app-text-subtle mb-4 tracking-wider">{label}</span>
 {children}
 </CustomCard>
);

export const AnalysisStageSidebarCard = ({
 label,
 value,
 description,
 tone ='accent',
 icon,
 valueClassName ='',
}: AnalysisStageSidebarCardProps) => {
 const palette = toneClasses[tone];

 return (
 <CustomCard className="border app-border dark:app-border-strong shadow-sm p-6 text-center relative overflow-hidden">
 <div className={`absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-gray-100 dark:from-gray-800 ${palette.rail} to-gray-100 dark:to-gray-800 opacity-60`} />
 <span className="block text-sm font-bold app-text-subtle dark:app-text-subtle mb-2">{label}</span>
 {icon && (
 <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-3 ${palette.iconWrap}`}>
 <span className={`text-2xl ${palette.icon}`}>{icon}</span>
 </div>
 )}
 <strong className={`block font-extrabold mb-3 leading-tight ${palette.value} ${valueClassName}`.trim()}>
 {value}
 </strong>
 <div className="w-12 h-1 app-surface-soft dark:bg-gray-700 mx-auto mb-4 rounded-full" />
 <p className="text-xs app-text-subtle dark:app-text-subtle leading-relaxed">{description}</p>
 </CustomCard>
 );
};

export const AnalysisStageActionButton = ({
 label,
 icon: Icon,
 onClick,
 disabled = false,
 variant ='primary',
}: AnalysisStageActionButtonProps) => {
 const classes = variant ==='primary'
 ? disabled
 ?'app-surface-soft dark:app-surface-soft app-text-subtle dark:app-text-muted cursor-not-allowed border app-border-strong dark:app-border-strong'
 :'bg-[var(--main-color)] text-white hover:bg-opacity-90 hover:shadow-md border border-transparent'
 :'border border-[var(--main-color)] text-[var(--main-color)] hover:bg-orange-50 dark:hover:bg-orange-950/30 app-surface dark:app-surface-muted';

 return (
 <button
 type="button"
 onClick={onClick}
 disabled={disabled}
 className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-colors shadow-sm ${classes}`}
 >
 <span>{label}</span>
 <Icon className="text-lg" />
 </button>
 );
};

export const AnalysisStageDocumentCard = ({
 label,
 badge,
 badgeTone ='accent',
 children,
}: AnalysisStageDocumentCardProps) => {
 const palette = toneClasses[badgeTone];

 return (
 <CustomCard className="border app-border dark:app-border-strong shadow-sm p-8">
 <div className="flex items-center justify-between mb-6 pb-4 border-b app-border dark:app-border-strong">
 <span className="text-xs font-bold app-text-subtle dark:app-text-subtle tracking-wider">{label}</span>
 <span className={`inline-flex items-center gap-1.5 text-xs font-bold border px-3 py-1 rounded-full ${palette.badge}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${badgeTone ==='success' ?'bg-green-500' :'bg-orange-500'}`} />
 {badge}
 </span>
 </div>
 {children}
 </CustomCard>
 );
};

export const AnalysisStageBanner = ({
 label,
 children,
 tone ='accent',
 icon,
}: AnalysisStageBannerProps) => {
 const palette = toneClasses[tone];

 return (
 <div className={`rounded-[22px] px-5 py-4 flex items-start gap-3 border ${palette.banner}`}>
 {icon ? <span className={`text-2xl mt-0.5 ${palette.icon}`}>{icon}</span> : null}
 <div>
 <span className={`block text-xs font-bold mb-1 tracking-wider ${palette.bannerLabel}`}>{label}</span>
 <div className={`text-sm font-medium ${palette.bannerText}`}>{children}</div>
 </div>
 </div>
 );
};

export const AnalysisStageListItem = ({ index, children }: { index: number | string, children: ReactNode }) => (
 <li className="flex gap-3 rounded-[18px] border app-border dark:app-border-strong bg-[rgba(251,250,232,0.45)] dark:bg-[rgba(251,250,232,0.04)] px-4 py-3">
 <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
 {index}
 </span>
 <div className="text-sm leading-relaxed app-text-muted w-full">
 {children}
 </div>
 </li>
);

export const AnalysisStageNumberedList = ({
 items,
 emptyText ='لا توجد بيانات متاحة',
}: AnalysisStageNumberedListProps) => {
 if (!items.length) {
 return <p className="text-sm app-text-subtle dark:app-text-subtle">{emptyText}</p>;
 }

 return (
 <ul className="flex flex-col gap-3">
 {items.map((item, idx) => (
 <AnalysisStageListItem key={`${idx}`} index={idx + 1}>
 {item}
 </AnalysisStageListItem>
 ))}
 </ul>
 );
};
