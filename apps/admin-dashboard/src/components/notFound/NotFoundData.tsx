import NotFoundImage from'./NotFoundImage';

const NotFoundData = ({ text }: { text: string }) => {
 return (
 <div className='not-found-data my-5'>
 <NotFoundImage text={text} variant='cases' size='compact' />
 </div>
 );
};

export default NotFoundData;
