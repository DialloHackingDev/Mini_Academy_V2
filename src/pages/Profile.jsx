import { useEffect, useState } from "react";
import { profilUser } from "../api/userApi.jsx";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await profilUser();
        setProfile(data);
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    fetchData();
  }, []);

  if (!profile) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md">
  <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
  <p><strong>Nom :</strong> {profile.username}</p>
  <p><strong>Email :</strong> {profile.email}</p>
  <p><strong>Rôle :</strong> {profile.role}</p>
</div>

  );
}
