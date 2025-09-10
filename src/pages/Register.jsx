import { useState } from "react";
import { registerUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    role: "eleve" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e){
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  
  async function handleSubmit(e){
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    console.log("Register - Tentative d'inscription avec:", { 
      username: form.username, 
      email: form.email, 
      role: form.role 
    });
    
    try {
      const response = await registerUser(form);
      console.log("Register - Inscription réussie:", response);
      
      setSuccess("Inscription réussie ! Redirection vers la page de connexion...");
      
      // Redirection immédiate sans setTimeout
      navigate("/login");
      
    } catch (err) {
      console.error("Register - Erreur inscription:", err);
      setError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        "Erreur lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Inscription</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <input
          type="text"
          name="username"
          value={form.username}
          placeholder="Nom d'utilisateur"
          onChange={handleChange}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          disabled={loading}
        />
        
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
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
        
        <p className="text-center mt-4 text-gray-600">
          Déjà un compte ?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
          >
            Se connecter
          </button>
        </p>
      </form>
    </div>
  );
}
