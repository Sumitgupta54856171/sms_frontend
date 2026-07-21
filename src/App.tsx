import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SchoolSidebar from "./components/Sidebar";
import AuthProvider from "./hooks/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteSuspenseFallback from "./components/RouterSupenseFallback";
import { LoadingProvider } from "./context/LoadingContent";
import { Toaster } from "@/components/ui/sonner";
const TeacherPage = lazy(() => import("@/pages/Teacher/Teacherpage"));
const StudentPage = lazy(() => import("@/pages/Studentpage/Studentpage"));
const AttendencePage = lazy(
  () => import("@/pages/Attendence/Attendecepage")
);

const AcademicSessionPage = lazy(
  () => import("@/pages/AcademicSessionpage/AcademicSessionPage")
);
const ClassPage = lazy(() => import("./pages/classpage/Classpage"));
const ClassStudentListPage = lazy(() => import("./pages/ClassStudentListPage/ClassStudentListPage"));
const TimetablePage = lazy(() => import("./pages/Timetablepage"));
const SubjectPage = lazy(() => import("./pages/Subjectpage/Subjectpage"));
const FeeStructurePage = lazy(() => import("./pages/FeeStructurepage/FeeStructurepage"));
const FeePage = lazy(() => import("./pages/Fees/Feepage"));
const InvoicePrintPage = lazy(() => import("./pages/InvoicePrintPage/InvoicePrintPage"));
const TCPage = lazy(() => import("./pages/TC/TCpage"));
const EnrollmentPage = lazy(() => import("./pages/Enrollment/EnrollmentPage"));
const LoginPage = lazy(() => import("./pages/Loginpage"));
const StudentProfilePage = lazy(() => import("./pages/Student/StudentProfilePage"));
const BankDetailPage = lazy(() => import("./pages/Student/BankDetailPage"));
const PhotoPage = lazy(() => import("./pages/Student/PhotoPage"));
const IdCardPage = lazy(() => import("./pages/Student/IdCardPage"));
const StudentTCPage = lazy(() => import("./pages/Student/TCPage"));
const FeesProfilePage = lazy(() => import("./pages/Student/FeesProfilePage"));
const InvoiceHistoryPage = lazy(() => import("./pages/InvoiceHistory/InvoiceHistoryPage"));
const ExamTimetablePage = lazy(() => import("./pages/ExamTimetable/ExamTimetablePage"));
const TeacherPlanPage = lazy(() => import("./pages/TeacherPlan/TeacherPlanPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage/CalendarPage"));
const NoticeBoardPage = lazy(() => import("./pages/NoticeBoardPage/NoticeBoardPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage/MessagesPage"));
const ReportCardPage = lazy(() => import("./pages/ReportCard/ReportCardPage"));
const GradePage = lazy(() => import("./pages/GradePage/GradePage"));
const DashboardPage = lazy(() => import("./pages/Dashboardpage/Dashboard"));

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
                <Route path="/teachers" element={<TeacherPage />} />
                <Route path="/students" element={<StudentPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/session" element={<AcademicSessionPage />} />
                <Route path="/subjects" element={<SubjectPage />} />
                <Route path="/tc" element={<TCPage />} />
                <Route path="/fees" element={<FeePage />} />
                <Route path="/fees/structure" element={<FeeStructurePage />} />
                <Route path="/enrollment" element={<EnrollmentPage />} />
                <Route path="/fees/invoice-history" element={<InvoiceHistoryPage />} />
                <Route path="/timetable/exams" element={<ExamTimetablePage />} />
                <Route path="/grades" element={<GradePage />} />
                <Route path="/lesson-plans" element={<TeacherPlanPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notices" element={<NoticeBoardPage />} />
                <Route path="/messages" element={<MessagesPage />} />
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
