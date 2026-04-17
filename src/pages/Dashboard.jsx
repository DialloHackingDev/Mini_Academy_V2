import { Navigate } from "react-router-dom";

export default function Dashboard() {
  // Rediriger automatiquement vers le bon dashboard selon le rôle
  const role = localStorage.getItem("role");
  
  switch(role) {
    case 'eleve':
      return <Navigate to="/student-dashboard" replace />;
    case 'prof':
      return <Navigate to="/teacher-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
