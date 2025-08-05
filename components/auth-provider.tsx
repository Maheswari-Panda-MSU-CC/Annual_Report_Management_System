"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "university_admin" | "faculty_dean" | "department_head" | "teacher"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  faculty?: string
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - replace with actual API call
    const mockUsers: User[] = [
      // University Admin
      {
        id: "1",
        name: "Dr. University Admin",
        email: "admin@msubaroda.ac.in",
        role: "university_admin",
        profilePicture: "/placeholder.svg?height=40&width=40&text=UA",
      },
      // Faculty Deans
      {
        id: "5",
        name: "Dean of Arts",
        email: "dean-arts@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Arts",
        department: "Arts Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DA",
      },
      {
        id: "6",
        name: "Dean of Technology and Engineering",
        email: "dean-techo@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Technology and Engineering",
        department: "Technology Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DT",
      },
      {
        id: "7",
        name: "Dean of Education and Psychology",
        email: "dean-edu@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Education and Psychology",
        department: "Education Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DE",
      },
      {
        id: "8",
        name: "Dean of Commerce",
        email: "dean-comm@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Commerce",
        department: "Commerce Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DC",
      },
      {
        id: "9",
        name: "Dean of Medicine",
        email: "dean-medi@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Medicine",
        department: "Medicine Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DM",
      },
      {
        id: "10",
        name: "Dean of Law",
        email: "dean-law@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Law",
        department: "Law Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DL",
      },
      {
        id: "11",
        name: "Dean of Fine Arts",
        email: "dean-farts@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Fine Arts",
        department: "Fine Arts Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=DF",
      },
      {
        id: "12",
        name: "Dean of Family and Community Science",
        email: "dean-fcs@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Family and Community Science",
        department: "FCS Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=FC",
      },
      {
        id: "13",
        name: "Dean of Social Work",
        email: "dean-sw@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Social Work",
        department: "Social Work Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=SW",
      },
      {
        id: "14",
        name: "Dean of Performing Arts",
        email: "dean-parts@msubaroda.ac.in",
        role: "faculty_dean",
        faculty: "Faculty of Performing Arts",
        department: "Performing Arts Administration",
        profilePicture: "/placeholder.svg?height=40&width=40&text=PA",
      },
      // Department Head
      {
        id: "3",
        name: "Dr. CS Head",
        email: "head.cs@msubaroda.ac.in",
        role: "department_head",
        department: "Computer Science",
        faculty: "Faculty of Technology",
        profilePicture: "/placeholder.svg?height=40&width=40&text=CH",
      },
      // Teacher
      {
        id: "4",
        name: "Dr. Viral Kapadia",
        email: "viral.kapadia-cse@msubaroda.ac.in",
        role: "teacher",
        department: "Computer Science & Engineering",
        faculty: "Faculty of Technology and Engineering",
        profilePicture: "/placeholder.svg?height=40&width=40&text=VK",
      },
    ]

    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser && password === "password") {
      // Set user in state first
      setUser(foundUser)

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(foundUser))

      // Determine redirect path based on role
      let redirectPath = "/teacher/dashboard"
      if (foundUser.role === "university_admin") {
        redirectPath = "/admin/dashboard"
      } else if (foundUser.role === "faculty_dean") {
        redirectPath = "/faculty/dashboard"
      } else if (foundUser.role === "department_head") {
        redirectPath = "/department/dashboard"
      }

      // Use router.push with a slight delay to ensure state is updated
      router.push(redirectPath)

      return true
    }
    return false
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
