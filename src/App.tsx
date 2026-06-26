import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Routes,Route } from 'react-router-dom'
import SchoolSidebar from './components/Sidebar'
import FeeCard from './components/Feecard'
import StudentForm from './components/Studentform'
import TeacherForm from './components/Teacherform'
import ClassGrid from './components/Class'
import IDCard from './components/IdCard'
import AcademicSessionPage from './pages/AcademicSessionPage'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route element={<SchoolSidebar />}>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/class" element={<ClassGrid />} />
        </Route>
        <Route path="/fee-card" element={<FeeCard />} />
        <Route path="/academic-session" element={<AcademicSessionPage />} />
        <Route path="/student-form" element={<StudentForm />} />
        <Route path="/teacher-form" element={<TeacherForm />} />
        <Route path="/id-card" element={<IDCard />} />
      </Routes>
    </>
  )
}

export default App
