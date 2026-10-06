"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "../types";
import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export const normalizeRole = (
  r: any
): "job_seeker" | "company" | "super_admin" | null => {
  if (!r) return null;
  const str = String(r).toLowerCase().trim();
  if (str === "company" || str === "employer" || str === "2") return "company";
  if (str === "job_seeker" || str === "seeker" || str === "1") return "job_seeker";
  if (str === "super_admin" || str === "admin" || str === "3") return "super_admin";
  return "job_seeker";
};

const setAuthCookies = (token: string, role: string) => {
  if (typeof document !== "undefined") {
    // 30 days expiry
    const maxAge = 30 * 24 * 60 * 60;
    document.cookie = `joballocate_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `joballocate_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

const clearAuthCookies = () => {
  if (typeof document !== "undefined") {
    document.cookie = "joballocate_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "joballocate_role=; path=/; max-age=0; SameSite=Lax";
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: "job_seeker" | "company" | "super_admin" | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted auth from localStorage
    const savedToken = localStorage.getItem("joballocate_token");
    const savedUser = localStorage.getItem("joballocate_user");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          const r = normalizeRole(parsedUser.role || parsedUser.user_type) || "job_seeker";
          setAuthCookies(savedToken, r);
        } catch {
          // Ignore parsing error
        }
      }
      // Refresh profile silently
      refreshUserSilently(savedToken);
    } else {
      clearAuthCookies();
      setIsLoading(false);
    }
  }, []);

  const refreshUserSilently = async (authToken: string) => {
    try {
      const response = await apiClient.get(ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data && response.data.user) {
        const u = response.data.user;
        setUser(u);
        localStorage.setItem("joballocate_user", JSON.stringify(u));
        const r = normalizeRole(u.role || u.user_type) || "job_seeker";
        setAuthCookies(authToken, r);
      }
    } catch {
      // Ignore background refresh failure
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    const resolvedRole = normalizeRole(newUser.role || newUser.user_type) || "job_seeker";
    localStorage.setItem("joballocate_token", newToken);
    localStorage.setItem("joballocate_user", JSON.stringify(newUser));
    setAuthCookies(newToken, resolvedRole);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("joballocate_token");
    localStorage.removeItem("joballocate_user");
    clearAuthCookies();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("joballocate_user", JSON.stringify(updatedUser));
    if (token) {
      const resolvedRole = normalizeRole(updatedUser.role || updatedUser.user_type) || "job_seeker";
      setAuthCookies(token, resolvedRole);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await apiClient.get(ENDPOINTS.USER_PROFILE);
      if (response.data && response.data.user) {
        updateUser(response.data.user);
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  const role: "job_seeker" | "company" | "super_admin" | null = user
    ? normalizeRole(user.role || user.user_type)
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        role,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
