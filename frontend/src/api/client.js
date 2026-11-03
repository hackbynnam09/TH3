import axios from 'axios';

export const TOKEN_KEY = 'th3_token';
export const USER_KEY = 'th3_user';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050',
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(error) {
  if (!error.response) return 'Không kết nối được API. Hãy kiểm tra backend cổng 5050.';
  const data = error.response.data;
  if (typeof data?.message === 'string') return data.message;
  if (data?.errors) return Object.values(data.errors).flat().join(' ');
  if (error.response.status === 401) return 'Bạn chưa đăng nhập hoặc phiên đã hết hạn.';
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
