import StatsCard, { type TStatsCard } from"./StatsCard";


type TStatsCards = {
 card1: TStatsCard;
 card2: TStatsCard;
 card3: TStatsCard;
}

const StatsCards = ({ card1, card2, card3 }: TStatsCards) => {
 return (
 <div className="flex flex-wrap items-center justify-between">
 <div className="w-full md:w-6/12 lg:w-4/12 px-1 mb-4 flex lg:justify-start">
 <StatsCard
 icon={card1.icon}
 iconColor={card1.iconColor}
 text={card1.text}
 number={card1.number}
 />
 </div>
 <div className="w-full md:w-6/12 lg:w-4/12 px-1 mb-4 flex lg:justify-center">
 <StatsCard
 icon={card2.icon}
 iconColor={card2.iconColor}
 text={card2.text}
 number={card2.number}
 />
 </div>
 <div className="w-full md:w-6/12 lg:w-4/12 px-1 mb-4 flex lg:justify-end">
 <StatsCard
 icon={card3.icon}
 iconColor={card3.iconColor}
 text={card3.text}
 number={card3.number}
 />
 </div>
 </div>
 );
};

export default StatsCards;