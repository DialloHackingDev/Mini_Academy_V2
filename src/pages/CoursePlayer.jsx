import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMyCourses } from "../api/StudiantApi";
import api from "../api/api";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import { FaArrowLeft, FaDownload, FaBookOpen, FaClock, FaUser, FaPlay, FaFileAlt } from "react-icons/fa";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Récupérer tous les cours de l'étudiant
        const myCourses = await getMyCourses();
        const foundCourse = myCourses.find(c => c._id === courseId);
        
        if (!foundCourse) {
          setError("Cours non trouvé ou non acheté");
          setLoading(false);
          return;
        }
        
        setCourse(foundCourse);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du cours:", err);
        setError("Erreur lors du chargement du cours");
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleDownload = async (fileType) => {
    try {
      const response = await api.get(`/course/${courseId}/download/${fileType}`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      if (fileType === 'pdf' && course.pdfFile) {
        link.download = course.pdfFile.originalName;
      } else if (fileType === 'video' && course.videoFile) {
        link.download = course.videoFile.originalName;
      }
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
      alert("Erreur lors du téléchargement du fichier");
    }
  };

  const getFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEstimatedDuration = (fileSize) => {
    if (!fileSize) return 'Temps variable';
    // Estimation basée sur la taille du fichier (approximatif)
    const minutes = Math.round(fileSize / (1024 * 1024 * 0.5));
    return `${minutes} min estimées`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error || "Cours non trouvé"}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">
                    {course.courseType === 'video' ? '🎥' : course.courseType === 'pdf' ? '📄' : '📝'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                  <p className="text-sm text-gray-600 capitalize">{course.courseType}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progression:</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{progress}%</span>
              </div>
              
              {/* Download */}
              {(course.courseType === "pdf" || course.courseType === "video") && (
                <button
                  onClick={() => handleDownload(course.courseType)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Télécharger</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
      {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Course Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📚</span>
                  Contenu du cours
                </h2>
                
                {course.courseType === "video" ? (
                  course.videoFile ? (
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
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <div className="text-6xl mb-4">🎥</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune vidéo disponible</h3>
                      <p className="text-gray-600">Ce cours ne contient pas de vidéo pour le moment.</p>
                    </div>
                  )
                ) : course.courseType === "pdf" ? (
                  course.pdfFile ? (
                    <PDFReader
                      src={`http://localhost:3000/uploads/pdfs/${course.pdfFile.filename}`}
                      title={course.title}
                      downloadUrl={`http://localhost:3000/api/course/${course._id}/download/pdf`}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun PDF disponible</h3>
                      <p className="text-gray-600">Ce cours ne contient pas de PDF pour le moment.</p>
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
          {/* Course Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du cours</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaBookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{course.courseType}</p>
                    </div>
                </div>
                
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">💰</span>
                    </div>
                  <div>
                      <p className="text-sm text-gray-600">Prix</p>
                      <p className="font-semibold text-gray-900">
                        {course.price === 0 ? "Gratuit" : `${course.price}€`}
                      </p>
                    </div>
                  </div>
                  
                  {course.professor && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-purple-600" />
                      </div>
                  <div>
                        <p className="text-sm text-gray-600">Professeur</p>
                        <p className="font-semibold text-gray-900">{course.professor.username}</p>
                      </div>
                  </div>
                )}
                
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FaClock className="w-4 h-4 text-yellow-600" />
                    </div>
                  <div>
                      <p className="text-sm text-gray-600">Durée estimée</p>
                      <p className="font-semibold text-gray-900">
                        {course.courseType === 'video' && course.videoFile?.size 
                          ? getEstimatedDuration(course.videoFile.size)
                          : 'Variable'
                        }
                      </p>
                  </div>
              </div>
            </div>
          </div>

              {/* File Details */}
              {(course.courseType === "pdf" || course.courseType === "video") && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Détails du fichier</h3>
                  <div className="space-y-3">
                    {course.courseType === "pdf" && course.pdfFile && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taille:</span>
                          <span className="font-medium">{getFileSize(course.pdfFile.size)}</span>
                      </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium">PDF</span>
                      </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nom:</span>
                          <span className="font-medium text-xs truncate ml-2">{course.pdfFile.originalName}</span>
                  </div>
                      </>
                    )}
                    
                    {course.courseType === "video" && course.videoFile && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taille:</span>
                          <span className="font-medium">{getFileSize(course.videoFile.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium">Vidéo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nom:</span>
                          <span className="font-medium text-xs truncate ml-2">{course.videoFile.originalName}</span>
                  </div>
                      </>
                    )}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/student-dashboard" 
                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center block"
                  >
                    Mon Dashboard
                  </Link>
                  
                  <Link 
                    to="/courses" 
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                  >
                    Voir tous les cours
                  </Link>
                  
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}