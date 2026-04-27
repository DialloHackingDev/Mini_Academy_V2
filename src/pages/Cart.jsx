import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiArrowRight,
  FiCreditCard,
  FiCheckCircle,
  FiX,
  FiHeart,
  FiBookOpen,
  FiStar,
  FiClock,
  FiUser,
  FiShield,
  FiTruck,
  FiRefreshCw
} from "react-icons/fi";
import { FaGraduationCap, FaPaypal, FaApple, FaGooglePay } from "react-icons/fa";
import AmazonNavbar from "../components/AmazonNavbar";

import { getCourses } from "../api/courApi";
import api from "../api/api";

export default function Cart() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const navigate = useNavigate();

  // Load recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const data = await getCourses();
      const coursesData = data.data || data;
      // Get 4 random courses as recommendations, excluding what's already in cart
      const currentCartIds = new Set(JSON.parse(localStorage.getItem('cart') || '[]').map(item => item._id));
      const filtered = coursesData
        .filter(c => !currentCartIds.has(c._id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setRecommendations(filtered);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };


  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, delta) => {
    setCartItems(items =>
      items.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item._id !== id));
  };

  const clearCart = () => {
    if (window.confirm('Voulez-vous vraiment vider votre panier ?')) {
      setCartItems([]);
    }
  };

  const addToCart = (course) => {
    const existingItem = cartItems.find(item => item._id === course._id);
    if (existingItem) {
      updateQuantity(course._id, 1);
    } else {
      const cartItem = {
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        originalPrice: course.originalPrice || Math.round(course.price * 1.5) || (course.price + 30),
        quantity: 1,
        image: course.coverImage,
        instructor: course.professor?.username || 'Instructeur',
        duration: course.duration || '12 heures',
        rating: course.rating || 4.5,
        reviews: course.reviews || 120
      };
      setCartItems([...cartItems, cartItem]);
      // Remove from recommendations if added
      setRecommendations(prev => prev.filter(r => r._id !== course._id));
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'academy20') {
      setPromoApplied(true);
      setDiscount(0.20); // 20% discount
      alert('Code promo appliqué ! Vous économisez 20%');
    } else {
      alert('Code promo invalide');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;
  const totalSavings = cartItems.reduce((sum, item) => 
    sum + ((item.originalPrice - item.price) * item.quantity), 0
  ) + discountAmount;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate 2s payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Register each purchased course in the backend
      const purchasePromises = cartItems.map(item =>
        api.post(`/purchase/${item._id}`).catch(err => {
          // Ignore "already purchased" errors (course may already be bought)
          console.warn(`Could not purchase ${item._id}:`, err.response?.data?.msg || err.message);
        })
      );
      await Promise.all(purchasePromises);

      setIsProcessing(false);
      setPaymentSuccess(true);

      // Clear cart after successful payment
      setTimeout(() => {
        setCartItems([]);
        localStorage.removeItem('cart');
      }, 3000);

    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
      alert("Une erreur est survenue lors du paiement. Veuillez réessayer.");
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AmazonNavbar />
        <div className="pt-24 pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 mb-8">
              Merci pour votre achat. Vous recevrez un email de confirmation avec les détails de votre commande.
            </p>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro de commande</span>
                  <span className="font-medium">#ACD-{Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant payé</span>
                  <span className="font-bold text-emerald-600">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                to="/student-dashboard"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Accéder à mes cours
              </Link>
              <Link
                to="/courses"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Continuer les achats
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AmazonNavbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiShoppingCart className="w-8 h-8 text-emerald-600" />
              Mon Panier
              <span className="text-lg font-normal text-gray-500">
                ({cartItems.length} {cartItems.length > 1 ? 'cours' : 'cours'})
              </span>
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Votre panier est vide
              </h2>
              <p className="text-gray-600 mb-8">
                Découvrez nos cours et commencez votre apprentissage dès aujourd'hui.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Explorer les cours
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Clear Cart Button */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} articles dans votre panier
                  </p>
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Vider le panier
                  </button>
                </div>

                {/* Cart Items List */}
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex gap-6">
                          {/* Course Image */}
                          <div className="w-32 h-24 bg-gradient-to-br from-emerald-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaGraduationCap className="w-10 h-10 text-emerald-400" />
                          </div>

                          {/* Course Info */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Link
                                  to={`/courses/${item._id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1"
                                >
                                  {item.title}
                                </Link>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(item._id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Instructor & Rating */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <FiUser className="w-4 h-4" />
                                {item.instructor}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                {item.rating} ({item.reviews} avis)
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                {item.duration}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  ${item.price}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                  -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Promo Code */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Code promo</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Entrez votre code (ex: ACADEMY20)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                      <FiCheckCircle className="w-4 h-4" />
                      Code promo ACADEMY20 appliqué (-20%)
                    </p>
                  )}
                </div>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-8 py-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-2">
                    <FiShield className="w-5 h-5 text-emerald-600" />
                    Paiement sécurisé
                  </span>
                  <span className="flex items-center gap-2">
                    <FiRefreshCw className="w-5 h-5 text-emerald-600" />
                    Remboursement 30 jours
                  </span>
                  <span className="flex items-center gap-2">
                    <FiTruck className="w-5 h-5 text-emerald-600" />
                    Accès immédiat
                  </span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Récapitulatif
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Réduction (20%)</span>
                        <span>-{discountAmount.toFixed(2)} $</span>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-600">
                      <span>Économies</span>
                      <span>-{totalSavings.toFixed(2)} $</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Taxes incluses
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
                  >
                    Procéder au paiement
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    En complétant votre achat, vous acceptez nos{' '}
                    <Link to="#" className="text-emerald-600 hover:underline">
                      Conditions d'utilisation
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ces cours pourraient vous intéresser
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((course) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-gradient-to-br from-emerald-100 to-purple-100 flex items-center justify-center overflow-hidden">
                      {course.coverImage ? (
                        <img src={`http://localhost:5000/uploads/covers/${course.coverImage.filename}`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <FaGraduationCap className="w-12 h-12 text-emerald-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-1 mb-3">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{course.rating || 4.5}</span>
                        <span className="text-xs text-gray-500">({course.reviews || 89})</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${course.price}
                        </span>
                        {course.price > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ${Math.round(course.price * 1.5)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(course)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FiPlus className="w-4 h-4" />
                        Ajouter au panier
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Order Summary in Modal */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Votre commande</h3>
                <div className="space-y-2 text-sm">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.title} (x{item.quantity})
                      </span>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)} $</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Méthode de paiement</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-500"
                    />
                    <FiCreditCard className="w-6 h-6 text-gray-600" />
                    <span className="flex-1 font-medium">Carte bancaire</span>
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-orange-500 rounded" /> {/* Visa */}
                      <div className="w-10 h-6 bg-blue-600 rounded" /> {/* Mastercard */}
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-500"
                    />
                    <FaPaypal className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">PayPal</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="apple"
                      checked={paymentMethod === 'apple'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-500"
                    />
                    <FaApple className="w-6 h-6 text-gray-900" />
                    <span className="font-medium">Apple Pay</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="google"
                      checked={paymentMethod === 'google'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-500"
                    />
                    <FaGooglePay className="w-12 h-6" />
                    <span className="font-medium">Google Pay</span>
                  </label>
                </div>
              </div>

              {/* Card Details Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom sur la carte
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    Payer ${total.toFixed(2)}
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                <FiShield className="w-4 h-4 inline mr-1" />
                Paiement 100% sécurisé par SSL
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
