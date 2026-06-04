import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCard from"../../components/public/statsCards/StatsCard";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { Spinner } from"@heroui/react";
import { FaShieldAlt, FaEnvelope, FaLock, FaExclamationTriangle } from"react-icons/fa";
import fetchAccountMessagingAudit from"../../redux/reports/thunk/fetchAccountMessagingAudit";
import type { TOtpAuditEntry, TEmailAuditEntry } from"../../redux/reports/thunk/fetchAccountMessagingAudit";
import AdminFilterToolbar from"../../components/adminFilters/AdminFilterToolbar";
import { recordMatchesAdminSearch } from"../../components/adminFilters/adminFilterUtils";

const statusColor = (status: string) => {
 switch (status) {
 case"Consumed": return"#22c55e";
 case"Active": return"#3b82f6";
 case"Expired": return"#f59e0b";
 case"Invalidated": return"#ef4444";
 default: return"#6b7280";
 }
};

const emailStatusColor = (status: string) => {
 switch (status) {
 case"Sent": return"#22c55e";
 case"Failed": return"#ef4444";
 case"Pending": return"#f59e0b";
 default: return"#6b7280";
 }
};

const purposeLabel = (purpose: string) => {
 switch (purpose) {
 case"forgetPassword": return"استعادة كلمة المرور";
 case"register": return"تأكيد التسجيل";
 case"SensitiveAction": return"إجراء محمي";
 default: return purpose;
 }
};

const eventTypeLabel = (eventType: string) => {
 switch (eventType) {
 case"WelcomeEmail": return"إيميل ترحيب";
 case"SubscriptionConfirmation": return"تأكيد اشتراك";
 case"PasswordResetCompleted": return"إعادة تعيين كلمة المرور";
 case"PasswordResetFallback": return"نسخة احتياطية استعادة";
 default: return eventType;
 }
};

