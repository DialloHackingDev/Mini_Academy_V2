import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

// Get all notifications for the logged-in user
export const getMyNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const response = await axios.get(API_URL, {
      params: { page, limit, unreadOnly },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(`${API_URL}/${notificationId}`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(`${API_URL}`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  try {
    const response = await axios.delete(`${API_URL}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};
