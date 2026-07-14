import { createContext, useEffect, useMemo, useState } from 'react';
import authApi from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ank_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ank_token'));
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const session = await authApi.getActiveSession();
        if (session?.access_token && session?.user?.email) {
          const profile = await authApi.getProfile();
          if (mounted) {
            setToken(session.access_token);
            setUser({ fullName: profile.fullName, role: profile.role, email: profile.email });
            localStorage.setItem('ank_token', session.access_token);
            localStorage.setItem('ank_user', JSON.stringify({ fullName: profile.fullName, role: profile.role, email: profile.email }));
          }
        }
      } catch {
        if (mounted) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('ank_token');
          localStorage.removeItem('ank_user');
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    hydrate();

    const subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) {
        return;
      }

      if (!session?.access_token) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('ank_token');
        localStorage.removeItem('ank_user');
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setToken(session.access_token);
        setUser({ fullName: profile.fullName, role: profile.role, email: profile.email });
        localStorage.setItem('ank_token', session.access_token);
        localStorage.setItem('ank_user', JSON.stringify({ fullName: profile.fullName, role: profile.role, email: profile.email }));
      } catch {
        setToken(session.access_token);
      }
    });

    return () => {
      mounted = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

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
    () => ({
      user,
      token,
      loading,
      initialized,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(token),
      isAdmin: authApi.isAdminRole(user?.role)
    }),
    [user, token, loading, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
