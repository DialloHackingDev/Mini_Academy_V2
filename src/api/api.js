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
      
      if (!isLoginAttempt) {
        
        console.error('🚨 Token rejeté par le serveur:', error.response?.data?.message);
        
        // Nettoyer le localStorage et rediriger
        localStorage.clear();
        window.location.href = '/login';
        
      }
    }
    return Promise.reject(error);
  }
);

export default api;
