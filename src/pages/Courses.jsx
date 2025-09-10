import { useEffect, useState } from "react";
import { getCourses } from "../api/courApi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaFilter, FaSort, FaBookOpen, FaVideo, FaFilePdf, FaFileAlt } from "react-icons/fa";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/course");
      const data = await res.json();
      const coursesData = data.data || data;
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (e) {
      console.error(e);
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

  const getCourseIcon = (courseType) => {
    switch (courseType) {
      case "video":
        return <FaVideo className="w-6 h-6" />;
      case "pdf":
        return <FaFilePdf className="w-6 h-6" />;
      case "text":
        return <FaFileAlt className="w-6 h-6" />;
      default:
        return <FaBookOpen className="w-6 h-6" />;
    }
  };

  const getCourseTypeColor = (courseType) => {
    switch (courseType) {
      case "video":
        return "from-red-500 to-pink-600";
      case "pdf":
        return "from-blue-500 to-indigo-600";
      case "text":
        return "from-green-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">📚 Catalogue des Cours</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez notre collection complète de cours créés par des experts passionnés
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-yellow-300">{courses.length}</span>
                <span>Cours disponibles</span>
              </div>
              <div className="w-px h-6 bg-blue-300"></div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-300">
                  {courses.filter(c => c.price === 0).length}
                </span>
                <span>Cours gratuits</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
        <input
          type="text"
              placeholder="Rechercher un cours, un professeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaFilter className="w-4 h-4" />
              <span>Filtres et tri</span>
            </button>
            <div className="text-sm text-gray-500">
              {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
            >
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les prix</option>
          <option value="free">Gratuits</option>
          <option value="paid">Payants</option>
        </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de cours</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="video">Vidéo</option>
                  <option value="pdf">PDF</option>
                  <option value="text">Texte</option>
                </select>
      </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="title">Titre A-Z</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou de filtres.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setPriceFilter("all");
                setTypeFilter("all");
                setSortBy("newest");
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Course Header */}
                <div className={`h-48 bg-gradient-to-br ${getCourseTypeColor(course.courseType)} flex items-center justify-center relative`}>
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">
                      {getCourseIcon(course.courseType)}
                    </div>
                    <p className="text-sm font-medium capitalize">{course.courseType}</p>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.price === 0 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/20 backdrop-blur-sm text-white'
                    }`}>
                      {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                    </span>
                  </div>

                  {/* Professor Badge */}
                  {course.professor && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        <span>👨‍🏫</span>
                        <span>{course.professor.username}</span>
                      </div>
            </div>
          )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>
                        {course.createdAt 
                          ? new Date(course.createdAt).toLocaleDateString()
                          : 'Date inconnue'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📊</span>
                      <span className="capitalize">{course.courseType}</span>
                    </div>
                  </div>

                  {/* Action Button */}
          <Link
            to={`/courses/${course._id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform group-hover:scale-105"
          >
            Voir le cours
          </Link>
        </div>
              </motion.div>
      ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
