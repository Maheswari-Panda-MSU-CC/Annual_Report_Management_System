"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "university_admin" | "faculty_dean" | "department_head" | "teacher"

export interface User {
  id: string;
  email: string;
  user_type: number;
  name?: string;
  department?: string;
  faculty?: string;
  profilePicture?: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only check for existing session if not on login page
    if (pathname !== "/login") {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error("Error parsing saved user:", error)
          localStorage.removeItem("user")
        }
      }
    }
    setIsLoading(false)
  }, [pathname])

  // Handle redirects for protected routes
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login" && !pathname.startsWith("/(auth)")) {
      router.replace("/login")
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Login failed",
      };
    }

    const data = await response.json();

    const { user } = data;

    // Save user in state and localStorage
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));

    // Redirect based on user_type
    let redirectPath = '/teacher/dashboard';

    switch (user.user_type) {
      case 1:
        redirectPath = '/admin/dashboard';
        break;
      case 2:
        redirectPath = '/faculty/dashboard';
        break;
      case 3:
        redirectPath = '/department/dashboard';
        break;
      case 4:
        redirectPath = '/teacher/dashboard';
        break;
    }

    router.push(redirectPath);
    return data;
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    sessionStorage.clear()

    // Clear any cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // Force redirect to login page
    router.replace("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
