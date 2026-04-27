import'./SubTitle.css';

type TSubTitle = {
 title: string;
 components?: React.ReactNode;
}

const SubTitle = ({ title, components }: TSubTitle) => {
 return (
 <div className='sub-title flex flex-wrap gap-5 md:gap-0 justify-between items-center my-4'>
 <h3 className='w-full md:w-6/12'>
 {title}
 </h3>
 <div className="components w-full md:w-6/12">
 {components}
 </div>
 </div>
 )
}

export default SubTitle