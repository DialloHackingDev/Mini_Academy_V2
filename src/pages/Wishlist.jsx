import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

import { 
  FiHeart, 
  FiArrowLeft, 
  FiBookOpen, 
  FiArrowRight,
  FiPlayCircle,
  FiFileText,
  FiPlus,
  FiCheck
} from "react-icons/fi";
import AmazonNavbar from "../components/AmazonNavbar.jsx";
import { getUserFavorites } from "../api/favoriteApi";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState({});
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const getCourseCoverUrl = (course) => {
    const cover = course?.coverImage;
    if (!cover) return null;

    if (typeof cover === 'string') {
      return cover.startsWith('http') ? cover : `http://localhost:5000/uploads/${cover}`;
    }

    if (typeof cover === 'object') {
      if (cover.filename) {
        return `http://localhost:5000/uploads/covers/${cover.filename}`;
      }
      if (typeof cover.path === 'string') {
        if (cover.path.startsWith('http')) return cover.path;
        if (cover.path.startsWith('/')) return `http://localhost:5000${cover.path}`;
        return `http://localhost:5000/${cover.path}`;
      }
    }

    return null;
  };

  const getCourseTypeColor = (type) => {
    switch (type) {
      case "video": return "from-emerald-500 to-teal-600";
      case "pdf":   return "from-emerald-600 to-teal-700";
      case "text":  return "from-emerald-400 to-emerald-500";
      default:      return "from-slate-500 to-gray-600";
    }
  };

  const getCourseIcon = (type) => {
    switch (type) {
      case "video": return <FiPlayCircle className="w-12 h-12" />;
      case "pdf":   return <FiFileText className="w-12 h-12" />;
      default:      return <FiBookOpen className="w-12 h-12" />;
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getUserFavorites();
        const courses = res.data || [];
        setFavorites(courses);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Impossible de charger les favoris.");
      } finally {
        setLoading(false);
      }
    };

    if (!token || !user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [token, user, navigate]);

  const addToCart = (course) => {
    if (!token || !user) {
      alert("Vous devez être connecté pour ajouter un cours au panier.");
      navigate('/login');
      return;
    }
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = savedCart.find(item => item._id === course._id);
    
    if (existingItem) {
      navigate('/cart');
      return;
    }
    
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
    
    const updatedCart = [...savedCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    setAddedToCart(prev => ({ ...prev, [course._id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [course._id]: false }));
    }, 2000);
  };

  const removeFavorite = async (courseId) => {
    setFavorites(prev => prev.filter(c => c._id !== courseId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AmazonNavbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-2">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <FiHeart className="w-10 h-10 text-rose-500 fill-rose-500" />
                  Mes Favoris
                </h1>
                <p className="text-gray-600">
                  {favorites.length} {favorites.length > 1 ? 'cours' : 'cours'} dans votre liste de souhaits
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-full px-6 py-3 text-gray-900 font-medium hover:border-emerald-600 hover:text-emerald-600 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Découvrir plus de cours
              </Link>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de vos favoris...</p>
              </div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-rose-900 mb-2">Erreur au chargement</h3>
              <p className="text-rose-700 mb-6">{error}</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-full font-medium hover:bg-rose-700 transition-colors"
              >
                Retour aux cours
              </Link>
            </motion.div>
          ) : favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-16 text-center border border-emerald-100"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiHeart className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Aucun favori pour le moment</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Explorez nos cours et ajoutez vos favoris pour les retrouver facilement et bénéficier des meilleures offres !
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Parcourir les cours
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {favorites.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Course Image */}
                  <div className={`h-44 flex items-center justify-center relative overflow-hidden ${!getCourseCoverUrl(course) ? `bg-gradient-to-br ${getCourseTypeColor(course.courseType)}` : ''}`}>
                    {getCourseCoverUrl(course) ? (
                      <>
                        <img
                          src={getCourseCoverUrl(course)}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                    {/* Remove from Favorites Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(course._id);
                      }}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur hover:bg-white w-9 h-9 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-600 transition-all shadow-sm hover:shadow-md"
                      title="Retirer des favoris"
                    >
                      <FiHeart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'Cours de haute qualité pour progresser rapidement'}
                    </p>

                    {/* Instructor */}
                    {course.professor?.username && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {course.professor.username?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <span className="text-xs text-gray-500">{course.professor.username}</span>
                      </div>
                    )}

                    {/* Buttons — same pattern as Courses.jsx */}
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
      </div>
    </div>
  );
}
