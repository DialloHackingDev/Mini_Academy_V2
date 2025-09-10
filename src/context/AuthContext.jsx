import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    // Vérifier si l'utilisateur est connecté au chargement
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");

    if (isMounted) {
      if (token && role) {
        setUser({
          token,
          role,
          username: username || "Utilisateur",
          email: email || "",
          _id: userId || ""
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    // Écouter les événements de déconnexion depuis l'intercepteur API
    const handleAuthLogout = () => {
      if (isMounted) {
        logout();
        navigate('/login', { replace: true });
      }
    };

    // Seulement ajouter l'event listener si on a un token
    if (token) {
      window.addEventListener('auth-logout', handleAuthLogout);
    }
    
    return () => {
      isMounted = false;
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  const login = useCallback((userData) => {
    // Validation des données reçues
    if (!userData || !userData.token || !userData.role) {
      throw new Error("Données de login invalides");
    }

    // Stockage sécurisé dans localStorage
    localStorage.setItem("token", userData.token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("username", userData.username || "Utilisateur");
    localStorage.setItem("email", userData.email || "");
    localStorage.setItem("userId", userData._id || "");

    // Création de l'objet utilisateur
    const newUser = {
      token: userData.token,
      role: userData.role,
      username: userData.username || "Utilisateur",
      email: userData.email || "",
      _id: userData._id || ""
    };

    setUser(newUser);

    // Redirection automatique vers le dashboard approprié
    const dashboardMap = {
      eleve: "/student-dashboard",
      prof: "/teacher-dashboard",
      admin: "/admin-dashboard"
    };
    
    const targetDashboard = dashboardMap[userData.role];
    if (targetDashboard) {
      setTimeout(() => {
        navigate(targetDashboard, { replace: true });
      }, 100);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    // Nettoyage complet du localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!user.token
  }), [user, login, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

