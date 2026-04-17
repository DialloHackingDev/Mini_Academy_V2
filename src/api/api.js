import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// 🔹 Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ajuster le Content-Type automatiquement pour FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Laisser le navigateur définir le boundary
    } else {
      config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof authDebugger !== 'undefined') {
      authDebugger.log('API', 'response_error', { 
        status: error.response?.status, 
        message: error.response?.data?.message,
        url: error.config?.url
      });
    }

    if (error.response?.status === 401) {
      // Vérifier si c'est une tentative de login (ne pas déclencher logout)
      const isLoginAttempt = error.config?.url?.includes('/login') || 
                            error.config?.url?.includes('/register');
      
      // Vérifier si on est déjà sur la page login (éviter boucle infinie)
      const isAlreadyOnLogin = window.location.pathname === '/login';
      
      if (!isLoginAttempt && !isAlreadyOnLogin) {
        console.error('🚨 Token rejeté par le serveur:', error.response?.data?.message);
        
        // Nettoyer UNIQUEMENT les données d'auth (pas tout le localStorage !)
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');
        
        // Émettre un événement pour que le contexte Auth se mette à jour
        window.dispatchEvent(new Event('auth-logout'));
        
        // Redirection seulement si pas déjà sur login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
