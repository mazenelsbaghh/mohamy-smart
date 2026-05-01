import { BrowserRouter, Route, Routes } from"react-router-dom";
import React, { Suspense } from"react";
import { Spinner } from"@heroui/react";
import ProtectedRoute from"./ProtectedRoute";
import PublicOnlyRoute from"./PublicOnlyRoute";

const CaseDetails = React.lazy(() => import("../pages/cases/CaseDetails"));

const AuthLayout = React.lazy(() => import("../pages/auth/AuthLayout"));
const Layout = React.lazy(() => import("../layout/Layout"));
const SignUp = React.lazy(() => import("../pages/auth/SignUp"));
const Login = React.lazy(() => import("../pages/auth/Login"));
const ForgotPassword = React.lazy(() => import("../pages/auth/ForgotPassword"));
const VerifyPhone = React.lazy(() => import("../pages/auth/VerifyPhone"));
const PrivacyPolicy = React.lazy(() => import("../pages/auth/PrivacyPolicy"));
const TermsConditions = React.lazy(() => import("../pages/auth/TermsConditions"));
const Home = React.lazy(() => import("../pages/home/Home"));
const Cases = React.lazy(() => import("../pages/cases/Cases"));
const Clients = React.lazy(() => import("../pages/clients/Clients"));
const ClientDetails = React.lazy(() => import("../pages/clients/ClientDetails"));
const Documents = React.lazy(() => import("../pages/Documents/Documents"));
const LegalContractsList = React.lazy(() => import("../pages/legalContracts/LegalContractsList"));
const AddNewContractsForm = React.lazy(() => import("../pages/legalContracts/AddNewContractsForm"));
const ContractDetails = React.lazy(() => import("../pages/legalContracts/ContractDetails"));
const Chat = React.lazy(() => import("../pages/chat/Chat"));
const Settings = React.lazy(() => import("../pages/settings/Settings"));
const DocumentSelection = React.lazy(() => import("../pages/cases/subPagesCases/analysis/DocumentSelection"));
const DefenseMemoPage = React.lazy(() => import("../pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage"));
const PreparingStatementOfClaims = React.lazy(() => import("../pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims"));
const AgendaPage = React.lazy(() => import("../pages/agenda/AgendaPage"));
const Subscription = React.lazy(() => import("../pages/subscription/Subscription"));
const AppealBriefPage = React.lazy(() => import("../pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage"));
const AdminComplaintPage = React.lazy(() => import("../pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage"));
const RulingAnalysisPage = React.lazy(() => import("../pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage"));
const LegalWarningPage = React.lazy(() => import("../pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage"));
const ExecRequestPage = React.lazy(() => import("../pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage"));
const LegalLibrary = React.lazy(() => import("../pages/legalLibrary/LegalLibrary"));
const InheritanceCalculator = React.lazy(() => import("../pages/legalLibrary/InheritanceCalculator"));
const CourtFeesCalculator = React.lazy(() => import("../pages/legalLibrary/CourtFeesCalculator"));
const PowerOfAttorneysPage = React.lazy(() => import("../pages/legalLibrary/PowerOfAttorneysPage"));
const ProcessServerPapersPage = React.lazy(() => import("../pages/processServerPapers/ProcessServerPapersPage"));
const NotFoundPage = React.lazy(() => import("../components/notFound/NotFoundPage"));

const SkeletonPreview = React.lazy(() => import("../pages/dev/SkeletonPreview"));

const PageLoader = () => (
 <div className="flex items-center justify-center min-h-screen">
 <Spinner size="lg" color="primary" />
 </div>
);

