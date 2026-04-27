import type { SubscriptionLifecycleDto } from'../../../features/analytics/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from'recharts';
import { Spinner } from"@heroui/react";

interface SubscriptionLifecycleProps {
 data: SubscriptionLifecycleDto | null;
 isLoading: boolean;
}

const SubscriptionLifecycle = ({ data, isLoading }: SubscriptionLifecycleProps) => {
 if (isLoading || !data) {
 return (
 <div className="flex justify-center items-center py-20" style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', padding:'var(--padding)' }}>
 <Spinner size="lg" color="primary" />
 </div>
 );
 }

 // Handle both camelCase and PascalCase from API
 const d = data as SubscriptionLifecycleDto & Record<string, unknown>;
 const chartData = [
 { name:'مشتركين جدد', value: (d.totalNewSubscribers as number | undefined) ?? (d.TotalNewSubscribers as number | undefined) ?? 0, fill:'#EF950A' },
 { name:'تجديد', value: (d.renewals as number | undefined) ?? (d.Renewals as number | undefined) ?? 0, fill:'#34BF49' },
 { name:'ترقيات', value: (d.upgrades as number | undefined) ?? (d.Upgrades as number | undefined) ?? 0, fill:'#3B82F6' },
 { name:'استرجاع', value: (d.refunds as number | undefined) ?? (d.Refunds as number | undefined) ?? 0, fill:'#EF4444' },
 { name:'إلغاء', value: (d.oneMonthChurners as number | undefined) ?? (d.OneMonthChurners as number | undefined) ?? 0, fill:'#F59E0B' },
 ];

 return (
 <div style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', padding:'var(--padding)' }}>
 <div className="h-[300px] w-full" dir="ltr">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
 <XAxis
 dataKey="name"
 tick={{ fill:'var(--muted-color)', fontSize: 12 }}
 axisLine={{ stroke:'var(--border-color)' }}
 tickLine={false}
 />
 <YAxis
 tick={{ fill:'var(--muted-color)', fontSize: 12 }}
 axisLine={false}
 tickLine={false}
 />
 <Tooltip
 cursor={{ fill:'var(--surface-muted)' }}
 contentStyle={{
 backgroundColor:'var(--white-color)',
 borderColor:'var(--border-color)',
 borderRadius:'var(--sm-radius)',
 color:'var(--title-color)',
 fontFamily:'Tajawal',
 }}
 />
 <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
};

export default SubscriptionLifecycle;
