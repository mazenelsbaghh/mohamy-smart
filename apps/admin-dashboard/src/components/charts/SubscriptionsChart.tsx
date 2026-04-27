import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from"recharts";
import { useEffect } from"react";
import { useDispatch, useSelector } from"react-redux";
import type { RootState, AppDispatch } from"../../redux/store";
import fetchRevenueReport from"../../redux/reports/thunk/fetchRevenueReport";
import { Spinner } from"@heroui/react";

const SubscriptionsChart = () => {
 const dispatch = useDispatch<AppDispatch>();
 const { revenueReport } = useSelector((state: RootState) => state.reports);

 useEffect(() => {
 if (!revenueReport) {
 dispatch(fetchRevenueReport("Monthly"));
 }
 }, [dispatch, revenueReport]);

 if (!revenueReport?.dataPoints?.length) {
 return (
 <div className="flex justify-center items-center h-full min-h-[200px]">
 <Spinner size="sm" color="primary" />
 </div>
 );
 }

 const data = revenueReport.dataPoints.map((point) => ({
 month: point.label,
 subscriptions: point.amount,
 }));

 return (
 <ResponsiveContainer width={'100%'} height={'100%'}>
 <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="var(--main-color)" stopOpacity={0.6} />
 <stop offset="90%" stopColor="var(--main-color)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="month" />
 <YAxis />
 <Tooltip />
 <CartesianGrid strokeDasharray="3 3" stroke="#DFE5EE" />
 <Area
 type="monotone"
 dataKey="subscriptions"
 stroke="none"
 fill="url(#colorGradient)"
 />
 <Line
 type="monotone"
 dataKey="subscriptions"
 stroke="var(--main-color)"
 strokeWidth={3}
 dot={{ r: 5, strokeWidth: 2, fill:"#fff" }}
 activeDot={{ r: 7 }}
 />
 </AreaChart>
 </ResponsiveContainer>
 );
};

export default SubscriptionsChart;
