import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileComponent from "../components/ProfileComponent";
import CourseReader from "../components/CourseReader";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import { getMyCourses, getProgress, postReview } from "../api/StudiantApi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("home");

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingCourse, setViewingCourse] = useState(null);
  
  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [courseTypeFilter, setCourseTypeFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyCourses();
        setCourses(data);
        setFilteredCourses(data);

        // Charger la progression de tous les cours
        const progressData = {};
        for (let course of data) {
          const prog = await getProgress(course._id);
          progressData[course._id] = prog.progress || { completed: 0, total: 0 };
        }
        setProgressMap(progressData);

        if (data.length > 0) setSelectedCourse(data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Erreur:", err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Effet pour filtrer les cours
  useEffect(() => {
    let filtered = courses;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type de cours
    if (courseTypeFilter !== "all") {
      filtered = filtered.filter(course => course.courseType === courseTypeFilter);
    }

    // Filtre par progression
    if (progressFilter !== "all") {
      filtered = filtered.filter(course => {
        const percent = getPercent(course._id);
        switch (progressFilter) {
          case "not-started":
            return percent === 0;
          case "in-progress":
            return percent > 0 && percent < 100;
          case "completed":
            return percent === 100;
          default:
            return true;
        }
      });
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, courseTypeFilter, progressFilter]);

  const handleReviewSubmit = async () => {
    if (!selectedCourse || !review.trim()) return;
    try {
      await postReview(selectedCourse._id, { review });
      setReview("");
      alert("Merci pour votre avis !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'avis");
    }
  };

  const handlePlayCourse = (courseId) => {
    navigate(`/course-player/${courseId}`);
  };

  const handleViewCourse = (course) => {
    setViewingCourse(course);
  };

  const handleDownloadCourse = async (courseType) => {
    if (!viewingCourse) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/course/${viewingCourse._id}/download/${courseType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      if (courseType === 'pdf' && viewingCourse.pdfFile) {
        link.download = viewingCourse.pdfFile.originalName || `${viewingCourse.title}.pdf`;
      } else if (courseType === 'video' && viewingCourse.videoFile) {
        link.download = viewingCourse.videoFile.originalName || `${viewingCourse.title}.mp4`;
      }
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  const getFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ Fonction pour calculer % de progression
  const getPercent = (courseId) => {
    const progress = progressMap[courseId] || { completed: 0, total: 0 };
    return progress.total
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;
  };

  const renderTabContent = () => {
    // Si un cours est en cours de visualisation, afficher le lecteur
    if (viewingCourse) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewingCourse(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour au dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">📚 Lecteur de cours</h1>
          </div>
          
          <CourseReader
            course={viewingCourse}
            onDownload={handleDownloadCourse}
          />
        </div>
      );
    }

    switch (selectedTab) {
      case "home":
        return (
          <div className="space-y-6 mt-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">
                👋 Bienvenue sur votre Dashboard étudiant !
              </h1>
              <p className="text-blue-100">
                Continuez votre apprentissage et explorez vos cours
              </p>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total des cours</p>
                    <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cours terminés</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.filter(course => getPercent(course._id) === 100).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En cours</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.filter(course => {
                        const percent = getPercent(course._id);
                        return percent > 0 && percent < 100;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cours récents */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Vos cours récents</h2>
                <p className="text-gray-600 mt-1">Continuez votre apprentissage</p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Chargement de vos cours...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours acheté</h3>
                  <p className="text-gray-600 mb-4">Commencez par explorer et acheter votre premier cours !</p>
                  <button
                    onClick={() => setSelectedTab("myCourses")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Voir tous les cours
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.slice(0, 6).map((course) => {
                      const percent = getPercent(course._id);
                      return (
                        <div
                          key={course._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handlePlayCourse(course._id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                            </div>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              percent === 100 ? 'bg-green-100 text-green-800' :
                              percent > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {percent}%
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          
                          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            Continuer
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {courses.length > 6 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setSelectedTab("myCourses")}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir tous mes cours ({courses.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "myCourses":
        return (
          <div className="mt-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">📚 Mes Cours</h1>
              <div className="mt-4 sm:mt-0 text-sm text-gray-600">
                {filteredCourses.length} cours sur {courses.length} total
              </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Recherche */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un cours
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Titre ou description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filtre par type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de cours
                  </label>
                  <select
                    value={courseTypeFilter}
                    onChange={(e) => setCourseTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les types</option>
                    <option value="video">Vidéo</option>
                    <option value="pdf">PDF</option>
                    <option value="text">Texte</option>
                  </select>
                </div>

                {/* Filtre par progression */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progression
                  </label>
                  <select
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="not-started">Non commencé</option>
                    <option value="in-progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des cours */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Chargement des cours...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {courses.length === 0 ? "Aucun cours acheté" : "Aucun cours trouvé"}
                </h3>
                <p className="text-gray-600">
                  {courses.length === 0 
                    ? "Commencez par acheter votre premier cours !" 
                    : "Essayez de modifier vos critères de recherche."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const percent = getPercent(course._id);
                  return (
                    <div
                      key={course._id}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Aperçu du cours */}
                      <div className="relative">
                        {course.courseType === "video" && (
                          <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <div className="text-center text-white">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              <p className="text-sm font-medium">Cours Vidéo</p>
                            </div>
                          </div>
                        )}
                        
                        {course.courseType === "pdf" && (
                          <div className="h-48 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                            <div className="text-center text-white">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                              </svg>
                              <p className="text-sm font-medium">Document PDF</p>
                            </div>
                          </div>
                        )}
                        
                        {course.courseType === "text" && (
                          <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                            <div className="text-center text-white">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
                              </svg>
                              <p className="text-sm font-medium">Cours Texte</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Badge de progression */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            percent === 100 ? 'bg-green-100 text-green-800' :
                            percent > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {percent}%
                          </span>
                        </div>
                      </div>

                      {/* Contenu de la carte */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        {/* Informations du fichier */}
                        <div className="mb-4">
                          {course.courseType === "pdf" && course.pdfFile && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                              </svg>
                              {getFileSize(course.pdfFile.size)}
                            </div>
                          )}
                          
                          {course.courseType === "video" && course.videoFile && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              {getFileSize(course.videoFile.size)}
                            </div>
                          )}
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progression</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCourse(course)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Lire
                          </button>
                          
                          <button
                            onClick={() => handlePlayCourse(course._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            title="Ouvrir dans le lecteur dédié"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            title="Détails du cours"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "progress":
        return (
          <div className="mt-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">📊 Progression Détaillée</h1>
              <div className="mt-4 sm:mt-0 text-sm text-gray-600">
                {courses.length} cours au total
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours acheté</h3>
                <p className="text-gray-600 mb-4">Commencez par acheter votre premier cours pour voir votre progression !</p>
                <button
                  onClick={() => setSelectedTab("myCourses")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Voir tous les cours
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Vue d'ensemble */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                      <div className="text-sm text-gray-600">Cours achetés</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {courses.filter(course => getPercent(course._id) === 100).length}
                      </div>
                      <div className="text-sm text-gray-600">Terminés</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {courses.filter(course => {
                          const percent = getPercent(course._id);
                          return percent > 0 && percent < 100;
                        }).length}
                      </div>
                      <div className="text-sm text-gray-600">En cours</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {Math.round(courses.reduce((acc, course) => acc + getPercent(course._id), 0) / courses.length) || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Progression moyenne</div>
                    </div>
                  </div>
                </div>

                {/* Liste détaillée des cours */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Progression par cours</h2>
                    <p className="text-gray-600 mt-1">Détails de votre progression sur chaque cours</p>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {courses.map((course) => {
                      const percent = getPercent(course._id);
                      const progress = progressMap[course._id] || { completed: 0, total: 0 };
                      
                      return (
                        <div key={course._id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-lg">
                                    {course.courseType === 'video' ? '🎥' : course.courseType === 'pdf' ? '📄' : '📝'}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                                  <p className="text-sm text-gray-600 capitalize">{course.courseType}</p>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                              
                              {/* Barre de progression détaillée */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Progression</span>
                                  <span className="font-medium text-gray-900">{percent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      percent === 100 ? 'bg-green-500' :
                                      percent > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{progress.completed} chapitres vus</span>
                                  <span>{progress.total} chapitres au total</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-6 flex flex-col items-end space-y-2">
                              {/* Statut */}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                percent === 100 ? 'bg-green-100 text-green-800' :
                                percent > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {percent === 100 ? 'Terminé' : percent > 0 ? 'En cours' : 'Non commencé'}
                              </span>
                              
                              {/* Temps de visionnage estimé */}
                              <div className="text-xs text-gray-500 text-right">
                                <div className="flex items-center space-x-1">
                                  <span>⏱️</span>
                                  <span>
                                    {course.courseType === 'video' && course.videoFile?.size ? 
                                      `${Math.round(course.videoFile.size / (1024 * 1024 * 0.5))} min estimées` :
                                      'Temps variable'
                                    }
                                  </span>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePlayCourse(course._id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                  {percent === 100 ? 'Revoir' : 'Continuer'}
                                </button>
                                <button
                                  onClick={() => setSelectedCourse(course)}
                                  className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                                >
                                  Détails
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statistiques avancées */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques d'apprentissage</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Répartition par type</h3>
                      <div className="space-y-2">
                        {['video', 'pdf', 'text'].map(type => {
                          const count = courses.filter(c => c.courseType === type).length;
                          const completed = courses.filter(c => c.courseType === type && getPercent(c._id) === 100).length;
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">{type}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{completed}/{count}</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${count > 0 ? (completed / count) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Objectifs d'apprentissage</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-800">Cours terminés</span>
                          <span className="text-lg font-bold text-green-600">
                            {courses.filter(c => getPercent(c._id) === 100).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-800">Progression moyenne</span>
                          <span className="text-lg font-bold text-blue-600">
                            {Math.round(courses.reduce((acc, course) => acc + getPercent(course._id), 0) / courses.length) || 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-purple-800">Cours en cours</span>
                          <span className="text-lg font-bold text-purple-600">
                            {courses.filter(c => {
                              const percent = getPercent(c._id);
                              return percent > 0 && percent < 100;
                            }).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "reviews":
        return (
          <div className="mt-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">⭐ Avis et Commentaires</h1>
              <div className="mt-4 sm:mt-0 text-sm text-gray-600">
                Partagez votre expérience d'apprentissage
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours acheté</h3>
                <p className="text-gray-600 mb-4">Achetez un cours pour pouvoir laisser un avis !</p>
                <button
                  onClick={() => setSelectedTab("myCourses")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Voir tous les cours
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Formulaire d'avis */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Laisser un avis</h2>
                  
                  {selectedCourse ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-1">{selectedCourse.title}</h3>
                        <p className="text-sm text-blue-700">{selectedCourse.description}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                            {selectedCourse.courseType}
                          </span>
                          <span className="text-xs text-blue-600">
                            {selectedCourse.price === 0 ? 'Gratuit' : `${selectedCourse.price}€`}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Votre avis
                        </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Partagez votre expérience avec ce cours..."
                          rows="4"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {review.length}/500 caractères
                        </p>
                      </div>

                      <div className="flex space-x-3">
            <button
              onClick={handleReviewSubmit}
                          disabled={!review.trim()}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Envoyer l'avis
                        </button>
                        <button
                          onClick={() => setSelectedCourse(null)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Annuler
            </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📝</div>
                      <p className="text-gray-600 mb-4">Sélectionnez un cours pour laisser un avis</p>
                    </div>
                  )}
                </div>

                {/* Liste des cours pour sélection */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Mes cours</h2>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCourse?._id === course._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm">
                              {course.courseType === 'video' ? '🎥' : course.courseType === 'pdf' ? '📄' : '📝'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getPercent(course._id) === 100 ? 'bg-green-100 text-green-800' :
                                getPercent(course._id) > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {getPercent(course._id)}% terminé
                              </span>
                              <span className="text-xs text-gray-500 capitalize">{course.courseType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conseils pour les avis */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Conseils pour un bon avis</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Que mentionner :</h4>
                  <ul className="space-y-1">
                    <li>• Qualité du contenu</li>
                    <li>• Clarté des explications</li>
                    <li>• Utilité pratique</li>
                    <li>• Niveau de difficulté</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Votre expérience :</h4>
                  <ul className="space-y-1">
                    <li>• Ce que vous avez appris</li>
                    <li>• Points forts du cours</li>
                    <li>• Améliorations possibles</li>
                    <li>• Recommandation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "profile":
        return <ProfileComponent />;
      case "settings":
        return <p className=" text-gray-600 flex justify-center items-center m-auto h-screen">⚙️ Paramètres du compte et préférences (à venir).</p>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex-1 p-6 overflow-auto">
        {/* Bouton menu mobile */}
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
