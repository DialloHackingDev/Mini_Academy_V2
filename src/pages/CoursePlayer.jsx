import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyCourses } from "../api/StudiantApi";
import api from "../api/api";
import { getMyNotifications } from "../api/notificationApi";
import { getCourseById } from "../api/courApi";
import { getCourseReviews, addOrUpdateReview } from "../api/reviewApi";
import { getCourseQuestions, postQuestion } from "../api/qaApi";
import { getCourseNotes, addCourseNote, deleteCourseNote } from "../api/noteApi";
import { useLanguage } from "../context/LanguageContext";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import { FaArrowLeft, FaDownload, FaBookOpen, FaClock, FaUser, FaPlay, FaFileAlt, FaBook, FaComments, FaFileAlt as FaNotes, FaCheckCircle, FaTools, FaBell, FaThumbsUp } from "react-icons/fa";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [evaluationAnswers, setEvaluationAnswers] = useState({});

  const loadAnnouncements = async () => {
    try {
      const data = await getMyNotifications(1, 20);
      setAnnouncements(data.notifications || []);
    } catch (err) {
      console.error("Erreur chargement annonces:", err);
    }
  };

  const loadQuestions = async () => {
    try {
      const questions = await getCourseQuestions(courseId);
      setQuestions(questions);
    } catch (err) {
      console.error("Erreur chargement Q&R:", err);
    }
  };

  const loadNotes = async () => {
    try {
      const notes = await getCourseNotes(courseId);
      setNotes(notes);
    } catch (err) {
      console.error("Erreur chargement notes:", err);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getCourseReviews(courseId);
      setReviews(data.reviews || []);
      setAvgRating(parseFloat(data.avgRating) || 0);
    } catch (err) {
      console.error("Erreur chargement avis:", err);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const myCourses = await getMyCourses();
        const enrolledCourses = myCourses?.courses || myCourses || [];
        const isEnrolled = enrolledCourses.some(c => String(c._id) === String(courseId));
        if (!isEnrolled) {
          setError("Cours non trouvé ou non acheté");
          setLoading(false);
          return;
        }

        const res = await getCourseById(courseId);
        const courseData = res.data || res;

        const userId = user?._id || user?.id;
        const isOwner = courseData.students?.some(s => String(s._id || s) === String(userId));
        if (!isOwner) {
          setError("Cours non trouvé ou non acheté");
          setLoading(false);
          return;
        }

        setCourse(courseData);
        await Promise.all([loadAnnouncements(), loadQuestions(), loadNotes(), loadReviews()]);
      } catch (err) {
        console.error("Erreur lors du chargement du cours:", err);
        setError("Erreur lors du chargement du cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

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
    const minutes = Math.round(fileSize / (1024 * 1024 * 0.5));
    return `${minutes} min estimées`;
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const note = await addCourseNote(courseId, newNote.trim());
      setNotes(prev => [note, ...prev]);
      setNewNote("");
    } catch (err) {
      console.error("Erreur ajout note:", err);
      alert("Impossible d'ajouter votre note.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteCourseNote(courseId, noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (err) {
      console.error("Erreur suppression note:", err);
      alert("Impossible de supprimer votre note.");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      const question = await postQuestion(courseId, newQuestion.trim());
      setQuestions(prev => [question, ...prev]);
      setNewQuestion("");
    } catch (err) {
      console.error("Erreur ajout question:", err);
      alert("Impossible d'ajouter votre question.");
    }
  };

  const setRatingLocal = (newRating) => {
    setRating(newRating);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert("Veuillez sélectionner une note entre 1 et 5 étoiles.");
      return;
    }
    if (!reviewComment.trim()) {
      alert("Veuillez saisir un commentaire.");
      return;
    }

    try {
      setReviewSubmitting(true);
      await addOrUpdateReview(courseId, rating, reviewComment.trim());
      await loadReviews();
      setReviewComment("");
      alert("Merci, votre avis a bien été enregistré !");
    } catch (err) {
      console.error("Erreur envoi avis:", err);
      alert("Impossible d'enregistrer votre avis.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const updateEvaluationAnswer = (questionIndex, answer) => {
    const updated = { ...evaluationAnswers, [questionIndex]: answer };
    setEvaluationAnswers(updated);
  };

  const getEvaluationScore = () => {
    const evaluationQuestions = [
      { question: "Avez-vous compris les concepts clés ?", type: "boolean" },
      { question: "Pouvez-vous appliquer ce que vous avez appris ?", type: "boolean" },
      { question: "Vous sentez-vous confiant dans vous-même ?", type: "boolean" }
    ];

    const correct = Object.values(evaluationAnswers).filter(a => a === true).length;
    return { correct, total: evaluationQuestions.length };
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
                <span>{t('back')}</span>
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
                
                {/* Video/PDF/Content Player */}
                {course.courseType === "video" ? (
                  course.videoFile ? (
                    <VideoPlayer
                      src={`http://localhost:5000/uploads/videos/${course.videoFile.filename}`}
                      title={course.title}
                      downloadUrl={`http://localhost:5000/api/course/${course._id}/download/video`}
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
                      src={`http://localhost:5000/uploads/pdfs/${course.pdfFile.filename}`}
                      title={course.title}
                      downloadUrl={`http://localhost:5000/api/course/${course._id}/download/pdf`}
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

              {/* Tab Navigation */}
              <div className="border-t border-gray-200">
                <div className="px-6 flex space-x-8 overflow-x-auto">
                  <button onClick={() => setActiveTab("overview")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaBook className="inline mr-2" /> {t('presentation')}
                  </button>
                  <button onClick={() => setActiveTab("qa")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "qa" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaComments className="inline mr-2" /> {t('qa')}
                  </button>
                  <button onClick={() => setActiveTab("notes")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "notes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaNotes className="inline mr-2" /> {t('mes_notes')}
                  </button>
                  <button onClick={() => setActiveTab("announcements")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "announcements" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaBell className="inline mr-2" /> {t('annonces')}
                  </button>
                  <button onClick={() => setActiveTab("evaluation")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "evaluation" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaCheckCircle className="inline mr-2" /> {t('evaluations')}
                  </button>
                  <button onClick={() => setActiveTab("resources")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "resources" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaDownload className="inline mr-2" /> {t('ressources')}
                  </button>
                  <button onClick={() => setActiveTab("tools")} className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "tools" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
                    <FaTools className="inline mr-2" /> {t('outils')}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Présentation du cours</h3>
                    <div className="prose max-w-none text-gray-700">
                      <p>{course.description || "Description du cours non disponible."}</p>
                      <h4 className="font-bold mt-4">Objectifs du cours:</h4>
                      <ul className="list-disc pl-5">
                        <li>Comprenez les concepts clés du sujet</li>
                        <li>Appliquez vos connaissances dans des projets pratiques</li>
                        <li>Gagnez une certification à la fin du cours</li>
                        <li>Rejoignez notre communauté d'apprenants</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Q&A Tab */}
                {activeTab === "qa" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Questions & Réponses</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Posez votre question..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                      <button
                        onClick={handleAddQuestion}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Envoyer la question
                      </button>
                    </div>

                    <div className="space-y-3">
                      {questions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune question pour le moment.</p>
                      ) : (
                        questions.map(q => (
                          <div key={q._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{q.question}</p>
                                <p className="text-xs text-gray-500 mt-2">Par {q.username || 'Étudiant'} • {new Date(q.createdAt || q.date).toLocaleString('fr-FR')}</p>
                                {q.replies?.length > 0 && (
                                  <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                                    {q.replies.map((reply) => (
                                      <div key={reply._id || reply.date} className="rounded-lg border border-gray-200 p-3 bg-white">
                                        <p className="text-sm text-gray-800">{reply.reply}</p>
                                        <p className="text-xs text-gray-500 mt-1">Réponse de {reply.username} • {new Date(reply.date).toLocaleString('fr-FR')}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Mes Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Écrivez vos notes ici..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                      <button
                        onClick={handleAddNote}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Enregistrer la note
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notes.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune note pour le moment.</p>
                      ) : (
                        notes.map(note => (
                          <div key={note._id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg hover:shadow-md transition">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="text-gray-900">{note.content}</p>
                                <p className="text-xs text-gray-500 mt-2">Par {note.username || 'Étudiant'} • {new Date(note.createdAt).toLocaleString('fr-FR')}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteNote(note._id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Announcements Tab */}
                {activeTab === "announcements" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Annonces</h3>
                    {announcements.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune annonce pour le moment.</p>
                    ) : (
                      announcements.map(announcement => (
                        <div key={announcement._id || announcement.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:shadow-md transition">
                          <h4 className="font-bold text-gray-900">{announcement.message || announcement.title}</h4>
                          <p className="text-gray-700 mt-2">{announcement.message || announcement.content}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(announcement.date).toLocaleString('fr-FR')}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Evaluation Tab */}
                {activeTab === "evaluation" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Évaluations</h3>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">Note moyenne du cours</p>
                          <p className="text-sm text-gray-600 mt-1">Basé sur {reviews.length} avis</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-yellow-500">{avgRating.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">/ 5</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-gray-900 mb-3">Donnez votre avis</p>
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRatingLocal(star)}
                            className={`text-3xl transition ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Rédigez votre commentaire..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting}
                        className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {reviewSubmitting ? 'Enregistrement...' : 'Envoyer mon avis'}
                      </button>
                    </div>

                    <div className="space-y-6">
                      {[
                        "Avez-vous compris les concepts clés ?",
                        "Pouvez-vous appliquer ce que vous avez appris ?",
                        "Vous sentez-vous confiant dans votre compréhension ?"
                      ].map((question, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-3">{question}</p>
                          <div className="flex space-x-4">
                            <button
                              onClick={() => updateEvaluationAnswer(index, true)}
                              className={`flex-1 py-2 rounded-lg font-medium transition ${evaluationAnswers[index] === true ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              Oui ✓
                            </button>
                            <button
                              onClick={() => updateEvaluationAnswer(index, false)}
                              className={`flex-1 py-2 rounded-lg font-medium transition ${evaluationAnswers[index] === false ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              Non ✗
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {Object.keys(evaluationAnswers).length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900">Score d'évaluation</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {getEvaluationScore().correct}/{getEvaluationScore().total}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resources Tab */}
                {activeTab === "resources" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Ressources</h3>
                    {course.courseType === "video" || course.courseType === "pdf" ? (
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <FaDownload className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {course.courseType === 'video' && course.videoFile 
                                    ? course.videoFile.originalName 
                                    : course.courseType === 'pdf' && course.pdfFile
                                    ? course.pdfFile.originalName
                                    : 'Ressource'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {course.courseType === 'video' && course.videoFile 
                                    ? getFileSize(course.videoFile.size) 
                                    : course.courseType === 'pdf' && course.pdfFile
                                    ? getFileSize(course.pdfFile.size)
                                    : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(course.courseType)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Télécharger
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Aucune ressource disponible pour téléchargement.</p>
                    )}
                  </div>
                )}

                {/* Tools Tab */}
                {activeTab === "tools" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Outils d'apprentissage</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                        <p className="font-medium text-gray-900 flex items-center"><FaBook className="mr-2 text-blue-600" /> Gestionnaire de notes</p>
                        <p className="text-sm text-gray-600 mt-1">Organisez toutes vos notes de cours</p>
                        <button onClick={() => setActiveTab("notes")} className="mt-3 text-blue-600 hover:underline text-sm">
                          Accéder →
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                        <p className="font-medium text-gray-900 flex items-center"><FaComments className="mr-2 text-green-600" /> Forum de questions</p>
                        <p className="text-sm text-gray-600 mt-1">Posez vos questions et obtenez des réponses</p>
                        <button onClick={() => setActiveTab("qa")} className="mt-3 text-blue-600 hover:underline text-sm">
                          Accéder →
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <p className="font-medium text-gray-900 flex items-center"><FaCheckCircle className="mr-2 text-purple-600" /> Tests optionnels</p>
                        <p className="text-sm text-gray-600 mt-1">Testez votre compréhension avec des quiz</p>
                        <button className="mt-3 text-blue-600 hover:underline text-sm">
                          Prochainement →
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <p className="font-medium text-gray-900 flex items-center"><FaBook className="mr-2 text-orange-600" /> Certificat</p>
                        <p className="text-sm text-gray-600 mt-1">Téléchargez votre certificat de completion</p>
                        <button className="mt-3 text-blue-600 hover:underline text-sm">
                          Obtenir →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                        {course.price === 0 ? "Gratuit" : `$${course.price}`}
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