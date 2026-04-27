import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import api from '../api/api';

export default function VerifyCertificate() {
  const { courseId, userId } = useParams();
  const [status, setStatus] = useState('loading'); // loading | valid | invalid
  const [data, setData] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/progress/verify/${courseId}/${userId}`);
        if (res.data?.success) {
          setData(res.data.data);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (err) {
        setStatus('invalid');
      }
    };
    verify();
  }, [courseId, userId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center"
      >
        {/* Logo */}
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FaGraduationCap className="text-white w-7 h-7" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-6">
          Elevated Academy · Vérification de certificat
        </p>

        {status === 'valid' ? (
          <>
            <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-2">Certificat Authentique</h1>
            <p className="text-gray-500 mb-6">
              Ce certificat est valide et a été décerné par Elevated Academy.
            </p>
            <div className="bg-emerald-50 rounded-2xl p-5 text-left space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Formation</span>
                <span className="font-bold text-gray-900 text-right max-w-[60%]">{data?.courseTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Progression</span>
                <span className="font-bold text-emerald-600">{data?.progressPercentage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Date d'obtention</span>
                <span className="font-bold text-gray-900">
                  {data?.certificateEarnedAt
                    ? new Date(data.certificateEarnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <FiXCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-2">Certificat Invalide</h1>
            <p className="text-gray-500 mb-8">
              Ce certificat n'a pas pu être vérifié. Il est peut-être invalide, expiré ou a été révoqué.
            </p>
          </>
        )}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}
