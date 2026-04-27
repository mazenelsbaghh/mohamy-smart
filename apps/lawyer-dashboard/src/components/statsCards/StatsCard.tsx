import'./StatsCard.css';
import type { CSSProperties } from'react';

export type TStatsCard = {
 icon: React.ReactNode;
 iconColor: CSSProperties['color'],
 text: string;
 number: number;
};

const StatsCard = ({ icon, iconColor, text, number }: TStatsCard) => {
 return (
 <div className='stats-card'>
 <div className="flex items-center gap-4 mb-4">
 <div className="icon"
 style={{ color: iconColor }}
 >
 {icon}
 </div>
 <h4>
 {text}
 </h4>
 </div>
 <h3>
 {number}
 </h3>
 </div>
 );
};

export default StatsCard;