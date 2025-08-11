import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    try {
      const data = error.response?.data;
      const message = (data?.message || data?.error || error.message) as string;
      // fire-and-forget toast via custom event to avoid hook usage here
      window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'error' } }));
    } catch {}
    return Promise.reject(error);
  }
);

export default api;

export const fetchPublishableKey = async (): Promise<string> => {
  const res = await api.get('/payments/publishable-key');
  return res.data.publishableKey as string;
}
