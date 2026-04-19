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
  FiMaximize2
} from "react-icons/fi";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/api";
import AmazonNavbar from "../components/AmazonNavbar";

export default function CourseViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

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

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleLessonCompletion = (lessonId) => {
    setCompletedLessons(prev => 
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
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
               <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                 <FiMaximize2 className="w-4 h-4" />
                 Full Screen
               </button>
             </div>
          </div>

          {/* Player Section */}
          <div className="bg-black aspect-video w-full max-h-[60vh] relative group">
             {activeLesson?.type === 'video' ? (
                activeLesson.videoUrl && (activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') || activeLesson.videoUrl.includes('vimeo.com')) ? (
                  <iframe 
                    src={activeLesson.videoUrl.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={activeLesson.videoUrl || `http://localhost:5000/uploads/videos/${activeLesson.videoFile?.filename}`}
                    controls
                    className="w-full h-full object-contain"
                  />
                )
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
              <div className="flex gap-8 border-b border-gray-200 mb-8">
                {['overview', 'resources', 'discussion'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-bold capitalize transition-all border-b-2 ${
                      activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
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
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
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
    </div>
  );
}
