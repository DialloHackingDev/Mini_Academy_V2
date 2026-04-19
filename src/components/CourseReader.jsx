import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import PDFReader from './PDFReader';
import { FaDownload, FaBookOpen, FaClock, FaUser, FaPlay, FaFileAlt, FaVideo, FaFilePdf } from 'react-icons/fa';

export default function CourseReader({ course, onDownload, className = "" }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const getFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEstimatedDuration = (fileSize) => {
    if (!fileSize) return 'Temps variable';
    const minutes = Math.round(fileSize / (1024 * 1024 * 0.5));
    return `${minutes} min estimées`;
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(course.courseType);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                {course.courseType === 'video' ? (
                  <FaVideo className="w-6 h-6 text-white" />
                ) : course.courseType === 'pdf' ? (
                  <FaFilePdf className="w-6 h-6 text-white" />
                ) : (
                  <FaFileAlt className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 capitalize">{course.courseType}</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4" />
                <span>
                  {course.courseType === 'video' && course.videoFile?.size 
                    ? getEstimatedDuration(course.videoFile.size)
                    : 'Temps variable'
                  }
                </span>
              </div>
              
              {course.courseType === 'video' && course.videoFile && (
                <div className="flex items-center space-x-2">
                  <span>📁</span>
                  <span>{getFileSize(course.videoFile.size)}</span>
                </div>
              )}
              
              {course.courseType === 'pdf' && course.pdfFile && (
                <div className="flex items-center space-x-2">
                  <span>📁</span>
                  <span>{getFileSize(course.pdfFile.size)}</span>
                </div>
              )}
              
              {course.professor && (
                <div className="flex items-center space-x-2">
                  <FaUser className="w-4 h-4" />
                  <span>Par {course.professor.username}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Course Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      >
        {course.courseType === "video" ? (
          course.videoFile ? (
            <VideoPlayer
              src={`http://localhost:5000/uploads/videos/${course.videoFile.filename}`}
              title={course.title}
              downloadUrl={`http://localhost:5000/api/course/${course._id}/download/video`}
              className="h-[600px]"
            />
          ) : course.videoUrl ? (
            <VideoPlayer
              src={course.videoUrl}
              title={course.title}
              className="h-[600px]"
            />
          ) : (
            <div className="bg-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune vidéo disponible</h3>
              <p className="text-gray-600">Ce cours ne contient pas de vidéo pour le moment.</p>
            </div>
          )
        ) : course.courseType === "pdf" ? (
          course.pdfFile ? (
            <PDFReader
              src={`http://localhost:5000/uploads/pdfs/${course.pdfFile.filename}`}
              title={course.title}
              downloadUrl={`http://localhost:5000/api/course/${course._id}/download/pdf`}
            />
          ) : (
            <div className="bg-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun PDF disponible</h3>
              <p className="text-gray-600">Ce cours ne contient pas de PDF pour le moment.</p>
            </div>
          )
        ) : course.courseType === "text" ? (
          <div className="p-8">
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                  {course.content}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* Course Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload className="w-4 h-4" />
            <span>Télécharger le cours</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaFileAlt className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaBookOpen className="w-4 h-4" />
            <span>Retour aux cours</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
