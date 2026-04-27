import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid, FiUsers, FiBook, FiSettings, FiMenu, FiX, FiLogOut,
  FiBarChart2, FiDollarSign, FiAward, FiTrendingUp, FiShield,
  FiBell, FiChevronRight
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getAdminDashboard, deleteUser, disableUser, deleteCourseAdmin } from "../api/adminApi";
import AmazonNavbar from "../components/AmazonNavbar";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import AdminCourses from "../components/admin/AdminCourses";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import SettingsView from "../components/SettingsView";

const NAV = [
  { id: "overview",   label: "Vue d'ensemble", icon: FiGrid },
  { id: "analytics",  label: "Analytique",     icon: FiBarChart2 },
  { id: "users",      label: "Utilisateurs",   icon: FiUsers },
  { id: "courses",    label: "Cours",           icon: FiBook },
  { id: "settings",   label: "Paramètres",     icon: FiSettings },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ users: [], courses: [], purchases: [], stats: {}, monthlyRevenue: [], topCourses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const goTab = (t) => { setActiveTab(t); setSearchParams({ tab: t }); setSidebarOpen(false); };

  const handleDeleteUser = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await deleteUser(id); load();
  };
  const handleDisableUser = async (id) => { await disableUser(id); load(); };
  const handleDeleteCourse = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await deleteCourseAdmin(id); load();
  };

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:flex`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <FaGraduationCap className="text-white w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-black text-sm leading-tight">Elevated</p>
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white"><FiX /></button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => goTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            <Icon className="w-5 h-5" />
            {label}
            {activeTab === id && <FiChevronRight className="ml-auto" />}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{user?.username}</p>
            <p className="text-slate-400 text-[10px] truncate">Administrateur</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors"><FiLogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <AmazonNavbar />

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <Sidebar />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-10 lg:p-12 pb-24 lg:pb-16 pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === "overview"  && <AdminOverview data={data} onTabChange={goTab} />}
                {activeTab === "analytics" && <AdminAnalytics data={data} />}
                {activeTab === "users"     && <AdminUsers users={data.users} onDelete={handleDeleteUser} onDisable={handleDisableUser} onRefresh={load} />}
                {activeTab === "courses"   && <AdminCourses courses={data.courses} onDelete={handleDeleteCourse} onRefresh={load} />}
                {activeTab === "settings"  && <SettingsView userProfile={user} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => goTab(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 text-[10px] font-semibold transition-all ${activeTab === id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}