import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlay, 
  FiFileText, 
  FiCheckCircle, 
  FiChevronDown, 
  FiChevronRight, 
  FiClock, 
  FiDownload, 
  FiMessageSquare,
  FiInfo,
  FiLock,
  FiArrowLeft,
  FiMaximize2,
  FiTrash2,
  FiBookOpen
} from "react-icons/fi";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaCertificate } from "react-icons/fa";
import api from "../api/api";
import AmazonNavbar from "../components/AmazonNavbar";
import { useAuth } from "../context/AuthContext";
import { getCourseQuestions, postQuestion } from "../api/qaApi";
import { getCourseNotes, addCourseNote, deleteCourseNote } from "../api/noteApi";
import { getCourseReviews, addOrUpdateReview } from "../api/reviewApi";
import { getMyNotifications } from "../api/notificationApi";
import { addPlatformReview } from "../api/platformReviewApi";
import { FiStar } from "react-icons/fi";

export default function CourseViewer() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [certificateEarned, setCertificateEarned] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteFilter, setNoteFilter] = useState("all");
  const [noteSort, setNoteSort] = useState("recent");
  const [announcements, setAnnouncements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [evaluationAnswers, setEvaluationAnswers] = useState({});
  const [showPlatformReviewPrompt, setShowPlatformReviewPrompt] = useState(false);
  const [platformRating, setPlatformRating] = useState(0);
  const [platformComment, setPlatformComment] = useState("");

  useEffect(() => {
    fetchCourseDetails();
    fetchProgression();
    loadQuestions();
    loadNotes();
    loadAnnouncements();
    loadReviews();

    // Prompt for platform review after 5 minutes (300000ms)
    // Check if already reviewed (localStorage flag)
    const hasReviewed = localStorage.getItem('platform_reviewed');
    if (!hasReviewed) {
      const timer = setTimeout(() => {
        setShowPlatformReviewPrompt(true);
      }, 300000); 
      return () => clearTimeout(timer);
    }
  }, [courseId]);

  const loadQuestions = async () => {
    try {
      const questions = await getCourseQuestions(courseId);
      setQuestions(questions || []);
    } catch (err) {
      console.error("Erreur chargement Q&R:", err);
    }
  };

  const loadNotes = async () => {
    try {
      const notes = await getCourseNotes(courseId);
      setNotes(notes || []);
    } catch (err) {
      console.error("Erreur chargement notes:", err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await getMyNotifications(1, 20);
      setAnnouncements(data.notifications || []);
    } catch (err) {
      console.error("Erreur chargement annonces:", err);
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

  const fetchProgression = async () => {
    try {
      if (user?.token && courseId) {
        const res = await api.get(`/progress/${courseId}`);
        if (res.data?.success && res.data?.data) {
           const prog = res.data.data;
           const completedIds = prog.completedLessons?.map(cl => cl.lessonId) || [];
           setCompletedLessons(completedIds);
           setCertificateEarned(prog.certificateEarned || false);
        }
      }
    } catch (err) {
      console.log("No progression found or error fetching:", err);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/course/${courseId}`);
      const courseData = res.data?.data || res.data;
      
      if (courseData) {
        // If course has no modules but has content/files, create a virtual module
        if (!courseData.modules || courseData.modules.length === 0) {
          const virtualLesson = {
            _id: 'virtual-lesson',
            title: courseData.title,
            description: courseData.description,
            type: courseData.courseType,
            content: courseData.content,
            videoUrl: courseData.videoUrl,
            videoFile: courseData.videoFile,
            pdfFile: courseData.pdfFile,
            duration: 10 // default
          };
          
          courseData.modules = [{
            _id: 'virtual-module',
            title: 'Course Content',
            lessons: [virtualLesson]
          }];
        }
        
        setCourse(courseData);
        if (courseData.modules?.length > 0) {
          const firstModule = courseData.modules[0];
          setActiveModule(firstModule);
          setExpandedModules([firstModule._id]);
          if (firstModule.lessons?.length > 0) {
            setActiveLesson(firstModule.lessons[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const note = await addCourseNote(courseId, newNote.trim(), activeLesson?._id, activeLesson?.title);
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
      { question: "Vous sentez-vous confiant dans votre compréhension ?", type: "boolean" }
    ];

    const correct = Object.values(evaluationAnswers).filter(a => a === true).length;
    return { correct, total: evaluationQuestions.length };
  };

  const isEmbedUrl = (url) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be') || url?.includes('vimeo.com');
  };

  const buildEmbedUrl = (url) => {
    if (!url) return url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
    }
    if (url.includes('vimeo.com')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  const getLessonVideoSource = (lesson) => {
    if (!lesson) return null;
    if (lesson.videoFile?.filename) {
      return {
        type: 'file',
        src: `http://localhost:5000/uploads/videos/${lesson.videoFile.filename}`
      };
    }
    if (!lesson.videoUrl) return null;
    if (isEmbedUrl(lesson.videoUrl)) {
      return {
        type: 'embed',
        src: buildEmbedUrl(lesson.videoUrl)
      };
    }
    return {
      type: 'video',
      src: lesson.videoUrl
    };
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleLessonCompletion = async (lessonId) => {
    try {
      // Optmistic UI Update
      setCompletedLessons(prev => 
        prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
      );
      
      // Save to backend
      const isCompleting = !completedLessons.includes(lessonId);
      if (isCompleting && user?.token) {
        const res = await api.post(`/progress/${courseId}/${lessonId}`, { timeSpent: 0, score: 100 });
        if (res.data?.success) {
           setCertificateEarned(res.data.data.certificateEarned);
        }
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
        <Link to="/courses" className="text-emerald-600 font-semibold flex items-center gap-2">
          <FiArrowLeft /> Back to Courses
        </Link>
      </div>
    </div>
  );

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AmazonNavbar />

      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Bar */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
             <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <FiArrowLeft className="w-5 h-5 text-gray-600" />
               </button>
               <div>
                 <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{activeLesson?.title || course.title}</h2>
                 <p className="text-xs text-gray-500 font-medium">{activeModule?.title}</p>
               </div>
             </div>
             <div className="flex items-center gap-6">
               <div className="hidden sm:flex items-center gap-3">
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Progress</p>
                   <p className="text-sm font-bold text-emerald-600">{progressPercent}% Completed</p>
                 </div>
                 <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                 </div>
               </div>
               
               {/* Certificate Button */}
               {(certificateEarned || progressPercent === 100) && (
                 <Link 
                   to={`/certificate/${courseId}`} 
                   className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 px-4 py-2 rounded-lg text-sm font-black hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/20"
                 >
                   <FaCertificate className="w-4 h-4" />
                   Certificat
                 </Link>
               )}

               <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                 <FiMaximize2 className="w-4 h-4" />
                 Full Screen
               </button>
             </div>
          </div>

          {/* Player Section */}
          <div className="bg-black aspect-video w-full max-h-[60vh] relative group">
             {activeLesson?.type === 'video' ? (
                (() => {
                  const source = getLessonVideoSource(activeLesson);
                  if (!source) return null;
                  if (source.type === 'embed') {
                    return (
                      <iframe
                        src={source.src}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={source.src}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  );
                })()
             ) : activeLesson?.type === 'pdf' ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
                   <FiFileText className="w-20 h-20 mb-4 text-emerald-400" />
                   <h3 className="text-xl font-bold mb-4">{activeLesson.title}</h3>
                   <a 
                    href={`http://localhost:5000/uploads/pdfs/${activeLesson.pdfFile?.filename}`}
                    target="_blank"
                    className="bg-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                   >
                     View Document
                   </a>
                </div>
             ) : (
                <div className="w-full h-full bg-white p-12 overflow-y-auto">
                   <div className="max-w-3xl mx-auto prose prose-emerald">
                     <h1 className="text-3xl font-bold mb-8 text-gray-900">{activeLesson?.title}</h1>
                     <div className="text-gray-700 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: activeLesson?.content || 'No content provided.' }} />
                   </div>
                </div>
             )}
          </div>

          {/* Content Details & Tabs */}
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-4 border-b border-gray-200 mb-8">
                {['overview', 'resources', 'discussion', 'qa', 'notes', 'announcements', 'evaluation', 'tools'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 text-sm font-bold capitalize transition-all border-b-2 ${
                      activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'qa' ? 'Q&A' : tab === 'notes' ? 'Notes' : tab === 'announcements' ? 'Annonces' : tab === 'evaluation' ? 'Évaluations' : tab === 'tools' ? 'Outils' : tab}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About this lesson</h3>
                      <p className="text-gray-600 leading-relaxed">{activeLesson?.description || "No description available for this lesson."}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <FiClock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                          <p className="font-bold text-gray-900">{activeLesson?.duration || 0} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <FiInfo className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skill Level</p>
                          <p className="font-bold text-gray-900">{course.level || 'Intermediate'}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'resources' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Lesson Resources</h3>
                    {activeLesson?.pdfFile ? (
                       <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                              <FiFileText className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{activeLesson.pdfFile.originalName}</p>
                              <p className="text-xs text-gray-500 font-medium">PDF Document • 4.2 MB</p>
                            </div>
                          </div>
                          <button className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <FiDownload className="w-5 h-5" />
                          </button>
                       </div>
                    ) : (
                      <p className="text-gray-500 italic">No downloadable resources for this lesson.</p>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'discussion' && (
                  <div className="text-center py-12">
                     <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500">The discussion forum for this lesson is coming soon.</p>
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Questions & Answers</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Posez votre question..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows="3"
                      />
                      <button
                        onClick={handleAddQuestion}
                        className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Envoyer la question
                      </button>
                    </div>
                    {questions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune question pour le moment.</p>
                    ) : (
                      <div className="space-y-3">
                        {questions.map(q => (
                          <div key={q._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
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
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Mes notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Écrivez vos notes ici..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows="3"
                      />
                      <button
                        onClick={handleAddNote}
                        className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Enregistrer la note
                      </button>
                    </div>
                    {notes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune note pour le moment.</p>
                    ) : (
                      <div className="space-y-3">
                        {notes.map(note => (
                          <div key={note._id} className="bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-sm transition group relative">
                            <div className="flex justify-between gap-4">
                              <div className="flex-1">
                                {note.lessonTitle && (
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <FiBookOpen className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{note.lessonTitle}</span>
                                  </div>
                                )}
                                <p className="text-gray-900 text-sm leading-relaxed">{note.content}</p>
                                <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  <span>{new Date(note.createdAt).toLocaleString('fr-FR')}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteNote(note._id)}
                                className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                                title="Supprimer"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'announcements' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Annonces</h3>
                    {announcements.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune annonce pour le moment.</p>
                    ) : (
                      <div className="space-y-3">
                        {announcements.map(announcement => (
                          <div key={announcement._id || announcement.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:shadow-sm transition">
                            <h4 className="font-semibold text-gray-900">{announcement.title || 'Annonce du cours'}</h4>
                            <p className="text-gray-700 mt-2">{announcement.message || announcement.content || 'Aucune description disponible.'}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(announcement.date || announcement.createdAt).toLocaleString('fr-FR')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'evaluation' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Évaluations</h3>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Note moyenne du cours</p>
                          <p className="text-3xl font-bold text-emerald-600 mt-2">{avgRating.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Basé sur {reviews.length} avis</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Donnez votre avis</h4>
                      <div className="flex gap-2 mb-4">
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows="4"
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition-colors disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        {reviewSubmitting ? 'Enregistrement...' : 'Envoyer mon avis'}
                      </button>
                    </div>
                    {Object.keys(evaluationAnswers).length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <p className="font-semibold text-gray-900">Score d'auto-évaluation</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-3">{getEvaluationScore().correct}/{getEvaluationScore().total}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tools' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Outils d'apprentissage</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
                        <p className="font-semibold text-gray-900">Gestionnaire de notes</p>
                        <p className="text-gray-500 mt-2">Consultez, enregistrez et organisez vos notes.</p>
                        <button onClick={() => setActiveTab('notes')} className="mt-4 text-emerald-600 hover:underline text-sm">Voir mes notes →</button>
                      </div>
                      <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
                        <p className="font-semibold text-gray-900">Q&A</p>
                        <p className="text-gray-500 mt-2">Posez vos questions et suivez les réponses du formateur.</p>
                        <button onClick={() => setActiveTab('qa')} className="mt-4 text-emerald-600 hover:underline text-sm">Accéder au Q&A →</button>
                      </div>
                      <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
                        <p className="font-semibold text-gray-900">Annonces officielles</p>
                        <p className="text-gray-500 mt-2">Restez informé des dernières mises à jour du cours.</p>
                        <button onClick={() => setActiveTab('announcements')} className="mt-4 text-emerald-600 hover:underline text-sm">Voir les annonces →</button>
                      </div>
                      <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
                        <p className="font-semibold text-gray-900">Feedback</p>
                        <p className="text-gray-500 mt-2">Donnez votre avis pour améliorer le cours.</p>
                        <button onClick={() => setActiveTab('evaluation')} className="mt-4 text-emerald-600 hover:underline text-sm">Évaluer →</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Syllabus */}
        <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Course Content</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{totalLessons} Lessons • {completedLessons.length} Completed</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {course.modules?.map((module, mIdx) => (
              <div key={module._id} className="border-b border-gray-100 last:border-0">
                <button 
                  onClick={() => toggleModule(module._id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                      {mIdx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{module.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{module.lessons?.length || 0} Lessons</p>
                    </div>
                  </div>
                  {expandedModules.includes(module._id) ? <FiChevronDown className="text-gray-400" /> : <FiChevronRight className="text-gray-400" />}
                </button>

                <AnimatePresence>
                  {expandedModules.includes(module._id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/30"
                    >
                      {module.lessons?.map((lesson, lIdx) => {
                        const isActive = activeLesson?._id === lesson._id;
                        const isDone = completedLessons.includes(lesson._id);
                        
                        return (
                          <button
                            key={lesson._id}
                            onClick={() => { setActiveLesson(lesson); setActiveModule(module); }}
                            className={`w-full flex items-center gap-4 px-8 py-4 transition-all hover:bg-white text-left ${isActive ? 'bg-white border-l-4 border-emerald-600' : ''}`}
                          >
                            <div onClick={(e) => { e.stopPropagation(); toggleLessonCompletion(lesson._id); }} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                              {isDone && <FiCheckCircle className="w-3 h-3" />}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-bold ${isActive ? 'text-emerald-600' : 'text-gray-700'}`}>{lesson.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {lesson.type === 'video' ? <FiPlay className="w-3 h-3 text-gray-400" /> : <FiFileText className="w-3 h-3 text-gray-400" />}
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lesson.duration || 0}m</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Review Prompt Modal */}
      <AnimatePresence>
        {showPlatformReviewPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
               {/* Decorative background */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
               
               <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                     <FiStar className="w-8 h-8 fill-current" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Aimez-vous Elevated Academy ?</h3>
                  <p className="text-gray-500 mb-8">Votre avis nous aide à améliorer l'expérience pour tous les étudiants.</p>
                  
                  <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setPlatformRating(star)}
                        className="transition-transform active:scale-125"
                      >
                        <FiStar 
                          className={`w-10 h-10 ${star <= platformRating ? 'text-orange-400 fill-current' : 'text-gray-200'} transition-colors`} 
                        />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={platformComment}
                    onChange={(e) => setPlatformComment(e.target.value)}
                    placeholder="Qu'est-ce que vous appréciez le plus ?"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6 text-sm"
                    rows="3"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        setShowPlatformReviewPrompt(false);
                        localStorage.setItem('platform_reviewed', 'deferred');
                      }}
                      className="py-3 px-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                    >
                      Plus tard
                    </button>
                    <button 
                      onClick={async () => {
                        if (platformRating === 0) return alert("Veuillez donner une note");
                        try {
                          await addPlatformReview(platformRating, platformComment);
                          localStorage.setItem('platform_reviewed', 'true');
                          setShowPlatformReviewPrompt(false);
                          alert("Merci pour votre avis !");
                        } catch (e) {
                          alert("Une erreur est survenue");
                        }
                      }}
                      className="py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Envoyer
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
