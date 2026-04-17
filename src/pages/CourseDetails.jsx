import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/fi";
import { getCourseById, enrollCourse } from "../api/courApi";
import { getCourses } from "../api/courApi";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/VideoPlayer";
import PDFReader from "../components/PDFReader";

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
  const token = localStorage.getItem("token");

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const isInCart = savedCart.some(item => item._id === id);
    setAddedToCart(isInCart);
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

  // Fetch related courses
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await getCourses();
        const allCourses = res.data || res || [];
        // Filter out current course and limit to 4
        const filtered = allCourses.filter(c => c._id !== id).slice(0, 4);
        setRelatedCourses(filtered);
      } catch (err) {
        console.error("Error fetching related courses:", err);
      }
    };
    fetchRelated();
  }, [id]);

  const handleEnroll = async () => {
    if (!user || !token) {
      alert("You must be logged in to enroll in a course.");
      navigate('/login');
      return;
    }

    try {
      await enrollCourse(course._id);
      setIsEnrolled(true);
      alert("Successfully enrolled! You can now access the course content.");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes("Token")) {
        alert("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (errorMessage.includes("Already enrolled")) {
        setIsEnrolled(true);
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
          <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 font-medium">
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

  // Use real course stats if available, otherwise defaults
  const courseStats = course.stats || {};
  const avgRating = courseStats.averageRating || 4.5;
  const totalReviews = courseStats.totalReviews || 598;
  const totalStudents = courseStats.totalStudents || course.students?.length || 3714;

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
                  <span className="font-bold">{avgRating}</span>
                  <span className="text-slate-400">({totalReviews} ratings)</span>
                </span>
                <span className="text-slate-400">{totalStudents.toLocaleString()} students</span>
                {course.professor && (
                  <>
                    <span className="text-slate-400">Created by</span>
                    <Link to="#" className="text-indigo-400 hover:underline underline-offset-4">
                      {course.professor.username}
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
                  English
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
                {course.coverImage ? (
                  <img 
                    src={`http://localhost:3000/uploads/covers/${course.coverImage.filename}`}
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
                <button className="text-indigo-600 text-sm font-medium hover:underline">
                  Expand all sections
                </button>
              </div>
              
              {/* Dynamic content based on course type */}
              {course.courseType === 'video' && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FiVideo className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Video Course</h3>
                      <p className="text-sm text-slate-500">On-demand video content</p>
                    </div>
                  </div>
                  
                  {/* Show video if available and enrolled/free */}
                  {(course.price === 0 || isEnrolled) && token && course.videoFile?.filename ? (
                    <VideoPlayer
                      src={`http://localhost:3000/uploads/videos/${course.videoFile.filename}`}
                      title={course.title}
                      className="h-[400px] rounded-lg"
                    />
                  ) : course.videoUrl && (course.price === 0 || isEnrolled) && token ? (
                    <VideoPlayer
                      src={course.videoUrl}
                      title={course.title}
                      className="h-[400px] rounded-lg"
                    />
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
                      src={`http://localhost:3000/uploads/pdfs/${course.pdfFile.filename}`}
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                  {course.professor?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <Link to="#" className="text-indigo-600 font-semibold hover:underline">
                    {course.professor?.username || 'Alex Instructor'}
                  </Link>
                  <p className="text-slate-500 text-sm mb-2">Senior Developer & Instructor</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-amber-500" />
                      4.5 Instructor Rating
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      12,356 Students
                    </span>
                    <span className="flex items-center gap-1">
                      <FiPlayCircle className="w-4 h-4" />
                      22 Courses
                    </span>
                  </div>
                  <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                    Experienced instructor with over 10 years in the industry.
                    Passionate about teaching and helping students achieve their goals.
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

              {course.reviews && course.reviews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {course.reviews.map((review, idx) => (
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
                  <p>No reviews yet. Be the first to review this course!</p>
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
                      <div className="w-24 h-16 bg-slate-200 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{related.courseType === 'video' ? '🎥' : '📚'}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">{related.title}</h4>
                        <p className="text-slate-500 text-xs mt-1">{related.professor?.username || 'Instructor'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-500 text-xs font-bold">4.5</span>
                          <span className="text-slate-400 text-xs">({Math.floor(Math.random() * 1000) + 100})</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm mt-1">
                          ${related.price || 0}
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
                {course.coverImage ? (
                  <>
                    <img 
                      src={`http://localhost:3000/uploads/covers/${course.coverImage.filename}`}
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
              </div>

              {/* Pricing Card */}
              <div className="border border-slate-200 rounded-lg p-6">
                {course.price === 0 ? (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-2">Free</p>
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
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
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
                        >
                          Log in to Enroll
                        </Link>
                        <button
                          onClick={addToCart}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                            addedToCart
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
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
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={addToCart}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                            addedToCart
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
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
                          className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors text-sm font-medium"
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
                    <span>5 hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiFileText className="w-4 h-4" />
                    <span>15 articles</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiDownload className="w-4 h-4" />
                    <span>25 downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiGlobe className="w-4 h-4" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiAward className="w-4 h-4" />
                    <span>Certificate of completion</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors text-sm font-medium">
                    <FiHeart className="w-4 h-4" />
                    Wishlist
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors text-sm font-medium">
                    <FiShare2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Team Access */}
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  Training for your team? <Link to="#" className="text-indigo-600 font-medium hover:underline">Get this course for your team</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
