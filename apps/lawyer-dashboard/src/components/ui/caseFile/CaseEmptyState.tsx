import'./CaseFile.css';

type CaseEmptyStateProps = {
 icon: React.ReactNode;
 message: string;
 details?: string;
 actionLabel?: string;
 onAction?: () => void;
 className?: string;
};

const CaseEmptyState = ({
 icon,
 message,
 details,
 actionLabel,
 onAction,
 className ='',
}: CaseEmptyStateProps) => {
 return (
 <div className={`case-file-empty-state ${className}`.trim()}>
 <div className="case-file-empty-state__icon">{icon}</div>
 <p>{message}</p>
 {details ? <small>{details}</small> : null}
 {actionLabel && onAction ? (
 <button type="button" className="case-file-empty-state__action" onClick={onAction}>
 {actionLabel}
 </button>
 ) : null}
 </div>
 );
};

export default CaseEmptyState;
