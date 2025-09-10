import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt, FaBookOpen, FaChartLine, FaUser, FaUserTie, FaCog } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎓</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                Mini Academy
              </h1>
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex space-x-1 items-center">
            <Link 
              to="/courses" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
            >
              <FaBookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Cours</span>
            </Link>
            
            {/* Dashboard selon rôle */}
            {user?.role === "eleve" && (
              <Link 
                to="/student-dashboard" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <FaChartLine className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
            {user?.role === "prof" && (
              <Link 
                to="/teacher-dashboard" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <FaUserTie className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard Prof</span>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link 
                to="/admin-dashboard" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <FaCog className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard Admin</span>
              </Link>
            )}

            {/* Login / Signup si pas connecté */}
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <FaUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Connexion</span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Inscription
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                >
                  <FaSignOutAlt className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            )}
          </div>

          {/* Menu toggle mobile */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link 
              to="/courses" 
              className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              onClick={() => setIsOpen(false)}
            >
              <FaBookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Cours</span>
            </Link>

            {user?.role === "eleve" && (
              <Link 
                to="/student-dashboard" 
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <FaChartLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
            {user?.role === "prof" && (
              <Link 
                to="/teacher-dashboard" 
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <FaUserTie className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard Prof</span>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link 
                to="/admin-dashboard" 
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <FaCog className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard Admin</span>
              </Link>
            )}

            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Connexion</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center justify-center space-x-2 mx-3 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Inscription</span>
                </Link>
              </>
            ) : (
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 rounded-lg mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group w-full"
                >
                  <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
