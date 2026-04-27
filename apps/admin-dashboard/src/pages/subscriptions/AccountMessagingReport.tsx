import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCard from"../../components/public/statsCards/StatsCard";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { Spinner } from"@heroui/react";
import { FaShieldAlt, FaEnvelope, FaLock, FaExclamationTriangle } from"react-icons/fa";
import fetchAccountMessagingAudit from"../../redux/reports/thunk/fetchAccountMessagingAudit";
import type { TOtpAuditEntry, TEmailAuditEntry } from"../../redux/reports/thunk/fetchAccountMessagingAudit";

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

 useEffect(() => {
 dispatch(fetchAccountMessagingAudit());
 }, [dispatch]);

 const otpTableData = (accountMessagingAudit?.recentOtpEvents ?? []).map((e: TOtpAuditEntry) => ({
 key: String(e.id),
 userName: e.userName,
 purpose: purposeLabel(e.purpose),
 maskedDestination: e.maskedDestination,
 status: <span style={{ color: statusColor(e.status), fontWeight: 600 }}>{e.status ==="Consumed" ?"مستخدم" : e.status ==="Active" ?"نشط" : e.status ==="Expired" ?"منتهي" : e.status ==="Invalidated" ?"ملغي" : e.status}</span>,
 attemptCount: String(e.attemptCount),
 issuedAtUtc: new Date(e.issuedAtUtc).toLocaleDateString("ar-EG"),
 failureReason: e.failureReason ??"-",
 }));

 const emailTableData = (accountMessagingAudit?.recentEmailEvents ?? []).map((e: TEmailAuditEntry) => ({
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
 <div style={{ marginBottom:"2rem" }}>
 <CustomTable data={otpTableData} columns={otpColumns} />
 </div>

 <SubTitle title="آخر أحداث البريد الإلكتروني" />
 <CustomTable data={emailTableData} columns={emailColumns} />
 </Container>
 );
};

export default AccountMessagingReport;
