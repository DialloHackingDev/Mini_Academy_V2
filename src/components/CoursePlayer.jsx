import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiBook,
  FiGrid,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiCheckCircle,
  FiPlayCircle,
  FiLock,
  FiFileText,
  FiDownload,
  FiMessageSquare,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiAward
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
      return;
    }
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCourseData(token);
  }, [courseId]);

  const fetchCourseData = async (token) => {
    try {
      // Récupérer les détails du cours
      const courseRes = await axios.get(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(courseRes.data);

      // Récupérer la progression
      const progressRes = await axios.get(`${API_URL}/progression/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(progressRes.data);

      // Définir la première leçon active
      if (courseRes.data.modules?.length > 0) {
        const firstModule = courseRes.data.modules[0];
        setActiveModule(firstModule);
        setExpandedModules([firstModule._id]);
        
        if (firstModule.lessons?.length > 0) {
          setActiveLesson(firstModule.lessons[0]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    setActiveModule(module);
    setActiveTab('overview');
  };

  const markLessonComplete = async () => {
    if (!activeLesson) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/progression/${courseId}/${activeLesson._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Rafraîchir la progression
      const progressRes = await axios.get(`${API_URL}/progression/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Erreur marquage leçon:', error);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.includes(lessonId);
  };

  const calculateProgress = () => {
    if (!course?.modules || !progress?.completedLessons) return 0;
    
    const totalLessons = course.modules.reduce(
      (acc, module) => acc + (module.lessons?.length || 0), 0
    );
    
    if (totalLessons === 0) return 0;
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  };

  const completedLessonsCount = () => {
    return progress?.completedLessons?.length || 0;
  };

  const totalLessonsCount = () => {
    return course?.modules?.reduce(
      (acc, module) => acc + (module.lessons?.length || 0), 0
    ) || 0;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cours non trouvé</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Elevated</h1>
              <p className="text-xs text-gray-500">Academy</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiHome className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link to="/courses" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiBook className="w-5 h-5" />
            <span>Courses</span>
          </Link>
          <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FiGrid className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/analytics" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiBarChart2 className="w-5 h-5" />
            <span>Analytics</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiSettings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <Link to="/help" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiHelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 mr-80">
        {/* Video Player Area */}
        <div className="bg-gray-900 aspect-video flex items-center justify-center">
          {activeLesson?.type === 'video' && (activeLesson.videoUrl || activeLesson.videoFile) ? (
            <video
              src={activeLesson.videoUrl || `/uploads/videos/${activeLesson.videoFile?.filename}`}
              controls
              className="w-full h-full"
              poster={course.coverImage ? `/uploads/covers/${course.coverImage}` : null}
            />
          ) : activeLesson?.type === 'pdf' ? (
            <div className="text-white text-center">
              <FiFileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Document PDF</p>
              <a
                href={`/uploads/pdfs/${activeLesson.pdfFile?.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <FiDownload className="w-5 h-5" />
                <span>Télécharger le PDF</span>
              </a>
            </div>
          ) : (
            <div className="text-white text-center">
              <FiPlayCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Sélectionnez une leçon pour commencer</p>
            </div>
          )}
        </div>

        {/* Lesson Content */}
        <div className="p-8">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-2">
              Module {course.modules?.findIndex(m => m._id === activeModule?._id) + 1 || 1}: {activeModule?.title}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeLesson?.title || course.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {activeLesson?.description || course.description}
            </p>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                {['overview', 'resources', 'discussion'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-medium capitalize transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {tab === 'resources' && activeLesson?.pdfFile && ' (1)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {activeTab === 'overview' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos de cette leçon</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {activeLesson?.content || 'Aucun contenu disponible pour cette leçon.'}
                  </p>
                  
                  {activeLesson?.duration > 0 && (
                    <div className="flex items-center space-x-2 mt-4 text-gray-500">
                      <FiClock className="w-5 h-5" />
                      <span>Durée: {activeLesson.duration} minutes</span>
                    </div>
                  )}

                  {/* Mark Complete Button */}
                  <div className="mt-8">
                    <button
                      onClick={markLessonComplete}
                      disabled={isLessonCompleted(activeLesson?._id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        isLessonCompleted(activeLesson?._id)
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FiCheckCircle className="w-5 h-5" />
                      <span>
                        {isLessonCompleted(activeLesson?._id)
                          ? 'Leçon terminée'
                          : 'Marquer comme terminée'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressources</h3>
                  {activeLesson?.pdfFile ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FiFileText className="w-8 h-8 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900">{activeLesson.pdfFile.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {(activeLesson.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/uploads/pdfs/${activeLesson.pdfFile.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <FiDownload className="w-5 h-5" />
                        <span>Télécharger</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune ressource disponible pour cette leçon.</p>
                  )}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">La discussion sera bientôt disponible.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Course Syllabus */}
      <aside className="w-80 bg-white border-l border-gray-200 fixed right-0 h-full overflow-y-auto">
        {/* Progress Card */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Course Progress</h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{progressPercent}% Completed</span>
            <span>{completedLessonsCount()}/{totalLessonsCount()} Lessons</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Course Syllabus */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Course Syllabus</h3>
          <div className="space-y-4">
            {course.modules?.map((module, moduleIndex) => (
              <div key={module._id}>
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module._id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Module {moduleIndex + 1}
                    </p>
                    <p className="font-medium text-gray-900">{module.title}</p>
                  </div>
                  {expandedModules.includes(module._id) ? (
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FiChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Lessons */}
                <AnimatePresence>
                  {expandedModules.includes(module._id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1">
                        {module.lessons?.map((lesson) => {
                          const isActive = activeLesson?._id === lesson._id;
                          const isCompleted = isLessonCompleted(lesson._id);
                          const isLocked = !lesson.isFree && !course.students?.includes(user?._id);

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => !isLocked && selectLesson(lesson, module)}
                              disabled={isLocked}
                              className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                                isActive
                                  ? 'bg-indigo-50 border border-indigo-200'
                                  : isLocked
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="mt-0.5">
                                {isCompleted ? (
                                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                                ) : isLocked ? (
                                  <FiLock className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <FiPlayCircle className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                  {lesson.duration > 0 && (
                                    <>
                                      <FiClock className="w-3 h-3" />
                                      <span>{lesson.duration} min</span>
                                    </>
                                  )}
                                  {lesson.type === 'video' && <span>• Video</span>}
                                  {lesson.type === 'pdf' && <span>• Reading</span>}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Progress */}
        {progressPercent >= 100 && (
          <div className="p-6 border-t border-gray-100">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <FiAward className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-900">Félicitations!</p>
              <p className="text-sm text-green-700">Vous avez terminé ce cours.</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CoursePlayer;
