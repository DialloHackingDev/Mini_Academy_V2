import { useEffect, useState } from "react";
import { getCourses } from "../api/courApi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, 
  FiFilter, 
  FiArrowUp, 
  FiArrowDown,
  FiBookOpen, 
  FiPlayCircle, 
  FiFileText,
  FiMenu,
  FiX,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiMapPin
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      const coursesData = data.data || data;
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (e) {
      console.error("Error fetching courses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filtrage et tri des cours
  useEffect(() => {
    let filtered = [...courses];

    // Filtre par recherche
    if (search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        (course.professor?.username && course.professor.username.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filtre par prix
    if (priceFilter === "free") {
      filtered = filtered.filter(course => course.price === 0);
    } else if (priceFilter === "paid") {
      filtered = filtered.filter(course => course.price > 0);
    }

    // Filtre par type
    if (typeFilter !== "all") {
      filtered = filtered.filter(course => course.courseType === typeFilter);
    }

    // Tri
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, search, priceFilter, typeFilter, sortBy]);

  // Helper function pour les couleurs de gradient
  const getCourseTypeColor = (type) => {
    switch (type) {
      case "video":
        return "from-rose-500 to-pink-600";
      case "pdf":
        return "from-indigo-500 to-purple-600";
      case "text":
        return "from-emerald-500 to-teal-600";
      default:
        return "from-slate-500 to-gray-600";
    }
  };

  // Helper function pour les icônes
  const getCourseIcon = (type) => {
    switch (type) {
      case "video":
        return <FiPlayCircle className="w-12 h-12" />;
      case "pdf":
        return <FiFileText className="w-12 h-12" />;
      case "text":
        return <FiBookOpen className="w-12 h-12" />;
      default:
        return <FiBookOpen className="w-12 h-12" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - Style Amazon */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white leading-tight block">Elevated</span>
                <span className="text-xs text-indigo-300">Academy</span>
              </div>
            </Link>

            <div className="flex-1 max-w-3xl mx-4">
              <div className="relative flex">
                <input 
                  type="text" 
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-l-md"
                />
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-4 py-2.5 rounded-r-md transition-all">
                  <FiSearch className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
              <Link to="/login" className="hidden sm:block hover:opacity-80 transition-opacity px-2 py-1">
                <div className="leading-tight text-left">
                  <span className="text-xs text-gray-400 block">Hello, sign in</span>
                  <span className="text-sm font-bold">Account</span>
                </div>
              </Link>

              <Link to="/courses" className="flex items-center hover:opacity-80 transition-opacity px-2 py-1">
                <div className="relative">
                  <FiShoppingCart className="w-7 h-7" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="hidden sm:block text-sm font-bold ml-1">Basket</span>
              </Link>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-indigo-300"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800 border-t border-slate-700"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/" className="block text-gray-300 hover:text-white py-2">Home</Link>
                <Link to="/login" className="block text-gray-300 hover:text-white py-2">Sign In</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Courses</h1>
            <p className="text-gray-600">
              {filteredCourses.length} {filteredCourses.length > 1 ? 'courses' : 'course'} available
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>
              
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Name: A-Z</option>
              </select>

              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="text">Text</option>
              </select>
            </div>
          </motion.div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearch("");
                  setPriceFilter("all");
                  setTypeFilter("all");
                  setSortBy("newest");
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Course Image */}
                  <div className={`h-44 bg-gradient-to-br ${getCourseTypeColor(course.courseType)} flex items-center justify-center relative`}>
                    <div className="text-center text-white">
                      {getCourseIcon(course.courseType)}
                      <p className="text-xs font-medium uppercase tracking-wider mt-2">{course.courseType}</p>
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        course.price === 0 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/90 text-gray-900'
                      }`}>
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Instructor */}
                    {course.professor && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {course.professor.username?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <span className="text-xs text-gray-500">{course.professor.username}</span>
                      </div>
                    )}

                    {/* Button */}
                    <Link
                      to={`/courses/${course._id}`}
                      className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium text-center hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                      View Course
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
