import { FiTrash2, FiUsers, FiDollarSign, FiPlus, FiX, FiCheckCircle, FiChevronRight, FiArrowLeft, FiPlusCircle } from "react-icons/fi";
import { useState } from "react";
import { createCourseAdmin } from "../../api/adminApi";

const initialCourseForm = {
  title: "",
  description: "",
  category: "Développement Web",
  courseType: "video",
  price: "",
  coverImage: null,
  previewVideoUrl: "",
  modules: [{ title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]
};

export default function AdminCourses({ courses = [], onDelete, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [createForm, setCreateForm] = useState(initialCourseForm);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Fonctions pour gérer les modules et leçons
  const updateModule = (moduleIndex, field, value) => {
    const updatedModules = [...createForm.modules];
    updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], [field]: value };
    setCreateForm({ ...createForm, modules: updatedModules });
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const updatedModules = [...createForm.modules];
    updatedModules[moduleIndex].lessons[lessonIndex] = { 
      ...updatedModules[moduleIndex].lessons[lessonIndex], 
      [field]: value 
    };
    setCreateForm({ ...createForm, modules: updatedModules });
  };

  const addModule = () => {
    setCreateForm({
      ...createForm,
      modules: [...createForm.modules, { 
        title: "", 
        lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] 
      }]
    });
  };

  const addLesson = (moduleIndex) => {
    const updatedModules = [...createForm.modules];
    updatedModules[moduleIndex].lessons.push({ 
      title: "", 
      type: "video", 
      sourceMode: "link", 
      videoUrl: "", 
      content: "", 
      file: null 
    });
    setCreateForm({ ...createForm, modules: updatedModules });
  };

  const removeModule = (moduleIndex) => {
    if (createForm.modules.length > 1) {
      const updatedModules = createForm.modules.filter((_, idx) => idx !== moduleIndex);
      setCreateForm({ ...createForm, modules: updatedModules });
    }
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...createForm.modules];
    if (updatedModules[moduleIndex].lessons.length > 1) {
      updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter((_, idx) => idx !== lessonIndex);
      setCreateForm({ ...createForm, modules: updatedModules });
    }
  };

  const handleCreateCourse = async () => {
    setCreateError('');
    setCreateSuccess('');

    if (!createForm.title || !createForm.description) {
      setCreateError('Veuillez remplir les champs obligatoires (titre et description).');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", createForm.title);
      formData.append("description", createForm.description);
      formData.append("category", createForm.category);
      formData.append("courseType", createForm.courseType);
      formData.append("price", Number(createForm.price) || 0);

      if (createForm.coverImage) {
        formData.append("coverImage", createForm.coverImage);
      }

      if (createForm.previewVideoUrl && createForm.previewVideoUrl.trim()) {
        formData.append("previewVideoUrl", createForm.previewVideoUrl.trim());
      }

      // Filtrer les modules et leçons valides (avec titre)
      const validModules = createForm.modules
        .filter(m => m.title && m.title.trim() !== "")
        .map(m => ({
          title: m.title.trim(),
          lessons: m.lessons
            .filter(l => l.title && l.title.trim() !== "")
            .map(l => ({
              title: l.title.trim(),
              type: l.type || "video",
              sourceMode: l.sourceMode || "link",
              videoUrl: l.videoUrl || "",
              content: l.content || ""
            }))
        }))
        .filter(m => m.lessons.length > 0); // Ne garder que les modules avec au moins une leçon

      if (validModules.length === 0) {
        setCreateError('Veuillez ajouter au moins un module avec une leçon ayant un titre.');
        return;
      }

      formData.append("modules", JSON.stringify(validModules));

      // Ajouter les fichiers des leçons
      createForm.modules.forEach((module, mIdx) => {
        module.lessons.forEach((lesson, lIdx) => {
          if (lesson.file) {
            formData.append(`lesson_file_${mIdx}_${lIdx}`, lesson.file);
          }
        });
      });

      await createCourseAdmin(formData);
      setCreateSuccess('Cours créé avec succès.');
      setCreateForm(initialCourseForm);
      setCreationStep(1);
      onRefresh();
    } catch (err) {
      setCreateError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Gestion des cours</h1>
            <p className="mt-2 text-sm text-slate-500">Contrôlez le catalogue de formation et supprimez les contenus obsolètes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <FiPlus className="w-4 h-4" /> Créer un cours
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.18em] text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Titre</th>
              <th className="px-6 py-4 text-left">Professeur</th>
              <th className="px-6 py-4 text-left">Étudiants</th>
              <th className="px-6 py-4 text-left">Prix</th>
              <th className="px-6 py-4 text-left">Créé le</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Aucun cours n'est disponible.</td>
              </tr>
            ) : courses.map((course) => (
              <tr key={course._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{course.title}</td>
                <td className="px-6 py-4 text-slate-700">{course.professor?.username || '—'}</td>
                <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-slate-400" />
                  <span>{(course.students?.length || 0)}</span>
                </td>
                <td className="px-6 py-4 text-slate-700 flex items-center gap-2">
                  <FiDollarSign className="w-4 h-4 text-slate-400" />
                  <span>{course.price ? `${course.price}` : 'Gratuit'}</span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(course.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => onDelete(course._id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="w-full max-w-5xl rounded-[32px] bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 md:p-10 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-1">Nouveau Cours</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Étape {creationStep} / 2</p>
              </div>
              <button onClick={() => { setShowCreate(false); setCreationStep(1); }} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-slate-900"><FiX size={24} /></button>
            </div>
            <div className="p-5 md:p-10 max-h-[75vh] md:max-h-[60vh] overflow-y-auto">
              {creationStep === 1 ? (
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Titre</label>
                      <input type="text" value={createForm.title || ""} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="Titre du cours" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Prix (€)</label>
                      <input type="number" value={createForm.price || ""} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Catégorie</label>
                      <select value={createForm.category || "Autre"} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold">
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
                      <select value={createForm.courseType || "video"} onChange={(e) => setCreateForm({ ...createForm, courseType: e.target.value })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold">
                        <option value="video">Vidéo</option>
                        <option value="pdf">PDF</option>
                        <option value="text">Texte</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Image de couverture</label>
                    <input type="file" accept="image/*" onChange={(e) => setCreateForm({ ...createForm, coverImage: e.target.files[0] })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                    <textarea value={createForm.description || ""} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold h-32" placeholder="Décrivez votre cours..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">URL Vidéo de Présentation (YouTube, Vimeo, etc.)</label>
                    <input type="url" value={createForm.previewVideoUrl || ""} onChange={(e) => setCreateForm({ ...createForm, previewVideoUrl: e.target.value })} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="https://www.youtube.com/embed/..." />
                  </div>
                  <button onClick={() => setCreationStep(2)} className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">Suivant: Modules & Leçons <FiChevronRight /></button>
                </div>
              ) : (
                <div className="space-y-10">
                  {createForm.modules.map((module, mIdx) => (
                    <div key={mIdx} className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black">{mIdx + 1}</div>
                        <input type="text" value={module.title || ""} onChange={(e) => updateModule(mIdx, 'title', e.target.value)} placeholder="Titre du module" className="flex-1 bg-transparent border-0 border-b border-slate-200 font-black text-xl outline-none" />
                        <button onClick={() => removeModule(mIdx)} className="text-slate-300 hover:text-red-500"><FiTrash2 /></button>
                      </div>
                      <div className="sm:ml-14 space-y-4">
                        {module.lessons.map((lesson, lIdx) => (
                          <div key={lIdx} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <input type="text" value={lesson.title || ""} onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)} placeholder="Nom leçon" className="flex-1 bg-transparent border-0 border-b border-slate-100 font-bold outline-none" />
                              <select value={lesson.type || "video"} onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)} className="bg-slate-50 rounded-lg p-2 text-[10px] font-black uppercase">
                                <option value="video">Vidéo</option>
                                <option value="pdf">PDF</option>
                                <option value="text">Texte</option>
                              </select>
                              <button onClick={() => removeLesson(mIdx, lIdx)} className="text-slate-200 hover:text-red-500"><FiX /></button>
                            </div>
                            {lesson.type !== 'text' && (
                              <div className="flex gap-4">
                                <button type="button" onClick={() => updateLesson(mIdx, lIdx, 'sourceMode', 'link')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${lesson.sourceMode === 'link' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>Lien</button>
                                <button type="button" onClick={() => updateLesson(mIdx, lIdx, 'sourceMode', 'upload')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${lesson.sourceMode === 'upload' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>Fichier</button>
                              </div>
                            )}
                            {lesson.sourceMode === 'link' ? (
                              <input type="text" placeholder="URL" value={lesson.videoUrl || ""} onChange={(e) => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl outline-none" />
                            ) : lesson.type !== 'text' ? (
                              <input type="file" onChange={(e) => updateLesson(mIdx, lIdx, 'file', e.target.files[0])} className="w-full p-4 bg-slate-50 rounded-xl" />
                            ) : null}
                            {lesson.type === 'text' && (
                              <textarea placeholder="Contenu..." value={lesson.content || ""} onChange={(e) => updateLesson(mIdx, lIdx, 'content', e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl h-24 outline-none" />
                            )}
                          </div>
                        ))}
                        <button onClick={() => addLesson(mIdx)} className="text-emerald-600 font-black text-xs flex items-center gap-2 mt-4"><FiPlusCircle /> Ajouter Leçon</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addModule} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-3">
                    <FiPlus /> Ajouter un Module
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4 pt-10">
                    <button onClick={() => setCreationStep(1)} className="w-full sm:w-auto px-10 py-5 bg-slate-100 rounded-2xl font-black flex items-center gap-2"><FiArrowLeft /> Retour</button>
                    <button onClick={handleCreateCourse} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20">Publier le cours</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
