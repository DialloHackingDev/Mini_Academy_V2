import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AmazonNavbar from "../components/AmazonNavbar.jsx";
import SettingsView from "../components/SettingsView.jsx";
import api from "../api/api";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setProfile(res.data?.user || res.data);
      } catch (err) {
        console.error("Erreur chargement profil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AmazonNavbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AmazonNavbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SettingsView userProfile={profile || user} onProfileUpdate={setProfile} />
      </div>
    </div>
  );
}
