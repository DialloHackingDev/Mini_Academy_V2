import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlayCircle, FiCheckCircle, FiClock, FiBookOpen } from 'react-icons/fi';
import { FaCertificate } from 'react-icons/fa';

export default function ProgressView({ courses, progressions }) {
  
  const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
           <FiBookOpen className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Aucun cours en cours</h2>
        <p className="text-slate-500 max-w-md mb-8">Vous n'êtes inscrit à aucun cours pour le moment. Explorez notre catalogue pour commencer votre apprentissage.</p>
        <Link to="/courses" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
          Découvrir les cours
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2">Ma Progression</h1>
        <p className="text-sm text-slate-500 font-medium italic">"Chaque pas en avant vous rapproche de votre objectif."</p>
      </div>

      <div className="space-y-6">
        {courses.map((course, index) => {
          const prog = progressions?.find(p => p.courseId === course._id) || { 
            progression: 0, 
            status: 'not-started',
            certificateEarned: false,
            totalTimeSpent: 0,
            lastAccessedAt: null
          };

          const isCompleted = prog.progression === 100;
          const isInProgress = prog.progression > 0 && prog.progression < 100;
          
          return (
            <motion.div 
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col md:flex-row gap-8 items-center"
            >
              {/* Image & Status Badge */}
              <div className="relative w-full md:w-64 h-40 flex-shrink-0 rounded-2xl overflow-hidden shadow-inner">
                <img 
                  src={course.coverImage?.filename ? `http://localhost:5000/uploads/covers/${course.coverImage.filename}` : "https://via.placeholder.com/400x250"} 
                  className="w-full h-full object-cover"
                  alt={course.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 left-3 flex gap-2">
                  {isCompleted ? (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-md">
                      <FiCheckCircle /> Terminé
                    </span>
                  ) : isInProgress ? (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-md">
                      <FiPlayCircle /> En cours
                    </span>
                  ) : (
                    <span className="bg-slate-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-md">
                      Non commencé
                    </span>
                  )}
                </div>
              </div>

              {/* Course Info & Progress Bar */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{course.title}</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mb-6">
                  <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4 text-slate-400" /> Temps passé : {formatTime(prog.totalTimeSpent)}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>Dernier accès : {formatDate(prog.lastAccessedAt)}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm font-black mb-2">
                    <span className={isCompleted ? "text-emerald-600" : "text-slate-700"}>Progression</span>
                    <span className={isCompleted ? "text-emerald-600" : "text-slate-900"}>{prog.progression}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${prog.progression}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${isCompleted ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                    ></motion.div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full md:w-auto flex flex-row md:flex-col gap-3 flex-shrink-0">
                <Link 
                  to={`/course-player/${course._id}`}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                    isCompleted 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-900/20 hover:shadow-emerald-600/30'
                  }`}
                >
                  <FiPlayCircle className="w-5 h-5" />
                  {isCompleted ? "Revoir" : isInProgress ? "Continuer" : "Commencer"}
                </Link>
                
                {prog.certificateEarned && (
                  <Link 
                    to={`/certificate/${course._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-2xl font-black text-sm transition-all shadow-sm"
                  >
                    <FaCertificate className="w-5 h-5" />
                    Certificat
                  </Link>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
