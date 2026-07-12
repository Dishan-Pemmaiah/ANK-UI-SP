import { createContext, useMemo, useState } from 'react';
import authApi from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ank_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ank_token'));
  const [loading, setLoading] = useState(false);

  const login = async (tokenValue, userData) => {
    setLoading(true);
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('ank_token', tokenValue);
    localStorage.setItem('ank_user', JSON.stringify(userData));
    setLoading(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('ank_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout failures and always clear local session.
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('ank_token');
    localStorage.removeItem('ank_user');
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, updateUser, isAuthenticated: Boolean(token) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
