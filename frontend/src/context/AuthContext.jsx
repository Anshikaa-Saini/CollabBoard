import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi, getMeApi } from "../api/authApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "collabboard_token";
const USER_KEY = "collabboard_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, rehydrate session from localStorage + verify with backend
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore malformed cache
        }
      }

      try {
        const res = await getMeApi();
        setUser(res.data.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const persistSession = (userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const { user: userData, token } = res.data.data;
    persistSession(userData, token);
    return userData;
  };

  const register = async (payload) => {
    const res = await registerApi(payload);
    const { user: userData, token } = res.data.data;
    persistSession(userData, token);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
