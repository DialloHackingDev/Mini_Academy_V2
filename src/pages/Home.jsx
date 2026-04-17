import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  FiArrowRight, 
  FiStar, 
  FiTrendingUp,
  FiPlayCircle,
  FiUsers,
  FiAward,
  FiMenu,
  FiX,
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiMapPin
} from "react-icons/fi";
import { 
  FaGraduationCap,
  FaUserGraduate
} from "react-icons/fa";
import { getCourses } from "../api/courApi.jsx";

// Animation hook
const useAnimatedInView = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  return { ref, inView };
};

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses((data.data || data).slice(0, 6));
      } catch (e) {
        console.error("Error fetching courses:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const { ref: heroRef, inView: heroInView } = useAnimatedInView();
  const { ref: coursesRef, inView: coursesInView } = useAnimatedInView();
  const { ref: footerRef, inView: footerInView } = useAnimatedInView();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - Style Amazon */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white">
        {/* Main Navbar */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white leading-tight block">Elevated</span>
                <span className="text-xs text-indigo-300">Academy</span>
              </div>
            </Link>

            {/* Location (mobile only) */}
            <div className="hidden lg:flex items-center gap-1 text-sm text-gray-300 hover:text-white cursor-pointer flex-shrink-0">
              <FiMapPin className="w-4 h-4" />
              <div className="leading-tight">
                <span className="text-xs text-gray-400 block">Deliver to</span>
                <span className="font-medium">Guinea</span>
              </div>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-3xl mx-4">
              <div className="relative flex">
                {/* Category Dropdown */}
                <select className="hidden sm:block bg-gray-100 text-gray-700 text-sm px-3 py-2.5 rounded-l-md border-r border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  <option>All</option>
                  <option>Courses</option>
                  <option>Mentors</option>
                  <option>Resources</option>
                </select>
                {/* Search Input */}
                <input 
                  type="text" 
                  placeholder="Search courses, mentors..."
                  className="flex-1 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:rounded-none rounded-l-md"
                />
                {/* Search Button */}
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-4 py-2.5 rounded-r-md transition-all">
                  <FiSearch className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
              {/* Language Selector */}
              <div className="hidden md:flex items-center gap-1 cursor-pointer hover:opacity-80">
                <span className="text-lg">🇬🇧</span>
                <span className="text-sm font-bold">EN</span>
              </div>

              {/* Account & Lists */}
              <Link to="/login" className="hidden sm:block hover:opacity-80 transition-opacity px-2 py-1">
                <div className="leading-tight text-left">
                  <span className="text-xs text-gray-400 block">Hello, sign in</span>
                  <span className="text-sm font-bold">Account & Lists</span>
                </div>
              </Link>

              {/* Wishlist */}
              <button className="hidden md:flex flex-col items-center hover:opacity-80 transition-opacity px-2 py-1">
                <div className="relative">
                  <FiHeart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="text-xs font-medium">& Orders</span>
              </button>

              {/* Cart */}
              <Link to="/courses" className="flex items-center hover:opacity-80 transition-opacity px-2 py-1">
                <div className="relative">
                  <FiShoppingCart className="w-7 h-7" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="hidden sm:block text-sm font-bold ml-1">Basket</span>
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-indigo-300"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navbar with Categories */}
        <div className="hidden md:block bg-slate-800 border-t border-slate-700">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10 text-sm">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-1 font-bold hover:text-indigo-300 transition-colors"
              >
                <FiMenu className="w-5 h-5" />
                All
              </button>
              <Link to="/courses" className="hover:text-indigo-300 transition-colors">Today's Deals</Link>
              <Link to="#" className="hover:text-indigo-300 transition-colors">Customer Service</Link>
              <Link to="#" className="hover:text-indigo-300 transition-colors">Registry</Link>
              <Link to="#" className="hover:text-indigo-300 transition-colors">Gift Cards</Link>
              <Link to="#" className="hover:text-indigo-300 transition-colors font-semibold text-indigo-300">Sell</Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800 border-t border-slate-700"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/courses" className="block text-gray-300 hover:text-white py-2">Courses</Link>
                <Link to="#" className="block text-gray-300 hover:text-white py-2">Mentors</Link>
                <Link to="#" className="block text-gray-300 hover:text-white py-2">Pricing</Link>
                <Link to="#" className="block text-gray-300 hover:text-white py-2">Resources</Link>
                <hr className="border-slate-600" />
                <Link to="/login" className="block text-gray-300 hover:text-white py-2">Sign In</Link>
                <Link to="/register" className="block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded text-center font-medium">
                  Create Account
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - Full Height */}
      <section ref={heroRef} className="min-h-[calc(100vh-6.5rem)] pt-32 pb-16 lg:pt-36 lg:pb-20 overflow-hidden flex items-center">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial="initial"
              animate={heroInView ? "animate" : "initial"}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                Voted #1 Online Academy 2024
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Empower Your Future with{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Mini Academy
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8 max-w-lg"
              >
                Master in-demand skills with our curated, high-impact courses. Designed for the modern professional seeking excellence.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-8">
                <Link 
                  to="/courses"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
                >
                  Explore Courses
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/register"
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all"
                >
                  Start for Free
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Join <span className="font-semibold text-gray-900">10,000+</span> successful learners
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-8 lg:p-12">
                <div className="aspect-square bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <FaUserGraduate className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-gray-600 font-medium">Career Growth</p>
                      <p className="text-2xl font-bold text-indigo-600">+85% Salary Bump</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3"
                >
                  <FiTrendingUp className="w-6 h-6 text-green-500" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3"
                >
                  <FiAward className="w-6 h-6 text-purple-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Curated Paths Section */}
      <section ref={coursesRef} className="py-20 lg:py-32 bg-white flex-1 flex items-center">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="initial"
            animate={coursesInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Curated Paths</h2>
                <p className="text-gray-600">Masterclasses designed by industry leaders</p>
              </div>
              <Link to="/courses" className="hidden sm:flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                View All Paths
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="initial"
            animate={coursesInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.length > 0 ? courses.map((course, index) => (
              <motion.div
                key={course._id}
                variants={fadeInUp}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className={`relative h-48 bg-gradient-to-br ${
                  index % 3 === 0 ? 'from-gray-900 to-gray-800' :
                  index % 3 === 1 ? 'from-blue-900 to-indigo-900' :
                  'from-teal-900 to-emerald-900'
                } flex items-center justify-center`}>
                  {index === 0 && (
                    <span className="absolute top-4 left-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                      4.0 (256 reviews)
                    </span>
                  )}
                  <div className="text-center text-white">
                    {course.courseType === 'video' ? (
                      <FiPlayCircle className="w-12 h-12 mx-auto mb-2" />
                    ) : (
                      <FaGraduationCap className="w-12 h-12 mx-auto mb-2" />
                    )}
                    <p className="text-lg font-semibold uppercase tracking-wider">{course.courseType}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  {index === 0 && (
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Featured Path</span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                        {course.teacher?.username?.[0] || 'T'}
                      </div>
                      <span className="text-sm text-gray-600">{course.teacher?.username || 'Instructor'}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">${course.price || 149}</span>
                  </div>
                </div>
              </motion.div>
            )) : (
              // Fallback courses if API fails
              <>
                {['UX Design', 'Data Science', 'Modern React', 'Growth Marketing', 'Product Management', 'Business Strategy'].map((title, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`relative h-48 bg-gradient-to-br ${
                      i % 3 === 0 ? 'from-gray-900 to-gray-800' :
                      i % 3 === 1 ? 'from-blue-900 to-indigo-900' :
                      'from-teal-900 to-emerald-900'
                    } flex items-center justify-center`}>
                      {i === 0 && (
                        <span className="absolute top-4 left-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                          4.0 (256 reviews)
                        </span>
                      )}
                      <div className="text-center text-white">
                        <FaGraduationCap className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-lg font-semibold uppercase tracking-wider">Course</p>
                      </div>
                    </div>
                    <div className="p-6">
                      {i === 0 && (
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Featured Path</span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{title}</h3>
                      <p className="text-gray-600 text-sm mb-4">Master the essentials of {title.toLowerCase()} with industry experts.</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <span className="text-sm text-gray-600">Alex Rivera</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">${149 + i * 10}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="mt-8 text-center sm:hidden"
          >
            <Link to="/courses" className="inline-flex items-center gap-2 text-indigo-600 font-medium">
              View All Paths
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <motion.div
            initial="initial"
            animate={footerInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp} className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Elevated Academy</span>
              </Link>
              <p className="text-sm text-gray-600">Built for the modern curator.</p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/courses" className="hover:text-gray-900 transition-colors">Courses</Link></li>
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Mentors</Link></li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-gray-900 transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Contact Support</Link></li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-gray-900 transition-colors">Cookie Policy</Link></li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600"
          >
            © {new Date().getFullYear()} The Elevated Academy. Built for the modern curator.
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
