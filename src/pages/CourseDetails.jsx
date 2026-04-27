import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiPlay,
  FiFileText,
  FiDownload,
  FiCheck,
  FiCheckCircle,
  FiStar,
  FiUsers,
  FiClock,
  FiGlobe,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiShare2,
  FiShoppingCart,
  FiPlayCircle,
  FiBookOpen,
  FiVideo,
  FiSend,
} from "react-icons/fi";
import { getCourseById, enrollCourse } from "../api/courApi";
import { getCourses } from "../api/courApi";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";
import { toggleFavorite, checkIsFavored } from "../api/favoriteApi";
import { addOrUpdateReview, getCourseReviews } from "../api/reviewApi";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [isFavored, setIsFavored] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const token = localStorage.getItem("token");

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const isInCart = savedCart.some(item => item._id === id);
    setAddedToCart(isInCart);

    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlisted(savedWishlist.some(item => item._id === id));
  }, [id]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await getCourseById(id);
        const courseData = res.data || res;
        setCourse(courseData);
        
        // Check if user is enrolled
        if (user && courseData.students) {
          setIsEnrolled(courseData.students.some(s => s._id === user._id));
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, user]);

  // Fetch related courses by category for more relevant recommendations
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await getCourses();
        const allCourses = res.data || res || [];
        const filtered = allCourses
          .filter(c => c._id !== id && c.category === course?.category)
          .slice(0, 4);
        setRelatedCourses(filtered.length ? filtered : allCourses.filter(c => c._id !== id).slice(0, 4));
      } catch (err) {
        console.error("Error fetching related courses:", err);
      }
    };
    if (course) fetchRelated();
  }, [id, course]);

  // Fetch reviews and favorite status once the course is available
  useEffect(() => {
    if (id && token) {
      fetchReviews();
      checkIfFavored();
    }
  }, [id, token]);

  const fetchReviews = async () => {
    try {
      const res = await getCourseReviews(id);
      setReviews(res.reviews || []);
      setAvgRating(parseFloat(res.avgRating) || 0);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkIfFavored = async () => {
    try {
      if (!token) return;
      const res = await checkIsFavored(id);
      setIsFavored(res.isFavored || false);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const getCourseDuration = () => {
    const minutes = course?.modules?.reduce((moduleTotal, module) => {
      return moduleTotal + (module.lessons?.reduce((lessonTotal, lesson) => lessonTotal + (Number(lesson.duration) || 0), 0) || 0);
    }, 0) || 0;

    if (minutes > 0) {
      return `${Math.ceil(minutes / 60)} hours`;
    }

    const lessons = course?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 1;
    return `${Math.max(1, lessons * 5)} hours`;
  };

  const buildEmbedUrl = (url) => {
    if (!url) return url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
    }
    if (url.includes('vimeo.com')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  const isEmbedUrl = (url) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be') || url?.includes('vimeo.com');
  };

  const getFirstVideoLesson = () => {
    if (!course?.modules?.length) return null;
    const allLessons = course.modules.flatMap(module => module.lessons || []);
    return allLessons.find(lesson => lesson.type === 'video' || lesson.videoUrl || lesson.videoFile?.filename);
  };

  const getVideoSource = (url, file) => {
    if (file?.filename) {
      return {
        type: 'file',
        src: `http://localhost:5000/uploads/videos/${file.filename}`
      };
    }
    if (!url) return null;
    if (isEmbedUrl(url)) {
      return {
        type: 'embed',
        src: buildEmbedUrl(url)
      };
    }
    return {
      type: 'video',
      src: url
    };
  };

  const getPreviewVideoSource = () => {
    const lesson = getFirstVideoLesson();
    if (course?.previewVideoUrl) {
      return getVideoSource(course.previewVideoUrl, null);
    }
    if (lesson?.videoFile?.filename) {
      return getVideoSource(null, lesson.videoFile);
    }
    if (lesson?.videoUrl) {
      return getVideoSource(lesson.videoUrl, null);
    }
    return null;
  };

  const getFullVideoSource = () => {
    if (course?.videoFile?.filename) {
      return getVideoSource(null, course.videoFile);
    }

    if (course?.videoUrl) {
      return getVideoSource(course.videoUrl, null);
    }

    return null;
  };

  const getArticleCount = () => course?.modules?.reduce((total, module) => total + (module.lessons?.filter(lesson => lesson.type === 'text').length || 0), 0) || 0;
  const getResourceCount = () => course?.modules?.reduce((total, module) => total + (module.lessons?.filter(lesson => lesson.type === 'pdf' || lesson.pdfFile?.filename).length || 0), 0) || 0;
  const getTotalLessons = () => course?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;
  const getModuleCount = () => course?.modules?.length || 0;

  const handleEnroll = async () => {
    if (!user || !token) {
      alert("You must be logged in to enroll in a course.");
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      navigate(`/course-player/${course._id}`);
      return;
    }

    try {
      await enrollCourse(course._id);
      setIsEnrolled(true);
      navigate(`/course-player/${course._id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes("Token")) {
        alert("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (errorMessage.includes("Already enrolled")) {
        setIsEnrolled(true);
        navigate(`/course-player/${course._id}`);
      } else {
        alert("Error: " + errorMessage);
      }
    }
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  const addToCart = () => {
    if (!course) return;
    
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
      instructor: course.professor?.username || course.teacher?.username || 'Instructeur',
      duration: course.duration || '10 heures',
      rating: course.rating || 4.5,
      reviews: course.reviews || 100
    };
    
    const updatedCart = [...savedCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setAddedToCart(true);
    
    // Show feedback
    alert('Cours ajouté au panier !');
  };

  const handleWishlist = () => {
    if (!course) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.some(item => item._id === course._id)) {
      alert('Ce cours est déjà dans votre wishlist.');
      return;
    }
    const updated = [...wishlist, { _id: course._id, title: course.title, price: course.price, coverImage: course.coverImage }];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlisted(true);
    alert('Cours ajouté à la wishlist !');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Lien du cours copié !');
    } catch (error) {
      console.error(error);
      alert('Impossible de copier le lien. Merci de le copier manuellement.');
    }
  };

  const toggleExpandSections = () => {
    setSectionsExpanded(prev => !prev);
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      alert("Vous devez être connecté pour ajouter aux favoris.");
      navigate('/login');
      return;
    }

    if (favoriteLoading) {
      return;
    }

    setFavoriteLoading(true);
    try {
      const res = await toggleFavorite(id);
      if (res?.success) {
        setIsFavored(res.isFavored);
        alert(res.message || (res.isFavored ? 'Ajouté aux favoris' : 'Retiré des favoris'));
      } else {
        alert(res.message || "Erreur lors de la mise à jour des favoris");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Erreur lors de l'ajout aux favoris");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert("Vous devez être connecté pour donner un avis.");
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      alert("Veuillez écrire un commentaire");
      return;
    }

    try {
      setSubmittingReview(true);
      await addOrUpdateReview(id, newReview.rating, newReview.comment);
      setNewReview({ rating: 5, comment: '' });
      alert('Avis enregistré avec succès !');
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Erreur lors de l'enregistrement de l'avis");
    } finally {
      setSubmittingReview(false);
    }
  };

  const previewVideoSource = getPreviewVideoSource();
  const fullVideoSource = getFullVideoSource();
  const previewVideoTitle = getFirstVideoLesson()?.title || course?.title || 'Course preview';
  const courseLanguage = course?.language || 'English';
  const courseStudentsCount = course?.students?.length || 0;
  const courseTotalReviews = course?.stats?.totalReviews || reviews.length || 0;
  const courseAverageRating = course?.stats?.averageRating || avgRating || 0;
  const instructorName = course?.professor?.username || 'Instructor';
  const instructorRating = course?.professor?.rating || courseAverageRating || 4.5;
  const instructorStudents = course?.professor?.studentsCount || courseStudentsCount || 0;
  const instructorCoursesCount = course?.professor?.coursesCount || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = couponApplied ? (course.price * 0.8).toFixed(2) : course.price;
  
  // Generate dynamic learning outcomes based on course title
  const learningOutcomes = course.learningOutcomes || [
    `Master the fundamentals of ${course.title}`,
    "Understand practical techniques and methods",
    "Apply concepts in real-world scenarios",
    "Build complete projects from scratch",
    "Earn a certificate of completion",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Dark Header Section */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link to="/courses" className="hover:text-white">Courses</Link>
            <span>›</span>
            <Link to="/courses" className="hover:text-white capitalize">{course.courseType || 'General'}</Link>
            <span>›</span>
            <span className="text-white">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-slate-300 mb-6">{course.description}</p>
              
              {/* Creator & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <span className="flex items-center gap-1 text-amber-400">
                  <FiStar className="fill-current" />
                  <span className="font-bold">{courseAverageRating.toFixed(1)}</span>
                  <span className="text-slate-400">({courseTotalReviews} ratings)</span>
                </span>
                <span className="text-slate-400">{courseStudentsCount.toLocaleString()} students</span>
                {course.professor && (
                  <>
                    <span className="text-slate-400">Created by</span>
                    <Link to="#" className="text-emerald-400 hover:underline underline-offset-4">
                      {instructorName}
                    </Link>
                  </>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <FiGlobe className="w-4 h-4" />
                  {courseLanguage}
                </span>
                <span className="flex items-center gap-1">
                  <FiAward className="w-4 h-4" />
                  Certificate of completion
                </span>
              </div>
            </div>

            {/* Video Preview Card (Mobile) */}
            <div className="lg:hidden">
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                {previewVideoSource?.type === 'file' || previewVideoSource?.type === 'video' ? (
                  <VideoPlayer
                    src={previewVideoSource.src}
                    title={previewVideoTitle}
                    poster={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : undefined}
                    className="w-full h-full"
                  />
                ) : previewVideoSource?.type === 'embed' ? (
                  <iframe
                    src={previewVideoSource.src}
                    title={`${previewVideoTitle} - Preview`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : course.coverImage ? (
                  <img 
                    src={`http://localhost:5000/uploads/covers/${course.coverImage.filename}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <>
                    {course.courseType === 'video' ? (
                      <FiPlayCircle className="w-16 h-16 text-white/80" />
                    ) : course.courseType === 'pdf' ? (
                      <FiFileText className="w-16 h-16 text-white/80" />
                    ) : (
                      <FiBookOpen className="w-16 h-16 text-white/80" />
                    )}
                  </>
                )}
                {previewVideoSource && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-3 text-white text-sm">
                    Preview: {previewVideoTitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <section className="border border-slate-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {learningOutcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-slate-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content - Dynamic based on course type */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Course content</h2>
                <button onClick={toggleExpandSections} className="text-emerald-600 text-sm font-medium hover:underline">
                  {sectionsExpanded ? 'Collapse all sections' : 'Expand all sections'}
                </button>
              </div>
              <div className="mb-4 text-sm text-slate-500">
                {getModuleCount()} sections • {getTotalLessons()} lessons • {getCourseDuration()}
              </div>

              {course.modules?.length > 0 && (
                <div className="space-y-4 mb-6">
                  {course.modules.map((module, mIdx) => (
                    <div key={mIdx} className="rounded-3xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <p className="text-slate-500 text-sm">Section {mIdx + 1}</p>
                          <h3 className="font-semibold text-slate-900">{module.title || `Module ${mIdx + 1}`}</h3>
                        </div>
                        <span className="text-sm text-slate-500">{module.lessons?.length || 0} lessons</span>
                      </div>
                      {sectionsExpanded && module.lessons?.length > 0 && (
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{lesson.title || `Leçon ${lIdx + 1}`}</p>
                                  <p className="text-slate-500 text-sm">
                                    {lesson.type === 'video' ? 'Video lesson' : lesson.type === 'pdf' ? 'PDF lesson' : 'Text lesson'}
                                  </p>
                                </div>
                                <span className="text-sm text-slate-500">{lesson.duration ? `${lesson.duration} min` : '—'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic content based on course type */}
              {course.courseType === 'video' && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FiVideo className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Video Course</h3>
                      <p className="text-sm text-slate-500">On-demand video content</p>
                    </div>
                  </div>
                  
                  {/* Show video if available and enrolled/free */}
                  {(course.price === 0 || isEnrolled) && token && fullVideoSource ? (
                    fullVideoSource.type === 'embed' ? (
                      <iframe
                        src={fullVideoSource.src}
                        title={`${course.title} - Video`}
                        className="w-full h-[400px] rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <VideoPlayer
                        src={fullVideoSource.src}
                        title={course.title}
                        poster={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : undefined}
                        className="h-[400px] rounded-lg"
                      />
                    )
                  ) : previewVideoSource ? (
                    previewVideoSource.type === 'embed' ? (
                      <iframe
                        src={previewVideoSource.src}
                        title={`${previewVideoTitle} - Preview`}
                        className="w-full h-[400px] rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <VideoPlayer
                        src={previewVideoSource.src}
                        title={previewVideoTitle}
                        poster={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : undefined}
                        className="h-[400px] rounded-lg"
                      />
                    )
                  ) : (
                    <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <FiPlayCircle className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">
                          {course.price > 0 && !isEnrolled ? "Enroll to watch the video" : "Video content available"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {course.courseType === 'pdf' && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">PDF Document</h3>
                      <p className="text-sm text-slate-500">Downloadable PDF content</p>
                    </div>
                  </div>
                  
                  {(course.price === 0 || isEnrolled) && token && course.pdfFile?.filename ? (
                    <PDFReader
                      src={`http://localhost:5000/uploads/pdfs/${course.pdfFile.filename}`}
                      title={course.title}
                    />
                  ) : (
                    <div className="bg-slate-200 rounded-lg p-8 flex items-center justify-center">
                      <div className="text-center">
                        <FiFileText className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">
                          {course.price > 0 && !isEnrolled ? "Enroll to access the PDF" : "PDF content available"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {course.courseType === 'text' && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FiBookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Text Course</h3>
                      <p className="text-sm text-slate-500">Written content and materials</p>
                    </div>
                  </div>
                  
                  <div className="prose prose-slate max-w-none bg-white p-6 rounded-lg border border-slate-200">
                    <pre className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
                      {course.content || "Course content will be available here."}
                    </pre>
                  </div>
                </div>
              )}
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Basic understanding of programming concepts</li>
                <li>A computer with internet access</li>
                <li>Willingness to learn and practice</li>
              </ul>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700">
                <p>{course.content || course.description}</p>
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Learning Objectives:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {course.learningObjectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-4">
                  This comprehensive course will take you from beginner to advanced level.
                  You'll learn through practical examples and real-world projects.
                </p>
              </div>
            </section>

            {/* Instructor */}
            <section className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                  {course.professor?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <Link to="#" className="text-emerald-600 font-semibold hover:underline">
                    {course.professor?.username || 'Alex Instructor'}
                  </Link>
                  <p className="text-slate-500 text-sm mb-2">{course.professor?.jobTitle || 'Senior Developer & Instructor'}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-amber-500" />
                      {instructorRating.toFixed(1)} Rating
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      {instructorStudents.toLocaleString()} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <FiPlayCircle className="w-4 h-4" />
                      {instructorCoursesCount || '1'} Courses
                    </span>
                  </div>
                  <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                    {course.professor?.bio || 'Experienced instructor with real-world industry experience and a passion for teaching.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews - Real if available */}
            <section className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Student feedback</h2>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-amber-500">{avgRating}</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={i < Math.floor(avgRating) ? "fill-current" : ""} />
                    ))}
                  </div>
                  <span className="text-slate-500">Course Rating</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                          {(review.user?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{review.user?.username || 'Student'}</p>
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(review.rating || 5)].map((_, i) => (
                              <FiStar key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-slate-400 text-sm ml-auto">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm">{review.comment || review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500">
                  <p>Aucun avis pour l'instant. Soyez le premier à donner votre avis !</p>
                </div>
              )}

              {/* Submit Review Form */}
              {isEnrolled && token && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Donnez votre avis</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Note (1-5 étoiles)
                      </label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2"
                      >
                        <option value="5">5 étoiles - Excellent</option>
                        <option value="4">4 étoiles - Très bon</option>
                        <option value="3">3 étoiles - Correct</option>
                        <option value="2">2 étoiles - Acceptable</option>
                        <option value="1">1 étoile - Pauvre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Votre avis
                      </label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Partagez votre expérience avec ce cours..."
                        rows="4"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <FiSend className="w-4 h-4" />
                      {submittingReview ? 'Envoi en cours...' : 'Publier votre avis'}
                    </button>
                  </form>
                </div>
              )}
            </section>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <section className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">More courses by {course.professor?.username || 'this instructor'}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedCourses.map((related) => (
                    <Link
                      key={related._id}
                      to={`/courses/${related._id}`}
                      className="flex gap-3 p-3 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="w-24 h-16 bg-slate-200 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {related.coverImage?.filename ? (
                          <img
                            src={`http://localhost:5000/uploads/covers/${related.coverImage.filename}`}
                            alt={related.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{related.courseType === 'video' ? '🎥' : '📚'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">{related.title}</h4>
                        <p className="text-slate-500 text-xs mt-1">{related.professor?.username || 'Instructor'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-500 text-xs font-bold">{(related.stats?.averageRating || 4.5).toFixed(1)}</span>
                          <span className="text-slate-400 text-xs">({related.stats?.totalReviews || 0})</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm mt-1">
                          {related.price === 0 ? 'Gratuit' : `${related.price?.toFixed(2) || '0.00'} $`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* Course Preview - Cover Image or Video */}
              <div className="hidden lg:block aspect-video bg-slate-900 rounded-lg overflow-hidden relative group cursor-pointer">
                {previewVideoSource?.type === 'file' || previewVideoSource?.type === 'video' ? (
                  <VideoPlayer
                    src={previewVideoSource.src}
                    title={previewVideoTitle}
                    poster={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : undefined}
                    className="w-full h-full"
                  />
                ) : previewVideoSource?.type === 'embed' ? (
                  <iframe
                    src={previewVideoSource.src}
                    title={`${previewVideoTitle} - Preview`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : course.coverImage ? (
                  <>
                    <img 
                      src={`http://localhost:5000/uploads/covers/${course.coverImage.filename}`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <FiPlay className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-medium">Preview this course</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <FiPlay className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-medium">Preview this course</p>
                    </div>
                  </>
                )}
                {previewVideoSource && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-3 text-white text-sm">
                    Preview: {previewVideoTitle}
                  </div>
                )}
              </div>

              {/* Pricing Card */}
              <div className="border border-slate-200 rounded-lg p-6">
                {course.price === 0 ? (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-2">Free</p>
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-slate-900">${finalPrice}</span>
                        {couponApplied && (
                          <span className="text-lg text-slate-400 line-through">${course.price}</span>
                        )}
                      </div>
                      {couponApplied ? (
                        <p className="text-emerald-600 text-sm font-medium">Coupon applied!</p>
                      ) : (
                        <p className="text-slate-500 text-sm">One-time payment</p>
                      )}
                    </div>

                    {!user || !token ? (
                      <div className="space-y-3">
                        <Link
                          to="/login"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
                        >
                          Log in to Enroll
                        </Link>
                        <button
                          onClick={addToCart}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                            addedToCart
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {addedToCart ? (
                            <>
                              <FiCheckCircle className="w-5 h-5" />
                              Dans le panier
                            </>
                          ) : (
                            <>
                              <FiShoppingCart className="w-5 h-5" />
                              Ajouter au panier
                            </>
                          )}
                        </button>
                      </div>
                    ) : isEnrolled ? (
                      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors">
                        Continue Learning
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={handleEnroll}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={addToCart}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                            addedToCart
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {addedToCart ? (
                            <>
                              <FiCheckCircle className="w-5 h-5" />
                              Dans le panier
                            </>
                          ) : (
                            <>
                              <FiShoppingCart className="w-5 h-5" />
                              Ajouter au panier
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Coupon */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-900 mb-2">Apply Coupon</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50 transition-colors text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                      {couponApplied && (
                        <p className="text-xs text-emerald-600 mt-1">20% discount applied!</p>
                      )}
                    </div>
                  </>
                )}

                {/* Features */}
                <div className="mt-6 space-y-3 text-sm">
                  <p className="font-medium text-slate-900">This course includes:</p>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiPlayCircle className="w-4 h-4" />
                      <span>{getCourseDuration()} on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FiFileText className="w-4 h-4" />
                      <span>{getArticleCount()} articles</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FiDownload className="w-4 h-4" />
                      <span>{getResourceCount()} downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiAward className="w-4 h-4" />
                    <span>Certificate of completion</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleToggleFavorite} 
                    disabled={favoriteLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded transition-colors text-sm font-medium ${isFavored ? 'bg-red-600 text-white border-red-600' : 'border-slate-300 hover:bg-slate-50 text-slate-900'} ${favoriteLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <FiHeart className={`w-4 h-4 ${isFavored ? 'fill-current' : ''}`} />
                    {isFavored ? 'Favoris' : 'Favoriser'}
                  </button>
                  <button onClick={handleWishlist} className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded transition-colors text-sm font-medium ${wishlisted ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 hover:bg-slate-50 text-slate-900'}`}>
                    <FiHeart className="w-4 h-4" />
                    {wishlisted ? 'In wishlist' : 'Wishlist'}
                  </button>
                  <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors text-sm font-medium">
                    <FiShare2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Team Access */}
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  Training for your team? <Link to="#" className="text-emerald-600 font-medium hover:underline">Get this course for your team</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
