import'./HeadTitle.css';

type THeadTitle = {
 title: string;
}

const HeadTitle = ({ title }: THeadTitle) => {
 return (
 <div className='head-title flex justify-start mb-5'>
 <h2>{title}</h2>
 </div>
 )
}

export default HeadTitle