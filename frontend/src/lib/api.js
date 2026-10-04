import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL || ""}/api`,
  timeout: 15000,
});

export function apiError(error, fallback = "Não foi possível salvar. Tente novamente.") {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(item => item.msg.replace(/^Value error, /, '')).join('. ');
  if (!error.response || error.response.status >= 500) return "Não foi possível obter a confirmação do servidor. Verifique a conexão e a lista antes de tentar novamente.";
  return fallback;
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("cha_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
