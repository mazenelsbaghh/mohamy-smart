import usePageTitle from '../../hooks/usePageTitle';
import { Container } from'@mohamy/shared-ui';
import'./LegalLibrary.css';
import { useNavigate } from'react-router-dom';
import { FaScaleBalanced, FaMoneyBillWave } from'react-icons/fa6';
import { MdOutlineAssignmentInd, MdOutlineDescription, MdOutlineArticle } from'react-icons/md';

import HeadTitle from'../../components/headTitle/HeadTitle';

interface LibraryTool {
 id: string;
 title: string;
 description: string;
 icon: React.ReactNode;
 route: string;
}

const TOOLS: LibraryTool[] = [
 {
 id:'inheritance',
 title:'حاسبة المواريث',
 description:'حساب نصيب كل وارث حسب الشريعة الإسلامية (المذهب الحنفي) مع بيان الأساس الشرعي لكل فرض',
 icon: <FaScaleBalanced />,
 route:'/legal-library/inheritance',
 },
 {
 id:'court-fees',
 title:'حاسبة الرسوم القضائية',
 description:'حساب الرسوم القضائية حسب نوع الدعوى وقيمة الحق المدعى به وفقاً لقانون الرسوم القضائية المصري',
 icon: <FaMoneyBillWave />,
 route:'/legal-library/court-fees',
 },
 {
 id:'power-of-attorneys',
 title:'التوكيلات',
 description:'إضافة توكيلاتك الخاصة ومتابعة حالتها بعيداً عن ملفات الموكلين',
 icon: <MdOutlineAssignmentInd />,
 route:'/legal-library/power-of-attorneys',
 },
 {
 id:'internal-regulations',
 title:'اللوائح الداخلية',
 description:'إضافة اللوائح الداخلية وربطها بالقضايا لتعمل مع القوانين المختارة داخل التحليل القانوني',
 icon: <MdOutlineArticle />,
 route:'/legal-library/internal-regulations',
 },
 {
 id:'process-server-papers',
 title:'أوراق المحضرين',
 description:'إدارة الإعلانات والإنذارات والتكليفات بالحضور ومتابعة حالتها ومرفقاتها من شاشة واحدة',
 icon: <MdOutlineDescription />,
 route:'/process-server-papers',
 },
];

const LegalLibrary = () => {
 const navigate = useNavigate();
  usePageTitle('المكتبة القانونية');

 return (
 <section className="legal-library">
 <Container>
 <HeadTitle title="المكتبة القانونية" />
 <div className="tools-grid">
 {TOOLS.map(tool => (
 <div
 key={tool.id}
 className="tool-card"
 onClick={() => navigate(tool.route)}
 >
 <div className="tool-icon">{tool.icon}</div>
 <h3 className="tool-title">{tool.title}</h3>
 <p className="tool-description">{tool.description}</p>
 </div>
 ))}
 </div>
 </Container>
 </section>
 );
};

export default LegalLibrary;
