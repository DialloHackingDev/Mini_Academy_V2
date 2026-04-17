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
import { getMyCourses, getProgress, getStudentAnalytics } from "../api/StudiantApi";
import api from "../api/api";

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid, active: true },
  { id: 'home', label: 'Home', icon: FiHome },
  { id: 'courses', label: 'Courses', icon: FiBook },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'settings', label: 'Settings', icon: FiSettings },
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

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyCourses();
        setCourses(data.courses || data || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'settings') fetchProfile();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await getStudentAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {localStorage.getItem('username') || 'Student'}.</h1>
                  <p className="text-gray-600 mb-6">You're making great progress. Continue your learning journey today.</p>
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
                    Resume Learning
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden sm:block">
                  <CircularProgress percentage={analytics ? Math.round(analytics.avgProgress || 0) : 0} />
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
                      {analytics ? (
                        <>
                          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <FiBook className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Courses</p>
                              <p className="font-semibold text-gray-900">{analytics.totalCourses || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FaFire className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Spent</p>
                              <p className="font-semibold text-gray-900">${analytics.totalSpent || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FaCertificate className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Avg Rating</p>
                              <p className="font-semibold text-gray-900">{analytics.averageRating || 0}/5</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">Loading stats...</p>
                      )}
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
                      {courses.length > 0 ? (
                        courses.slice(0, 4).map((course, index) => (
                          <div key={course._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <FiBook className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Course Type: {course.courseType || 'text'}</span>
                                <span className="font-medium text-gray-900">
                                  {analytics?.courses?.find(c => c._id === course._id)?.progression || Math.floor(Math.random() * 80) + 10}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${analytics?.courses?.find(c => c._id === course._id)?.progression || Math.floor(Math.random() * 80) + 10}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-gray-100">
                          <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No courses in progress. Start learning today!</p>
                        </div>
                      )}
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
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : analytics ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalCourses}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900">${analytics.totalSpent}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Avg Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.avgProgress}%</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.averageRating}/5</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <FiBarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No analytics data available.</p>
                </div>
              )}
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
              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : profile ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-700">Username</span>
                    <span className="text-gray-900 font-medium">{profile.username || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-700">Email</span>
                    <span className="text-gray-900 font-medium">{profile.email || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-700">Role</span>
                    <span className="text-gray-900 font-medium capitalize">{profile.role || 'student'}</span>
                  </div>
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
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <FiSettings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Unable to load profile settings.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
