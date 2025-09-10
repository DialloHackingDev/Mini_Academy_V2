import api from './api';

// Connexion utilisateur
export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

// Inscription utilisateur
export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// Profil utilisateur
const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export { getUserProfile, updateUserProfile };