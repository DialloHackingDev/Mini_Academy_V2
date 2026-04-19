import { useState, useCallback } from "react";
import { loginUser } from "../api/userApi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiArrowRight,
  FiCheck
} from "react-icons/fi";
import { 
  FaGraduationCap, 
  FaUserGraduate, 
  FaUserShield,
  FaUserTie
} from "react-icons/fa";

const roles = [
  { id: 'eleve', label: 'Student', icon: FaUserGraduate, color: 'indigo' },
  { id: 'prof', label: 'Teacher', icon: FaUserTie, color: 'purple' },
  { id: 'admin', label: 'Admin', icon: FaUserShield, color: 'emerald' }
];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState('eleve');
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(form);
      
      if (!data || !data.token || !data.user || !data.user.role) {
        throw new Error("Invalid server response");
      }

      const userData = {
        token: data.token,
        role: data.user.role,
        username: data.user.username,
        email: data.user.email,
        _id: data.user._id,
        profileImage: data.user.profileImage
      };

      login(userData);
      setMessage("Login successful! Redirecting...");
      
      // Attendre que localStorage soit bien rempli, puis forcer le rechargement
      setTimeout(() => {
        // Vérifier que le token est bien dans localStorage
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token || !role) {
          setError("Authentication error. Please try again.");
          setLoading(false);
          return;
        }
        
        // Redirection avec rechargement forcé pour s'assurer que le contexte se met à jour
        switch(role) {
          case 'eleve':
            window.location.href = '/student-dashboard';
            break;
          case 'prof':
            window.location.href = '/teacher-dashboard';
            break;
          case 'admin':
            window.location.href = '/admin-dashboard';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }, 500);

    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }, [form, navigate, login]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
              <FaGraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Curate Your Digital Campus.</h2>
            <p className="text-lg text-white/80">
              Join The Elevated Academy to experience learning designed with editorial reverence and SaaS efficiency.
            </p>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full"></div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Elevated Academy</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">Please enter your details to sign in.</p>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? `border-${role.color}-600 bg-${role.color}-50 text-${role.color}-700` 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? `text-${role.color}-600` : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm"
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="Enter your email"
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                }`}>
                  {rememberMe && <FiCheck className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm text-gray-600">Remember for 30 days</span>
              </label>
              <Link to="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in</>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Request access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
