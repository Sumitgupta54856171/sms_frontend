import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Routes,Route } from 'react-router-dom'
import SchoolSidebar from './components/Sidebar'
import FeeCard from './components/Feecard'
import StudentForm from './components/Studentform'
import TeacherForm from './components/Teacherform'
import ClassGrid from './components/Class'
import IDCard from './components/IdCard'
import AcademicSessionPage from './pages/AcademicSessionpage/AcademicSessionPage'
import LoginPage from './pages/Loginpage'
import LoadingPage from './pages/Loginpage/LoadingPage'
import { Toaster } from './components/ui/sonner'

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time before showing the main app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Show the loading page while the app is initializing
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Routes>
        <Route element={<SchoolSidebar />}>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/class" element={<ClassGrid />} />
        </Route>
        <Route path="/fee-card" element={<FeeCard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/academic-session" element={<AcademicSessionPage />} />
        <Route path="/student-form" element={<StudentForm />} />
        <Route path="/teacher-form" element={<TeacherForm />} />
        <Route path="/id-card" element={<IDCard />} />
      </Routes>
      <Toaster richColors />
    </>
  )
}

export default App
