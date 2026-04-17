import { Routes, Route, Navigate } from "react-router-dom";
import AmazonNavbar from "./components/AmazonNavbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import CoursePlayer from "./pages/CoursePlayer.jsx";
import Cart from "./pages/Cart.jsx";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* 🔹 Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<><AmazonNavbar /><CourseDetails /></>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔹 Routes protégées */}
        <Route path="/student-dashboard" element={
          <PrivateRoute allowedRoles={['eleve']}>
            <StudentDashboard />
          </PrivateRoute>
        } />

        <Route path="/course-player/:courseId" element={
          <PrivateRoute allowedRoles={['eleve']}>
            <CoursePlayer />
          </PrivateRoute>
        } />

        <Route path="/teacher-dashboard" element={
          <PrivateRoute allowedRoles={['prof']}>
            <TeacherDashboard />
          </PrivateRoute>
        } />

        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* 🔹 Dashboard générique */}
        <Route path="/dashboard" element={<><AmazonNavbar /><Dashboard /></>} />

        {/* 🔹 Route inconnue → Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
