import { CustomButton, Container } from'@mohamy/shared-ui';
import { useNavigate } from'react-router-dom';



const NotFoundPage = () => {
 const navigate = useNavigate();

 return (
 <div className="flex items-center justify-center min-h-screen app-surface-soft" dir="rtl">
 <Container>
 <div className="text-center">
 <h1 className="text-8xl font-bold text-primary-500 mb-4">404</h1>
 <h2 className="text-2xl font-semibold text-[var(--title-color)] mb-4">الصفحة غير موجودة</h2>
 <p className="app-text-muted mb-8 max-w-md mx-auto">
 عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
 </p>
 <CustomButton
 type='button'
 text='العودة إلى لوحة التحكم'
 radius='md'
 size='lg'
 color="primary"
 onClick={() => navigate('/')}
 />
 </div>
 </Container>
 </div>
 );
};

export default NotFoundPage;
