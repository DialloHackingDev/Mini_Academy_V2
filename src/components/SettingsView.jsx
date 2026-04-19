import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiBell, 
  FiShield, 
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle
} from "react-icons/fi";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'account', label: 'Account', icon: FiMail },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'security', label: 'Security', icon: FiShield },
];

export default function SettingsView({ userProfile, onProfileUpdate }) {
  const { updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    jobTitle: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        username: userProfile.username || "",
        jobTitle: userProfile.jobTitle || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.put("/users/profile", form);
      if (res.data.success) {
        setSuccess("Profile updated successfully!");
        if (onProfileUpdate) onProfileUpdate(res.data.user);
        updateUserData({ 
          username: res.data.user.username, 
          profileImage: res.data.user.profileImage 
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and secure your learning experience.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-all whitespace-nowrap px-1 ${
                isActive 
                  ? 'border-emerald-600 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
            >
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-10 pb-8 border-b border-gray-100 text-center sm:text-left">
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold overflow-hidden">
                    {userProfile?.profileImage ? (
                      <img src={`http://localhost:5000/uploads/profiles/${userProfile.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      userProfile?.username?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center border-4 border-white group-hover:bg-emerald-700 transition-colors">
                    <FiCamera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Photo de profil</h3>
                  <p className="text-[10px] md:text-sm text-gray-500 mb-4">Taille recommandée: 400x400px.</p>
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append('profileImage', file);
                      
                      setLoading(true);
                      try {
                        const res = await api.put("/users/profile", formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        if (res.data.success) {
                          setSuccess("Photo de profil mise à jour !");
                          if (onProfileUpdate) onProfileUpdate(res.data.user);
                          updateUserData({ profileImage: res.data.user.profileImage });
                        }
                      } catch (err) {
                        setError("Erreur lors de l'upload de l'image");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  <div className="flex justify-center sm:justify-start gap-3">
                    <button 
                      onClick={() => document.getElementById('profile-upload').click()}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-emerald-100 transition-all"
                    >
                      Modifier
                    </button>
                    <button className="px-4 py-2 text-gray-600 text-xs md:text-sm font-semibold hover:bg-gray-50 rounded-lg transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information Form */}
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Alex Curator"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Title</label>
                    <input 
                      type="text"
                      name="jobTitle"
                      value={form.jobTitle}
                      onChange={handleChange}
                      placeholder="Senior UX Researcher"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="alex.curator@academy.com"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
                  <textarea 
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Brief description for your profile. Maximum 250 characters."
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 resize-none"
                  ></textarea>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <FiAlertCircle />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm">
                    <FiCheckCircle />
                    {success}
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-all">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {(activeTab === 'account' || activeTab === 'notifications' || activeTab === 'security') && (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {tabs.find(t => t.id === activeTab).icon({ className: "w-8 h-8" })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tabs.find(t => t.id === activeTab).label} Settings</h3>
              <p className="text-gray-500">This section is under construction. Coming soon!</p>
            </div>
          )}
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          {/* Account Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Account Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Membership</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {userProfile?.role === 'eleve' ? 'Student' : 'Instructor'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium text-gray-900">
                  {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Courses Completed</span>
                <span className="font-medium text-gray-900">12</span>
              </div>
            </div>
          </div>

          {/* Promotion Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
             {/* Decorative Stars */}
             <div className="absolute top-4 right-4 opacity-30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
             </div>
             
             <h3 className="text-xl font-bold mb-3 leading-tight">Elevate your experience.</h3>
             <p className="text-emerald-100 text-sm mb-6">Get personalized mentoring and early access to new learning modules.</p>
             <button className="w-full bg-white text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-lg">
                Compare Plans
             </button>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-emerald-600">
              <FiHelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Need help?</p>
              <p className="text-xs text-gray-500">Chat with our support team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
