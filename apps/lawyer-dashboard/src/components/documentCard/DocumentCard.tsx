import'./DocumentCard.css';
import { useNavigate } from'react-router-dom';

type TDocumentCard = {
 icon: React.ReactNode;
 title: string;
 text: string;
 stepCount: string | number;
 link: string;
 facts?: string;
 disabled?: boolean;
 variant?:'primary' |'secondary';
 eyebrow?: string;
}

const DocumentCard = ({
 icon,
 title,
 text,
 stepCount,
 link,
 facts,
 disabled = false,
 variant ='secondary',
 eyebrow,
}: TDocumentCard) => {
 const navigate = useNavigate();
 const label = `${title}، ${stepCount} خطوات`;

 return (
 <button
 type="button"
 className={`document-card document-card--${variant}`}
 aria-label={label}
 disabled={disabled}
 onClick={() => navigate(link, {
 state: facts,
 })}
 >
 {eyebrow ? <span className="document-card__eyebrow">{eyebrow}</span> : null}
 <div className="document-card__body">
 <div className="img">
 {icon}
 </div>
 <div className="text">
 <h4>{title}</h4>
 <p>
 {text}
 </p>
 </div>
 </div>
 <span className="document-card__meta">{stepCount} خطوات</span>
 </button>
 );
};

export default DocumentCard;
