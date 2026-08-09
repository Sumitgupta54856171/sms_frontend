import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SchoolSidebar from "./components/Sidebar";
import AuthProvider from "./hooks/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteSuspenseFallback from "./components/RouterSupenseFallback";
import { LoadingProvider } from "./context/LoadingContent";
import { Toaster } from "@/components/ui/sonner";
import HomeworkPage from "@/pages/HomeworkPage/HomeworkPage.tsx";
const TeacherPage = lazy(() => import("@/pages/Teacher/Teacherpage.tsx"));
const StudentPage = lazy(() => import("@/pages/Studentpage/Studentpage.tsx"));
const AttendencePage = lazy(
  () => import("@/pages/Attendence/Attendecepage.tsx")
);
const AttendanceSummaryPage = lazy(
  () => import("@/pages/Attendence/AttendanceSummaryPage.tsx")
);

const AcademicSessionPage = lazy(
  () => import("@/pages/AcademicSessionpage/AcademicSessionPage.tsx")
);
const ClassPage = lazy(() => import("./pages/classpage/Classpage.tsx"));
const ClassStudentListPage = lazy(() => import("./pages/ClassStudentListPage/ClassStudentListPage.tsx"));
const TimetablePage = lazy(() => import("./pages/Timetablepage.tsx"));
const SubjectPage = lazy(() => import("./pages/Subjectpage/Subjectpage.tsx"));
const FeeStructurePage = lazy(() => import("./pages/FeeStructurepage/FeeStructurepage.tsx"));
const FeePage = lazy(() => import("./pages/Fees/Feepage.tsx"));
const InvoicePrintPage = lazy(() => import("./pages/InvoicePrintPage/InvoicePrintPage.tsx"));
const TCPage = lazy(() => import("./pages/TC/TCpage.tsx"));
const EnrollmentPage = lazy(() => import("./pages/Enrollment/EnrollmentPage.tsx"));
const LoginPage = lazy(() => import("./pages/Loginpage.tsx"));
const StudentProfilePage = lazy(() => import("./pages/Student/StudentProfilePage.tsx"));
const BankDetailPage = lazy(() => import("./pages/Student/BankDetailPage.tsx"));
const PhotoPage = lazy(() => import("./pages/Student/PhotoPage.tsx"));
const IdCardPage = lazy(() => import("./pages/Student/IdCardPage.tsx"));
const StudentTCPage = lazy(() => import("./pages/Student/TCPage.tsx"));
const FeesProfilePage = lazy(() => import("./pages/Student/FeesProfilePage.tsx"));
const InvoiceHistoryPage = lazy(() => import("./pages/InvoiceHistory/InvoiceHistoryPage.tsx"));
const ExamTimetablePage = lazy(() => import("./pages/ExamTimetable/ExamTimetablePage.tsx"));
const TeacherPlanPage = lazy(() => import("./pages/TeacherPlan/TeacherPlanPage.tsx"));
const CalendarPage = lazy(() => import("./pages/CalendarPage/CalendarPage.tsx"));
const NoticeBoardPage = lazy(() => import("./pages/NoticeBoardPage/NoticeBoardPage.tsx"));
const MessagesPage = lazy(() => import("./pages/MessagesPage/MessagesPage.tsx"));
const GmailPage = lazy(() => import("./pages/GmailPage/GmailPage.tsx"));
const SmsAlertPage = lazy(() => import("./pages/SmsAlertPage/SmsAlertPage.tsx"));
const ReportCardPage = lazy(() => import("./pages/ReportCard/ReportCardPage.tsx"));
const GradePage = lazy(() => import("./pages/GradePage/GradePage.tsx"));
const IdCardPrintPage = lazy(() => import("./pages/IdCardPrintPage/IdCardPrintPage.tsx"));
const IdCardTemplate = lazy(() => import("./pages/IdCardTemplate/IdCardTemplate.tsx"));
const DashboardPage = lazy(() => import("./pages/Dashboardpage/Dashboard.tsx"));
const ReportPage = lazy(()=>import("./pages/ReportsPage/ReportsPage.tsx"))
const Setting = lazy(()=>import("@/pages/SettingsPage/SettingsPage.tsx"))
const Homework = lazy(()=>import("@/pages/HomeworkPage/HomeworkPage.tsx"))
const Payroll = lazy(()=> import("@/pages/PayrollPage/PayrollPage.tsx"))
const Progress = lazy(()=>import("@/pages/ProgressCardPage/ProgressCardPage.tsx"))
const IDCardGenerator = lazy(()=>import("@/components/IdCardGenerator.tsx"))
const MarksheetPage = lazy(()=>import("@/pages/MarksheetPage/MarksheetPage.tsx"))
const AdmitCardPage = lazy(()=>import("@/pages/AdmitCardPage/AdmitCardPage.tsx"))
const AdmitCardTemplatePage = lazy(()=>import("@/pages/AdmitCardTemplate/AdmitCardTemplatePage.tsx"))
const SecondIdCardGenerator = lazy(()=>import("@/pages/SecondIdCardGenerator/SecondIdCardGenerator.tsx"))
const LoginGeneratePage = lazy(()=>import("@/pages/LoginGenerate/LoginGeneratePage.tsx"))
const ElectiveSubjectPage = lazy(()=>import("@/pages/ElectiveSubject/ElectiveSubjectPage.tsx"))

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Suspense fallback={<RouteSuspenseFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<SchoolSidebar />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/class" element={<ClassPage />} />
                <Route path="/class/:classNo/students" element={<ClassStudentListPage />} />
                <Route path="/academic" element={<AcademicSessionPage />} />
                <Route path="/attendance" element={<AttendencePage />} />
                <Route path="/attendance/summary" element={<AttendanceSummaryPage />} />
                <Route path="/teachers" element={<TeacherPage />} />
                <Route path="/students" element={<StudentPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/session" element={<AcademicSessionPage />} />
                <Route path="/subjects" element={<SubjectPage />} />
                <Route path="/homework" element={<HomeworkPage/>}></Route>
                <Route path="/tc" element={<TCPage />} />
                <Route path="/fees" element={<FeePage />} />
                <Route path="/fees/structure" element={<FeeStructurePage />} />
                <Route path="/enrollment" element={<EnrollmentPage />} />
                <Route path="/fees/invoice-history" element={<InvoiceHistoryPage />} />
                <Route path="/timetable/exams" element={<ExamTimetablePage />} />
                <Route path="/id-card-generator" element={<IDCardGenerator />} />
                <Route path="/marksheet" element={<MarksheetPage />} />
                <Route path="/grades" element={<GradePage />} />
                <Route path="/lesson-plans" element={<TeacherPlanPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notices" element={<NoticeBoardPage />} />
                <Route path="/report" element={<ReportPage/>}></Route>
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/payroll"  element={<Payroll/>}></Route>
                <Route path="/progress" element={<Progress/>}></Route>
                <Route path="/gmail" element={<GmailPage />} />
                <Route path="/sms-alert" element={<SmsAlertPage />} />
                <Route path="/id-card-print" element={<IdCardPrintPage />} />
                <Route path="/id-card-template" element={<IdCardTemplate />} />
                <Route path="/admit-card" element={<AdmitCardPage />} />
                <Route path="/admit-card-template" element={<AdmitCardTemplatePage />} />
                <Route path="/second-id-card" element={<SecondIdCardGenerator />} />
                <Route path="/login-generate" element={<LoginGeneratePage />} />
                <Route path="/elective-subject" element={<ElectiveSubjectPage />} />
                <Route path="/setting" element={<Setting/>}></Route>
              </Route>
              <Route path="/student/profile/:studentId" element={<StudentProfilePage />} />
              <Route path="/student/bank-detail/:studentId" element={<BankDetailPage />} />
              <Route path="/student/photo/:studentId" element={<PhotoPage />} />
              <Route path="/student/id-card/:studentId" element={<IdCardPage />} />
              <Route path="/student/tc/:studentId" element={<StudentTCPage />} />
              <Route path="/student/feesprofile" element={<FeesProfilePage />} />
              <Route path="/student/report-card" element={<ReportCardPage />} />
            </Route>
            <Route path="/invoice/:invoiceId" element={<InvoicePrintPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
      <Toaster richColors closeButton position="top-right" />
    </LoadingProvider>
  );
}

export default App;
