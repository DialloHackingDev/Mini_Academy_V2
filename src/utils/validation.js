// Utilitaires de validation côté client

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) >= 0;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = `${fieldRules.label || field} est requis`;
      return;
    }
    
    if (value && fieldRules.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Email invalide';
      return;
    }
    
    if (value && fieldRules.type === 'password' && !validatePassword(value)) {
      errors[field] = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    
    if (value && fieldRules.type === 'price' && !validatePrice(value)) {
      errors[field] = 'Le prix doit être un nombre positif';
      return;
    }
    
    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} doit contenir au moins ${fieldRules.minLength} caractères`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
