import React, { Suspense } from"react"
import { BrowserRouter, Route, Routes } from"react-router-dom"
import { Spinner } from"@heroui/react"
import AuthLayout from"../pages/auth/AuthLayout"
import Layout from"../layout/Layout"
import AdminRoute from"./AdminRoute"
import PublicRoute from"./PublicRoute"

const Login = React.lazy(() => import("../pages/auth/Login"))
const PrivacyPolicy = React.lazy(() => import("../pages/auth/PrivacyPolicy"))
const TermsConditions = React.lazy(() => import("../pages/auth/TermsConditions"))
const Home = React.lazy(() => import("../pages/home/Home"))
const Lawyers = React.lazy(() => import("../pages/lawyers/Lawyers"))
const LawyerDetails = React.lazy(() => import("../pages/lawyers/LawyerDetails"))
const Subscriptions = React.lazy(() => import("../pages/subscriptions/Subscriptions"))
const SubscriptionReports = React.lazy(() => import("../pages/subscriptions/SubscriptionReports"))
const SubscriptionDetails = React.lazy(() => import("../pages/subscriptions/SubscriptionDetails"))
const AccountMessagingReport = React.lazy(() => import("../pages/subscriptions/AccountMessagingReport"))
const PlansAndReview = React.lazy(() => import("../pages/plansAndReview/PlansAndReview"))
const Reviews = React.lazy(() => import("../pages/plansAndReview/Reviews"))
const Settings = React.lazy(() => import("../pages/settings/Settings"))
const Notifications = React.lazy(() => import("../pages/notifications/Notifications"))
const ContactRequests = React.lazy(() => import("../pages/contactRequests/ContactRequests"))
const AiUsage = React.lazy(() => import("../pages/aiUsage/AiUsage"))
const LawyerUsageDetail = React.lazy(() => import("../pages/aiUsage/LawyerUsageDetail"))
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"))
const AnalyticsDashboard = React.lazy(() => import("../pages/analytics/AnalyticsDashboard"))

const AppRouter = () => {
 return (
 <BrowserRouter>
 <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>}>
 <Routes>
 <Route element={<PublicRoute />}>
 <Route path="/auth" element={<AuthLayout />}>
 <Route index element={<Login />} />
 <Route path="login" element={<Login />} />
 </Route>
 <Route path="/privacy-policy" element={<PrivacyPolicy />} />
 <Route path="/terms-conditions" element={<TermsConditions />} />
 </Route>
 <Route element={<AdminRoute />}>
 <Route element={<Layout />}>
 <Route path="/" element={<Home />} />

 <Route path="/lawyers" element={<Lawyers />} />
 <Route path="/lawyers/:id" element={<LawyerDetails />} />

 <Route path="/subscriptions" element={<Subscriptions />} />
 <Route path="/subscriptions/subscription-reports" element={<SubscriptionReports />} />
 <Route path="/subscriptions/subscription-reports/:id" element={<SubscriptionDetails />} />
 <Route path="/subscriptions/account-messaging" element={<AccountMessagingReport />} />

 <Route path="/plans-and-review" element={<PlansAndReview />} />
 <Route path="/plans-and-review/reviews" element={<Reviews />} />

 <Route path="/contact-requests" element={<ContactRequests />} />

 <Route path="/ai-usage" element={<AiUsage />} />
 <Route path="/ai-usage/:id" element={<LawyerUsageDetail />} />

 <Route path="/analytics" element={<AnalyticsDashboard />} />

 <Route path="/settings" element={<Settings />} />

 <Route path="/notifications" element={<Notifications />} />

 <Route path="*" element={<NotFoundPage />} />
 </Route>
 </Route>
 </Routes>
 </Suspense>
 </BrowserRouter>
 )
}

export default AppRouter
