import { motion } from "framer-motion";
import { FiUsers, FiBookOpen, FiDollarSign, FiAward, FiTrendingUp, FiShield, FiChevronRight } from "react-icons/fi";

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export default function AdminOverview({ data = {}, onTabChange }) {
  const { stats = {}, topCourses = [], purchases = [] } = data;
  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: FiUsers, accent: 'from-sky-500 to-cyan-500' },
    { label: 'Étudiants', value: stats.totalStudents, icon: FiShield, accent: 'from-emerald-500 to-teal-500' },
    { label: 'Professeurs', value: stats.totalProfessors, icon: FiBookOpen, accent: 'from-violet-500 to-fuchsia-500' },
    { label: 'Cours', value: stats.totalCourses, icon: FiBookOpen, accent: 'from-orange-500 to-amber-500' },
    { label: 'Revenu', value: currencyFormatter.format(stats.totalRevenue || 0), icon: FiDollarSign, accent: 'from-emerald-500 to-lime-500' },
    { label: 'Certificats', value: stats.totalCertificates, icon: FiAward, accent: 'from-emerald-500 to-blue-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-white p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Vue d'ensemble</p>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">Centre de pilotage des opérations</h2>
            <p className="max-w-2xl text-sm text-slate-500 leading-6">Suivez les utilisateurs, le contenu, la comptabilité et la production des certificats en temps réel. Tout est rassemblé ici pour une prise de décision rapide.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            onClick={() => onTabChange('users')}
          >
            Gérer les utilisateurs
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-lg shadow-slate-200/40`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="mt-6 text-3xl font-black text-slate-900">{card.value ?? 0}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Rapport rapide</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Statistiques clés</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Production</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Revenu total</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{currencyFormatter.format(stats.totalRevenue || 0)}</p>
              <p className="mt-2 text-sm text-slate-500">Basé sur les achats confirmés et les paiements validés.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Certificats obtenus</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalCertificates || 0}</p>
              <p className="mt-2 text-sm text-slate-500">Nombre de certificats générés par les apprenants.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dernières ventes</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">Transactions récentes</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Top 10</span>
          </div>

          <div className="space-y-4">
            {purchases.length > 0 ? (
              purchases.slice(0, 5).map((purchase) => (
                <div key={purchase._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{purchase.courseId?.title || 'Cours inconnu'}</p>
                    <p className="text-sm text-slate-500">{purchase.userId?.username || 'Élève inconnu'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{currencyFormatter.format(purchase.price || 0)}</p>
                    <p className="text-sm text-slate-500">{new Date(purchase.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucune vente récente disponible.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Top cours</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">Performances des cours</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Classement</span>
          </div>

          <div className="space-y-4">
            {topCourses.length > 0 ? (
              topCourses.slice(0, 5).map((course) => (
                <div key={course._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="font-semibold text-slate-900">{course.title}</p>
                    <p className="text-sm font-semibold text-slate-600">{currencyFormatter.format(course.revenue || 0)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{course.students} élèves</span>
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                    <span>{course.revenue ? Math.max(0, Math.round(course.revenue / Math.max(course.students, 1))) : 0} / élève</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucun cours à afficher pour le moment.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onTabChange('users')}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Gestion</p>
          <p className="mt-3 text-lg font-black text-slate-900">Utilisateurs</p>
          <p className="mt-2 text-sm text-slate-500">Créez, éditez et désactivez des comptes.</p>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('courses')}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contenu</p>
          <p className="mt-3 text-lg font-black text-slate-900">Cours</p>
          <p className="mt-2 text-sm text-slate-500">Modifiez, supprimez ou vérifiez les cours actives.</p>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Comptabilité</p>
          <p className="mt-3 text-lg font-black text-slate-900">Revenus</p>
          <p className="mt-2 text-sm text-slate-500">Suivez les tendances financières et les certificats.</p>
        </button>
      </div>
    </div>
  );
}
