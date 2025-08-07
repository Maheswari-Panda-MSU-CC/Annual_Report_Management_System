"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  User,
  FileText,
  BookOpen,
  Award,
  Calendar,
  Users,
  X,
  Building,
  GraduationCap,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["teacher", "department_head"],
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      roles: ["teacher", "department_head", "faculty_dean", "university_admin"],
    },
    {
      title: "Publications",
      href: "/publication",
      icon: BookOpen,
      roles: ["teacher", "department_head"],
    },
    {
      title: "Research",
      href: "/research",
      icon: Award,
      roles: ["teacher", "department_head"],
    },
    {
      title: "Events & Talks",
      href: "/talks-events",
      icon: Calendar,
      roles: ["teacher", "department_head"],
    },
    {
      title: "Faculty Management",
      href: "/faculty-management",
      icon: Users,
      roles: ["department_head", "faculty_dean"],
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      roles: ["department_head", "faculty_dean", "university_admin"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["department_head", "faculty_dean", "university_admin"],
    },
  ]

  // Admin-specific navigation
  const adminNavigationItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: Home,
      roles: ["university_admin"],
    },
    {
      title: "User Management",
      href: "/admin/user-management",
      icon: Users,
      roles: ["university_admin"],
    },
    {
      title: "Academic Management",
      href: "/admin/academic/activities",
      icon: GraduationCap,
      roles: ["university_admin"],
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: FileText,
      roles: ["university_admin"],
    },
  ]

  // Faculty-specific navigation
  const facultyNavigationItems = [
    {
      title: "Faculty Dashboard",
      href: "/faculty/dashboard",
      icon: Home,
      roles: ["faculty_dean"],
    },
    {
      title: "Faculty Events",
      href: "/faculty/events",
      icon: Calendar,
      roles: ["faculty_dean"],
    },
    {
      title: "Faculty Profile",
      href: "/faculty/profile",
      icon: User,
      roles: ["faculty_dean"],
    },
    {
      title: "Department Management",
      href: "/admin/department/introduction",
      icon: Building,
      roles: ["faculty_dean"],
    },
  ]

  const getNavigationItems = () => {
    if (user?.role === "university_admin") {
      return adminNavigationItems
    } else if (user?.role === "faculty_dean") {
      return facultyNavigationItems
    } else {
      return navigationItems.filter((item) => item.roles.includes(user?.role || "teacher"))
    }
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* User info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role?.replace("_", " ") || "Role"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
