"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  User,
  Trophy,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Monitor,
  Briefcase,
  UserCheck,
  Plane,
  DollarSign,
  Copyright,
  FileCheck,
  X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Faculty Management",
    href: "/faculty-management",
    icon: Users,
    roles: ["university_admin", "faculty_dean", "department_head"],
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: User,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Annual Reports",
    href: "/reports",
    icon: FileText,
    roles: ["university_admin", "faculty_dean", "department_head"],
  },
  {
    name: "Research Projects",
    href: "/research",
    icon: Award,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Publications",
    href: "/publications",
    icon: BookOpen,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Research & Academic Contributions",
    href: "/research-contributions",
    icon: GraduationCap,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
    subItems: [
      { name: "Patents", href: "/research-contributions?tab=patents", icon: "Lightbulb" },
      { name: "Policy Documents", href: "/research-contributions?tab=policy", icon: "FileText" },
      { name: "E-Content", href: "/research-contributions?tab=econtent", icon: "Monitor" },
      { name: "Consultancy", href: "/research-contributions?tab=consultancy", icon: "Briefcase" },
      { name: "Collaborations / MoUs", href: "/research-contributions?tab=collaborations", icon: "UserCheck" },
      { name: "Academic Visits", href: "/research-contributions?tab=visits", icon: "Plane" },
      { name: "Financial Support", href: "/research-contributions?tab=financial", icon: "DollarSign" },
      { name: "JRF/SRF", href: "/research-contributions?tab=jrfSrf", icon: "Users" },
      { name: "PhD Guidance", href: "/research-contributions?tab=phd", icon: "GraduationCap" },
      { name: "Copyrights", href: "/research-contributions?tab=copyrights", icon: "Copyright" },
    ],
  },
  {
    name: "Events & Activities",
    href: "/talks-events",
    icon: Calendar,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Awards & Recognition",
    href: "/awards-recognition",
    icon: Trophy,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Academic Recommendations",
    href: "/academic-recommendations",
    icon: GraduationCap,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Online Engagement Information Summary",
    href: "/online-engagement",
    icon: Monitor,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Publication Certificate",
    href: "/publication-certificate",
    icon: FileCheck,
    roles: ["university_admin", "faculty_dean", "department_head", "teacher"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["university_admin", "faculty_dean", "department_head"],
  },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["university_admin"] },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

// Map user_type to role string for navigation filtering
const userTypeToRole = (userType: number): string => {
  switch (userType) {
    case 1:
      return "teacher";
    case 2:
      return "faculty_dean";
    case 3:
      return "university_admin";
    default:
      return "teacher";
  }
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userTypeToRole(user?.user_type || 1)))

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose) {
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile overlay - positioned to not interfere with sidebar content */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-black bg-opacity-50 lg:hidden" onClick={handleOverlayClick} />
      )}

      {/* Sidebar - higher z-index than overlay */}
      <div
        className={cn(
          "fixed z-40 flex w-64 flex-col transition-transform duration-300 ease-in-out",
          // Desktop positioning - below header
          "lg:top-16 lg:bottom-0 lg:left-0 lg:translate-x-0",
          // Mobile positioning - full height when open
          "top-0 bottom-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg border-r border-gray-200 custom-scrollbar">
          {/* Mobile header - only visible on mobile */}
          <div className="flex h-16 shrink-0 items-center justify-between lg:hidden">
            <h1 className="text-xl font-bold text-blue-600">MSU Reports</h1>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          {/* Desktop header - only visible on desktop, smaller height */}
          <div className="hidden lg:flex h-12 shrink-0 items-center pt-4">
            <h1 className="text-xl font-bold text-blue-600">MSU Reports</h1>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      {item.subItems ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={cn(
                              "w-full group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                              pathname.startsWith(item.href)
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:text-blue-600",
                            )}
                          >
                            <item.icon
                              className={cn(
                                pathname.startsWith(item.href)
                                  ? "text-blue-600"
                                  : "text-gray-400 group-hover:text-blue-600",
                                "h-6 w-6 shrink-0",
                              )}
                              aria-hidden="true"
                            />
                            <span className="flex-1">{item.name}</span>
                            {expandedItems.includes(item.name) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {expandedItems.includes(item.name) && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.subItems.map((subItem) => {
                                const IconComponent =
                                  {
                                    Lightbulb,
                                    FileText,
                                    Monitor,
                                    Briefcase,
                                    UserCheck,
                                    Plane,
                                    DollarSign,
                                    Users,
                                    GraduationCap,
                                    Copyright,
                                  }[subItem.icon] || FileText

                                return (
                                  <li key={subItem.name}>
                                    <Link href={subItem.href}>
                                      <span
                                        onClick={handleLinkClick}
                                        className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 text-gray-600 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                      >
                                        <IconComponent className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                        {subItem.name}
                                      </span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={cn(
                            pathname === item.href
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          )}
                        >
                          <item.icon
                            className={cn(
                              pathname === item.href ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600",
                              "h-6 w-6 shrink-0",
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
