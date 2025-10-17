"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "university_admin" | "faculty_dean" | "department_head" | "teacher"

export interface User {
  id: string;
  role_id: number;
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
    role_id: number;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Run once on mount to restore user
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []); // ✅ run only once, not on every pathname change
  
  // Handle redirects for protected routes only
  useEffect(() => {
    if (isLoading) return;
    if (!pathname) return;

    const isAuthRoute = pathname === "/login" || pathname.startsWith("/(auth)");
    if (isAuthRoute) return;

    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user, isLoading, pathname, router]);
  
  // Auto-logout when the session expires (based on cookie set at login)
  useEffect(() => {
    if (!user) return;
    const cookies = document.cookie.split(';').map(c => c.trim())
    const kv = cookies.find(c => c.startsWith('session_expires_at='))
    if (!kv) return;
    const value = kv.split('=')[1]
    const expiresAt = Number(value)
    if (!expiresAt || Number.isNaN(expiresAt)) return;

    const delay = Math.max(0, expiresAt - Date.now())
    const timer = setTimeout(() => {
      logout()
    }, delay)

    return () => clearTimeout(timer)
  }, [user])

  // Guard on route change: if expired, logout immediately
  useEffect(() => {
    if (!user) return;
    const cookies = document.cookie.split(';').map(c => c.trim())
    const kv = cookies.find(c => c.startsWith('session_expires_at='))
    const value = kv ? kv.split('=')[1] : undefined
    const expiresAt = value ? Number(value) : undefined
    if (expiresAt && Date.now() >= expiresAt) {
      logout()
    }
  }, [pathname, user])

  // Periodic check as a safety net (every 30 min)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const kv = cookies.find(c => c.startsWith('session_expires_at='))
      const value = kv ? kv.split('=')[1] : undefined
      const expiresAt = value ? Number(value) : undefined
      if (expiresAt && Date.now() >= expiresAt) {
        clearInterval(interval)
        logout()
      }
    }, 1800000)
    return () => clearInterval(interval)
  }, [user])
  
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      // Disable caching at request level too
      cache: "no-store",
      credentials: "include",
    });
  
    if (!response.ok) {
      return {
        success: false,
        message: "Login failed",
      };
    }
  
    const data = await response.json();
    const { user } = data;
  
    // Save user in state and localStorage immediately
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  
    // Redirect based on user_type
    const routeByType: Record<number, string> = {
      1: "/admin/dashboard",
      2: "/faculty/dashboard",
      3: "/department/dashboard",
      4: "/teacher/dashboard",
    };
    const redirectPath = routeByType[user.user_type] || "/teacher/dashboard";
    // Force a fresh navigation to ensure auth state is reflected
    router.replace(redirectPath);
    // As a fallback, trigger a refresh of the router cache
    if ((router as any).refresh) {
      (router as any).refresh();
    }
  
    return data;
  };
  

  const logout = () => {
    // Call server to clear httpOnly cookies
    fetch("/api/auth/login", { method: "DELETE", cache: "no-store", credentials: "include" })
      .catch(() => {})
      .finally(() => {
        setUser(null)
        localStorage.removeItem("user")
        sessionStorage.clear()

        // Best-effort clear non-httpOnly cookies (role_id, etc.)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/")
        })

        router.replace("/login")
        if ((router as any).refresh) {
          (router as any).refresh();
        }
      })
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
