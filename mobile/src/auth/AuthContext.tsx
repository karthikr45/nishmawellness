import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredToken, login as apiLogin, register as apiRegister, logout as apiLogout } from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        // Verify token is still valid by fetching profile
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}/api/users/profile`, {
          headers: { Cookie: `next-auth.session-token=${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
        }
      }
    } catch {
      // Token invalid, clear it
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    await checkAuth();
  };

  const register = async (name: string, email: string, password: string) => {
    await apiRegister(name, email, password);
    await apiLogin(email, password);
    await checkAuth();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
