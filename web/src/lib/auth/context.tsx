"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "../types";
import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
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
          setUser(JSON.parse(savedUser));
        } catch {
          // Ignore parsing error
        }
      }
      // Refresh profile silently
      refreshUserSilently(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUserSilently = async (authToken: string) => {
    try {
      const response = await apiClient.get(ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem("joballocate_user", JSON.stringify(response.data.user));
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
    localStorage.setItem("joballocate_token", newToken);
    localStorage.setItem("joballocate_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("joballocate_token");
    localStorage.removeItem("joballocate_user");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("joballocate_user", JSON.stringify(updatedUser));
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

  const role: UserRole | null = user
    ? user.role === 1 || user.role === "1" || user.user_type === "seeker"
      ? "seeker"
      : user.role === 2 || user.role === "2" || user.user_type === "employer"
      ? "employer"
      : user.role === 3 || user.role === "3" || user.user_type === "admin"
      ? "admin"
      : "seeker"
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
