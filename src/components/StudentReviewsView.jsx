import { useState, useEffect } from "react";
import { FiStar, FiMessageSquare, FiClock, FiBookOpen } from "react-icons/fi";
import { getMyReviews } from "../api/reviewApi";
import { motion } from "framer-motion";

export default function StudentReviewsView() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getMyReviews();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Mes Avis</h2>
        <p className="text-slate-500 font-medium">Retrouvez tous les témoignages et notes que vous avez laissés sur les cours.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FiMessageSquare className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-bold">Vous n'avez pas encore laissé d'avis.</p>
          <p className="text-slate-400 text-sm mt-1">Partagez votre expérience sur les cours que vous avez suivis !</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                   <img 
                    src={review.courseId?.coverImage?.filename ? `http://localhost:5000/uploads/covers/${review.courseId.coverImage.filename}` : "https://via.placeholder.com/200x120"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt=""
                   />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">{review.courseId?.title}</h3>
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">
                      <FiStar className="fill-current" />
                      {review.rating}/5
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(review.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl relative">
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-50 rotate-45"></div>
                    <p className="text-slate-700 italic leading-relaxed text-sm">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
