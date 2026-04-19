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
    const profileImage = localStorage.getItem("profileImage");

    if (isMounted) {
      if (token && role) {
        setUser({
          token,
          role,
          username: username || "Utilisateur",
          email: email || "",
          _id: userId || "",
          profileImage: profileImage || ""
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    // Écouter les événements de déconnexion depuis l'intercepteur API
    let logoutInProgress = false;
    const handleAuthLogout = () => {
      if (isMounted && !logoutInProgress) {
        logoutInProgress = true;
        logout();
        // Ne pas naviguer ici car l'intercepteur API gère déjà la redirection
      }
    };

    // Ajouter l'event listener
    window.addEventListener('auth-logout', handleAuthLogout);
    
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
    localStorage.setItem("profileImage", userData.profileImage || "");

    // Création de l'objet utilisateur
    const newUser = {
      token: userData.token,
      role: userData.role,
      username: userData.username || "Utilisateur",
      email: userData.email || "",
      _id: userData._id || "",
      profileImage: userData.profileImage || ""
    };

    setUser(newUser);
    // La redirection est gérée par le composant Login.jsx
  }, []);

  const updateUserData = useCallback((newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      // Sync with localStorage
      if (newData.username) localStorage.setItem("username", newData.username);
      if (newData.profileImage) localStorage.setItem("profileImage", newData.profileImage);
      return updated;
    });
  }, []);

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
    updateUserData,
    loading,
    isAuthenticated: !!user && !!user.token
  }), [user, login, logout, updateUserData, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

