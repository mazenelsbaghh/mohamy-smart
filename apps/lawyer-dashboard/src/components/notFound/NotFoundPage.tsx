import { Link } from'react-router-dom';
import { CustomButton } from'@mohamy/shared-ui';
import NotFoundImage from'./NotFoundImage';
import { LuArrowRight } from'react-icons/lu';

const NotFoundPage = () => {
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 py-16">
 <NotFoundImage text="الصفحة غير موجودة" variant="default" />
 <Link to="/">
 <CustomButton
 type="button"
 text="العودة للرئيسية"
 size="md"
 radius="full"
 color="primary"
 startContent={<LuArrowRight size={14} />}
 />
 </Link>
 </div>
 );
};

export default NotFoundPage;
