import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  fr: {
    settings: "Paramètres",
    profile: "Profil",
    account: "Compte",
    notifications: "Notifications",
    security: "Sécurité",
    language: "Langue",
    choose_language: "Choisissez votre langue préférée",
    save_changes: "Enregistrer les modifications",
    cancel: "Annuler",
    username: "Nom d'utilisateur",
    email: "Adresse e-mail",
    bio: "Bio",
    job_title: "Titre du poste",
    success_profile_update: "Profil mis à jour avec succès !",
    error_profile_update: "Erreur lors de la mise à jour du profil",
    logout: "Déconnexion",
    dashboard: "Tableau de bord",
    my_courses: "Mes cours",
    cart: "Panier",
    search_placeholder: "Rechercher des cours...",
    become_teacher: "Devenir Prof",
    login: "Connexion",
    register: "S'inscrire",
    all_courses: "Tous les cours",
    learning: "Apprentissage",
    create: "Créer",
    settings_desc: "Gérez vos préférences de compte et sécurisez votre expérience d'apprentissage.",
    photo_profil: "Photo de profil",
    recommanded_size: "Taille recommandée: 400x400px.",
    modifier: "Modifier",
    supprimer: "Supprimer",
    personal_info: "Informations personnelles",
    account_overview: "Aperçu du compte",
    membership: "Adhésion",
    joined: "Inscrit depuis",
    courses_completed: "Cours terminés",
    need_help: "Besoin d'aide ?",
    chat_support: "Discutez avec notre support",
    eleve: "Élève",
    prof: "Professeur",
    admin: "Administrateur",
    presentation: "Présentation",
    qa: "Q & R",
    mes_notes: "Mes Notes",
    annonces: "Annonces",
    evaluations: "Évaluations",
    ressources: "Ressources",
    outils: "Outils",
    back: "Retour",
  },
  en: {
    settings: "Settings",
    profile: "Profile",
    account: "Account",
    notifications: "Notifications",
    security: "Security",
    language: "Language",
    choose_language: "Choose your preferred language",
    save_changes: "Save Changes",
    cancel: "Cancel",
    username: "Username",
    email: "Email Address",
    bio: "Bio",
    job_title: "Job Title",
    success_profile_update: "Profile updated successfully!",
    error_profile_update: "Error updating profile",
    logout: "Logout",
    dashboard: "Dashboard",
    my_courses: "My Courses",
    cart: "Cart",
    search_placeholder: "Search for courses...",
    become_teacher: "Become Teacher",
    login: "Login",
    register: "Register",
    all_courses: "All Courses",
    learning: "Learning",
    create: "Create",
    settings_desc: "Manage your account preferences and secure your learning experience.",
    photo_profil: "Profile Photo",
    recommanded_size: "Recommended size: 400x400px.",
    modifier: "Change",
    supprimer: "Delete",
    personal_info: "Personal Information",
    account_overview: "Account Overview",
    membership: "Membership",
    joined: "Joined",
    courses_completed: "Courses Completed",
    need_help: "Need help?",
    chat_support: "Chat with our support team",
    eleve: "Student",
    prof: "Teacher",
    admin: "Admin",
    presentation: "Overview",
    qa: "Q & A",
    mes_notes: "My Notes",
    annonces: "Announcements",
    evaluations: "Evaluations",
    ressources: "Resources",
    outils: "Tools",
    back: "Back",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const switchLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
