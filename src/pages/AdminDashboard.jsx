import { useState, useEffect } from "react";
import { 
  FiGrid, 
  FiUsers, 
  FiBook, 
  FiSettings, 
  FiPlus, 
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiChevronRight,
  FiUser,
  FiBarChart2,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiSlash
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AmazonNavbar from "../components/AmazonNavbar";
import { 
  getAdminDashboard, 
  createUser, 
  updateUser, 
  deleteUser, 
  disableUser,
  updateCourseAdmin,
  deleteCourseAdmin 
} from "../api/adminApi";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import ProfileComponent from "../components/ProfileComponent";
import SettingsView from "../components/SettingsView";
import { useAuth } from "../context/AuthContext";

import { useSearchParams } from "react-router-dom";

const sidebarItems = [
  { id: "overview", label: "Vue d'ensemble", icon: FiBarChart2 },
  { id: "users", label: "Utilisateurs", icon: FiUsers },
  { id: "courses", label: "Gestion Cours", icon: FiBook },
  { id: "settings", label: "Paramètres", icon: FiSettings },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewingMedia, setViewingMedia] = useState(null);

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
  
  const [userForm, setUserForm] = useState({ username: "", email: "", password: "", role: "eleve" });
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: "", category: "Développement Web", courseType: "text", content: "", videoUrl: "" });
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getAdminDashboard();
      setUsers(data.users || []);
      setCourses(data.courses || []);
      setLoading(false);
    } catch (error) { console.error("Erreur:", error); setLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(userForm);
      setUserForm({ username: "", email: "", password: "", role: "eleve" });
      fetchDashboardData();
      alert("Utilisateur créé avec succès!");
    } catch (error) { alert(error.response?.data?.message || "Erreur lors de la création"); }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser._id, userForm);
      fetchDashboardData();
      setSelectedUser(null);
      setUserForm({ username: "", email: "", password: "", role: "eleve" });
      alert("Utilisateur modifié!");
    } catch (error) { alert("Erreur lors de la modification"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try { await deleteUser(userId); fetchDashboardData(); alert("Utilisateur supprimé!"); } catch (error) { alert("Erreur lors de la suppression"); }
  };

  const handleDisableUser = async (userId) => {
    try { await disableUser(userId); fetchDashboardData(); alert("Utilisateur désactivé!"); } catch (error) { alert("Erreur lors de la désactivation"); }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    try {
      await updateCourseAdmin(selectedCourse._id, courseForm);
      fetchDashboardData();
      setSelectedCourse(null);
      setCourseForm({ title: "", description: "", price: "", category: "Développement Web", courseType: "text", content: "", videoUrl: "" });
      alert("Cours modifié!");
    } catch (error) { alert("Erreur lors de la modification"); }
  };

  const handleCreateCourseAdmin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(courseForm).forEach(key => {
        if (key === 'price') {
          formData.append(key, Number(courseForm[key]) || 0);
        } else {
          formData.append(key, courseForm[key]);
        }
      });
      if (coverImage) formData.append("coverImage", coverImage);
      if (courseForm.courseType === "pdf" && pdfFile) formData.append("pdfFile", pdfFile);
      if (courseForm.courseType === "video" && videoFile) formData.append("videoFile", videoFile);
      
      const res = await fetch("http://localhost:5000/api/course", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      setCourseForm({ title: "", description: "", price: "", courseType: "text", content: "", videoUrl: "", category: "Développement Web" }); 
      setCoverImage(null); 
      setPdfFile(null); 
      setVideoFile(null); 
      fetchDashboardData(); 
      alert("Cours créé ! ✅");
    } catch (error) { alert(error.message); }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Supprimer ce cours ?")) return;
    try { await deleteCourseAdmin(courseId); fetchDashboardData(); alert("Cours supprimé!"); } catch (error) { alert("Erreur lors de la suppression"); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AmazonNavbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Desktop */}
        <aside className="w-80 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="flex-1 py-10 px-6 space-y-3">
             <div className="px-5 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 overflow-hidden">
                   {user?.profileImage ? (
                     <img src={`http://localhost:5000/uploads/profiles/${user.profileImage}`} className="w-full h-full object-cover" alt="" />
                   ) : (
                     user?.username?.[0]?.toUpperCase() || 'A'
                   )}
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</p>
                   <p className="text-sm font-bold text-slate-900">{user?.username}</p>
                </div>
             </div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-4">
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                  </div>
                  {activeTab === item.id && <FiChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
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
                       className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                    >
                       <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                          <Icon className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                       {isActive && <motion.div layoutId="bottomNavAdmin" className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />}
                    </button>
                 );
              })}
           </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-14 pb-24 lg:pb-14">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 lg:mb-14">
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">Panneau Admin 🛠️</h1>
               <p className="text-slate-500 font-medium italic">Gérez la plateforme Elevated Academy.</p>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Utilisateurs', value: users.length, color: 'blue', icon: FiUsers },
                        { label: 'Cours', value: courses.length, color: 'green', icon: FiBook },
                        { label: 'Professeurs', value: users.filter(u=>u.role==='prof').length, color: 'purple', icon: FiUser },
                        { label: 'Revenu', value: '12,450€', color: 'emerald', icon: FiBarChart2 },
                      ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                             <div className={`w-12 h-12 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
                                <Icon className="w-6 h-6" />
                             </div>
                             <p className="text-2xl font-black text-slate-900">{s.value}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                          </div>
                        );
                      })}
                   </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-black">Utilisateurs</h2>
                        <span className="bg-slate-100 text-slate-600 text-xs font-black px-3 py-1 rounded-full">{users.length}</span>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                         {users.map(u => (
                           <div key={u._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div>
                                 <p className="font-bold text-slate-900 text-sm">{u.username}</p>
                                 <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => { setSelectedUser(u); setUserForm({ ...u, password: "" }); }} className="p-2 text-blue-600 bg-white rounded-lg shadow-sm"><FiEdit2 size={14}/></button>
                                 <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-red-600 bg-white rounded-lg shadow-sm"><FiTrash2 size={14}/></button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                      <h2 className="text-xl font-black mb-8">{selectedUser ? "Modifier" : "Créer"} Utilisateur</h2>
                      <form onSubmit={selectedUser ? (e)=>{e.preventDefault(); handleUpdateUser();} : handleCreateUser} className="space-y-4">
                         <input type="text" placeholder="Nom" value={userForm.username || ""} onChange={e=>setUserForm({...userForm, username: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none" required />
                         <input type="email" placeholder="Email" value={userForm.email || ""} onChange={e=>setUserForm({...userForm, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none" required />
                         {!selectedUser && <input type="password" placeholder="Pass" value={userForm.password || ""} onChange={e=>setUserForm({...userForm, password: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none" required />}
                         <select value={userForm.role || "eleve"} onChange={e=>setUserForm({...userForm, role: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold">
                            <option value="eleve">Élève</option>
                            <option value="prof">Professeur</option>
                            <option value="admin">Admin</option>
                         </select>
                         <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20">{selectedUser ? "Modifier" : "Créer"}</button>
                         {selectedUser && <button type="button" onClick={()=>{setSelectedUser(null); setUserForm({username:"",email:"",password:"",role:"eleve"});}} className="w-full py-2 text-slate-400 text-xs font-bold">Annuler</button>}
                      </form>
                   </div>
                </motion.div>
              )}

              {activeTab === 'courses' && (
                <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                   {viewingMedia && (
                     <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                        <button onClick={()=>setViewingMedia(null)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-full hover:bg-white/20"><FiX /></button>
                        <h2 className="text-2xl font-black mb-2">{viewingMedia.title}</h2>
                        <div className="aspect-video bg-black rounded-3xl overflow-hidden mb-4">
                           {viewingMedia.courseType === 'video' ? <VideoPlayer src={viewingMedia.videoFile ? `http://localhost:5000/uploads/videos/${viewingMedia.videoFile.filename}` : viewingMedia.videoUrl} /> : <div className="flex items-center justify-center h-full">Format: {viewingMedia.courseType}</div>}
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                         <h2 className="text-xl font-black mb-6">Liste des Cours</h2>
                         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {courses.map(c => (
                              <div key={c._id} className="p-5 border border-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FiBook size={18}/></div>
                                    <div>
                                       <p className="font-bold text-slate-900">{c.title}</p>
                                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{c.price}€</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-2">
                                    <button onClick={()=>setViewingMedia(c)} className="p-2 text-blue-500 bg-white shadow-sm rounded-lg"><FiEye size={14}/></button>
                                    <button onClick={()=>handleDeleteCourse(c._id)} className="p-2 text-red-500 bg-white shadow-sm rounded-lg"><FiTrash2 size={14}/></button>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                         <h2 className="text-xl font-black mb-8">Nouveau Cours (Admin)</h2>
                         <form onSubmit={handleCreateCourseAdmin} className="space-y-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Titre</label>
                               <input type="text" placeholder="Titre" value={courseForm.title || ""} onChange={e=>setCourseForm({...courseForm, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Prix (€)</label>
                                  <input type="number" placeholder="0 pour gratuit" value={courseForm.price || ""} onChange={e=>setCourseForm({...courseForm, price: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Type</label>
                                  <select value={courseForm.courseType || "text"} onChange={e=>setCourseForm({...courseForm, courseType: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold">
                                     <option value="text">Texte</option>
                                     <option value="pdf">PDF</option>
                                     <option value="video">Vidéo</option>
                                  </select>
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Catégorie</label>
                               <select value={courseForm.category || "Autre"} onChange={e=>setCourseForm({...courseForm, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold">
                                  <option value="Développement Web">Développement Web</option>
                                  <option value="Développement Mobile">Développement Mobile</option>
                                  <option value="Data Science">Data Science</option>
                                  <option value="IA & Machine Learning">IA & Machine Learning</option>
                                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                                  <option value="Conception & UI/UX">Conception & UI/UX</option>
                                  <option value="Marketing Digital">Marketing Digital</option>
                                  <option value="Gestion de Projet">Gestion de Projet</option>
                                  <option value="Langue & Communication">Langue & Communication</option>
                                  <option value="Autre">Autre</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Image de couverture</label>
                               <input type="file" onChange={e=>setCoverImage(e.target.files[0])} className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm" accept="image/*" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                               <textarea placeholder="Description" value={courseForm.description || ""} onChange={e=>setCourseForm({...courseForm, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold h-32" required />
                            </div>
                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs">Publier le cours</button>
                         </form>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <SettingsView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}