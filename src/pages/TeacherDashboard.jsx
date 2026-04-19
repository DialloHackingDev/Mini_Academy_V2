import { useState, useEffect } from "react";
import { 
  FiPlus, FiBook, FiBarChart2, FiSettings, FiTrash2, FiEdit2, 
  FiPlay, FiFileText, FiLink, FiHardDrive, FiUpload, FiX, 
  FiChevronRight, FiArrowLeft, FiPlusCircle, FiUsers
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AmazonNavbar from "../components/AmazonNavbar";
import { getTeacherDashboard, createCourse, updateCourse, deleteCourse, getTeacherAnalytics } from "../api/teacherApi";
import AnalyticsView from "../components/AnalyticsView";
import SettingsView from "../components/SettingsView";
import ProfileComponent from "../components/ProfileComponent";
import VideoPlayer from "../components/VideoPlayer";

import { useSearchParams } from "react-router-dom";

const sidebarItems = [
  { id: "dashboard", label: "Aperçu", icon: FiBarChart2 },
  { id: "courses", label: "Mes Cours", icon: FiBook },
  { id: "analytics", label: "Analytiques", icon: FiBarChart2 },
  { id: "settings", label: "Paramètres", icon: FiSettings },
];

export default function TeacherDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  
  const [activeTab, setActiveTab] = useState(initialTab === "create" ? "courses" : initialTab);
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(initialTab === "create");
  const [creationStep, setCreationStep] = useState(1);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "create") {
      setActiveTab("courses");
      setShowCreateModal(true);
    } else if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Développement Web",
    courseType: "video",
    price: "",
    coverImage: null,
    modules: [{ title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dashData, analytics] = await Promise.all([
        getTeacherDashboard(),
        getTeacherAnalytics()
      ]);
      setCourses(dashData.courses || []);
      setProfile(dashData.profile || {});
      setAnalyticsData(analytics);
    } catch (err) { console.error(err); }
  };

  const handleCreateCourse = async () => {
    try {
      if (!form.title || !form.description) {
        alert("Veuillez remplir les champs obligatoires (Titre et Description)");
        return;
      }

      // Validation approfondie des modules et leçons
      for (let i = 0; i < form.modules.length; i++) {
        if (!form.modules[i].title?.trim()) {
          alert(`Le module ${i + 1} doit avoir un titre`);
          return;
        }
        for (let j = 0; j < form.modules[i].lessons.length; j++) {
          if (!form.modules[i].lessons[j].title?.trim()) {
            alert(`La leçon ${j + 1} du module "${form.modules[i].title}" doit avoir un titre`);
            return;
          }
        }
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("courseType", form.courseType);
      formData.append("price", Number(form.price) || 0);
      
      if (form.coverImage) {
        formData.append("coverImage", form.coverImage);
      }

      formData.append("modules", JSON.stringify(form.modules.map(m => ({ 
        title: m.title || "", 
        lessons: m.lessons.map(l => ({ 
          title: l.title || "", 
          type: l.type || "video", 
          sourceMode: l.sourceMode || "link", 
          videoUrl: l.videoUrl || "", 
          content: l.content || "" 
        })) 
      }))));
      
      form.modules.forEach((m, mIdx) => {
        m.lessons.forEach((l, lIdx) => {
          if (l.file) formData.append(`lesson_file_${mIdx}_${lIdx}`, l.file);
        });
      });

      await createCourse(formData);
      setShowCreateModal(false);
      setForm({
        title: "",
        description: "",
        category: "Développement Web",
        courseType: "video",
        price: "",
        coverImage: null,
        modules: [{ title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]
      });
      loadData();
      alert("Cours publié ! ✅");
    } catch (err) { 
      console.error(err);
      alert("Erreur lors de la création : " + (err.response?.data?.message || err.message)); 
    }
  };

  const handleUpdateCourse = async () => {
     try {
       const formData = new FormData();
       formData.append("title", editingCourse.title || "");
       formData.append("description", editingCourse.description || "");
       formData.append("category", editingCourse.category || "Autre");
       formData.append("price", Number(editingCourse.price) || 0);
       
       if (editingCourse.newCoverImage) {
         formData.append("coverImage", editingCourse.newCoverImage);
       }

       await updateCourse(editingCourse._id, formData);
       setEditingCourse(null);
       loadData();
       alert("Cours mis à jour ! ✅");
     } catch(err) { 
       console.error(err);
       alert("Erreur lors de la modification"); 
     }
  };

  const handleDeleteCourse = async (id) => {
    if(confirm("Supprimer ce cours ?")) {
      try { await deleteCourse(id); loadData(); } catch(err) { alert("Erreur suppression"); }
    }
  };

  const addModule = () => setForm({...form, modules: [...form.modules, { title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]});
  const removeModule = (idx) => setForm({...form, modules: form.modules.filter((_, i) => i !== idx)});
  const updateModule = (idx, key, val) => {
    const newModules = [...form.modules];
    newModules[idx][key] = val;
    setForm({...form, modules: newModules});
  };

  const addLesson = (mIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].lessons.push({ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null });
    setForm({...form, modules: newModules});
  };

  const removeLesson = (mIdx, lIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].lessons = newModules[mIdx].lessons.filter((_, i) => i !== lIdx);
    setForm({...form, modules: newModules});
  };

  const updateLesson = (mIdx, lIdx, key, val) => {
    const newModules = [...form.modules];
    newModules[mIdx].lessons[lIdx][key] = val;
    setForm({...form, modules: newModules});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AmazonNavbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Desktop */}
        <aside className="w-80 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="flex-1 py-10 px-6 space-y-3">
             <div className="px-5 mb-8"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructeur</p></div>
             {sidebarItems.map(item => {
               const Icon = item.icon;
               return (
                 <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                       className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                       <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                          <Icon className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                       {isActive && <motion.div layoutId="bottomNavTeacher" className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />}
                    </button>
                 );
              })}
           </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-14 pb-24 lg:pb-14">
          <div className="max-w-7xl mx-auto">
             <div className="mb-10 lg:mb-14">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">Espace Instructeur 🎖️</h1>
                <p className="text-slate-500 font-medium italic">Gérez vos formations et suivez vos élèves.</p>
             </div>

             <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                     {[
                       { label: 'Cours Actifs', value: courses.length, color: 'emerald', icon: FiBook },
                       { label: 'Élèves Totaux', value: courses.reduce((acc, c) => acc + (c.students?.length || 0), 0), color: 'blue', icon: FiUsers },
                       { label: 'Note Moyenne', value: '4.8', color: 'orange', icon: FiPlusCircle },
                       { label: 'Ventes', value: '3,200€', color: 'purple', icon: FiBarChart2 },
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
                  </motion.div>
                )}

                {activeTab === 'courses' && (
                  <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black">Mes Cours</h2>
                        <button onClick={() => { setShowCreateModal(true); setCreationStep(1); }} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                           <FiPlus /> Nouveau
                        </button>
                     </div>
                     <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                           <thead className="bg-slate-50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <tr><th className="px-10 py-6">Cours</th><th className="px-10 py-6">Élèves</th><th className="px-10 py-6 text-right">Actions</th></tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {courses.map(c => (
                                <tr key={c._id} className="hover:bg-slate-50/50 transition-all group">
                                   <td className="px-10 py-8 font-bold">{c.title}</td>
                                   <td className="px-10 py-8 font-bold">{c.students?.length || 0}</td>
                                   <td className="px-10 py-8 text-right">
                                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                         <button onClick={() => setEditingCourse(c)} className="p-3 text-slate-400 hover:text-emerald-600"><FiEdit2 /></button>
                                         <button onClick={() => handleDeleteCourse(c._id)} className="p-3 text-slate-400 hover:text-red-600"><FiTrash2 /></button>
                                      </div>
                                   </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'analytics' && (
                  <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AnalyticsView courses={courses} stats={analyticsData} />
                  </motion.div>
                )}
                {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SettingsView userProfile={profile} onProfileUpdate={setProfile} /></motion.div>}
             </AnimatePresence>
          </div>
        </main>
      </div>

      {/* MODAL CRÉATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 overflow-y-auto">
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-5xl shadow-2xl overflow-hidden my-auto relative">
              <div className="p-5 md:p-10 border-b border-gray-50 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl md:text-3xl font-black mb-1">Nouveau Cours</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Étape {creationStep} / 2</p>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-slate-900"><FiX size={24}/></button>
              </div>

              <div className="p-5 md:p-10 max-h-[75vh] md:max-h-[60vh] overflow-y-auto">
                 {creationStep === 1 ? (
                    <div className="space-y-6 md:space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Titre</label>
                             <input type="text" value={form.title || ""} onChange={e=>setForm({...form, title: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="Nom du cours" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Prix (€)</label>
                             <input type="number" value={form.price || ""} onChange={e=>setForm({...form, price: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="0 pour gratuit" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Catégorie</label>
                             <select value={form.category || "Autre"} onChange={e=>setForm({...form, category: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold">
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
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Type de cours</label>
                             <select value={form.courseType || "video"} onChange={e=>setForm({...form, courseType: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold">
                                <option value="video">Vidéo</option>
                                <option value="pdf">PDF</option>
                                <option value="text">Texte</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Image de couverture</label>
                          <input type="file" onChange={e=>setForm({...form, coverImage: e.target.files[0]})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none text-sm" accept="image/*" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                          <textarea value={form.description || ""} onChange={e=>setForm({...form, description: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold h-32" placeholder="Décrivez votre cours..." />
                       </div>
                       <button onClick={() => setCreationStep(2)} className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">Suivant: Modules & Leçons <FiChevronRight /></button>
                    </div>
                 ) : (
                    <div className="space-y-10">
                       {form.modules.map((m, mIdx) => (
                         <div key={mIdx} className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                               <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black">{mIdx+1}</div>
                               <input type="text" value={m.title || ""} onChange={e=>updateModule(mIdx, 'title', e.target.value)} placeholder="Titre du module" className="flex-1 bg-transparent border-0 border-b border-slate-200 font-black text-xl outline-none" />
                               <button onClick={()=>removeModule(mIdx)} className="text-slate-300 hover:text-red-500"><FiTrash2 /></button>
                            </div>
                            <div className="sm:ml-14 space-y-4">
                               {m.lessons.map((l, lIdx) => (
                                 <div key={lIdx} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                       <input type="text" value={l.title || ""} onChange={e=>updateLesson(mIdx, lIdx, 'title', e.target.value)} placeholder="Nom leçon" className="flex-1 bg-transparent border-0 border-b border-slate-100 font-bold outline-none" />
                                       <select value={l.type || "video"} onChange={e=>updateLesson(mIdx, lIdx, 'type', e.target.value)} className="bg-slate-50 rounded-lg p-2 text-[10px] font-black uppercase">
                                          <option value="video">Vidéo</option>
                                          <option value="pdf">PDF</option>
                                          <option value="text">Texte</option>
                                       </select>
                                       <button onClick={()=>removeLesson(mIdx, lIdx)} className="text-slate-200 hover:text-red-500"><FiX /></button>
                                    </div>
                                    {l.type !== 'text' && (
                                      <div className="flex gap-4">
                                         <button type="button" onClick={()=>updateLesson(mIdx, lIdx, 'sourceMode', 'link')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${l.sourceMode==='link' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>Lien</button>
                                         <button type="button" onClick={()=>updateLesson(mIdx, lIdx, 'sourceMode', 'upload')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${l.sourceMode==='upload' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>Fichier</button>
                                      </div>
                                    )}
                                    {l.sourceMode === 'link' ? <input type="text" placeholder="URL" value={l.videoUrl || ""} onChange={e=>updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl outline-none" /> : (l.type !== 'text' && <input type="file" onChange={e=>updateLesson(mIdx, lIdx, 'file', e.target.files[0])} className="w-full p-4 bg-slate-50 rounded-xl" />)}
                                    {l.type === 'text' && <textarea placeholder="Contenu..." value={l.content || ""} onChange={e=>updateLesson(mIdx, lIdx, 'content', e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl h-24" />}
                                 </div>
                               ))}
                               <button onClick={()=>addLesson(mIdx)} className="text-emerald-600 font-black text-xs flex items-center gap-2 mt-4"><FiPlusCircle /> Ajouter Leçon</button>
                            </div>
                         </div>
                       ))}
                       <button onClick={addModule} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-3">
                          <FiPlus /> Ajouter un Module
                       </button>
                       <div className="flex flex-col sm:flex-row gap-4 pt-10">
                          <button onClick={()=>setCreationStep(1)} className="w-full sm:w-auto px-10 py-5 bg-slate-100 rounded-2xl font-black flex items-center gap-2"><FiArrowLeft /> Retour</button>
                          <button onClick={handleCreateCourse} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20">Publier le cours</button>
                       </div>
                    </div>
                 )}
              </div>
           </motion.div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 overflow-y-auto">
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden my-auto relative">
              <div className="p-6 md:p-10 border-b border-gray-50 flex justify-between items-center">
                 <h2 className="text-2xl md:text-3xl font-black">Modifier le cours</h2>
                 <button onClick={()=>setEditingCourse(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900"><FiX size={20}/></button>
              </div>
              <div className="p-6 md:p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Titre</label>
                       <input type="text" value={editingCourse.title || ""} onChange={e=>setEditingCourse({...editingCourse, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Prix (€)</label>
                       <input type="number" value={editingCourse.price || ""} onChange={e=>setEditingCourse({...editingCourse, price: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Catégorie</label>
                       <select value={editingCourse.category || "Autre"} onChange={e=>setEditingCourse({...editingCourse, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
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
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nouvelle Image de couverture (optionnel)</label>
                    <input type="file" onChange={e=>setEditingCourse({...editingCourse, newCoverImage: e.target.files[0]})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm" accept="image/*" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                    <textarea value={editingCourse.description || ""} onChange={e=>setEditingCourse({...editingCourse, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold h-32" />
                 </div>
                 <button onClick={handleUpdateCourse} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs">Sauvegarder les modifications</button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
