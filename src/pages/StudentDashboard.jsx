import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiGrid,
  FiArrowRight,
  FiPlayCircle,
  FiSearch,
  FiChevronRight
} from "react-icons/fi";
import {
  FaGraduationCap,
  FaFire,
  FaCertificate,
  FaUserGraduate
} from "react-icons/fa";
import { getMyCourses, getStudentAnalytics } from "../api/StudiantApi";
import api from "../api/api";
import AmazonNavbar from "../components/AmazonNavbar";
import SettingsView from "../components/SettingsView";
import AnalyticsView from "../components/AnalyticsView";
import ProfileComponent from "../components/ProfileComponent";
import { useAuth } from "../context/AuthContext";

import { useSearchParams } from "react-router-dom";

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'mycourses', label: 'Mes Cours', icon: FiBook },
  { id: 'analytics', label: 'Analytique', icon: FiBarChart2 },
  { id: 'settings', label: 'Paramètres', icon: FiSettings },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [coursesRes, profileRes, analyticsRes] = await Promise.allSettled([
        getMyCourses(),
        api.get("/users/profile"),
        getStudentAnalytics()
      ]);

      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.courses || coursesRes.value || []);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.user || profileRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AmazonNavbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (Desktop) */}
        <aside className="w-80 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="flex-1 py-10 px-6 space-y-3">
             <div className="px-5 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 overflow-hidden">
                   {user?.profileImage ? (
                     <img src={`http://localhost:5000/uploads/profiles/${user.profileImage}`} className="w-full h-full object-cover" alt="" />
                   ) : (
                     user?.username?.[0]?.toUpperCase() || 'E'
                   )}
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Élève</p>
                   <p className="text-sm font-bold text-slate-900">{user?.username}</p>
                </div>
             </div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                  </div>
                  {isActive && <FiChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          <div className="p-6 border-t border-gray-100">
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <h4 className="font-bold mb-2 text-sm">Besoin d'aide ?</h4>
                <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Accédez à notre centre d'aide 24/7 pour toute question technique.</p>
                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all">
                  Support
                </button>
             </div>
          </div>
        </aside>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-50 px-4 pb-safe">
           <div className="flex justify-around items-center h-16">
              {sidebarItems.map((item) => {
                 const Icon = item.icon;
                 const isActive = activeTab === item.id;
                 return (
                    <button 
                       key={item.id}
                       onClick={() => handleTabChange(item.id)}
                       className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                       <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                          <Icon className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                       {isActive && <motion.div layoutId="bottomNavStudent" className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />}
                    </button>
                 );
              })}
           </div>
        </div>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 pb-24 lg:pb-12">
          <div className="max-w-7xl mx-auto">
            
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* Welcome Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 mb-2">Bonjour, {profile?.username || 'Apprenant'} ! 👋</h1>
                      <p className="text-slate-500 font-medium italic">"L'éducation est l'arme la plus puissante pour changer le monde."</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                       <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <FaFire className="w-6 h-6" />
                       </div>
                       <div className="pr-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Série actuelle</p>
                          <p className="text-lg font-black text-slate-900">12 Jours</p>
                       </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                           <FiBook className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-slate-900">{courses.length}</p>
                           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cours inscrits</p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                           <FiPlayCircle className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-slate-900">4</p>
                           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">En cours</p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                           <FaCertificate className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-slate-900">2</p>
                           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Certificats</p>
                        </div>
                     </div>
                  </div>

                  {/* Continue Learning Section */}
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black text-slate-900">Continuer l'apprentissage</h2>
                      <button onClick={() => setActiveTab('mycourses')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all">
                        Voir tout <FiArrowRight />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {courses.slice(0, 2).map((course) => (
                        <div key={course._id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                           <div className="relative h-48 overflow-hidden">
                              <img 
                                src={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : "https://via.placeholder.com/600x400"} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={course.title}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                              <div className="absolute bottom-6 left-6 right-6">
                                 <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{course.category || 'Developpement'}</span>
                                 </div>
                                 <h3 className="text-xl font-bold text-white leading-tight">{course.title}</h3>
                              </div>
                           </div>
                           <div className="p-8">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>)}
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">+12</div>
                                 </div>
                                 <p className="text-xs font-bold text-slate-500">65% Terminé</p>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <Link 
                                to={`/course-player/${course._id}`}
                                className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3"
                              >
                                <FiPlayCircle className="w-5 h-5" />
                                Continuer la leçon
                              </Link>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'mycourses' && (
                <motion.div key="mycourses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900">Mes Cours</h2>
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                       <FiSearch className="text-gray-400" />
                       <input type="text" placeholder="Rechercher un cours..." className="bg-transparent border-0 focus:ring-0 text-sm font-medium outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                      <div key={course._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="h-40 bg-slate-100">
                           <img 
                            src={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : "https://via.placeholder.com/400x200"} 
                            className="w-full h-full object-cover"
                            alt=""
                           />
                        </div>
                        <div className="p-6">
                           <h4 className="font-bold text-slate-900 mb-2">{course.title}</h4>
                           <p className="text-xs text-slate-500 mb-6 line-clamp-2">{course.description}</p>
                           <Link 
                            to={`/course-player/${course._id}`}
                            className="inline-block text-sm font-bold text-emerald-600 hover:underline"
                           >
                            Accéder au cours →
                           </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AnalyticsView />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SettingsView userProfile={profile} onProfileUpdate={(p) => setProfile(p)} />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
}
