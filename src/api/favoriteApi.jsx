import axios from 'axios';

const API_URL = 'http://localhost:5000/api/course';

// Toggle favorite/like a course
export const toggleFavorite = async (courseId) => {
  try {
    const response = await axios.post(`${API_URL}/${courseId}/favorite`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// Check if course is favored by current user
export const checkIsFavored = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/${courseId}/favorite/check`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

// Get all user's favorite courses
export const getUserFavorites = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/favorites/list`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};
