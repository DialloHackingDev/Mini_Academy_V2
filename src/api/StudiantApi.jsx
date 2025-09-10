import api from "./api"

// const api = axios.create({
//   baseURL: "http://localhost:3000/api",
//   withCredentials: true, // si JWT stocké en cookie
// });

// 🔹 Cours achetés
export const getMyCourses = async () => {
  const res = await api.get("/dashboard/student");
  return res.data.courses;
};

// 🔹 Progression d’un cours
export const getProgress = async (courseId) => {
  const res = await api.get(`/progress/${courseId}`);
  return res.data;
};

// 🔹 Poster un avis
export const postReview = async (courseId, reviewData) => {
  const res = await api.post(`/reviews/${courseId}`, reviewData);
  return res.data;
};
