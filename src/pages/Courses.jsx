import { useEffect, useState } from "react";
import { getCourses } from "../api/courApi";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, 
  FiFilter, 
  FiArrowUp, 
  FiArrowDown,
  FiBookOpen, 
  FiPlayCircle, 
  FiFileText,
  FiPlus,
  FiCheck
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import AmazonNavbar from "../components/AmazonNavbar.jsx";
import { useAuth } from "../context/AuthContext";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const addToCart = (course) => {
    if (!token || !user) {
      alert("Vous devez être connecté pour ajouter un cours au panier.");
      navigate('/login');
      return;
    }
    const existingItem = cartItems.find(item => item._id === course._id);
    if (existingItem) {
      // Item already in cart, show feedback
      setAddedToCart(prev => ({ ...prev, [course._id]: true }));
      setTimeout(() => setAddedToCart(prev => ({ ...prev, [course._id]: false })), 2000);
      navigate('/cart');
    } else {
      const cartItem = {
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        originalPrice: course.originalPrice || Math.round(course.price * 1.5),
        quantity: 1,
        image: course.coverImage,
        instructor: course.professor?.username || 'Instructeur',
        duration: course.duration || '10 heures',
        rating: course.rating || 4.5,
        reviews: course.reviews || 100
      };
      const updatedCart = [...cartItems, cartItem];
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setAddedToCart(prev => ({ ...prev, [course._id]: true }));
      setTimeout(() => setAddedToCart(prev => ({ ...prev, [course._id]: false })), 2000);
    }
  };

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
        return "from-emerald-500 to-teal-600";
      case "pdf":
        return "from-emerald-600 to-teal-700";
      case "text":
        return "from-emerald-400 to-emerald-500";
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - AmazonNavbar Component */}
      <AmazonNavbar searchValue={search} onSearchChange={setSearch} />

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
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>
              
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
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
                  <div className={`h-44 flex items-center justify-center relative overflow-hidden ${!course.coverImage ? `bg-gradient-to-br ${getCourseTypeColor(course.courseType)}` : ''}`}>
                    {course.coverImage ? (
                      <>
                        <img 
                          src={`http://localhost:5000/uploads/covers/${course.coverImage.filename}`}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add(`bg-gradient-to-br`, getCourseTypeColor(course.courseType));
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </>
                    ) : (
                      <div className="text-center text-white">
                        {getCourseIcon(course.courseType)}
                        <p className="text-xs font-medium uppercase tracking-wider mt-2">{course.courseType}</p>
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        course.price === 0 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/90 text-gray-900'
                      }`}>
                        {course.price === 0 ? 'Gratuit' : `$${course.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Instructor */}
                    {course.professor && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {course.professor.username?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <span className="text-xs text-gray-500">{course.professor.username}</span>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                      {course.price === 0 ? (
                        <Link
                          to={`/courses/${course._id}`}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg font-medium text-center hover:shadow-lg transition-all"
                        >
                          Commencer gratuitement
                        </Link>
                      ) : (
                        <>
                          <Link
                            to={`/courses/${course._id}`}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium text-center transition-all"
                          >
                            Détails
                          </Link>
                          <button
                            onClick={() => addToCart(course)}
                            disabled={addedToCart[course._id]}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                              addedToCart[course._id]
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg'
                            }`}
                          >
                            {addedToCart[course._id] ? (
                              <>
                                <FiCheck className="w-4 h-4" />
                                Ajouté
                              </>
                            ) : (
                              <>
                                <FiPlus className="w-4 h-4" />
                                Panier
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
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
