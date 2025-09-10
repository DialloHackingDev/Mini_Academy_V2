import api from "./api"


//enregister un utilisateur
export async function registerUser(data) {
    const res = await api.post(`/users/register`,data);
    return res.data
}

//connexion d'un utilisateur
export async function loginUser(data){
    const res = await api.post(`/users/login`,data);
    return res.data;
}

//profil utilisateur
export async function profilUser() {
    const res = await api.get(`/users/profile`)
    return res.data;
}