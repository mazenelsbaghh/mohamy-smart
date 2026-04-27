import type { CohortDataDto } from'../../../features/analytics/analyticsService';
import { Spinner } from"@heroui/react";

interface CohortRetentionTableProps {
 data: CohortDataDto[] | null;
 isLoading: boolean;
}

const CohortRetentionTable = ({ data, isLoading }: CohortRetentionTableProps) => {
 if (isLoading) {
 return (
 <div className="flex justify-center items-center py-20" style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', padding:'var(--padding)' }}>
 <Spinner size="lg" color="primary" />
 </div>
 );
 }

 if (!data || !Array.isArray(data) || data.length === 0) {
 return (
 <div className="flex justify-center items-center py-10" style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', padding:'var(--padding)', color:'var(--muted-color)' }}>
 لا توجد بيانات متاحة حالياً
 </div>
 );
 }

 // Normalize data to handle both camelCase and PascalCase
 const normalizedData = data.map((rawItem) => {
 const item = rawItem as CohortDataDto & Record<string, unknown>;
 return {
 cohortMonth: item.cohortMonth ?? item.CohortMonth ??'',
 totalUsers: item.totalUsers ?? item.TotalUsers ?? 0,
 retentionRates: item.retentionRates ?? item.RetentionRates ?? {}
 };
 });

 const allMonths = new Set<string>();
 normalizedData.forEach(cohort => {
 Object.keys(cohort.retentionRates).forEach(month => allMonths.add(month));
 });
 const sortedMonths = Array.from(allMonths).sort((a, b) => a.localeCompare(b));

 const getBadgeStyle = (percentage: number): React.CSSProperties => {
 if (percentage >= 70) return { backgroundColor:'var(--success-soft)', color:'var(--success-color)' };
 if (percentage >= 40) return { backgroundColor:'var(--accent-soft)', color:'var(--main-color)' };
 return { backgroundColor:'var(--danger-soft)', color:'var(--danger-color)' };
 };

 return (
 <div style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', overflow:'hidden' }}>
 <div style={{ padding:'var(--padding)', borderBottom:'1px solid var(--border-color)' }}>
 <h3 style={{ fontSize:'1.2rem', fontWeight: 600, color:'var(--title-color)', marginBottom:'0.3rem' }}>
 تحليل المجموعات (Cohort Retention)
 </h3>
 <p style={{ fontSize:'0.85rem', color:'var(--text-color)' }}>
 تتبع معدلات الاحتفاظ بالمحامين بمرور الوقت منذ شهر التسجيل.
 </p>
 </div>
 <div style={{ overflowX:'auto' }}>
 <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'right', fontSize:'0.88rem' }}>
 <thead style={{ backgroundColor:'var(--surface-muted)' }}>
 <tr>
 <th style={{ padding:'14px 20px', fontWeight: 600, color:'var(--muted-color)', whiteSpace:'nowrap' }}>
 شهر التسجيل
 </th>
 <th style={{ padding:'14px 20px', fontWeight: 600, color:'var(--muted-color)', textAlign:'center' }}>
 إجمالي المستخدمين
 </th>
 {sortedMonths.map(month => (
 <th key={month} style={{ padding:'14px 20px', fontWeight: 600, color:'var(--muted-color)', textAlign:'center' }}>
 {month}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {normalizedData.map((cohort, idx) => (
 <tr key={idx}>
 <td style={{ padding:'12px 20px', borderBottom:'1px solid var(--border-color)', fontWeight: 500, color:'var(--title-color)', whiteSpace:'nowrap' }}>
 {cohort.cohortMonth}
 </td>
 <td style={{ padding:'12px 20px', borderBottom:'1px solid var(--border-color)', textAlign:'center', fontWeight: 700, color:'var(--title-color)' }}>
 {cohort.totalUsers}
 </td>
 {sortedMonths.map(month => {
 const value = cohort.retentionRates[month];
 return (
 <td key={month} style={{ padding:'8px 12px', borderBottom:'1px solid var(--border-color)', textAlign:'center' }}>
 {value !== undefined ? (
 <span style={{
 display:'inline-block',
 padding:'4px 12px',
 borderRadius:'8px',
 fontSize:'0.78rem',
 fontWeight: 600,
 minWidth:'56px',
 ...getBadgeStyle(value)
 }}>
 {value}%
 </span>
 ) : (
 <span style={{ color:'var(--muted-color)', opacity: 0.5 }}>-</span>
 )}
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
};

export default CohortRetentionTable;
