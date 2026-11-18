import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import api from './api';

/* ---------- Auth ---------- */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('tp_token'));

  useEffect(() => {
    if (!localStorage.getItem('tp_token')) return;
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('tp_token')).finally(() => setLoading(false));
  }, []);

  const start = ({ token, user }) => { localStorage.setItem('tp_token', token); setUser(user); return user; };
  const login = async (email, password) => start((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => start((await api.post('/auth/register', form)).data);
  const logout = () => { localStorage.removeItem('tp_token'); setUser(null); };

  return <AuthCtx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((text, type = 'success') => {
    const id = Math.random();
    setItems((s) => [...s, { id, text, type }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className="card flex animate-fade items-center gap-3 px-4 py-3 text-sm font-medium shadow-lift">
            {i.type === 'success' ? <CheckCircle2 className="text-accent-600" size={18} /> : <XCircle className="text-red-600" size={18} />}
            {i.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
