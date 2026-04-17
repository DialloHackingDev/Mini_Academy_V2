import { useState, useEffect } from "react";
import ProfileComponent from "../components/ProfileComponent";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import { 
  getAdminDashboard, 
  createUser, 
  updateUser, 
  deleteUser, 
  disableUser,
  updateCourseAdmin,
  deleteCourseAdmin 
} from "../api/adminApi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewingMedia, setViewingMedia] = useState(null);
  
  // Formulaires
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "eleve"
  });
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: "",
    courseType: "text",
    content: "",
    videoUrl: ""
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getAdminDashboard();
      setUsers(data.users || []);
      setCourses(data.courses || []);
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
    }
  };

  // Gestion des utilisateurs
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(userForm);
      setUserForm({ username: "", email: "", password: "", role: "eleve" });
      fetchDashboardData();
      alert("Utilisateur créé avec succès!");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la création");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser._id, {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role
      });
      fetchDashboardData();
      setSelectedUser(null);
      setUserForm({ username: "", email: "", password: "", role: "eleve" });
      alert("Utilisateur modifié!");
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(userId);
      fetchDashboardData();
      alert("Utilisateur supprimé!");
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await disableUser(userId);
      fetchDashboardData();
      alert("Utilisateur désactivé!");
    } catch (error) {
      alert("Erreur lors de la désactivation");
    }
  };

  // Gestion des cours
  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    try {
      await updateCourseAdmin(selectedCourse._id, courseForm);
      fetchDashboardData();
      setSelectedCourse(null);
      setCourseForm({ title: "", description: "", price: "", professor: "" });
      alert("Cours modifié!");
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  const handleCreateCourseAdmin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", courseForm.title);
      formData.append("description", courseForm.description);
      formData.append("price", courseForm.price || 0);
      formData.append("courseType", courseForm.courseType);
      
      // Ajouter l'image de couverture si fournie
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      if (courseForm.courseType === "text") {
        formData.append("content", courseForm.content);
      } else if (courseForm.courseType === "pdf" && pdfFile) {
        formData.append("pdfFile", pdfFile);
      } else if (courseForm.courseType === "video") {
        if (videoFile) formData.append("videoFile", videoFile);
        else if (courseForm.videoUrl) formData.append("videoUrl", courseForm.videoUrl);
      }
      
      // Utiliser l'API enseignant/course publique
      const res = await fetch("http://localhost:3000/api/course", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création du cours");
      setCourses([...courses, data.data || data]);
      setCourseForm({ title: "", description: "", price: "", courseType: "text", content: "", videoUrl: "" });
      setPdfFile(null);
      setVideoFile(null);
      setCoverImage(null);
      alert("Cours créé avec succès !");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Supprimer ce cours ?")) return;
    try {
      await deleteCourseAdmin(courseId);
      fetchDashboardData();
      alert("Cours supprimé!");
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role
    });
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      professor: course.professor?._id || ""
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement du dashboard admin...</div>
      </div>
    );
  }

  // Navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔧 Dashboard Administrateur</h1>
              <p className="text-gray-600 mt-1">Gérez votre plateforme d'apprentissage</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bienvenue, Admin</p>
                <p className="font-medium text-gray-900">Administrateur</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-4 rounded-2xl shadow-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "overview" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📊 Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "users" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            👥 Utilisateurs ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "courses" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📚 Cours ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "profile" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            👤 Mon Profil
          </button>
        </div>

        {/* Contenu selon l'onglet */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">👥 Utilisateurs</h3>
                    <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                    <p className="text-sm text-gray-600">Total des utilisateurs</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">📚 Cours</h3>
                    <p className="text-3xl font-bold text-green-600">{courses.length}</p>
                    <p className="text-sm text-gray-600">Total des cours</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">👨‍🏫 Professeurs</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {users.filter(u => u.role === "prof").length}
                    </p>
                    <p className="text-sm text-gray-600">Professeurs actifs</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">🎓 Étudiants</h3>
                    <p className="text-3xl font-bold text-orange-600">
                      {users.filter(u => u.role === "eleve").length}
                    </p>
                    <p className="text-sm text-gray-600">Étudiants inscrits</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques et analyses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Répartition des cours par type</h3>
                <div className="space-y-3">
                  {['video', 'pdf', 'text'].map(type => {
                    const count = courses.filter(c => c.courseType === type).length;
                    const percentage = courses.length > 0 ? Math.round((count / courses.length) * 100) : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {type === 'video' ? '🎥' : type === 'pdf' ? '📄' : '📝'}
                          </span>
                          <span className="font-medium text-gray-900 capitalize">{type}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                type === 'video' ? 'bg-red-500' : 
                                type === 'pdf' ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-12 text-right">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Répartition des cours par prix</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🆓</span>
                      <span className="font-medium text-gray-900">Cours gratuits</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${courses.length > 0 ? Math.round((courses.filter(c => c.price === 0).length / courses.length) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {courses.filter(c => c.price === 0).length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💳</span>
                      <span className="font-medium text-gray-900">Cours payants</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${courses.length > 0 ? Math.round((courses.filter(c => c.price > 0).length / courses.length) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {courses.filter(c => c.price > 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des utilisateurs */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">👥 Gestion des utilisateurs</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.role === "admin" ? "bg-red-100 text-red-800" :
                        user.role === "prof" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => selectUser(user)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDisableUser(user._id)}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                      >
                        Désactiver
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire utilisateur */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {selectedUser ? "✏️ Modifier utilisateur" : "➕ Créer utilisateur"}
              </h2>
              <form onSubmit={selectedUser ? (e) => { e.preventDefault(); handleUpdateUser(); } : handleCreateUser} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                {!selectedUser && (
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                )}
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="eleve">Élève</option>
                  <option value="prof">Professeur</option>
                  <option value="admin">Administrateur</option>
                </select>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
                  >
                    {selectedUser ? "Modifier" : "Créer"}
                  </button>
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setUserForm({ username: "", email: "", password: "", role: "eleve" });
                      }}
                      className="px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-8">
            {/* Vue des médias */}
            {viewingMedia && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📺 Lecteur de média</h2>
                  <button
                    onClick={() => setViewingMedia(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{viewingMedia.title}</h3>
                  <p className="text-gray-600">{viewingMedia.description}</p>
                </div>
                
                {viewingMedia.courseType === "video" ? (
                  viewingMedia.videoFile ? (
                    <VideoPlayer
                      src={`http://localhost:3000/uploads/videos/${viewingMedia.videoFile.filename}`}
                      title={viewingMedia.title}
                      className="h-[500px]"
                    />
                  ) : viewingMedia.videoUrl ? (
                    <VideoPlayer
                      src={viewingMedia.videoUrl}
                      title={viewingMedia.title}
                      className="h-[500px]"
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <div className="text-6xl mb-4">🎥</div>
                      <p className="text-gray-600">Aucune vidéo disponible</p>
                    </div>
                  )
                ) : viewingMedia.courseType === "pdf" ? (
                  viewingMedia.pdfFile ? (
                    <PDFReader
                      src={`http://localhost:3000/uploads/pdfs/${viewingMedia.pdfFile.filename}`}
                      title={viewingMedia.title}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-gray-600">Aucun PDF disponible</p>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {viewingMedia.content}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Liste des cours */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">📚 Gestion des cours</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {courses.map((course) => (
                    <div key={course._id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">
                            {course.courseType === 'video' ? '🎥' : course.courseType === 'pdf' ? '📄' : '📝'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {course.price}€
                              </span>
                              {course.professor && (
                                <span className="text-xs text-gray-600">
                                  Par: {course.professor.username}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              {(course.courseType === 'video' || course.courseType === 'pdf' || course.courseType === 'text') && (
                                <button
                                  onClick={() => setViewingMedia(course)}
                                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                  title="Voir le contenu"
                                >
                                  👁️
                                </button>
                              )}
                              <button
                                onClick={() => selectCourse(course)}
                                className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulaire cours - modification */}
              {selectedCourse && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">✏️ Modifier le cours</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titre"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                    <input
                      type="number"
                      placeholder="Prix"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpdateCourse}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(null);
                          setCourseForm({ title: "", description: "", price: "", professor: "" });
                        }}
                        className="px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="mt-8">
            {/* Formulaire cours - création */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">➕ Créer un cours</h2>
              <form onSubmit={handleCreateCourseAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre du cours</label>
                  <input
                    type="text"
                    placeholder="Titre du cours"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Description du cours"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                  <input
                    type="number"
                    placeholder="0 pour gratuit"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de cours</label>
                  <select
                    value={courseForm.courseType}
                    onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="text">📝 Texte</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="video">🎥 Vidéo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format recommandé: JPG, PNG (max 5MB)</p>
                </div>

                {courseForm.courseType === "text" && (
                  <textarea
                    placeholder="Contenu"
                    value={courseForm.content}
                    onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                    className="w-full border p-3 rounded"
                  />
                )}

                {courseForm.courseType === "pdf" && (
                  <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                )}

                {courseForm.courseType === "video" && (
                  <div className="space-y-2">
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
                    <input
                      type="url"
                      placeholder="Ou URL de la vidéo"
                      value={courseForm.videoUrl}
                      onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                      className="w-full border p-3 rounded"
                    />
                  </div>
                )}

                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition">
                  Créer le cours
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto">
            <ProfileComponent />
          </div>
        )}
      </div>
    </div>
  );
}