import type { UserEngagementDto } from'../../../features/analytics/analyticsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from'recharts';
import { Spinner } from"@heroui/react";

interface UserEngagementProps {
 data: UserEngagementDto | null;
 isLoading: boolean;
}

const UserEngagement = ({ data, isLoading }: UserEngagementProps) => {
 if (isLoading || !data) {
 return (
 <div className="flex justify-center items-center py-20" style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', padding:'var(--padding)' }}>
 <Spinner size="lg" color="primary" />
 </div>
 );
 }

 // Handle both camelCase and PascalCase from API
 const d = data as UserEngagementDto & Record<string, unknown>;
 const dau = (d.dailyActiveUsers as number | undefined) ?? (d.DailyActiveUsers as number | undefined) ?? 0;
 const mau = (d.monthlyActiveUsers as number | undefined) ?? (d.MonthlyActiveUsers as number | undefined) ?? 0;
 const dormant = (d.dormantUsers as number | undefined) ?? (d.DormantUsers as number | undefined) ?? 0;
 const power = (d.powerUsersCount as number | undefined) ?? (d.PowerUsersCount as number | undefined) ?? 0;

 const chartData = [
 { name:'نشط يومياً', value: dau },
 { name:'مستخدم سوبر', value: power },
 { name:'نشط شهرياً', value: mau },
 { name:'غير نشط', value: dormant }
 ];

 return (
 <div style={{ backgroundColor:'var(--white-color)', borderRadius:'var(--sm-radius)', padding:'var(--padding)' }}>
 <div className="flex justify-between items-center mb-4">
 <div className="flex gap-4" style={{ fontSize:'0.88rem' }}>
 <div className="flex flex-col items-end">
 <span style={{ color:'var(--muted-color)' }}>DAU</span>
 <span style={{ color:'var(--title-color)', fontWeight: 700 }}>{dau}</span>
 </div>
 <div className="flex flex-col items-end">
 <span style={{ color:'var(--muted-color)' }}>MAU</span>
 <span style={{ color:'var(--title-color)', fontWeight: 700 }}>{mau}</span>
 </div>
 </div>
 </div>

 <div className="h-[280px] w-full" dir="ltr">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
 <defs>
 <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#EF950A" stopOpacity={0.3} />
 <stop offset="95%" stopColor="#EF950A" stopOpacity={0} />
 </linearGradient>
 </defs>
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
 cursor={{ stroke:'var(--border-color)', strokeWidth: 1, strokeDasharray:'3 3' }}
 contentStyle={{
 backgroundColor:'var(--white-color)',
 borderColor:'var(--border-color)',
 borderRadius:'var(--sm-radius)',
 color:'var(--title-color)',
 fontFamily:'Tajawal',
 }}
 />
 <Area
 type="monotone"
 dataKey="value"
 stroke="#EF950A"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorValue)"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
};

export default UserEngagement;
