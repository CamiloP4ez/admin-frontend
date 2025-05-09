// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

import type { AuthResponseDto } from "../types/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponseDto | null; // Almacenaremos todo el AuthResponseDto
  token: string | null;
  login: (userData: AuthResponseDto) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUserData = localStorage.getItem("userData");
    if (storedToken && storedUserData) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("accessToken");
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthResponseDto) => {
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("userData", JSON.stringify(authData));
    setToken(authData.accessToken);
    setUser(authData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        user,
        token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
