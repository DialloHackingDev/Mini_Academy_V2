import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // En cours de chargement → afficher spinner
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Vérification de l'authentification...</div>
    </div>;
  }

  // Pas connecté → redirection vers login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }


  // Si connecté mais rôle interdit → redirection vers SON dashboard
  if (!allowedRoles.includes(user.role)) {
    const dashboardMap = {
      eleve: "/student-dashboard",
      prof: "/teacher-dashboard", 
      admin: "/admin-dashboard"
    };
    
    const targetDashboard = dashboardMap[user.role];
    if (targetDashboard && location.pathname !== targetDashboard) {
      return <Navigate to={targetDashboard} replace />;
    }
    
    // Si déjà sur le bon dashboard mais rôle pas autorisé → permettre l'accès
    if (targetDashboard && location.pathname === targetDashboard) {
      return children;
    }
    
    // Si pas de dashboard correspondant, redirection vers login
    if (!targetDashboard) {
      return <Navigate to="/login" replace />;
    }
  }

  // Rôle autorisé → OK
  return children;
}