const AppRouter = () => {
 return (
 <BrowserRouter>
 <Suspense fallback={<PageLoader />}>
 <Routes>
 <Route element={<PublicOnlyRoute />}>
 <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>}>
 <Route index element={<Suspense fallback={<PageLoader />}><SignUp /></Suspense>} />
 <Route path="sign-up" element={<Suspense fallback={<PageLoader />}><SignUp /></Suspense>} />
 <Route path="login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
 <Route path="verify-phone" element={<Suspense fallback={<PageLoader />}><VerifyPhone /></Suspense>} />
 <Route path="forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
 </Route>
 <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
 <Route path="/terms-conditions" element={<Suspense fallback={<PageLoader />}><TermsConditions /></Suspense>} />
 </Route>

 {/* Dev-only skeleton preview for Boneyard CLI */}
 {import.meta.env.DEV && (
 <Route path="/dev/skeletons" element={<Suspense fallback={<PageLoader />}><SkeletonPreview /></Suspense>} />
 )}

 <Route element={<ProtectedRoute />}>
 <Route element={<Suspense fallback={<PageLoader />}><Layout /></Suspense>}>
 <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
 <Route path="/cases" element={<Suspense fallback={<PageLoader />}><Cases /></Suspense>} />
 <Route path="/cases/:id" element={<Suspense fallback={<PageLoader />}><CaseDetails /></Suspense>} />
 <Route path="/cases/:id/document-selection" element={<Suspense fallback={<PageLoader />}><DocumentSelection /></Suspense>} />
 <Route path="/cases/:id/document-selection/defense-memo" element={<Suspense fallback={<PageLoader />}><DefenseMemoPage /></Suspense>} />
 <Route path="/cases/:id/document-selection/preparing-statement-of-claims" element={<Suspense fallback={<PageLoader />}><PreparingStatementOfClaims /></Suspense>} />
 <Route path="/cases/:id/document-selection/appeal-brief" element={<Suspense fallback={<PageLoader />}><AppealBriefPage /></Suspense>} />
 <Route path="/cases/:id/document-selection/admin-complaint" element={<Suspense fallback={<PageLoader />}><AdminComplaintPage /></Suspense>} />
 <Route path="/cases/:id/document-selection/ruling-analysis" element={<Suspense fallback={<PageLoader />}><RulingAnalysisPage /></Suspense>} />
 <Route path="/cases/:id/document-selection/legal-warning" element={<Suspense fallback={<PageLoader />}><LegalWarningPage /></Suspense>} />
 <Route path="/cases/:id/document-selection/exec-request" element={<Suspense fallback={<PageLoader />}><ExecRequestPage /></Suspense>} />

 <Route path="/clients" element={<Suspense fallback={<PageLoader />}><Clients /></Suspense>} />
 <Route path="/clients/:id" element={<Suspense fallback={<PageLoader />}><ClientDetails /></Suspense>} />

 <Route path="/documents" element={<Suspense fallback={<PageLoader />}><Documents /></Suspense>} />

 <Route path="/legal-contracts" element={<Suspense fallback={<PageLoader />}><LegalContractsList /></Suspense>} />
 <Route path="/legal-contracts/new" element={<Suspense fallback={<PageLoader />}><AddNewContractsForm /></Suspense>} />
 <Route path="/legal-contracts/:id" element={<Suspense fallback={<PageLoader />}><ContractDetails /></Suspense>} />

 <Route path="/legal-library" element={<Suspense fallback={<PageLoader />}><LegalLibrary /></Suspense>} />
 <Route path="/legal-library/inheritance" element={<Suspense fallback={<PageLoader />}><InheritanceCalculator /></Suspense>} />
 <Route path="/legal-library/court-fees" element={<Suspense fallback={<PageLoader />}><CourtFeesCalculator /></Suspense>} />
 <Route path="/legal-library/power-of-attorneys" element={<Suspense fallback={<PageLoader />}><PowerOfAttorneysPage /></Suspense>} />
 <Route path="/process-server-papers" element={<Suspense fallback={<PageLoader />}><ProcessServerPapersPage /></Suspense>} />

 <Route path="/agenda" element={<Suspense fallback={<PageLoader />}><AgendaPage /></Suspense>} />
 <Route path="/agenda/:id" element={<Suspense fallback={<PageLoader />}><AgendaPage /></Suspense>} />

 <Route path="/chat" element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />

 <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />

 <Route path="/subscription" element={<Suspense fallback={<PageLoader />}><Subscription /></Suspense>} />

 <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
 </Route>
 </Route>

 </Routes>
 </Suspense>
 </BrowserRouter>
 );
};

export default AppRouter;