const AccountMessagingReport = () => {
 const dispatch = useAppDispatch();
 const { accountMessagingAudit, isLoadingAccountMessaging } = useAppSelector((state) => state.reports);
 const [otpSearchQuery, setOtpSearchQuery] = useState("");
 const [otpStatusFilter, setOtpStatusFilter] = useState("");
 const [emailSearchQuery, setEmailSearchQuery] = useState("");
 const [emailStatusFilter, setEmailStatusFilter] = useState("");

 useEffect(() => {
 dispatch(fetchAccountMessagingAudit());
 }, [dispatch]);

 const otpEvents = accountMessagingAudit?.recentOtpEvents ?? [];
 const emailEvents = accountMessagingAudit?.recentEmailEvents ?? [];
 const filteredOtpEvents = otpEvents.filter((e: TOtpAuditEntry) => {
 const matchesStatus = otpStatusFilter ? e.status === otpStatusFilter : true;
 const matchesSearch = recordMatchesAdminSearch(otpSearchQuery, [
 e.userName,
 purposeLabel(e.purpose),
 e.maskedDestination,
 e.status,
 e.attemptCount,
 e.failureReason,
 new Date(e.issuedAtUtc).toLocaleDateString("ar-EG"),
 ]);
 return matchesStatus && matchesSearch;
 });
 const filteredEmailEvents = emailEvents.filter((e: TEmailAuditEntry) => {
 const matchesStatus = emailStatusFilter ? e.deliveryStatus === emailStatusFilter : true;
 const matchesSearch = recordMatchesAdminSearch(emailSearchQuery, [
 e.recipientEmail,
 eventTypeLabel(e.eventType),
 e.deliveryStatus,
 e.triggeredBy,
 e.failureReasonCategory,
 e.sentAtUtc ? new Date(e.sentAtUtc).toLocaleDateString("ar-EG") : "",
 ]);
 return matchesStatus && matchesSearch;
 });

 const otpTableData = filteredOtpEvents.map((e: TOtpAuditEntry) => ({
 key: String(e.id),
 userName: e.userName,
 purpose: purposeLabel(e.purpose),
 maskedDestination: e.maskedDestination,
 status: <span style={{ color: statusColor(e.status), fontWeight: 600 }}>{e.status ==="Consumed" ?"مستخدم" : e.status ==="Active" ?"نشط" : e.status ==="Expired" ?"منتهي" : e.status ==="Invalidated" ?"ملغي" : e.status}</span>,
 attemptCount: String(e.attemptCount),
 issuedAtUtc: new Date(e.issuedAtUtc).toLocaleDateString("ar-EG"),
 failureReason: e.failureReason ??"-",
 }));

 const emailTableData = filteredEmailEvents.map((e: TEmailAuditEntry) => ({
 key: String(e.id),
 recipientEmail: e.recipientEmail,
 eventType: eventTypeLabel(e.eventType),
 deliveryStatus: <span style={{ color: emailStatusColor(e.deliveryStatus), fontWeight: 600 }}>{e.deliveryStatus ==="Sent" ?"مرسل" : e.deliveryStatus ==="Failed" ?"فشل" : e.deliveryStatus}</span>,
 sentAtUtc: e.sentAtUtc ? new Date(e.sentAtUtc).toLocaleDateString("ar-EG") :"-",
 triggeredBy: e.triggeredBy,
 failureReasonCategory: e.failureReasonCategory ??"-",
 }));

 const otpColumns = [
 { key:"userName", label:"المستخدم" },
 { key:"purpose", label:"الغرض" },
 { key:"maskedDestination", label:"الوجهة" },
 { key:"status", label:"الحالة" },
 { key:"attemptCount", label:"المحاولات" },
 { key:"issuedAtUtc", label:"تاريخ الإرسال" },
 { key:"failureReason", label:"سبب الفشل" },
 ];

 const emailColumns = [
 { key:"recipientEmail", label:"البريد" },
 { key:"eventType", label:"النوع" },
 { key:"deliveryStatus", label:"الحالة" },
 { key:"sentAtUtc", label:"تاريخ الإرسال" },
 { key:"triggeredBy", label:"المصدر" },
 { key:"failureReasonCategory", label:"سبب الفشل" },
 ];
 const isOtpFiltering = Boolean(otpSearchQuery.trim() || otpStatusFilter);
 const isEmailFiltering = Boolean(emailSearchQuery.trim() || emailStatusFilter);

 if (isLoadingAccountMessaging || !accountMessagingAudit) {
 return (
 <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh" }}>
 <Spinner size="lg" />
 </div>
 );
 }

 return (
 <Container>
 <HeadTitle title="تقرير المراسلات والأمان" />

 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"1rem", marginBottom:"2rem" }}>
 <StatsCard
 icon={<FaShieldAlt />}
 iconColor="#3b82f6"
 text="OTP مرسل"
 number={accountMessagingAudit.totalOtpIssued}
 />
 <StatsCard
 icon={<FaShieldAlt />}
 iconColor="#22c55e"
 text="OTP مستخدم بنجاح"
 number={accountMessagingAudit.totalOtpVerified}
 />
 <StatsCard
 icon={<FaExclamationTriangle />}
 iconColor="#ef4444"
 text="OTP فاشل / ملغي"
 number={accountMessagingAudit.totalOtpFailed}
 />
 <StatsCard
 icon={<FaLock />}
 iconColor="#f59e0b"
 text="حظر تجاوز المحاولات"
 number={accountMessagingAudit.totalOtpLockedOut}
 />
 <StatsCard
 icon={<FaEnvelope />}
 iconColor="#22c55e"
 text="إيميلات مرسلة"
 number={accountMessagingAudit.totalEmailsSent}
 />
 <StatsCard
 icon={<FaEnvelope />}
 iconColor="#ef4444"
 text="إيميلات فاشلة"
 number={accountMessagingAudit.totalEmailsFailed}
 />
 </div>

 <SubTitle title="آخر أحداث OTP" />
 <AdminFilterToolbar
 searchValue={otpSearchQuery}
 onSearchChange={setOtpSearchQuery}
 searchPlaceholder="ابحث بالمستخدم، الغرض، الوجهة..."
 totalCount={otpEvents.length}
 filteredCount={filteredOtpEvents.length}
 isFiltering={isOtpFiltering}
 onReset={() => {
 setOtpSearchQuery("");
 setOtpStatusFilter("");
 }}
 filters={[
 {
 key:"otp-status",
 label:"الحالة",
 value: otpStatusFilter,
 onChange: setOtpStatusFilter,
 options: [
 { value:"", label:"الكل" },
 { value:"Consumed", label:"مستخدم" },
 { value:"Active", label:"نشط" },
 { value:"Expired", label:"منتهي" },
 { value:"Invalidated", label:"ملغي" },
 ],
 },
 ]}
 />
 <div style={{ marginBottom:"2rem" }}>
 {otpTableData.length ? (
 <CustomTable data={otpTableData} columns={otpColumns} />
 ) : (
 <div className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] p-6 text-center text-sm app-text-subtle">
 لا توجد أحداث OTP مطابقة للفلاتر الحالية
 </div>
 )}
 </div>

 <SubTitle title="آخر أحداث البريد الإلكتروني" />
 <AdminFilterToolbar
 searchValue={emailSearchQuery}
 onSearchChange={setEmailSearchQuery}
 searchPlaceholder="ابحث بالبريد، النوع، المصدر..."
 totalCount={emailEvents.length}
 filteredCount={filteredEmailEvents.length}
 isFiltering={isEmailFiltering}
 onReset={() => {
 setEmailSearchQuery("");
 setEmailStatusFilter("");
 }}
 filters={[
 {
 key:"email-status",
 label:"الحالة",
 value: emailStatusFilter,
 onChange: setEmailStatusFilter,
 options: [
 { value:"", label:"الكل" },
 { value:"Sent", label:"مرسل" },
 { value:"Failed", label:"فشل" },
 { value:"Pending", label:"قيد الإرسال" },
 ],
 },
 ]}
 />
 {emailTableData.length ? (
 <CustomTable data={emailTableData} columns={emailColumns} />
 ) : (
 <div className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] p-6 text-center text-sm app-text-subtle">
 لا توجد أحداث بريد إلكتروني مطابقة للفلاتر الحالية
 </div>
 )}
 </Container>
 );
};

export default AccountMessagingReport;
