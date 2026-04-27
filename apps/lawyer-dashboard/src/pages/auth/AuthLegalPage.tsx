import { Link } from"react-router-dom";
import { IoIosArrowForward } from"react-icons/io";

type LegalSection = {
 title: string;
 paragraphs?: string[];
 bullets?: string[];
};

type AuthLegalPageProps = {
 title: string;
 eyebrow: string;
 summary: string;
 lastUpdated: string;
 backTo: string;
 sections: LegalSection[];
};

const AuthLegalPage = ({
 title,
 eyebrow,
 summary,
 lastUpdated,
 backTo,
 sections,
}: AuthLegalPageProps) => {
 return (
 <div className="auth-legal-page">
 <div className="auth-legal-shell">
 <Link to={backTo} className="auth-back-link auth-legal-back-link">
 <IoIosArrowForward />
 <span>العودة</span>
 </Link>

 <header className="auth-legal-hero">
 <span className="auth-kicker">{eyebrow}</span>
 <h1 className="auth-legal-title">{title}</h1>
 <p className="auth-legal-summary">{summary}</p>

 <div className="auth-legal-meta-row">
 <div className="auth-legal-meta-card">
 <span className="auth-legal-meta-label">آخر تحديث</span>
 <strong className="auth-legal-meta-value">{lastUpdated}</strong>
 </div>
 <div className="auth-legal-meta-card">
 <span className="auth-legal-meta-label">الدعم الفني</span>
 <a
 className="auth-legal-meta-link"
 href={`https://wa.me/${import.meta.env.VITE_SUPPORT_WHATSAPP ||'201289221056'}`}
 target="_blank"
 rel="noreferrer"
 >
 واتساب: {import.meta.env.VITE_SUPPORT_WHATSAPP ||'01289221056'}
 </a>
 </div>
 </div>
 </header>

 <div className="auth-legal-grid">
 {sections.map((section) => (
 <section key={section.title} className="auth-legal-section">
 <h2 className="auth-legal-section-title">{section.title}</h2>

 {section.paragraphs?.map((paragraph) => (
 <p key={paragraph} className="auth-legal-text">
 {paragraph}
 </p>
 ))}

 {section.bullets ? (
 <ul className="auth-legal-list">
 {section.bullets.map((bullet) => (
 <li key={bullet} className="auth-legal-list-item">
 {bullet}
 </li>
 ))}
 </ul>
 ) : null}
 </section>
 ))}
 </div>
 </div>
 </div>
 );
};

export default AuthLegalPage;
