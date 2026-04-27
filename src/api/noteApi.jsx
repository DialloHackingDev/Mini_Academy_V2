import api from './api';

export const getCourseNotes = async (courseId) => {
  const res = await api.get(`/notes/${courseId}`);
  return res.data.notes;
};

export const addCourseNote = async (courseId, content, lessonId = null, lessonTitle = null) => {
  const res = await api.post(`/notes/${courseId}`, { content, lessonId, lessonTitle });
  return res.data.note;
};

export const deleteCourseNote = async (courseId, noteId) => {
  const res = await api.delete(`/notes/${courseId}/${noteId}`);
  return res.data;
};
