import { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre la fin de l'animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "error":
        return <FaExclamationTriangle className="text-red-500" />;
      case "info":
        return <FaInfoCircle className="text-blue-500" />;
      default:
        return <FaCheckCircle className="text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-green-50 border-green-200";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getBgColor()}`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="text-gray-800">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

// Hook pour utiliser les toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}
