import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

export default function AmazonNavbar({ searchValue = "", onSearchChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const handleSearch = (e) => {
    if (e.key === 'Enter' && onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white leading-tight block">Elevated</span>
              <span className="text-xs text-indigo-300">Academy</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl mx-4">
            <div className="relative flex">
              <input 
                type="text" 
                placeholder="Search courses..."
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-l-md"
              />
              <button 
                onClick={() => navigate('/courses')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-4 py-2.5 rounded-r-md transition-all"
              >
                <FiSearch className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            {!token ? (
              <Link to="/login" className="hidden sm:block hover:opacity-80 transition-opacity px-2 py-1">
                <div className="leading-tight text-left">
                  <span className="text-xs text-gray-400 block">Hello, sign in</span>
                  <span className="text-sm font-bold">Account</span>
                </div>
              </Link>
            ) : (
              <Link 
                to={role === "eleve" ? "/student-dashboard" : role === "prof" ? "/teacher-dashboard" : "/admin-dashboard"} 
                className="hidden sm:block hover:opacity-80 transition-opacity px-2 py-1"
              >
                <div className="leading-tight text-left">
                  <span className="text-xs text-gray-400 block">Hello, {username || 'User'}</span>
                  <span className="text-sm font-bold">Dashboard</span>
                </div>
              </Link>
            )}

            <Link to="/courses" className="flex items-center hover:opacity-80 transition-opacity px-2 py-1">
              <div className="relative">
                <FiShoppingCart className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
              </div>
              <span className="hidden sm:block text-sm font-bold ml-1">Basket</span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-slate-800 rounded"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 hover:text-indigo-300">Home</Link>
            <Link to="/courses" className="block py-2 hover:text-indigo-300">Courses</Link>
            {!token ? (
              <Link to="/login" className="block py-2 hover:text-indigo-300">Sign In</Link>
            ) : (
              <>
                <Link 
                  to={role === "eleve" ? "/student-dashboard" : "/teacher-dashboard"} 
                  className="block py-2 hover:text-indigo-300"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
