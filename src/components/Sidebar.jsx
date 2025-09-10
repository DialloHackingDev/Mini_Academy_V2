import { FaHome, FaBook, FaChartLine, FaCog, FaUser } from "react-icons/fa";

export default function Sidebar({ selectedTab, setSelectedTab, open, setOpen }) {
  const tabs = [
    { name: "Accueil", icon: <FaHome />, key: "home" },
    { name: "Mes Cours", icon: <FaBook />, key: "myCourses" },
    { name: "Progression", icon: <FaChartLine />, key: "progress" },
    { name: "Avis", icon: <FaChartLine />, key: "reviews" },
    { name: "Mon Profil", icon: <FaUser />, key: "profile" },
    { name: "Paramètres", icon: <FaCog />, key: "settings" },
  ];

  return (
    <div
      className={`fixed md:relative z-50 md:z-auto top-0 left-0 h-full w-64 bg-white shadow transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-6 flex flex-col h-screen mt-6 bg-red-500">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <ul className="flex-1">
          {tabs.map((tab) => (
            <li
              key={tab.key}
              onClick={() => {
                setSelectedTab(tab.key);
                setOpen(false);
              }}
              className={`flex items-center gap-3 p-3 mb-2 rounded cursor-pointer transition-colors duration-200 ${
                selectedTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-md font-medium">{tab.name}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-400 mt-auto">© 2025 Smart Digital Works</p>
      </div>
    </div>
  );
}
