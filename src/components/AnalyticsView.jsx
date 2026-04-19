import { motion } from "framer-motion";
import { 
  FiArrowUpRight, 
  FiArrowDownRight, 
  FiUsers, 
  FiDollarSign, 
  FiGlobe,
  FiExternalLink,
  FiCheckCircle,
  FiStar,
  FiTrendingUp,
  FiBook
} from "react-icons/fi";
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

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function AnalyticsView({ stats, courses = [] }) {
  // Fallback data if none provided
  const chartData = [
    { name: 'Jan', revenue: 4000, enrollment: 2400 },
    { name: 'Feb', revenue: 3000, enrollment: 1398 },
    { name: 'Mar', revenue: 2000, enrollment: 9800 },
    { name: 'Apr', revenue: 2780, enrollment: 3908 },
    { name: 'May', revenue: 1890, enrollment: 4800 },
    { name: 'Jun', revenue: 2390, enrollment: 3800 },
    { name: 'Jul', revenue: 3490, enrollment: 4300 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#6366f1' },
    { name: 'Mobile', value: 25, color: '#10b981' },
    { name: 'Tablet', value: 10, color: '#f59e0b' },
  ];

  const topLocations = [
    { name: "France", percentage: 42, color: "emerald" },
    { name: "Sénégal", percentage: 18, color: "indigo" },
    { name: "Canada", percentage: 12, color: "emerald" },
  ];

  // Derived stats
  const totalStudents = stats?.totalStudents ?? courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const totalRevenue = stats?.totalRevenue ?? courses.reduce((acc, c) => acc + ((c.price || 0) * (c.students?.length || 0)), 0);
  const avgRating = stats?.averageRating ?? 0;
  
  const displayStats = [
    { label: "Revenu Total", value: `${totalRevenue.toLocaleString()}€`, change: stats?.revenueGrowth ? `+${stats.revenueGrowth}%` : "+0%", isPositive: true, icon: FiDollarSign, color: "emerald" },
    { label: "Taux de Réussite", value: "100%", change: "+0%", isPositive: true, icon: FiCheckCircle, color: "blue" },
    { label: "Satisfaction", value: `${avgRating}/5.0`, change: "0%", isPositive: true, icon: FiStar, color: "amber" },
    { label: "Élèves Inscrits", value: totalStudents.toLocaleString(), change: stats?.studentGrowth ? `+${stats.studentGrowth}%` : "+0%", isPositive: true, icon: FiUsers, color: "indigo" },
  ];

  const handleExport = () => {
    if (!courses || courses.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const headers = ["Titre", "Catégorie", "Prix", "Élèves", "Revenu"];
    const rows = courses.map(c => [
      c.title,
      c.category || "N/A",
      `${c.price}€`,
      c.students?.length || 0,
      `${(c.students?.length || 0) * (c.price || 0)}€`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics_elevated_${new Date().toLocaleDateString()}.csv`);
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
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2">Analytique</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium italic">"Mesurez votre succès en temps réel."</p>
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
              <div className={`flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-1.5 md:px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
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
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1">Croissance</h3>
              <p className="text-[10px] md:text-sm text-slate-400 font-medium">Revenus vs Inscriptions</p>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Élèves</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="enrollment" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorEnr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8">Canaux de Lecture</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900">{(totalStudents * 1.5).toFixed(1)}k</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sessions</span>
            </div>
          </div>
          <div className="space-y-6 mt-10">
            {deviceData.map((device, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: device.color}}></div>
                  <span className="text-sm font-bold text-slate-600">{device.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{device.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Courses */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">Cours les plus performants</h3>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
               <FiTrendingUp />
            </div>
          </div>
          <div className="space-y-6">
             {(courses.length > 0 ? [...courses].sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0)).slice(0, 3) : []).map((course, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400">
                         {course.coverImage?.filename ? (
                           <img src={`http://localhost:5000/uploads/covers/${course.coverImage.filename}`} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <FiBook className="w-6 h-6" />
                         )}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{course.title}</p>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{i === 0 ? 'Bestseller' : 'Populaire'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{course.students?.length || 0} Élèves</p>
                      <p className="text-[10px] font-bold text-slate-400">{((course.students?.length || 0) * (course.price || 0)).toLocaleString()}€ récoltés</p>
                   </div>
                </div>
             ))}
             {courses.length === 0 && <p className="text-center text-slate-400 py-10 italic">Aucun cours disponible.</p>}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">Audience par Pays</h3>
            <FiGlobe className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-8">
            {topLocations.map((loc, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>{loc.name}</span>
                  <span className="text-slate-900">{loc.percentage}%</span>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loc.percentage}%` }}
                    className={`h-full bg-${loc.color}-500 rounded-full shadow-sm shadow-emerald-500/20`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
