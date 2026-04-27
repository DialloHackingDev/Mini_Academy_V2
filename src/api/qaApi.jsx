import api from './api';

export const getCourseQuestions = async (courseId) => {
  const res = await api.get(`/qa/${courseId}`);
  return res.data.questions;
};

export const postQuestion = async (courseId, question) => {
  const res = await api.post(`/qa/${courseId}`, { question });
  return res.data.question;
};

export const postQuestionReply = async (courseId, questionId, reply) => {
  const res = await api.post(`/qa/${courseId}/reply/${questionId}`, { reply });
  return res.data.question;
};
