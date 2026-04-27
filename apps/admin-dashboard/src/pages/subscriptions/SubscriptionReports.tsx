import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { SearchInput } from'@mohamy/shared-ui';
import { FilterSelect } from'@mohamy/shared-ui';

import fetchSubscriptionsReport from"../../redux/subscriptions/thunk/fetchSubscriptionsReport";
import SkeletonTable from"../../components/skeleton/SkeletonTable";

const columns = [
 { key:"lawyerName", label:"اسم المستخدم" },
 { key:"planName", label:"الخطة" },
 { key:"startDate", label:"تاريخ البداية" },
 { key:"endDate", label:"تاريخ الانتهاء" },
 { key:"isActiveLabel", label:"الحالة" },
];

const SubscriptionReports = () => {
 const dispatch = useAppDispatch();
 const { records, isLoading } = useAppSelector(
 (state) => state.subscriptions
 );
 const [statusFilter, setStatusFilter] = useState<string>("");
 const [planFilter, setPlanFilter] = useState<string>("");
 const [searchQuery, setSearchQuery] = useState<string>("");

 useEffect(() => {
 const isActive =
 statusFilter ==="نشط" ? true : statusFilter ==="غير نشط" ? false : undefined;
 dispatch(fetchSubscriptionsReport(isActive !== undefined ? { isActive } : undefined));
 }, [dispatch, statusFilter]);

 const filteredRecords = records.filter((r) => {
 const matchesPlan = planFilter ? r.planName === planFilter : true;
 const matchesSearch = searchQuery
 ? (r.lawyerName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
 : true;
 return matchesPlan && matchesSearch;
 });

 const tableData = filteredRecords.map((r) => ({
 key: r.lawyerId,
 lawyerName: r.lawyerName ||"-",
 planName: r.planName ||"-",
 startDate: r.startDate ? new Date(r.startDate).toLocaleDateString("ar-EG") :"-",
 endDate: r.endDate ? new Date(r.endDate).toLocaleDateString("ar-EG") :"-",
 isActiveLabel: r.isActive ?"نشطة" :"منتهية",
 }));

 const uniquePlans = [...new Set(records.map((r) => r.planName).filter(Boolean))];

 return (
 <section>
 <Container>
 <HeadTitle title="إدارة الاشتراكات" />

 <SubTitle title="تقارير تفصيلية :"
 components={
 <div className="flex flex-wrap gap-4">
 <SearchInput
 placeholder="ابحث باسم المستخدم..."
 value={searchQuery}
 onValueChange={setSearchQuery}
 />
 <div className="w-40">
 <FilterSelect
 label="الحالة"
 options={[
 { value:"", label:"الكل" },
 { value:"نشط", label:"نشط" },
 { value:"غير نشط", label:"غير نشط" }
 ]}
 onChange={(e) => setStatusFilter(e.target.value)}
 />
 </div>
 <div className="w-40">
 <FilterSelect
 label="الخطة"
 options={[
 { value:"", label:"الكل" },
 ...uniquePlans.map(p => ({ value: p, label: p }))
 ]}
 onChange={(e) => setPlanFilter(e.target.value)}
 />
 </div>
 </div>
 }
 />
  {isLoading ? (
  <div className="w-full">
  <SkeletonTable rows={8} cols={5} />
  </div>
  ) : (
 <div className="w-full">
 <CustomTable data={tableData} columns={columns} />
 </div>
 )}
 </Container>
 </section>
 );
};

export default SubscriptionReports;
