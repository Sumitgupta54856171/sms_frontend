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
const TimetablePage = lazy(() => import("./pages/Timetablepage"));
const LoginPage = lazy(() => import("./pages/Loginpage"));

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
                <Route path="/" element={<div>Home</div>} />
                <Route path="/class" element={<ClassPage />} />
                <Route path="/academic" element={<AcademicSessionPage />} />
                <Route path="/attendance" element={<AttendencePage />} />
                <Route path="/teachers" element={<TeacherPage />} />
                <Route path="/students" element={<StudentPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/session" element={<AcademicSessionPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
      <Toaster richColors closeButton position="top-right" />
    </LoadingProvider>
  );
}

export default App;
