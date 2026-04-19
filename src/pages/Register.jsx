import { useState } from "react";
import { registerUser } from "../api/userApi";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiCheck,
  FiArrowRight
} from "react-icons/fi";
import { 
  FaGraduationCap, 
  FaUserGraduate, 
  FaUserTie,
  FaQuoteLeft
} from "react-icons/fa";

const roleOptions = [
  { 
    id: 'eleve', 
    label: 'Student', 
    icon: FaUserGraduate, 
    description: 'Learn and grow',
    color: 'indigo'
  },
  { 
    id: 'prof', 
    label: 'Instructor', 
    icon: FaUserTie, 
    description: 'Teach and inspire',
    color: 'purple'
  }
];

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
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  function handleChange(e){
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  
  async function handleSubmit(e){
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await registerUser(form);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        "Error creating account"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Purple Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 relative overflow-hidden"
      >
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mini Academy
            </span>
          </div>

          {/* Main content */}
          <div className="max-w-sm">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Empower your learning journey.
            </h2>
            <p className="text-gray-600 text-lg">
              Join a community of curious minds. Discover tailored courses, track your progress, and master new skills in a premium digital environment.
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <FaQuoteLeft className="w-5 h-5 text-indigo-400 mb-2" />
                <p className="text-gray-700 text-sm mb-2">"The best platform for focused learning."</p>
                <p className="text-gray-500 text-xs">Sarah J. - UX Design Student</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600 mb-8">Get started with Mini Academy today.</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  placeholder="John Doe"
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="you@example.com"
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
                  autoComplete="new-password"
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-4">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = form.role === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setForm({ ...form, role: role.id })}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? `border-${role.color}-600 bg-${role.color}-50` 
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? `bg-${role.color}-600 text-white` 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className={`font-semibold ${isSelected ? `text-${role.color}-700` : 'text-gray-700'}`}>
                          {role.label}
                        </p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                agreedToTerms ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
              }`}>
                {agreedToTerms && <FiCheck className="w-3 h-3 text-white" />}
              </div>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm text-gray-600">
                I agree to the <Link to="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms of Service</Link> and <Link to="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</Link>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign Up</>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
