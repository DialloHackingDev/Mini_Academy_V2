import { motion } from "framer-motion";
import { 
  FiClock, 
  FiAward, 
  FiDollarSign, 
  FiExternalLink,
  FiTrendingUp,
  FiBook
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StudentAnalyticsView({ stats }) {
  // Format the time spent (seconds to hours/minutes)
  const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Mock data for learning timeline (since we don't have historical daily data yet)
  const learningTimeline = [
    { name: 'Lun', hours: 1.5 },
    { name: 'Mar', hours: 2.0 },
    { name: 'Mer', hours: 0.5 },
    { name: 'Jeu', hours: 3.0 },
    { name: 'Ven', hours: 1.0 },
    { name: 'Sam', hours: 4.5 },
    { name: 'Dim', hours: 2.5 },
  ];

  const categoryDistribution = stats?.categoryDistribution?.length > 0 
    ? stats.categoryDistribution 
    : [{ name: 'Général', value: 1 }];

  const displayStats = [
    { label: "Temps d'apprentissage", value: formatTime(stats?.totalTimeSpentSeconds), isPositive: true, icon: FiClock, color: "blue" },
    { label: "Progression Moyenne", value: `${stats?.avgProgress || 0}%`, isPositive: true, icon: FiTrendingUp, color: "emerald" },
    { label: "Certificats Obtenus", value: stats?.certificatesCount || 0, isPositive: true, icon: FiAward, color: "amber" },
    { label: "Investissement", value: `${stats?.totalSpent || 0}€`, isPositive: true, icon: FiDollarSign, color: "indigo" },
  ];

  const handleExport = () => {
    if (!stats?.courses || stats.courses.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const headers = ["Titre", "Catégorie", "Progression (%)", "Temps Passé (secondes)", "Prix (Euros)"];
    const rows = stats.courses.map(c => [
      c.title,
      c.category,
      c.progress || 0,
      c.timeSpent || 0,
      c.price || 0
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_apprentissage_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2">Mon Apprentissage</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium italic">"Suivez vos efforts et célébrez vos progrès."</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 self-start md:self-auto">
           <button 
             onClick={handleExport}
             className="px-5 md:px-6 py-2 md:py-2.5 bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
           >
              <FiExternalLink /> Exporter
           </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <p className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-xl md:text-3xl font-black text-slate-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1">Rythme d'étude</h3>
              <p className="text-[10px] md:text-sm text-slate-400 font-medium">Heures d'apprentissage cette semaine</p>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Heures</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningTimeline}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px'}}
                />
                <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8">Intérêts par Catégorie</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900">{stats?.totalCourses || 0}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cours</span>
            </div>
          </div>
          <div className="space-y-6 mt-10">
            {categoryDistribution.map((cat, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-slate-600">{cat.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
        {/* Enrolled Courses */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">Détails de progression</h3>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
               <FaGraduationCap />
            </div>
          </div>
          <div className="space-y-6">
             {(stats?.courses && stats.courses.length > 0 ? [...stats.courses].sort((a, b) => (b.progress || 0) - (a.progress || 0)) : []).map((course, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                   <div className="flex items-center gap-5 w-1/2">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400">
                         <FiBook className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{course.title}</p>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{course.category}</p>
                      </div>
                   </div>
                   <div className="w-1/3 px-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>Progression</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress || 0}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        ></motion.div>
                      </div>
                   </div>
                   <div className="text-right w-1/6">
                      <p className="text-sm font-black text-slate-900">{formatTime(course.timeSpent)}</p>
                      <p className="text-[10px] font-bold text-slate-400">Étudié</p>
                   </div>
                </div>
             ))}
             {(!stats?.courses || stats.courses.length === 0) && <p className="text-center text-slate-400 py-10 italic">Aucun cours trouvé.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
