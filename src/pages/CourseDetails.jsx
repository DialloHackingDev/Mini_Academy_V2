import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseById, enrollCourse } from "../api/courApi";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import AuthDebugger from "../components/AuthDebugger";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await getCourseById(id);
        setCourse(res.data || res);
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    // Debug: Vérifier l'état de l'authentification
    console.log("🔍 Debug - État de l'authentification:");
    console.log("User:", user);
    console.log("Token:", token);
    console.log("Course ID:", course._id);

    // Vérifier si l'utilisateur est connecté
    if (!user || !token) {
      alert("Vous devez être connecté pour vous inscrire à un cours.");
      window.location.href = '/login';
      return;
    }

    try {
      console.log("🚀 Tentative d'inscription au cours...");
      const result = await enrollCourse(course._id);
      console.log("✅ Inscription réussie:", result);
      setIsEnrolled(true);
      alert("Inscription réussie ! Vous pouvez maintenant accéder au contenu du cours.");
    } catch (err) {
      console.error("❌ Erreur lors de l'inscription:", err);
      console.error("❌ Détails de l'erreur:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message;
      
      if (errorMessage.includes("Token d'authentification requis") || errorMessage.includes("Token")) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        localStorage.clear();
        window.location.href = '/login';
      } else if (errorMessage.includes("Déjà inscrit")) {
        alert("Vous êtes déjà inscrit à ce cours !");
        setIsEnrolled(true);
      } else {
        alert("Erreur : " + errorMessage);
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cours non trouvé</h2>
          <p className="text-gray-600 mb-4">Le cours que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link 
            to="/courses" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 mb-4">
              <Link to="/courses" className="hover:text-white transition-colors">Cours</Link>
              <span>→</span>
              <span>{course.title}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                    {course.courseType === 'video' ? '🎥' : course.courseType === 'pdf' ? '📄' : '📝'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-blue-200">Type de cours</p>
                  <p className="font-semibold capitalize">{course.courseType}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-blue-200">Prix</p>
                  <p className="font-semibold">
                    {course.price === 0 ? "Gratuit" : `${course.price}€`}
                  </p>
                </div>
              </div>
              
              {course.professor && (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Professeur</p>
                    <p className="font-semibold">{course.professor.username}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Course Content */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📚</span>
                  Contenu du cours
                </h2>
                
        {course.courseType === "video" ? (
          (course.price === 0 || isEnrolled) && token ? (
                    <div className="space-y-4">
                      {course.videoFile?.filename ? (
                        <VideoPlayer
                src={`http://localhost:3000/uploads/videos/${course.videoFile.filename}`}
                          title={course.title}
                          downloadUrl={`http://localhost:3000/api/course/${course._id}/download/video`}
                          className="h-[500px]"
              />
            ) : course.videoUrl ? (
                        <VideoPlayer
                          src={course.videoUrl}
                          title={course.title}
                          className="h-[500px]"
                        />
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <p className="text-gray-600">Aucune vidéo disponible</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenu verrouillé</h3>
                      <p className="text-gray-600 mb-4">Connectez-vous et inscrivez-vous pour accéder à cette vidéo.</p>
                      <Link 
                        to="/login" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Se connecter
                      </Link>
                    </div>
          )
        ) : course.courseType === "pdf" ? (
          (course.price === 0 || isEnrolled) && token ? (
                    <div className="space-y-4">
                      {course.pdfFile?.filename ? (
                        <PDFReader
                src={`http://localhost:3000/uploads/pdfs/${course.pdfFile.filename}`}
                          title={course.title}
                          downloadUrl={`http://localhost:3000/api/course/${course._id}/download/pdf`}
                        />
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="text-gray-600">Aucun PDF disponible</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenu verrouillé</h3>
                      <p className="text-gray-600 mb-4">Connectez-vous et inscrivez-vous pour lire ce PDF.</p>
                      <Link 
                        to="/login" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Se connecter
                      </Link>
                    </div>
          )
        ) : course.courseType === "text" ? (
          <div className="prose max-w-none">
                    <div className="bg-gray-50 rounded-lg p-8">
                      <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
            {course.content}
                      </pre>
                    </div>
          </div>
        ) : null}

              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Enrollment Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Accès au cours</h3>
                
                {course.price > 0 && !isEnrolled ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{course.price}€</div>
                      <p className="text-gray-600">Prix du cours</p>
                    </div>
                    
                    {!user || !token ? (
                      <div className="space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="text-yellow-600 mr-3">⚠️</div>
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Connexion requise</p>
                              <p className="text-xs text-yellow-700">Vous devez être connecté pour vous inscrire</p>
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          to="/login"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-center block"
                        >
                          Se connecter
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        S'inscrire maintenant
                      </button>
                    )}
                    
                    <p className="text-sm text-gray-500 text-center">
                      Accès immédiat après paiement
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h4 className="text-lg font-semibold text-green-600 mb-2">
                      {course.price === 0 ? "Cours gratuit" : "Inscrit"}
                    </h4>
                    <p className="text-gray-600">
                      {course.price === 0 
                        ? "Vous pouvez accéder à tout le contenu gratuitement"
                        : "Vous avez accès à tout le contenu de ce cours"
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold capitalize">{course.courseType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix:</span>
                    <span className="font-semibold">
                      {course.price === 0 ? "Gratuit" : `${course.price}€`}
                    </span>
                  </div>
                  {course.professor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professeur:</span>
                      <span className="font-semibold">{course.professor.username}</span>
                    </div>
                  )}
                  {course.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé:</span>
                      <span className="font-semibold">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/courses" 
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                  >
                    Voir tous les cours
                  </Link>
                  
                  {token && (
                    <Link 
                      to={user?.role === "eleve" ? "/student-dashboard" : user?.role === "prof" ? "/teacher-dashboard" : "/admin-dashboard"}
                      className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center block"
                    >
                      Mon Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Component - À supprimer en production */}
      <AuthDebugger />
    </div>
  );
}
