import'./CaseFile.css';

type CaseInfoCardProps = {
 label: string;
 value?: string;
 fallback?: string;
 className?: string;
 valueClassName?: string;
};

const CaseInfoCard = ({
 label,
 value,
 fallback ='غير متاح',
 className ='',
 valueClassName ='',
}: CaseInfoCardProps) => {
 const resolvedValue = value?.trim() ? value : fallback;

 return (
 <article className={`case-file-info-card ${className}`.trim()}>
 <span className="case-file-info-card__label">{label}</span>
 <div className={`case-file-info-card__value ${valueClassName}`.trim()}>{resolvedValue}</div>
 </article>
 );
};

export default CaseInfoCard;
