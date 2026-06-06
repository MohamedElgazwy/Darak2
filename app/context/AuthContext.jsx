"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { accountService, authService } from "../services";

const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "authUser";

export const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
};

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (token, refreshToken, userData) => {
    const decodedToken = parseJwt(token);
    const enrichedUser = {
      ...userData,
      roles: decodedToken.roles || decodedToken.role || [] 
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(enrichedUser));
    setUser(enrichedUser);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const cached = localStorage.getItem(USER_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      if (cached) {
        try { setUser(JSON.parse(cached)); } catch {}
      }

      try {
        const res = await accountService.getMe();
        const freshUser = res?.data ?? res;
        const decodedToken = parseJwt(token);
        const enrichedUser = {
          ...freshUser,
          roles: decodedToken.roles || decodedToken.role || []
        };

        setUser(enrichedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(enrichedUser));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const data = res?.data ?? res;
    const token = data?.token;
    const refreshToken = data?.refreshToken;
    const userData = data?.user ?? data;

    if (!token) throw new Error("Invalid login response");
    saveSession(token, refreshToken, userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    return res?.data ?? res;
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (token && refreshToken) {
        await authService.revokeToken({ token, refreshToken }).catch(() => {});
      }
    } finally {
      clearSession();
      router.push("/auth/login");
    }
  }, [clearSession, router]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return userRoles.includes("Admin");
  }, [user]);

  const isCompany = useMemo(() => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return userRoles.includes("Company") || user?.userType === "Company";
  }, [user]);

  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user, loading, isAuthenticated, isAdmin, isCompany, login, register, logout
  }), [user, loading, isAuthenticated, isAdmin, isCompany, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}