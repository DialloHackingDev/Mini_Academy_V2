import api from "./api";

// ✅ Dashboard admin - récupérer tous les utilisateurs et cours
export const getAdminDashboard = async () => {
  const res = await api.get("/dashboard/admin");
  return res.data;
};

// ✅ Gestion des utilisateurs
export const getAllUsers = async () => {
  const res = await api.get("/dashboard/admin");
  return res.data.users;
};

export const createUser = async (userData) => {
  const res = await api.post("/dashboard/admin/user", userData);
  return res.data;
};

export const updateUser = async (userId, userData) => {
  const res = await api.put(`/dashboard/admin/user/${userId}`, userData);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/dashboard/admin/user/${userId}`);
  return res.data;
};

export const disableUser = async (userId) => {
  const res = await api.patch(`/dashboard/admin/user/${userId}/disable`);
  return res.data;
};

// ✅ Gestion des cours (admin)
export const getAllCourses = async () => {
  const res = await api.get("/dashboard/admin");
  return res.data.courses;
};

export const updateCourseAdmin = async (courseId, courseData) => {
  const res = await api.put(`/dashboard/admin/course/${courseId}`, courseData);
  return res.data;
};

export const deleteCourseAdmin = async (courseId) => {
  const res = await api.delete(`/dashboard/admin/course/${courseId}`);
  return res.data;
};
