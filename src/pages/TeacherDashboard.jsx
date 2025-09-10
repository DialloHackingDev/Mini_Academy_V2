import { useState, useEffect } from "react";
import SidebarTeacher from "../components/SidebarTeacher";
import {
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
} from "../api/teacherApi";

// Ajoutez l'import du composant ProfileComponent
import ProfileComponent from "../components/ProfileComponent";

export default function DashboardTeacher() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("home");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    courseType: "text",
    content: "",
    videoUrl: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyCourses();
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Erreur:", err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ Création d'un cours
  const handleCreateCourse = async () => {
    if (!form.title.trim()) return alert("Titre requis !");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price || 0);
      formData.append("courseType", form.courseType);

      if (form.courseType === "text") {
        formData.append("content", form.content);
      } else if (form.courseType === "pdf" && pdfFile) {
        formData.append("pdfFile", pdfFile);
      } else if (form.courseType === "video") {
        if (videoFile) formData.append("videoFile", videoFile);
        else formData.append("videoUrl", form.videoUrl);
      }

      const newCourse = await createCourse(formData);
      setCourses([...courses, newCourse]);
      setForm({
        title: "",
        description: "",
        price: "",
        courseType: "text",
        content: "",
        videoUrl: "",
      });
      setPdfFile(null);
      setVideoFile(null);
      alert("Cours créé avec succès !");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de la création du cours");
    }
  };

  // ✅ Modification d'un cours
  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price || 0);
      formData.append("courseType", form.courseType);

      if (form.courseType === "text") {
        formData.append("content", form.content);
      } else if (form.courseType === "pdf" && pdfFile) {
        formData.append("pdfFile", pdfFile);
      } else if (form.courseType === "video") {
        if (videoFile) formData.append("videoFile", videoFile);
        else formData.append("videoUrl", form.videoUrl);
      }

      const updated = await updateCourse(selectedCourse._id, formData);
      setCourses(courses.map((c) => (c._id === selectedCourse._id ? updated : c)));
      alert("Cours mis à jour !");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  // ✅ Suppression d'un cours
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    if (!confirm("Voulez-vous vraiment supprimer ce cours ?")) return;
    try {
      await deleteCourse(selectedCourse._id);
      setCourses(courses.filter((c) => c._id !== selectedCourse._id));
      setSelectedCourse(null);
      alert("Cours supprimé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // ✅ Stats
  const fetchStats = async () => {
    if (!selectedCourse) return;
    try {
      const s = await getCourseStats(selectedCourse._id);
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  // Dans la fonction renderTabContent, ajoutez le cas pour l'onglet profile
  const renderTabContent = () => {
    switch (selectedTab) {
      case "home":
        return (
          <div className="space-y-6 mt-4">
            <h1 className="text-2xl font-bold">
              👋 Bienvenue sur votre Dashboard Professeur !
            </h1>
            {loading ? (
              <p>Chargement...</p>
            ) : courses.length === 0 ? (
              <p>Vous n’avez encore créé aucun cours.</p>
            ) : (
              <ul className="space-y-3">
                {courses.map((course) => (
                  <li
                    key={course._id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedCourse?._id === course._id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    {course.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "creation":
        return (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4">➕ Créer un cours</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Titre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Prix"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <select
                value={form.courseType}
                onChange={(e) => setForm({ ...form, courseType: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="text">Texte</option>
                <option value="pdf">PDF</option>
                <option value="video">Vidéo</option>
              </select>

              {form.courseType === "text" && (
                <textarea
                  placeholder="Contenu du cours"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              )}

              {form.courseType === "pdf" && (
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
              )}

              {form.courseType === "video" && (
                <>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                  />
                  <input
                    type="url"
                    placeholder="Ou URL de la vidéo"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full border p-2 rounded mt-2"
                  />
                </>
              )}

              <button
                type="button"
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Créer le cours
              </button>
            </form>
          </div>
        );

      case "manageCourses":
        return (
          <div className="mt-4 space-y-6">
            <h1 className="text-2xl font-bold">✏️ Gérer les Cours</h1>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateCourse}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  disabled={!selectedCourse}
                >
                  Modifier
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={!selectedCourse}
                >
                  Supprimer
                </button>
              </div>
            </div>
            {selectedCourse && (
              <div className="mt-4 p-4 border rounded bg-gray-50">
                <h2 className="font-semibold">{selectedCourse.title}</h2>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>
            )}
          </div>
        );

      case "stats":
        return (
          <div className="mt-4">
            <h1 className="text-2xl font-bold">📊 Statistiques du cours</h1>
            {selectedCourse ? (
              <div>
                <button
                  onClick={fetchStats}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Charger les stats
                </button>
                {stats && (
                  <div className="mt-4 space-y-6">
                    <div className="p-4 border rounded bg-gray-50">
                      <p className="font-semibold">Étudiants inscrits: {stats.data?.totalStudents ?? stats.totalStudents ?? 0}</p>
                      <p>Vues totales: {stats.data?.stats?.totalViews ?? 0}</p>
                      <p>Téléchargements: {stats.data?.stats?.totalDownloads ?? 0}</p>
                      <p>Note moyenne: {stats.data?.stats?.averageRating ?? 0} ⭐</p>
                    </div>
                    {/* Tableau des étudiants inscrits */}
                    {selectedCourse.students && selectedCourse.students.length > 0 && (
                      <div className="bg-white rounded shadow overflow-x-auto">
                        <table className="min-w-full text-left">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2">Nom</th>
                              <th className="px-4 py-2">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCourse.students.map((s) => (
                              <tr key={s._id} className="border-t">
                                <td className="px-4 py-2">{s.username}</td>
                                <td className="px-4 py-2">{s.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p>Sélectionnez un cours pour voir les statistiques.</p>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="max-w-3xl mx-auto">
            <ProfileComponent />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <SidebarTeacher
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex-1 p-6 overflow-auto">
        <button
          className="md:hidden mb-4 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        </button>

        {renderTabContent()}
      </div>
    </div>
  );
}
