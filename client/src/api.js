import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('tp_token'); // only the JWT is kept in the browser
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && localStorage.getItem('tp_token')) {
    localStorage.removeItem('tp_token');
    window.location.href = '/login';
  }
  return Promise.reject(e);
});

export default api;

export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server. Is the backend running?' : e.message);
export const fileUrl = (p) => (p ? `${import.meta.env.VITE_FILE_URL || ''}/uploads/${p}` : null);
export const money = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const toDate = (d) => new Date(d.length === 10 ? `${d}T00:00:00` : d.replace(' ', 'T'));
export const fmtDate = (d) => (d ? toDate(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
