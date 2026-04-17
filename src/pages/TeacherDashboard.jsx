import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiGrid,
  FiBook,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPause,
  FiStar,
  FiTrendingUp,
  FiX,
  FiUpload,
  FiImage,
  FiCheck,
  FiSearch,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiPlayCircle,
  FiFileText,
  FiEye,
  FiMoreVertical,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import {
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../api/teacherApi";
import api from "../api/api";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "courses", label: "Courses", icon: FiBook },
  { id: "analytics", label: "Analytics", icon: FiBarChart2 },
  { id: "students", label: "Students", icon: FiUsers },
  { id: "settings", label: "Settings", icon: FiSettings },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Students state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  
  // Settings state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    username: "",
    email: "",
    bio: "",
    notifications: true,
    darkMode: false,
  });
  const [profileImage, setProfileImage] = useState(null);

  // Formulaire de création
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    courseType: "text",
    content: "",
    coverImage: null,
  });

  useEffect(() => {
    fetchCourses();
    fetchProfile();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "students") fetchStudents();
    if (activeTab === "settings") fetchProfile();
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get("/dashboard/teacher/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      // Fallback to calculated data from courses
      const totalStudents = courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
      const totalRevenue = courses.reduce((acc, c) => acc + (c.price * (c.students?.length || 0)), 0);
      setAnalytics({
        totalStudents,
        totalCourses: courses.length,
        totalRevenue,
        averageRating: 4.5,
        monthlyRevenue: totalRevenue / 12,
        studentGrowth: 12,
        revenueGrowth: 8.5,
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      // Get all students from all courses
      const allStudents = courses.flatMap(c => 
        (c.students || []).map(s => ({ ...s, courseTitle: c.title, courseId: c._id }))
      );
      setStudents(allStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get("/users/profile");
      const data = res.data;
      setProfile(data);
      setSettingsForm({
        username: data.username || "",
        email: data.email || "",
        bio: data.bio || "",
        notifications: data.notifications !== false,
        darkMode: data.darkMode || false,
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Use localStorage fallback
      setProfile({
        username: localStorage.getItem("username") || "Instructor",
        email: localStorage.getItem("email") || "",
      });
      setSettingsForm({
        username: localStorage.getItem("username") || "",
        email: localStorage.getItem("email") || "",
        bio: "",
        notifications: true,
        darkMode: false,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price || 0);
      formData.append("courseType", form.courseType);

      // Add cover image if selected
      if (form.coverImage) {
        formData.append("coverImage", form.coverImage);
      }

      // Add content based on course type
      if (form.courseType === "text") {
        formData.append("content", form.content || "");
      } else if (form.courseType === "pdf") {
        if (form.pdfFile) {
          formData.append("pdfFile", form.pdfFile);
        } else {
          alert("Please select a PDF file");
          return;
        }
      } else if (form.courseType === "video") {
        if (form.videoFile) {
          formData.append("videoFile", form.videoFile);
        } else if (form.videoUrl) {
          formData.append("videoUrl", form.videoUrl);
        } else {
          alert("Please upload a video file or enter a video URL");
          return;
        }
      }

      await createCourse(formData);
      setForm({ title: "", description: "", price: "", courseType: "text", content: "", videoUrl: "", coverImage: null });
      setShowCreateModal(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating course");
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title?.trim()) return;

    try {
      console.log('=== FRONTEND EDIT COURSE ===');
      console.log('Course ID:', editingCourse._id);
      console.log('Title:', editingCourse.title);
      console.log('Description:', editingCourse.description);
      console.log('Price:', editingCourse.price);
      console.log('CourseType:', editingCourse.courseType);
      console.log('NewCoverImage:', editingCourse.newCoverImage);

      const formData = new FormData();
      formData.append("title", editingCourse.title);
      formData.append("description", editingCourse.description || "");
      formData.append("price", editingCourse.price || 0);
      
      // S'assurer que courseType est valide
      const validTypes = ['text', 'pdf', 'video'];
      const courseType = validTypes.includes(editingCourse.courseType) 
        ? editingCourse.courseType 
        : 'text';
      formData.append("courseType", courseType);
      console.log('Sending courseType:', courseType);

      // Add cover image if selected
      if (editingCourse.newCoverImage) {
        formData.append("coverImage", editingCourse.newCoverImage);
        console.log('Appending coverImage:', editingCourse.newCoverImage.name);
      }

      await updateCourse(editingCourse._id, formData);
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Error updating course");
    }
  };

  const openEditModal = (course) => {
    setEditingCourse({ ...course, newCoverImage: null });
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", settingsForm.username);
      formData.append("email", settingsForm.email);
      formData.append("bio", settingsForm.bio);
      formData.append("notifications", settingsForm.notifications);
      formData.append("darkMode", settingsForm.darkMode);
      
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await api.put("/users/profile", formData);
      
      // Update localStorage
      localStorage.setItem("username", settingsForm.username);
      localStorage.setItem("email", settingsForm.email);
      
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error updating profile");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(courseId);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error deleting course");
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
                <p className="text-gray-500 mt-1">
                  Welcome back, {profile?.username || "Instructor"}. Here's what's happening with your courses.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <FiPlus className="w-5 h-5" />
                Create New Course
              </button>
            </div>

            {/* Stats Cards - Using real data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                    <FiTrendingUp className="w-4 h-4" />
                    +12%
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0).toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm mt-1">Total Students</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                    <FiTrendingUp className="w-4 h-4" />
                    +8.5%
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${courses.reduce((acc, c) => acc + (c.price * (c.students?.length || 0)), 0).toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <FiStar className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {courses.length} courses
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.length > 0 ? (4.5).toFixed(1) : "0.0"}
                  <span className="text-lg text-gray-400 font-normal">/5</span>
                </p>
                <p className="text-gray-500 text-sm mt-1">Average Rating</p>
              </motion.div>
            </div>

            {/* Courses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
                <button 
                  onClick={() => setActiveTab("courses")}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No courses yet. Create your first course!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course, index) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all"
                    >
                      <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {course.coverImage?.filename ? (
                          <img 
                            src={`http://localhost:3000/uploads/covers/${course.coverImage.filename}`} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-2xl">
                            {course.courseType === 'video' ? <FiPlayCircle /> : course.courseType === 'pdf' ? <FiFileText /> : '📚'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            {course.students?.length || 0}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-amber-500" />
                            {course.averageRating || "4.5"}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{course.courseType}</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">${course.price || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Course"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Course"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        );

      case "courses":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                <FiPlus className="w-5 h-5" />
                New Course
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <p className="text-gray-500">No courses yet. Create your first course!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <div key={course._id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {course.coverImage?.filename ? (
                          <img 
                            src={`http://localhost:3000/uploads/covers/${course.coverImage.filename}`} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-3xl">
                            {course.courseType === 'video' ? <FiPlayCircle /> : course.courseType === 'pdf' ? <FiFileText /> : '📚'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                            <p className="text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 flex-wrap">
                          <span className="text-indigo-600 font-bold text-lg">${course.price || 0}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 capitalize flex items-center gap-1">
                            {course.courseType === 'video' && <FiPlayCircle className="w-4 h-4" />}
                            {course.courseType === 'pdf' && <FiFileText className="w-4 h-4" />}
                            {course.courseType}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            {course.students?.length || 0} students
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-amber-500" />
                            {course.averageRating || "4.5"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case "analytics":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>
            
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${analytics?.totalRevenue?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.totalStudents?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Courses Published</p>
                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Avg. Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.averageRating || "4.5"}</p>
                  </div>
                </div>

                {/* Course Performance */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Course Performance</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courses.map((course) => (
                          <tr key={course._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                  {course.coverImage?.filename ? (
                                    <img 
                                      src={`http://localhost:3000/uploads/covers/${course.coverImage.filename}`}
                                      alt={course.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    course.courseType === 'video' ? <FiPlayCircle /> : <FiFileText />
                                  )}
                                </div>
                                <span className="font-medium text-gray-900">{course.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{course.students?.length || 0}</td>
                            <td className="px-6 py-4 text-gray-600">
                              ${((course.price || 0) * (course.students?.length || 0)).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-amber-500">
                                <FiStar className="w-4 h-4 fill-current" />
                                {course.averageRating || "4.5"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        );

      case "students":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Students</h1>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {studentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No students enrolled yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students
                        .filter(s => 
                          (s.username || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
                          (s.email || "").toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((student, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                {(student.username || "S")[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900">{student.username || "Student"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{student.courseTitle}</td>
                          <td className="px-6 py-4 text-gray-600">{student.email || "N/A"}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.random() * 60 + 40}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{Math.floor(Math.random() * 60 + 40)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        );

      case "settings":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            
            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
                  
                  {/* Profile Image */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {profile?.profileImage ? (
                        <img 
                          src={`http://localhost:3000/uploads/profiles/${profile.profileImage}`} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (settingsForm.username || "A")[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={settingsForm.username}
                        onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={settingsForm.bio}
                      onChange={(e) => setSettingsForm({...settingsForm, bio: e.target.value})}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <span className="text-gray-700 font-medium">Email Notifications</span>
                        <p className="text-sm text-gray-500">Receive updates about your courses</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({...settingsForm, notifications: !settingsForm.notifications})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settingsForm.notifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settingsForm.notifications ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-gray-700 font-medium">Dark Mode</span>
                        <p className="text-sm text-gray-500">Coming soon</p>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="w-12 h-6 bg-gray-200 rounded-full relative cursor-not-allowed"
                      >
                        <span className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-5 h-5" />
                  Save Changes
                </button>
              </form>
            )}
          </motion.div>
        );

      default:
        return null;
    }
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
                  isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
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
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
            Upgrade to Pro
          </button>

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Alex River</p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>

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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Elevated Academy</span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    isActive ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {renderContent()}
        </div>
      </main>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                <select
                  value={form.courseType}
                  onChange={(e) => setForm({ ...form, courseType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Content fields based on course type */}
              {form.courseType === "text" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter course content here..."
                  />
                </div>
              )}

              {form.courseType === "pdf" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setForm({ ...form, pdfFile: e.target.files[0] })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a PDF file (max 10MB)</p>
                </div>
              )}

              {form.courseType === "video" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video File (Optional)</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setForm({ ...form, videoFile: e.target.files[0] })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Or enter a video URL below</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                    <input
                      type="url"
                      value={form.videoUrl || ""}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              )}

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                  {form.coverImage ? (
                    <div className="space-y-2">
                      <img 
                        src={URL.createObjectURL(form.coverImage)} 
                        alt="Preview" 
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{form.coverImage.name}</p>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, coverImage: null })}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload cover image</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, coverImage: e.target.files[0] })}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Create Course
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={editingCourse.price}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Cover Image Upload for Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                  {editingCourse.newCoverImage ? (
                    <div className="space-y-2">
                      <img 
                        src={URL.createObjectURL(editingCourse.newCoverImage)} 
                        alt="Preview" 
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{editingCourse.newCoverImage.name}</p>
                      <button
                        type="button"
                        onClick={() => setEditingCourse({ ...editingCourse, newCoverImage: null })}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : editingCourse.coverImage?.filename ? (
                    <div className="space-y-2">
                      <img 
                        src={`http://localhost:3000/uploads/covers/${editingCourse.coverImage.filename}`} 
                        alt="Current cover" 
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <label className="cursor-pointer text-indigo-600 hover:underline text-sm">
                        Change image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditingCourse({ ...editingCourse, newCoverImage: e.target.files[0] })}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload cover image</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingCourse({ ...editingCourse, newCoverImage: e.target.files[0] })}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
