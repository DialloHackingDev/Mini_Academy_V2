import { FiTrash2, FiUsers, FiDollarSign, FiPlus, FiX, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";
import { createCourseAdmin } from "../../api/adminApi";

export default function AdminCourses({ courses = [], onDelete, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "Développement Web",
    courseType: "video",
    price: "",
    coverImage: null,
    modules: [{ title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const handleCreateCourse = async () => {
    setCreateError('');
    setCreateSuccess('');
    if (!createForm.title || !createForm.description) {
      setCreateError('Titre et description sont obligatoires.');
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

      formData.append("modules", JSON.stringify(createForm.modules.map(m => ({
        title: m.title || "",
        lessons: m.lessons.map(l => ({
          title: l.title || "",
          type: l.type || "video",
          sourceMode: l.sourceMode || "link",
          videoUrl: l.videoUrl || "",
          content: l.content || ""
        }))
      }))));

      createForm.modules.forEach((m, mIdx) => {
        m.lessons.forEach((l, lIdx) => {
          if (l.file) formData.append(`lesson_file_${mIdx}_${lIdx}`, l.file);
        });
      });

      await createCourseAdmin(formData);
      setCreateSuccess('Cours créé avec succès.');
      setCreateForm({
        title: "",
        description: "",
        category: "Développement Web",
        courseType: "video",
        price: "",
        coverImage: null,
        modules: [{ title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]
      });
      onRefresh();
    } catch (err) {
      setCreateError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Erreur lors de la création');
    }
  };

  const addModule = () => setCreateForm({...createForm, modules: [...createForm.modules, { title: "", lessons: [{ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null }] }]});
  const removeModule = (idx) => setCreateForm({...createForm, modules: createForm.modules.filter((_, i) => i !== idx)});
  const updateModule = (idx, key, val) => {
    const newModules = [...createForm.modules];
    newModules[idx][key] = val;
    setCreateForm({...createForm, modules: newModules});
  };
  const addLesson = (mIdx) => {
    const newModules = [...createForm.modules];
    newModules[mIdx].lessons.push({ title: "", type: "video", sourceMode: "link", videoUrl: "", content: "", file: null });
    setCreateForm({...createForm, modules: newModules});
  };
  const removeLesson = (mIdx, lIdx) => {
    const newModules = [...createForm.modules];
    newModules[mIdx].lessons = newModules[mIdx].lessons.filter((_, i) => i !== lIdx);
    setCreateForm({...createForm, modules: newModules});
  };
  const updateLesson = (mIdx, lIdx, key, val) => {
    const newModules = [...createForm.modules];
    newModules[mIdx].lessons[lIdx][key] = val;
    setCreateForm({...createForm, modules: newModules});
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
                  <span>{course.price ? `${course.price} €` : 'Gratuit'}</span>
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
          <div className="w-full max-w-4xl rounded-[32px] bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Créer un cours</h2>
                <p className="text-sm text-slate-500">Ajoutez un nouveau cours au catalogue.</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-900"><FiX className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">Titre *</label>
                <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Titre du cours" />
                <label className="block text-sm font-semibold text-slate-700">Catégorie</label>
                <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                  <option>Développement Web</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Business</option>
                  <option>Autre</option>
                </select>
                <label className="block text-sm font-semibold text-slate-700">Prix (€)</label>
                <input type="number" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="0 pour gratuit" />
                <label className="block text-sm font-semibold text-slate-700">Type de cours</label>
                <select value={createForm.courseType} onChange={(e) => setCreateForm({ ...createForm, courseType: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                  <option value="video">Vidéo</option>
                  <option value="pdf">PDF</option>
                  <option value="text">Texte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={4} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Décrivez le cours..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image de couverture</label>
                <input type="file" accept="image/*" onChange={(e) => setCreateForm({ ...createForm, coverImage: e.target.files[0] })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Modules et leçons</h3>
                  <button type="button" onClick={addModule} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                    <FiPlus className="w-4 h-4" /> Module
                  </button>
                </div>
                {createForm.modules.map((module, mIdx) => (
                  <div key={mIdx} className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="text" placeholder="Titre du module" value={module.title} onChange={(e) => updateModule(mIdx, 'title', e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none" />
                      <button type="button" onClick={() => removeModule(mIdx)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {module.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="bg-white rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <input type="text" placeholder="Titre de la leçon" value={lesson.title} onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
                          <select value={lesson.type} onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none">
                            <option value="video">Vidéo</option>
                            <option value="pdf">PDF</option>
                            <option value="text">Texte</option>
                          </select>
                          <button type="button" onClick={() => removeLesson(mIdx, lIdx)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {lesson.type === 'video' && (
                          <div className="space-y-2">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input type="radio" name={`source-${mIdx}-${lIdx}`} checked={lesson.sourceMode === 'link'} onChange={() => updateLesson(mIdx, lIdx, 'sourceMode', 'link')} />
                                Lien externe
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="radio" name={`source-${mIdx}-${lIdx}`} checked={lesson.sourceMode === 'file'} onChange={() => updateLesson(mIdx, lIdx, 'sourceMode', 'file')} />
                                Télécharger
                              </label>
                            </div>
                            {lesson.sourceMode === 'link' ? (
                              <input type="text" placeholder="URL de la vidéo" value={lesson.videoUrl || ""} onChange={(e) => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
                            ) : (
                              <input type="file" onChange={(e) => updateLesson(mIdx, lIdx, 'file', e.target.files[0])} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
                            )}
                          </div>
                        )}
                        {lesson.type === 'text' && (
                          <textarea placeholder="Contenu de la leçon" value={lesson.content} onChange={(e) => updateLesson(mIdx, lIdx, 'content', e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
                        )}
                        {lesson.type === 'pdf' && (
                          <input type="file" accept=".pdf" onChange={(e) => updateLesson(mIdx, lIdx, 'file', e.target.files[0])} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addLesson(mIdx)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition">
                      <FiPlus className="w-4 h-4" /> Leçon
                    </button>
                  </div>
                ))}
              </div>

              {createError && <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>}
              {createSuccess && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2"><FiCheckCircle className="w-4 h-4" />{createSuccess}</div>}
            </div>
            <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-200">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Annuler</button>
              <button type="button" onClick={handleCreateCourse} className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">Créer le cours</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
