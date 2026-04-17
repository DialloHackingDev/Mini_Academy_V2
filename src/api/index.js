// Export centralisé de toutes les API
// Ce fichier facilite l'importation des fonctions API dans les composants

// API Utilisateurs (Auth)
export { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile 
} from './userApi';

// API Cours (Public)
export { 
  getCourses, 
  getCourseById, 
  enrollCourse 
} from './courApi';

// API Étudiant
export { 
  getMyCourses as getStudentCourses, 
  getProgress, 
  postReview 
} from './StudiantApi';

// API Professeur
export { 
  getMyCourses as getTeacherCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getCourseStats 
} from './teacherApi';

// API Admin
export { 
  getAdminDashboard, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  disableUser, 
  getAllCourses as getAdminCourses, 
  updateCourseAdmin, 
  deleteCourseAdmin 
} from './adminApi';

// Instance axios configurée
export { default as api } from './api';
