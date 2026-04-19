import api from "./api";

// ✅ Récupérer le dashboard du professeur
export const getTeacherDashboard = async () => {
  const res = await api.get("/dashboard/teacher");
  return res.data;
};

// ✅ Créer un cours
export const createCourse = async (courseData) => {
  const res = await api.post("/course", courseData);
  return res.data.data || res.data;
};

// ✅ Mettre à jour un cours
export const updateCourse = async (courseId, courseData) => {
  const res = await api.put(`/course/${courseId}`, courseData);
  return res.data.data || res.data;
};

// ✅ Supprimer un cours
export const deleteCourse = async (courseId) => {
  const res = await api.delete(`/course/${courseId}`);
  return res.data;
};

// ✅ Récupérer les stats d'un cours
export const getCourseStats = async (courseId) => {
  const res = await api.get(`/course/${courseId}/stats`);
  return res.data;
};
