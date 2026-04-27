import'./Auth.css';
import { Outlet, Link } from'react-router-dom';
import { Toaster } from'sileo';
import'sileo/styles.css';

const AuthLayout = () => {
 return (
 <div className="auth-layout">
 {/* ── Form Panel (Right / RTL primary) ── */}
 <section className="auth-form-panel">
 <div className="auth-brand">
 <img src="/images/logo.png" alt="محامي سمارت" className="auth-brand-logo" loading="lazy" decoding="async" />
 <span className="auth-brand-text">محامي سمارت</span>
 </div>

 <div className="auth-form-wrapper">
 <Outlet />
 <Toaster position="top-center" />
 </div>

 <div className="auth-page-footer">
 <Link to="/privacy-policy">سياسة الخصوصية</Link>
 <Link to="/terms-conditions">شروط الخدمة</Link>
 <a href={`https://wa.me/${import.meta.env.VITE_SUPPORT_WHATSAPP ||'201289221056'}`} target="_blank" rel="noreferrer">الدعم الفني</a>
 </div>
 </section>

 {/* ── Visual Panel (Left / decorative) ── */}
 <section className="auth-visual-panel">
 {/* Amber accent line at top */}
 <div className="auth-visual-accent-line" />

 {/* Background watermark */}
 <div className="auth-visual-bg-text" aria-hidden="true">
 <span className="auth-visual-bg-text-inner">م</span>
 </div>

 <div className="auth-visual-content">
 {/* Top brand mark */}
 <div className="auth-visual-brand">
 <div className="auth-visual-brand-dot" />
 <span className="auth-visual-brand-label">MOHAMY SMART — ADMIN</span>
 </div>

 {/* Quote block */}
 <div className="auth-quote-block">
 <span className="auth-quote-mark" aria-hidden="true">"</span>
 <h2 className="auth-quote-text">
 الإدارة الفعّالة تبدأ<br />برؤية شاملة ودقيقة.
 </h2>
 <p className="auth-quote-source">لوحة تحكم الإدارة — محامي سمارت</p>
 </div>
 </div>

 </section>
 </div>
 );
};

export default AuthLayout;
