# 🎓 Mini Academy - Frontend

Interface utilisateur moderne pour la plateforme e-learning Mini Academy, développée avec React.js et Tailwind CSS.

## 🚀 Fonctionnalités Implémentées

### ✅ **Authentification & Sécurité**
- Système de connexion/inscription avec JWT
- Routes protégées par rôle (élève, professeur, admin)
- Gestion automatique des tokens avec intercepteurs Axios
- Déconnexion automatique en cas de token expiré
- Context API pour l'état d'authentification global

### ✅ **Dashboard Étudiant**
- Vue d'ensemble des cours inscrits avec progression
- Système de progression visuelle (barres de progression)
- Interface pour laisser des avis sur les cours
- Navigation par onglets (Accueil, Mes Cours, Progression, Avis)

### ✅ **Dashboard Professeur**
- Création de cours (texte, PDF, vidéo)
- Modification et suppression de cours
- Statistiques des cours (étudiants inscrits, progression moyenne)
- Upload de fichiers multimédia
- Interface CRUD complète pour la gestion des cours

### ✅ **Dashboard Administrateur**
- Gestion complète des utilisateurs (CRUD)
- Gestion des cours (modification, suppression)
- Vue d'ensemble avec statistiques globales
- Interface intuitive avec onglets (Vue d'ensemble, Utilisateurs, Cours)

### ✅ **Interface Utilisateur**
- Design responsive avec Tailwind CSS
- Sidebar adaptative mobile/desktop
- Navbar avec navigation contextuelle selon le rôle
- Composants réutilisables (Toast, LoadingSpinner, FormInput)
- Gestion d'erreurs avec ErrorBoundary

## 🛠️ Technologies Utilisées

- **React 19.1.1** - Framework frontend
- **Tailwind CSS 4.1.12** - Framework CSS utilitaire
- **React Router DOM 7.8.2** - Routage côté client
- **Axios 1.11.0** - Client HTTP pour les API calls
- **React Icons 5.5.0** - Bibliothèque d'icônes
- **Vite 7.1.2** - Build tool et dev server

## 🔧 Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build
npm run preview
```

## 🔗 Intégration Backend

Le frontend est configuré pour communiquer avec le backend Node.js/Express sur `http://localhost:3000/api`.

### Endpoints API utilisés :
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/dashboard/student` - Dashboard étudiant
- `GET /api/dashboard/teacher` - Dashboard professeur
- `GET /api/dashboard/admin` - Dashboard admin
- `POST /api/course` - Création de cours
- `PUT /api/course/:id` - Modification de cours
- `DELETE /api/course/:id` - Suppression de cours

## 🔐 Sécurité

- **JWT automatique** : Les tokens sont automatiquement ajoutés aux headers via les intercepteurs Axios
- **Routes protégées** : Vérification des rôles avant l'accès aux pages
- **Validation côté client** : Validation des formulaires avant envoi
- **Gestion d'erreurs** : Capture et affichage des erreurs utilisateur

## 🎨 Améliorations UX

- **Feedback visuel** : Notifications toast pour les actions utilisateur
- **États de chargement** : Spinners pendant les requêtes API
- **Design responsive** : Interface adaptée mobile/tablette/desktop
- **Navigation intuitive** : Sidebar contextuelle selon le rôle utilisateur
