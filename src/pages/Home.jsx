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
  FiShield,
  FiWifi,
  FiCpu,
  FiCode,
  FiMonitor,
  FiGlobe,
  FiBriefcase,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUnlock
} from "react-icons/fi";
import { 
  MdScience,
  MdComputer,
  MdEco,
  MdRouter,
  MdOutlineMenuBook
} from "react-icons/md";
import { getCourses } from "../api/courApi.jsx";
import AmazonNavbar from "../components/AmazonNavbar.jsx";
import { FaGraduationCap } from "react-icons/fa";

// Animation hook
const useAnimatedInView = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  return { ref, inView };
};

// Hero Banner Component with Image Slider
function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerImages = [
    { src: "/src/assets/bannier.jpeg", alt: "Bannière 1" },
    { src: "/src/assets/bannier2.jpeg", alt: "Bannière 2" },
    { src: "/src/assets/bannier3.jpeg", alt: "Bannière 3" }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  return (
    <section className="relative w-full pt-[6.5rem]">
      {/* Main Banner Container */}
      <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] overflow-hidden bg-gray-900">
        {/* Images Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={bannerImages[currentIndex].src}
              alt={bannerImages[currentIndex].alt}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-xl text-white"
            >
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Voted #1 Online Academy 2024
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
              >
                Formez-vous aux métiers de{" "}
                <span className="text-emerald-400">demain</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-base sm:text-lg text-gray-200 mb-6 max-w-md"
              >
                Des cours pratiques et certifiants pour booster votre carrière dans la tech.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-3"
              >
                <Link 
                  to="/courses"
                  className="group inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-emerald-500/30"
                >
                  Explorer les cours
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Commencer gratuitement
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-6 mt-6 pt-6 border-t border-white/20"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">50+</p>
                  <p className="text-xs text-gray-300">Cours</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">10K+</p>
                  <p className="text-xs text-gray-300">Élèves</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">95%</p>
                  <p className="text-xs text-gray-300">Satisfaction</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-emerald-400 w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Free Courses Slider Component
function FreeCoursesSlider({ courses }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const freeCourses = courses.filter(c => c.price === 0 || c.isFree);
  // Fallback data if no free courses from API
  const displayCourses = freeCourses.length > 0 ? freeCourses : [
    {
      _id: '1',
      title: "Introduction à la cybersécurité",
      description: "Explorez le domaine passionnant de la cybersécurité et découvrez pourquoi il va durer dans le temps.",
      courseType: "text",
      price: 0,
      duration: "8 heures",
      level: "DÉBUTANT",
      coverImage: null,
      professor: { username: "Cisco Networking Academy" }
    },
    {
      _id: '2',
      title: "Premiers pas avec Cisco Packet Tracer",
      description: "Votre passerelle vers Cisco Packet Tracer. Familiarisez-vous avec l'environnement de simulation.",
      courseType: "video",
      price: 0,
      duration: "2 heures",
      level: "DÉBUTANT",
      coverImage: null,
      professor: { username: "Cisco Networking Academy" }
    },
    {
      _id: '3',
      title: "Introduction à la science des données",
      description: "Quintillions de milliards d'octets de données sont créés CHAQUE jour ! Découvrez comment les données transforment le monde.",
      courseType: "text",
      price: 0,
      duration: "6 heures",
      level: "DÉBUTANT",
      coverImage: null,
      professor: { username: "Cisco Networking Academy" }
    },
    {
      _id: '4',
      title: "Python Essentials 1",
      description: "Learn fundamental concepts of computer programming and start building coding skills with the Python programming language.",
      courseType: "video",
      price: 0,
      duration: "30 heures",
      level: "DÉBUTANT",
      coverImage: null,
      professor: { username: "Python Institute" }
    }
  ];

  const itemsPerPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4;
  const maxIndex = Math.max(0, displayCourses.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (displayCourses.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Cours en ligne <span className="text-emerald-600 underline decoration-4 underline-offset-4">gratuits</span> les plus populaires
          </h2>
        </motion.div>

        {/* Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-xl'}`}
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all ${currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-xl'}`}
          >
            <FiChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: -currentIndex * (100 / itemsPerPage) + '%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {displayCourses.map((course) => (
                <div
                  key={course._id}
                  className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                >
                  <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    {/* Course Image */}
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      {course.coverImage ? (
                        <img
                          src={`http://localhost:5000/uploads/covers/${typeof course.coverImage === 'string' ? course.coverImage : course.coverImage.filename}`}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center"><svg class="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg></div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <FiPlayCircle className="w-12 h-12 text-indigo-400" />
                        </div>
                      )}
                      {/* Level Badge */}
                      <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded">
                        {course.level || 'DÉBUTANT'}
                      </span>
                      {/* Share Button */}
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <FiArrowRight className="w-4 h-4 text-gray-600 -rotate-45" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <FiUsers className="w-4 h-4" />
                        <span>Cours</span>
                        <span>•</span>
                        <span>À votre rythme</span>
                        <span>•</span>
                        <span>Dirigé par un instructeur</span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{course.duration || '8 heures'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600">
                          <FiUnlock className="w-4 h-4" />
                          <span className="font-medium">gratuitement</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Paid Courses Slider Component (Curated Paths)
function CoursesSlider({ courses }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Filter paid courses or use all courses if API returns them
  const paidCourses = courses.length > 0 ? courses : [
    {
      _id: '1',
      title: "UX Design Masterclass",
      description: "Learn to create beautiful, user-centered designs that convert. Master Figma, prototyping, and design systems.",
      courseType: "video",
      price: 149,
      duration: "12 heures",
      level: "INTERMÉDIAIRE",
      coverImage: null,
      rating: "4.8",
      reviews: 256,
      professor: { username: "Alex Rivera" }
    },
    {
      _id: '2',
      title: "Data Science Fundamentals",
      description: "Master Python, pandas, numpy and machine learning basics. Build real-world data projects.",
      courseType: "video",
      price: 199,
      duration: "20 heures",
      level: "DÉBUTANT",
      coverImage: null,
      rating: "4.9",
      reviews: 412,
      professor: { username: "Sarah Chen" }
    },
    {
      _id: '3',
      title: "Modern React & Next.js",
      description: "Build production-ready apps with React 18, Next.js 14, TypeScript, and Tailwind CSS.",
      courseType: "video",
      price: 179,
      duration: "15 heures",
      level: "AVANCÉ",
      coverImage: null,
      rating: "4.7",
      reviews: 189,
      professor: { username: "Mike Johnson" }
    },
    {
      _id: '4',
      title: "Growth Marketing Pro",
      description: "Master SEO, content marketing, paid ads, and analytics. Scale your startup to $1M ARR.",
      courseType: "text",
      price: 129,
      duration: "8 heures",
      level: "INTERMÉDIAIRE",
      coverImage: null,
      rating: "4.6",
      reviews: 145,
      professor: { username: "Emma Wilson" }
    }
  ];

  const itemsPerPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4;
  const maxIndex = Math.max(0, paidCourses.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (paidCourses.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Curated Paths</h2>
            <p className="text-gray-600 text-lg mt-2">Masterclasses designed by industry leaders</p>
          </div>
          <Link 
            to="/courses" 
            className="hidden sm:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            View All Paths
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-xl'}`}
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all ${currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-xl'}`}
          >
            <FiChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: -currentIndex * (100 / itemsPerPage) + '%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {paidCourses.map((course) => (
                <div
                  key={course._id}
                  className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                >
                  <Link to={`/courses/${course._id}`} className="block h-full">
                    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                      {/* Course Image */}
                      <div className="relative h-40 bg-gray-100 overflow-hidden">
                        {course.coverImage ? (
                          <img
                            src={`http://localhost:5000/uploads/covers/${typeof course.coverImage === 'string' ? course.coverImage : course.coverImage.filename}`}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center"><svg class="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg></div>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <FiPlayCircle className="w-12 h-12 text-indigo-400" />
                          </div>
                        )}
                        {/* Level Badge */}
                        <span className="absolute top-3 left-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded">
                          {course.level || 'DÉBUTANT'}
                        </span>
                        {/* Share Button */}
                        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                          <FiArrowRight className="w-4 h-4 text-gray-600 -rotate-45" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <FiUsers className="w-4 h-4" />
                          <span>Cours</span>
                          <span>•</span>
                          <span>À votre rythme</span>
                          <span>•</span>
                          <span>Dirigé par un instructeur</span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">{course.rating || '4.5'}</span>
                            <span className="text-sm text-gray-500">({course.reviews || 128} avis)</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">${course.price}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile View All Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <Link to="/courses" className="inline-flex items-center gap-2 text-indigo-600 font-medium">
            View All Paths
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* Navbar - Using AmazonNavbar Component */}
      <AmazonNavbar />

      {/* Hero Banner with Image Slider */}
      <HeroBanner />

      {/* Domaines Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Domaines
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explorez nos domaines d'expertise et trouvez la formation qui correspond à vos ambitions
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {[
              { name: "Cybersécurité", icon: FiShield, color: "#10b981" },
              { name: "Réseau", icon: FiWifi, color: "#10b981" },
              { name: "IA et science des données", icon: MdScience, color: "#10b981" },
              { name: "Programmation", icon: FiCode, color: "#10b981" },
              { name: "IT", icon: MdComputer, color: "#10b981" },
              { name: "Connaissance du monde", icon: FiGlobe, color: "#10b981" },
              { name: "Compétences professionnelles", icon: FiBriefcase, color: "#10b981" },
              { name: "Développement durable", icon: MdEco, color: "#10b981" },
            ].map((domain) => (
              <motion.div
                key={domain.name}
                variants={fadeInUp}
                className="group bg-white rounded-xl border border-gray-200 px-6 py-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <domain.icon 
                    className="w-7 h-7 flex-shrink-0" 
                    style={{ color: domain.color }}
                  />
                  <span className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {domain.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link 
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              Découvrir le catalogue complet
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Free Courses Slider Section */}
      <FreeCoursesSlider courses={courses} />

      {/* Curated Paths Section - Slider */}
      <CoursesSlider courses={courses} />

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
