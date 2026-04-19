import { motion } from "framer-motion";
import { FiTrendingUp, FiDollarSign, FiBookOpen, FiAward } from "react-icons/fi";

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export default function AdminAnalytics({ data = {} }) {
  const { stats = {}, monthlyRevenue = [], topCourses = [], purchases = [] } = data;
  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue || 0), 1);
  const certificateRate = stats.totalStudents ? Math.round((stats.totalCertificates || 0) / stats.totalStudents * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600">
            <FiDollarSign className="w-5 h-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Revenu total</p>
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{currencyFormatter.format(stats.totalRevenue || 0)}</p>
          <p className="mt-2 text-sm text-slate-500">Flux des ventes confirmé des derniers achats.</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sky-600">
            <FiBookOpen className="w-5 h-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Cours actifs</p>
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.totalCourses || 0}</p>
          <p className="mt-2 text-sm text-slate-500">Nombre de cours publiés et accessibles aux apprenants.</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-indigo-600">
            <FiAward className="w-5 h-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Taux de certificats</p>
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{certificateRate}%</p>
          <p className="mt-2 text-sm text-slate-500">Certificats obtenus par rapport aux étudiants inscrits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.85fr] gap-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Graphique</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Revenu mensuel</h3>
            </div>
            <p className="text-sm text-slate-500">Répartition sur les 6 derniers mois.</p>
          </div>

          <div className="flex items-end gap-4 h-64">
            {monthlyRevenue.length > 0 ? monthlyRevenue.map((item) => {
              const height = Math.max(10, Math.round((item.revenue || 0) / maxRevenue * 100));
              return (
                <div key={item.month} className="flex-1 text-center">
                  <div className="relative mx-auto h-48 w-full">
                    <div className="absolute bottom-0 left-1/2 h-full w-10 -translate-x-1/2 rounded-3xl bg-slate-100"></div>
                    <div className="absolute bottom-0 left-1/2 w-10 -translate-x-1/2 rounded-3xl bg-emerald-500" style={{ height: `${height}%` }} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{item.month}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500">Aucun historique de revenu disponible.</p>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Top cours</p>
              <h3 className="text-2xl font-black text-slate-900">Meilleures performances</h3>
            </div>
          </div>

          <div className="space-y-4">
            {topCourses.length > 0 ? topCourses.slice(0, 5).map((course) => (
              <div key={course._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{course.title}</p>
                    <p className="text-sm text-slate-500">{course.students} élèves</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{currencyFormatter.format(course.revenue || 0)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Aucun cours à afficher.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-4">Revenus récents</h3>
          <div className="space-y-3">
            {purchases.length > 0 ? purchases.slice(0, 6).map((purchase) => (
              <div key={purchase._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{purchase.courseId?.title || 'Cours inconnu'}</p>
                    <p className="text-sm text-slate-500">{purchase.userId?.username || 'Étudiant'} • {new Date(purchase.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{currencyFormatter.format(purchase.price || 0)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Aucune transaction récente trouvée.</p>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-4">Objectifs clés</h3>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rendement</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalRevenue ? `${Math.round(stats.totalRevenue / Math.max(stats.totalCourses, 1))} €` : '0 €'}</p>
              <p className="mt-2 text-sm text-slate-500">Revenu moyen par cours.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Activité</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalStudents || 0}</p>
              <p className="mt-2 text-sm text-slate-500">Étudiants actifs inscrits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
