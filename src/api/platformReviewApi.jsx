import axios from "axios";

const API_URL = "http://localhost:5000/api/platform-reviews";

// Add or update platform review
export const addPlatformReview = async (rating, comment) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/add`,
      { rating, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding platform review:", error);
    throw error;
  }
};

// Get recent platform reviews
export const getPlatformReviews = async () => {
  try {
    const response = await axios.get(`${API_URL}/recent`);
    return response.data;
  } catch (error) {
    console.error("Error fetching platform reviews:", error);
    throw error;
  }
};
