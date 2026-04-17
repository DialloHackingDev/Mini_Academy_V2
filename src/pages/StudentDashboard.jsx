import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiGrid,
  FiArrowRight,
  FiCode,
  FiPenTool,
  FiPlayCircle
} from "react-icons/fi";
import {
  FaGraduationCap,
  FaFire,
  FaCertificate,
  FaClock,
  FaUserGraduate
} from "react-icons/fa";
import { getMyCourses, getProgress } from "../api/StudiantApi";

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid, active: true },
  { id: 'home', label: 'Home', icon: FiHome },
  { id: 'courses', label: 'Courses', icon: FiBook },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

const statsData = [
  { label: 'Current Streak', value: '12 Days', icon: FaFire, color: 'orange' },
  { label: 'Certificates', value: '3 Earned', icon: FaCertificate, color: 'indigo' },
  { label: 'Hours Learned', value: '45.5 hrs', icon: FaClock, color: 'purple' },
];

const inProgressCourses = [
  {
    id: 1,
    title: 'Advanced UI/UX Patterns',
    description: 'Master complex interface design and interactive prototypes.',
    module: 'Module 4 of 8',
    progress: 60,
    icon: FiCode,
    color: 'indigo'
  },
  {
    id: 2,
    title: 'Color Theory & Emotion',
    description: 'Understanding the psychological impact of palettes.',
    module: 'Module 2 of 5',
    progress: 35,
    icon: FiPenTool,
    color: 'purple'
  }
];

const recommendedCourses = [
  { id: 1, title: 'Brand Identity', new: true, image: 'bg-emerald-600' },
  { id: 2, title: 'Data Security', new: false, image: 'bg-cyan-600' },
  { id: 3, title: 'Creative Art', new: false, image: 'bg-amber-600' },
];

// Circular Progress Component
const CircularProgress = ({ percentage, color = "indigo" }) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`text-${color}-600 transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 block leading-tight">Elevated Academy</span>
              <span className="text-xs text-gray-500">Educational Curator</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
            <FiHelpCircle className="w-5 h-5" />
            <span className="font-medium">Help Center</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>

          {/* Upgrade Button */}
          <button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="w-full mx-auto">
          
          {/* Dashboard Tab Content */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Welcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 rounded-3xl p-8 mb-8 flex items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Alex.</h1>
                  <p className="text-gray-600 mb-6">You're making great progress. Continue your learning journey today.</p>
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
                    Resume Learning
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden sm:block">
                  <CircularProgress percentage={75} />
                </div>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Stats & Progress */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                    <div className="space-y-4">
                      {statsData.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className={`w-10 h-10 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{stat.label}</p>
                              <p className="font-semibold text-gray-900">{stat.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - In Progress & Recommended */}
                <div className="lg:col-span-2 space-y-8">
                  {/* In Progress */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">In Progress</h3>
                      <Link to="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {inProgressCourses.map((course) => {
                        const Icon = course.icon;
                        return (
                          <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`w-10 h-10 rounded-xl bg-${course.color}-100 flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 text-${course.color}-600`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{course.module}</span>
                                <span className="font-medium text-gray-900">{course.progress}%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-${course.color}-600 rounded-full transition-all duration-500`}
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Recommended */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {recommendedCourses.map((course) => (
                        <Link
                          key={course.id}
                          to="#"
                          className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
                        >
                          <div className={`absolute inset-0 ${course.image} opacity-90 group-hover:opacity-100 transition-opacity`}>
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-30">
                              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <pattern id={`pattern-${course.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
                                  <circle cx="2" cy="2" r="1" fill="white" />
                                </pattern>
                                <rect width="100" height="100" fill={`url(#pattern-${course.id})`} />
                              </svg>
                            </div>
                          </div>
                          {course.new && (
                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                              New
                            </span>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                            <FiPlayCircle className="w-8 h-8 text-white mb-2" />
                            <h4 className="text-white font-semibold">{course.title}</h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Home Tab Content */}
          {activeTab === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiHome className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Home</h2>
              <p className="text-gray-600">Welcome to your learning home page.</p>
            </motion.div>
          )}

          {/* Courses Tab Content */}
          {activeTab === 'courses' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses yet. Start learning today!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics Tab Content */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBarChart2 className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
              <p className="text-gray-600">Track your learning progress and achievements.</p>
            </motion.div>
          )}

          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-700">Email Notifications</span>
                  <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-700">Dark Mode</span>
                  <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-700">Language</span>
                  <span className="text-gray-500">English</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
