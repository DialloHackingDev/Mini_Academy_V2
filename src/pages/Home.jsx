import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/course?limit=3");
        const data = await res.json();
        const list = (data.data || data).slice(0, 3);
        setLatest(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Composant AnimatedSection
  const AnimatedSection = ({ children }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Full Height */}
      <section className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
            >
              Mini-Academy
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl lg:text-3xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed"
            >
              Transformez votre apprentissage avec des cours interactifs, 
              <span className="text-yellow-300 font-semibold"> des professeurs experts</span> et 
              <span className="text-green-300 font-semibold"> une progression personnalisée</span>
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                to="/courses" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center">
                  🚀 Explorer les cours
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link 
                to="/register" 
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center">
                  ✨ Commencer gratuitement
                  <svg className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
            </Link>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">500+</div>
                <div className="text-blue-200">Cours disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-300 mb-2">10K+</div>
                <div className="text-blue-200">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2">50+</div>
                <div className="text-blue-200">Professeurs experts</div>
          </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center text-white/70">
            <span className="text-sm mb-2">Découvrez plus</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Dernières nouveautés */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                🆕 Dernières nouveautés
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez nos cours les plus récents, créés par des experts passionnés
              </motion.p>
            </motion.div>
            
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {latest.map((course, index) => (
                <motion.div 
                  key={course._id} 
                  variants={fadeInUp}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">
                        {course.courseType === 'video' ? '🎥' : course.courseType === 'pdf' ? '📄' : '📝'}
                      </div>
                      <p className="text-sm font-medium">{course.courseType.toUpperCase()}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                <Link
                  to={`/courses/${course._id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-all duration-200"
                >
                  Voir le cours
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                </Link>
              </div>
                </motion.div>
              ))}
              {latest.length === 0 && (
                <motion.div 
                  variants={fadeInUp}
                  className="col-span-full text-center py-12"
                >
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600 text-lg">Aucun cours pour le moment.</p>
                </motion.div>
              )}
            </motion.div>
        </div>
      </section>
      </AnimatedSection>

      {/* À propos */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInLeft}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  🎯 À propos de Mini-Academy
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Mini-Academy est une plateforme d'apprentissage en ligne révolutionnaire qui connecte des 
                  <span className="text-blue-600 font-semibold"> professeurs passionnés</span> à des 
                  <span className="text-purple-600 font-semibold"> étudiants curieux</span>. 
                  Notre mission est de démocratiser l'éducation de qualité.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Cours interactifs et engageants</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Suivi de progression personnalisé</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-600 font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Communauté d'apprentissage active</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInRight}
                className="relative"
              >
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">🚀 Apprenez partout, à tout moment</h3>
                    <p className="text-blue-100 mb-6 leading-relaxed">
                      Accédez à vos cours depuis n'importe où, sur n'importe quel appareil. 
                      Votre apprentissage ne s'arrête jamais.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-300">24/7</div>
                        <div className="text-blue-200 text-sm">Disponible</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-300">100%</div>
                        <div className="text-blue-200 text-sm">Flexible</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
                </div>
              </motion.div>
          </div>
        </div>
    </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-2">🎓</span>
                  Mini-Academy
                </h3>
                <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                  La plateforme d'apprentissage en ligne qui révolutionne l'éducation. 
                  Apprenez, progressez et excellez avec nos cours de qualité.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors group">
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors group">
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors group">
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors group">
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Quick Links */}
          <div>
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">🔗</span>
                  Liens rapides
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                      <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link to="/courses" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                      <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                      Cours
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                      <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                      <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                      Inscription
                    </Link>
                  </li>
                </ul>
              </motion.div>
          </div>

            {/* Contact */}
          <div>
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">📞</span>
                  Contact
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-300">support@mini-academy.com</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-300">+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-300">Paris, France</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.p 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-gray-400 text-sm"
              >
                © {new Date().getFullYear()} Mini-Academy. Tous droits réservés.
              </motion.p>
              <motion.div 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex space-x-6 mt-4 md:mt-0"
              >
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions légales</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">CGU</a>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
