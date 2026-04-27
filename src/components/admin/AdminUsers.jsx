import { useMemo, useState } from "react";
import { FiSearch, FiTrash2, FiSlash, FiUserCheck, FiPlus, FiX, FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { createUser } from "../../api/adminApi";

const roleLabels = {
  admin: 'Admin',
  eleve: 'Élève',
  prof: 'Professeur',
  professeur: 'Professeur'
};

export default function AdminUsers({ users = [], onDelete, onDisable, onRefresh }) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: 'eleve' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = [user.username, user.email, roleLabels[user.role] || user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Gestion des utilisateurs</h1>
            <p className="mt-2 text-sm text-slate-500">Recherchez, filtrez et gérez les comptes de tous les utilisateurs.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <FiPlus className="w-4 h-4" /> Créer un utilisateur
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Actualiser
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <label className="relative block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Recherche des utilisateurs"
              value={query}
              onChange={handleQueryChange}
              placeholder="Rechercher par nom, email ou rôle"
              className="w-full bg-transparent pl-10 text-sm text-slate-900 outline-none"
            />
          </label>

          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="prof">Professeur</option>
            <option value="eleve">Élève</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.18em] text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Nom</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Rôle</th>
              <th className="px-6 py-4 text-left">Créé le</th>
              <th className="px-6 py-4 text-left">Statut</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Aucun utilisateur trouvé.</td>
              </tr>
            ) : paginatedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-900">{user.username}</td>
                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-slate-700">{roleLabels[user.role] || user.role}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.disabled ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {user.disabled ? 'Désactivé' : 'Actif'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    type="button"
                    onClick={() => onDisable(user._id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <FiSlash className="w-3.5 h-3.5" />
                    {user.disabled ? 'Réactiver' : 'Désactiver'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(user._id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Page <span className="font-bold text-slate-900">{currentPage}</span> sur <span className="font-bold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="w-full max-w-xl rounded-[32px] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Créer un utilisateur</h2>
                <p className="text-sm text-slate-500">Ajoutez un nouveau compte administrateur, professeur ou élève.</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-900"><FiX className="w-6 h-6" /></button>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">Nom d'utilisateur</label>
                <input type="text" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <label className="block text-sm font-semibold text-slate-700">Rôle</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                  <option value="eleve">Élève</option>
                  <option value="prof">Professeur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {createError && <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>}
              {createSuccess && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{createSuccess}</div>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Annuler</button>
                <button type="button" onClick={async () => {
                  setCreateError('');
                  setCreateSuccess('');
                  if (!createForm.username || !createForm.email || !createForm.password) {
                    setCreateError('Tous les champs sont requis.');
                    return;
                  }
                  try {
                    await createUser(createForm);
                    setCreateSuccess('Utilisateur créé avec succès.');
                    setCreateForm({ username: '', email: '', password: '', role: 'eleve' });
                    onRefresh();
                  } catch (err) {
                    setCreateError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Erreur lors de la création');
                  }
                }} className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">Créer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
