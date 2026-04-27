import type { ReactNode } from"react";

type FormSectionProps = {
 label: string;
 /** Renders an"اختياري" badge and muted accent color */
 optional?: boolean;
 /** Renders a dashed divider above this section */
 withTopDivider?: boolean;
 children: ReactNode;
};

/**
 * Standard form section with labelled grouping.
 * Use withTopDivider on every section after the first.
 */
const FormSection = ({ label, optional, withTopDivider, children }: FormSectionProps) => {
 return (
 <>
 {withTopDivider && (
 <div className="border-t border-dashed app-border" />
 )}
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-2" dir="rtl">
                        <span
                            className={`w-1 h-4 rounded-full flex-shrink-0 ${optional ? 'bg-[var(--border-strong)]' : 'bg-[var(--main-color)]'}`}
                        />
                        <p
                            className={`text-xs font-bold ${optional ? 'text-[var(--text-color)]' : 'text-[var(--main-color)]'}`}
                        >
                            {label}
                        </p>
 {optional && (
 <span className="text-[10px] app-surface-soft app-text-muted px-2 py-0.5 rounded-full border app-border">
 اختياري
 </span>
 )}
 </div>
 {children}
 </div>
 </>
 );
};

export default FormSection;
