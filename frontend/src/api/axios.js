import axios from "axios";

// URL de l'API Django
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://maman50-api-v2.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ============================
// Requête
// ============================
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// Réponse
// ============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("admin_auth");
    }

    return Promise.reject(error);
  }
);

export { api };
export const API = api;
export default api;