import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api.js';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('mc_token'));
  useEffect(() => {
    if (!localStorage.getItem('mc_token')) return;
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('mc_token')).finally(() => setLoading(false));
  }, []);
  const authenticate = async (path, body) => { const { data } = await api.post(path, body); localStorage.setItem('mc_token', data.token); setUser(data.user); return data.user; };
  const login = b => authenticate('/auth/login', b);
  const register = b => authenticate('/auth/register', b);
  const logout = () => { localStorage.removeItem('mc_token'); setUser(null); };
  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
