import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiSearch, 
  FiShoppingCart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiBook, 
  FiGrid, 
  FiPlayCircle,
  FiLogOut,
  FiSettings,
  FiPlusCircle,
  FiBell,
  FiHeart,
  FiCheck,
  FiTrash2
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getMyNotifications, markNotificationAsRead, deleteNotification } from "../api/notificationApi";

export default function AmazonNavbar({ searchValue = "", onSearchChange }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchInput, setSearchInput] = useState(searchValue);
  const navigate = useNavigate();
  const location = useLocation();

  const token = user?.token;
  const role = user?.role;
  const username = user?.username;
  const profileImage = user?.profileImage;

  // Load cart count from localStorage on mount and sync
  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    updateCount();
    
    // Check for changes every second to keep synced across components
    const interval = setInterval(updateCount, 1000);

    return () => clearInterval(interval);
  }, [token]);

  // Fetch notifications when token is available
  useEffect(() => {
    if (token && notificationsOpen) {
      fetchNotifications();
    }
  }, [token, notificationsOpen]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await getMyNotifications(1, 10, true); // Fetch unread notifications
      setNotifications(res.notifications || []);
      setNotificationCount(res.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      setNotificationCount(Math.max(0, notificationCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      setNotificationCount(Math.max(0, notificationCount - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update search input when prop changes
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (onSearchChange) {
        onSearchChange(searchInput);
      }
      if (searchInput.trim()) {
        navigate(`/courses?search=${encodeURIComponent(searchInput)}`);
      }
    }
  };

  const handleSearchClick = () => {
    if (onSearchChange) {
      onSearchChange(searchInput);
    }
    if (searchInput.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchInput)}`);
    } else {
      navigate('/courses');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  const getDashboardLink = () => {
    switch(role) {
      case 'eleve': return '/student-dashboard';
      case 'prof': return '/teacher-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white leading-tight block">Elevated</span>
              <span className="text-xs text-emerald-400">Academy</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl mx-4">
            <div className="relative flex">
              <input 
                type="text" 
                placeholder="Rechercher des cours..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-l-md"
              />
              <button 
                onClick={handleSearchClick}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-2.5 rounded-r-md transition-all"
              >
                <FiSearch className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {/* Courses Link */}
            <Link to="/courses" className="flex items-center gap-1 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
              <FiBook className="w-5 h-5" />
              <span className="text-sm font-medium">Cours</span>
            </Link>

            {!token ? (
              /* Not Connected - Show Login/Register */
              <>
                <Link 
                  to="/login" 
                  className="hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">Connexion</span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  S'inscrire
                </Link>
                {/* Teacher Registration */}
                <Link 
                  to="/register?role=prof" 
                  className="flex items-center gap-1 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                >
                  <FaChalkboardTeacher className="w-4 h-4" />
                  <span className="text-sm font-medium">Devenir Prof</span>
                </Link>
              </>
            ) : (
              /* Connected User Menu */
              <>
                {/* Role-Based Dashboard Link */}
                <Link 
                  to={getDashboardLink()}
                  className="flex items-center gap-1 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiGrid className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {role === 'eleve' ? 'Élève' : role === 'prof' ? 'Prof' : 'Admin'}
                  </span>
                </Link>

                {/* Student: Learning/My Courses */}
                {role === 'eleve' && (
                  <Link 
                    to="/student-dashboard?tab=mycourses"
                    className="flex items-center gap-1 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FiPlayCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Apprentissage</span>
                  </Link>
                )}

                {/* Teacher: Create Course */}
                {role === 'prof' && (
                  <Link 
                    to="/teacher-dashboard?tab=create"
                    className="flex items-center gap-1 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FiPlusCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Créer</span>
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FiBell className="w-6 h-6" />
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 rounded-t-xl">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      </div>
                      
                      {loadingNotifications ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500">Chargement...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500">Aucune notification</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map(notif => (
                            <div key={notif._id} className="px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 break-words">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notif.date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex items-start gap-1 ml-2">
                                <button
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  className="text-emerald-600 hover:text-emerald-700 p-1"
                                  title="Marquer comme lu"
                                >
                                  <FiCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNotification(notif._id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Supprimer"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Wishlist */}
                <Link to="/wishlist" className="hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
                  <FiHeart className="w-6 h-6" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={`http://localhost:5000/uploads/profiles/${profileImage}`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-sm font-bold">{username?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium hidden xl:block">{username || 'User'}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{username || 'User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{role === 'eleve' ? 'Élève' : role === 'prof' ? 'Professeur' : 'Administrateur'}</p>
                      </div>
                      <Link 
                        to={getDashboardLink()} 
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiGrid className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link 
                        to={`${getDashboardLink()}?tab=settings`} 
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiSettings className="w-4 h-4" />
                        Paramètres
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Cart - Dynamic count for connected users */}
            <Link to="/cart" className="flex items-center hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
              <div className="relative">
                <FiShoppingCart className="w-6 h-6" />
                {(token && cartCount > 0) && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                {!token && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      {token && (
        <div className="hidden lg:block bg-slate-800 border-t border-slate-700">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10 text-sm">
              <Link to="/courses" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                <FiBook className="w-4 h-4" />
                Tous les cours
              </Link>
              {role === 'eleve' && (
                <>
                  <Link to="/student-dashboard?tab=progress" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <FiPlayCircle className="w-4 h-4" />
                    Ma Progression
                  </Link>
                  <Link to="/student-dashboard?tab=mycourses" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <FiGrid className="w-4 h-4" />
                    Mes Cours
                  </Link>
                </>
              )}
              {role === 'prof' && (
                <>
                  <Link to="/teacher-dashboard?tab=courses" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <FiGrid className="w-4 h-4" />
                    Mes Cours
                  </Link>
                  <Link to="/teacher-dashboard?tab=students" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    Mes Élèves
                  </Link>
                  <Link to="/teacher-dashboard?tab=create" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <FiPlusCircle className="w-4 h-4" />
                    Nouveau Cours
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 bg-slate-900 z-[70] shadow-2xl flex flex-col overflow-y-auto"
            >
               <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
                      <FaGraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Elevated</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                    <FiX className="w-6 h-6" />
                  </button>
               </div>

               <div className="p-6 space-y-6">
                  {/* User Profile Info on Mobile */}
                  {token && (
                    <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-2xl mb-4">
                       <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-lg">
                          {username?.[0]?.toUpperCase()}
                       </div>
                       <div>
                          <p className="font-bold text-white">{username}</p>
                          <p className="text-xs text-slate-400 capitalize">{role}</p>
                       </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Link to="/" className="flex items-center gap-3 py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                      <FiGrid className="w-5 h-5" />
                      Accueil
                    </Link>
                    <Link to="/courses" className="flex items-center gap-3 py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                      <FiBook className="w-5 h-5" />
                      Tous les Cours
                    </Link>
                  </div>

                  {!token ? (
                    <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-800">
                      <Link to="/login" className="flex items-center justify-center py-3 bg-slate-800 rounded-xl font-bold" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                      <Link to="/register" className="flex items-center justify-center py-3 bg-emerald-600 rounded-xl font-bold" onClick={() => setMobileMenuOpen(false)}>S'inscrire</Link>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-4 border-t border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Mon Espace</p>
                      <Link to={getDashboardLink()} className="flex items-center gap-3 py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                        <FiGrid className="w-5 h-5" />
                        Dashboard
                      </Link>
                      {role === 'eleve' && (
                        <Link to="/student-dashboard?tab=mycourses" className="flex items-center gap-3 py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                          <FiPlayCircle className="w-5 h-5" />
                          Mon Apprentissage
                        </Link>
                      )}
                      {role === 'prof' && (
                        <Link to="/teacher-dashboard?tab=create" className="flex items-center gap-3 py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                          <FiPlusCircle className="w-5 h-5" />
                          Créer un Cours
                        </Link>
                      )}
                      <Link to="/cart" className="flex items-center justify-between py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3">
                           <FiShoppingCart className="w-5 h-5" />
                           Panier
                        </div>
                        {cartCount > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 py-3 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                        <FiSettings className="w-5 h-5" />
                        Paramètres
                      </Link>
                      <div className="pt-6">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold">
                           <FiLogOut /> Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
               </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
