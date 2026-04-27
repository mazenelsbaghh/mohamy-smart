import { BsExclamationTriangleFill } from'react-icons/bs';

type ReviewField = {
 label: string;
 value?: string | number | null;
 /** Span full grid width — use for long-text fields */
 fullWidth?: boolean;
};

type ReviewSection = {
 title: string;
 fields: ReviewField[];
};

type ConfirmReviewBannerProps = {
 /** Sections of data to display in the review table */
 sections: ReviewSection[];
 /** Main warning message shown at the top (defaults to a generic Arabic message) */
 warningMessage?: string;
 /** Secondary note displayed below the warning (defaults to responsibility message) */
 noteMessage?: string;
};

/**
 * Shared review/confirmation banner shown before a user submits a form.
 * Displays all provided data in a styled, brand-consistent summary so the
 * user can verify every field before confirming.
 *
 * Usage:
 * <ConfirmReviewBanner sections={[{ title:"بيانات القضية", fields: [...] }]} />
 */
const ConfirmReviewBanner = ({
 sections,
 warningMessage ='لحظة مراجعة سريعة — كل محامي محترف يتأكد قبل ما يضغط ✓',
 noteMessage ='أنا مجرد مساعد ذكي أستخرج البيانات ويُنظِّمها لك، لكنَّ المسؤوليةَ القانونية والمهنية كاملةً تقع على عاتقك. تحقَّق من كل حقل بعينك قبل المضيّ قُدُماً.',
}: ConfirmReviewBannerProps) => {
 return (
 <div className="confirm-review-banner" dir="rtl">
 {/* ── Warning Header ── */}
 <div className="crb-header">
 <span className="crb-icon">
 <BsExclamationTriangleFill />
 </span>
 <div className="crb-header-text">
 <p className="crb-warning-msg">{warningMessage}</p>
 <p className="crb-note-msg">{noteMessage}</p>
 </div>
 </div>

 {/* ── Data Sections ── */}
 {sections.map((section, sIdx) => (
 <div key={sIdx} className="crb-section">
 {/* Section label with brand accent bar */}
 <div className="crb-section-label">
 <span className="crb-accent-bar" />
 <span className="crb-section-title">{section.title}</span>
 </div>

 <div className="crb-fields">
 {section.fields.map((field, fIdx) => (
 <div key={fIdx} className={`crb-field${field.fullWidth ?' crb-field--full' :''}`}>
 <span className="crb-field-label">{field.label}</span>
 <span className="crb-field-value">
 {field.value !== undefined && field.value !== null && field.value !==''
 ? String(field.value)
 : <em className="crb-empty">— غير محدد —</em>}
 </span>
 </div>
 ))}
 </div>
 </div>
 ))}

 {/* ── Responsibility Stamp ── */}
 <div className="crb-stamp">
 <span className="crb-stamp-dot" />
 <span className="crb-stamp-text">
 بالضغط على «إنشاء القضية» فأنتَ تُقِرُّ بأنك راجعتَ جميع البيانات بنفسك، وتتحمل كامل المسؤولية القانونية والمهنية عن صحتها. الذكاء الاصطناعي أداةٌ مساعِدة — القرارُ النهائي لك وحدك.
 </span>
 </div>
 </div>
 );
};

export default ConfirmReviewBanner;
