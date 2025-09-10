import api from "./api"

// instance axios avec URL de base


// récupérer tous les cours
export const getCourses = async () => {
  const res = await api.get("/course");
  return res.data;
};

// récupérer un cours par ID
export const getCourseById = async (id) => {
  const res = await api.get(`/course/${id}`);
  return res.data;
};

// inscription à un cours (besoin du token)
export const enrollCourse = async (id) => {
  const res = await api.post(
    `/course/${id}/enroll`);
  return res.data;
};

export default api;
