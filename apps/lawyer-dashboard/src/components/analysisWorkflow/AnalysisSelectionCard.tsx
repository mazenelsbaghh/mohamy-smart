import'./AnalysisWorkflow.css';
import { motion, useReducedMotion } from'framer-motion';
import { MdDone } from'react-icons/md';

type TAnalysisSelectionCard = {
 badge: string;
 title?: string;
 description: string;
 meta?: React.ReactNode;
 selected?: boolean;
 onClick?: () => void;
};

const AnalysisSelectionCard = ({
 badge,
 title,
 description,
 meta,
 selected = false,
 onClick,
}: TAnalysisSelectionCard) => {
 const prefersReducedMotion = useReducedMotion();

 return (
 <motion.button
 type="button"
 className={`analysis-selection-card ${selected ?'is-selected' :''}`}
 onClick={onClick}
 whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
 transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
 >
 <div className="analysis-selection-card__head">
 <span className="analysis-selection-card__badge">{badge}</span>
 <span className="analysis-selection-card__status">
 <i>{selected ? <MdDone /> : null}</i>
 {selected ?'معتمدة' :'قيد المراجعة'}
 </span>
 </div>

 {title && <h3>{title}</h3>}
 <p>{description}</p>
 {meta && <div className="analysis-selection-card__meta">{meta}</div>}
 </motion.button>
 );
};

export default AnalysisSelectionCard;
