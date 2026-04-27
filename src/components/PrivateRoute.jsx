import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Vérifier aussi le localStorage directement (fallback si contexte pas à jour)
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  // Si pas de token dans localStorage ET pas d'utilisateur dans le contexte → redirection
  if (!token && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si token existe mais pas encore dans le contexte → attendre un peu
  if (token && !user && loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
    </div>;
  }

  // Utiliser le rôle du contexte ou du localStorage
  const userRole = user?.role || role;
  
  if (!userRole) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }


  // Si connecté mais rôle interdit → redirection vers SON dashboard
  if (!allowedRoles.includes(userRole)) {
    const dashboardMap = {
      eleve: "/student-dashboard",
      prof: "/teacher-dashboard", 
      admin: "/admin-dashboard"
    };
    
    const targetDashboard = dashboardMap[userRole];
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
