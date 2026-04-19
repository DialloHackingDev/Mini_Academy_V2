import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function CertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseRes = await api.get(`/course/${courseId}`);
        const courseData = courseRes.data?.data || courseRes.data;
        
        // Fetch user progression
        const progRes = await api.get(`/progress/${courseId}`);
        const progData = progRes.data?.data;

        if (!progData || progData.progressPercentage < 100 || !progData.certificateEarned) {
          setError("Ce certificat n'est pas encore disponible ou vous n'avez pas terminé le cours.");
        } else {
          setCourse(courseData);
          setProgression(progData);
        }
      } catch (err) {
        console.error("Error fetching certificate data:", err);
        setError("Erreur lors de la récupération des informations du certificat.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [courseId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/student-dashboard" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold inline-flex items-center gap-2">
            <FiArrowLeft /> Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const dateObtention = new Date(progression.certificateEarnedAt || new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const verifyUrl = `${window.location.origin}/verify-cert/${courseId}/${user._id}`;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center print:bg-white print:p-0 print:py-0">
      {/* Controls (Hidden during print) */}
      <div className="max-w-5xl w-full flex justify-between items-center mb-8 print:hidden">
        <Link to="/student-dashboard" className="text-slate-600 hover:text-emerald-600 flex items-center gap-2 font-bold transition-colors">
          <FiArrowLeft /> Retour
        </Link>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FiPrinter /> Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Certificate Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white shadow-2xl overflow-hidden w-full max-w-[1100px] aspect-[1.414/1] print:shadow-none print:w-full print:h-screen print:max-w-none"
        style={{
          boxSizing: 'border-box'
        }}
        ref={certificateRef}
      >
        {/* Corner Decor - Top Left */}
        <div className="absolute top-0 left-0 w-64 h-64 overflow-hidden pointer-events-none">
           <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-[#111] transform -rotate-45 translate-x-[-20%] translate-y-[-20%]"></div>
           <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-[#f59e0b] transform -rotate-45 translate-x-[20%] translate-y-[-5%] border-[16px] border-white z-[-1]"></div>
           <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-gray-200 transform -rotate-45 translate-x-[35%] translate-y-[10%] z-[-2]"></div>
        </div>

        {/* Corner Decor - Bottom Right */}
        <div className="absolute bottom-0 right-0 w-64 h-64 overflow-hidden pointer-events-none rotate-180">
           <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-[#111] transform -rotate-45 translate-x-[-20%] translate-y-[-20%]"></div>
           <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-[#f59e0b] transform -rotate-45 translate-x-[20%] translate-y-[-5%] border-[16px] border-white z-[-1]"></div>
           <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-gray-200 transform -rotate-45 translate-x-[35%] translate-y-[10%] z-[-2]"></div>
        </div>

        {/* Certificate Content */}
        <div className="absolute inset-[30px] border-[1px] border-gray-200 flex flex-col items-center justify-center p-12 text-center bg-white/80 z-10">
          
          <div className="mb-8 mt-12">
            <h1 className="text-5xl md:text-6xl font-black text-[#111] tracking-widest mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              CERTIFICATE
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-500 tracking-[0.2em] uppercase">
              Of Achievement
            </h2>
          </div>

          <div className="mb-10 relative">
            <div className="bg-[#f59e0b] text-white px-8 py-2 font-bold tracking-widest text-sm uppercase relative z-10 mx-auto inline-block">
              Ce certificat est fièrement décerné à
            </div>
            {/* Ribbon ends */}
            <div className="absolute top-0 -left-3 w-4 h-full bg-[#d97706] skew-x-[30deg] z-0"></div>
            <div className="absolute top-0 -right-3 w-4 h-full bg-[#d97706] -skew-x-[30deg] z-0"></div>
          </div>

          <div className="mb-10 w-full">
            <h3 className="text-6xl md:text-7xl font-medium text-[#111] mb-6" style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}>
              {user.username}
            </h3>
            <p className="max-w-2xl mx-auto text-gray-600 text-sm md:text-base leading-relaxed">
              a suivi et complété avec succès la formation professionnelle 
              <br />
              <strong className="text-black font-bold text-lg mt-2 inline-block">"{course.title}"</strong>
              <br />
              Démontrant une maîtrise des compétences requises et un engagement exceptionnel envers l'apprentissage continu.
            </p>
          </div>

          <div className="flex justify-between items-end w-full max-w-4xl mt-auto pt-10 pb-6">
            {/* Date Section */}
            <div className="text-center w-48">
              <div className="border-b-2 border-black pb-2 mb-2 font-bold text-lg">
                {dateObtention}
              </div>
              <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                Date
              </div>
            </div>

            {/* Badge / Logo */}
            <div className="flex flex-col items-center justify-center -mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Sunburst badge effect with CSS */}
                <div className="absolute inset-0 bg-[#f59e0b] rounded-full scale-110" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
                <div className="absolute inset-2 bg-[#111] rounded-full border-2 border-[#f59e0b] border-dashed flex flex-col items-center justify-center text-center p-2 z-10">
                  <span className="text-[#f59e0b] text-[10px] font-black uppercase tracking-widest leading-tight">Academy</span>
                  <span className="text-white text-xs font-bold uppercase tracking-widest border-t border-b border-[#f59e0b]/30 py-1 my-1">Certified</span>
                  <span className="text-[#f59e0b] text-[10px] font-black uppercase tracking-widest">{new Date(progression?.certificateEarnedAt || new Date()).getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="text-center w-48">
              <div className="border-b-2 border-black pb-2 mb-2 font-black text-2xl text-slate-800" style={{ fontFamily: 'Arial, sans-serif' }}>
                ELEVATED ACADEMY
              </div>
              <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                La Direction
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="absolute bottom-10 left-10 flex flex-col items-center">
             <div className="p-1 bg-white border border-gray-200 shadow-sm">
                <QRCode value={verifyUrl} size={64} />
             </div>
             <span className="text-[8px] text-gray-400 mt-1 uppercase tracking-widest">Scan to Verify</span>
          </div>

        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
