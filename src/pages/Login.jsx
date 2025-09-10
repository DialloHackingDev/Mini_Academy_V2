import { useState, useCallback } from "react";
import { loginUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation côté client
    if (!form.email || !form.password) {
      setError("Email et mot de passe requis");
      setLoading(false);
      return;
    }

    try {
      console.log("Login - Tentative de connexion avec:", { email: form.email });
      
      const data = await loginUser(form);
      
      console.log("Login - Réponse complète du backend:", data);
      
      // Vérification de la structure des données selon votre backend
      if (!data || !data.token || !data.user || !data.user.role) {
        console.error("Login - Structure de données invalide:", data);
        throw new Error("Réponse du serveur invalide");
      }

      console.log("Login - Données valides reçues:", {
        token: data.token,
        role: data.user.role,
        username: data.user.username,
        email: data.user.email,
        _id: data.user._id
      });

      // Appel du contexte avec les données du backend
      const userData = {
        token: data.token,
        role: data.user.role,
        username: data.user.username,
        email: data.user.email,
        _id: data.user._id
      };

      login(userData);
      setMessage("Connexion réussie ! Redirection...");

    } catch (err) {
      console.error("Login - Erreur complète:", err);
      console.error("Login - Réponse serveur:", err.response?.data);
      
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.message ||
        "Erreur de connexion"
      );
    } finally {
      setLoading(false);
    }
  }, [form, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Connexion</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        <input
          type="email"
          name="email"
          value={form.email}
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          value={form.password}
          placeholder="Mot de passe"
          onChange={handleChange}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        
        <p className="text-center mt-4 text-gray-600">
          Pas encore de compte ?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline"
          >
            S'inscrire
          </button>
        </p>
      </form>
    </div>
  );
}
