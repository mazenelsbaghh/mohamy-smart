import './Auth.css';
import { Outlet, Link } from "react-router-dom";
import { Sparkles, Briefcase, Scale, Clock, ShieldCheck } from "lucide-react";
import { Toaster } from 'sileo';
import 'sileo/styles.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* ── Form Panel (Right / RTL primary) ── */}
      <div className="auth-form-panel-container">
        <section className="auth-form-panel">
          <div className="auth-brand">
            <img src="/images/logo.png" alt="محامي سمارت" className="auth-brand-logo" loading="lazy" decoding="async" />
            <span className="auth-brand-text">محامي سمارت</span>
          </div>

          <div className="auth-form-wrapper">
            <Outlet />
            <Toaster position="top-center" />
          </div>

          {/* Bottom features columns */}
          <div className="auth-footer-features">
            <div className="auth-footer-feature-col">
              <div className="auth-footer-feature-icon-box">
                <Clock className="w-5 h-5 text-[#EF950A]" />
              </div>
              <div className="auth-footer-feature-text">
                <h4 className="auth-footer-feature-title">متاح على مدار الساعة</h4>
                <p className="auth-footer-feature-desc">مساعدك القانوني في أي وقت</p>
              </div>
            </div>
            
            <div className="auth-footer-feature-col">
              <div className="auth-footer-feature-icon-box">
                <Sparkles className="w-5 h-5 text-[#EF950A]" />
              </div>
              <div className="auth-footer-feature-text">
                <h4 className="auth-footer-feature-title">دقة واحترافية</h4>
                <p className="auth-footer-feature-desc">تحليل قانوني دقيق وفوري</p>
              </div>
            </div>

            <div className="auth-footer-feature-col">
              <div className="auth-footer-feature-icon-box">
                <ShieldCheck className="w-5 h-5 text-[#EF950A]" />
              </div>
              <div className="auth-footer-feature-text">
                <h4 className="auth-footer-feature-title">آمن وسري</h4>
                <p className="auth-footer-feature-desc">حماية بياناتك بأعلى معايير الأمان</p>
              </div>
            </div>
          </div>

          <div className="auth-page-footer">
            <Link to="/privacy-policy">سياسة الخصوصية</Link>
            <Link to="/terms-conditions">شروط الخدمة</Link>
            <a href={`https://wa.me/${import.meta.env.VITE_SUPPORT_WHATSAPP || '201289221056'}`} target="_blank" rel="noreferrer">الدعم الفني</a>
          </div>
        </section>
      </div>

      {/* ── Visual Panel (Left / decorative) ── */}
      <section className="auth-visual-panel">
        {/* Amber accent line at top */}
        <div className="auth-visual-accent-line" />

        {/* Background watermark numeral */}
        <div className="auth-visual-bg-text" aria-hidden="true">
          <span className="auth-visual-bg-text-inner">م</span>
        </div>

        <div className="auth-visual-content">
          {/* Top brand mark */}
          <div className="auth-visual-brand">
            <img src="/images/logo.png" alt="محامي سمارت" className="auth-visual-brand-logo" />
            <span className="auth-visual-brand-text">محامي سمارت</span>
          </div>

          {/* Middle features block */}
          <div className="auth-visual-middle">
            <h1 className="auth-visual-heading">ابدأ رحلتك الذكية معنا</h1>
            <p className="auth-visual-subtitle">
              منصة قانونية متكاملة مدعومة بالذكاء الاصطناعي لإدارة وتيسير أعمالك القانونية بكفاءة واحترافية.
            </p>

            <ul className="auth-features-list">
              <li className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <Sparkles className="auth-feature-icon" />
                </div>
                <div className="auth-feature-text">
                  <h3 className="auth-feature-title">تحليل القضايا بالذكاء الاصطناعي</h3>
                  <p className="auth-feature-description">
                    استخلص الوقائع، ابنِ الدفوع القانونية، وصُغ مذكرات الدفاع بدقة متناهية.
                  </p>
                </div>
              </li>
              <li className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <Briefcase className="auth-feature-icon" />
                </div>
                <div className="auth-feature-text">
                  <h3 className="auth-feature-title">إدارة الوقائع والمستندات</h3>
                  <p className="auth-feature-description">
                    نظّم مستنداتك ووقائع قضيتك واربطها بالدفوع في واجهة واحدة مرنة وسهلة.
                  </p>
                </div>
              </li>
              <li className="auth-feature-item">
                <div className="auth-feature-icon-wrapper">
                  <Scale className="auth-feature-icon" />
                </div>
                <div className="auth-feature-text">
                  <h3 className="auth-feature-title">محرك البحث القانوني الذكي</h3>
                  <p className="auth-feature-description">
                    ابحث في اللوائح والأنظمة والقرارات القانونية للحصول على السند القانوني الأنسب.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Copyright footer */}
          <footer className="auth-visual-footer">
            <span>محامي سمارت © 2026. جميع الحقوق محفوظة.</span>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
