import'./SubTitle.css';

type TSubTitle = {
 title: string;
 components?: React.ReactNode;
};

const SubTitle = ({ title, components }: TSubTitle) => {


 return (
 <div className='sub-title flex flex-wrap gap-5 md:gap-0 justify-between items-center my-4'>
 <h3>
 {title}
 </h3>
 <div className="components">
 {components}
 </div>
 </div>
 );
};

export default SubTitle;