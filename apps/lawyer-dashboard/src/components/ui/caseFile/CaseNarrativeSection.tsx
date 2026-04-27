import type { ReactNode } from'react';
import'./CaseFile.css';

type CaseNarrativeSectionProps = {
 label: string;
 title: string;
 meta?: string;
 emphasized?: boolean;
 className?: string;
 children: ReactNode;
};

const CaseNarrativeSection = ({
 label,
 title,
 meta,
 emphasized = false,
 className ='',
 children,
}: CaseNarrativeSectionProps) => {
 return (
 <section className={`case-file-section ${emphasized ?'case-file-section--emphasis' :''} ${className}`.trim()}>
 <div className="case-file-section__header">
 <div>
 <span className="case-file-section__label">{label}</span>
 <h4>{title}</h4>
 </div>
 {meta ? <span className="case-file-section__meta">{meta}</span> : null}
 </div>

 {children}
 </section>
 );
};

export default CaseNarrativeSection;
