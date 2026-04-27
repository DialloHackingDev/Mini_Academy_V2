import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reviews';

// Add or update a review for a course
export const addOrUpdateReview = async (courseId, rating, comment) => {
  try {
    const response = await axios.post(`${API_URL}/${courseId}`, 
      { rating, comment },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding/updating review:', error);
    throw error;
  }
};

// Get all reviews for a course
export const getCourseReviews = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Get my own reviews
export const getMyReviews = async () => {
  try {
    const response = await axios.get(`${API_URL}/my/reviews`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    throw error;
  }
};

// Get recent platform reviews for home page
export const getPlatformReviews = async () => {
  try {
    const response = await axios.get(`${API_URL}/platform/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching platform reviews:', error);
    throw error;
  }
};
