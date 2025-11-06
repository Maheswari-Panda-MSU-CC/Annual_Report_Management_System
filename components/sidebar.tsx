"use client"

import type React from "react"
import { useAuth } from "../app/api/auth/auth-provider"
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
  IndianRupee,
  Copyright,
  FileCheck,
  X,
  Presentation,
  Star,
  Globe,
  FileImage,
  Medal,
  Building,
  UserPlus,
  UserCog,
  Download,
  LogOut,
  Shield,
  ClipboardList,
  Activity,
  Settings as SettingsIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// TypeScript interfaces for navigation items
interface SubItem {
  name: string
  href: string
  icon: string
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  subItems?: SubItem[]
}

// Unified navigation configuration for all roles
const navigationConfig: Record<number, NavigationItem[]> = {
  1: [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
    },
    {
      name: "Year Management",
      href: "/admin/year",
      icon: Calendar,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
      subItems: [
        { name: "Faculty Report", href: "/admin/reports/faculty", icon: "Users" },
        { name: "Appendices Report", href: "/admin/reports/appendices", icon: "FileText" },
        { name: "AQAR Report", href: "/admin/reports/aqar", icon: "Award" },
        { name: "Academic Recommendation Report", href: "/admin/reports/academic-recommendation", icon: "BookOpen" },
        { name: "Teachers Consolidated Report", href: "/admin/reports/teachers-consolidated", icon: "Users" },
      ],
    },
    {
      name: "User Management",
      href: "/admin/user-management",
      icon: UserCog,
    },
    {
      name: "Registration",
      href: "/admin/register-user",
      icon: UserPlus,
    },
    {
      name: "Additional Information",
      href: "/admin/additional-info",
      icon: ClipboardList,
    },
    {
      name: "Academic Activities",
      href: "/admin/academic",
      icon: GraduationCap,
      subItems: [
        { name: "Paper Presented", href: "/admin/academic/paper-presented", icon: "Presentation" },
        { name: "Activities", href: "/admin/academic/activities", icon: "Activity" },
        { name: "Student Progression", href: "/admin/academic/student-progression", icon: "Users" },
        { name: "Alumni", href: "/admin/academic/alumni", icon: "UserCheck" },
        { name: "Development Programs", href: "/admin/academic/development-programs", icon: "Briefcase" },
        { name: "Events", href: "/admin/academic/events", icon: "Calendar" },
      ],
    },
    {
      name: "Department Management",
      href: "/admin/department",
      icon: Building,
      subItems: [
        { name: "Department Introduction", href: "/admin/department/introduction", icon: "FileText" },
        { name: "Logins", href: "/admin/department/logins", icon: "Shield" },
      ],
    },
    {
      name: "Teacher's ARMS Status",
      href: "/admin/teachers-arms",
      icon: FileCheck,
    },
    {
      name: "Downloads Mode",
      href: "/admin/downloads",
      icon: Download,
    },
    {
      name: "Admin Mode",
      href: "/admin/admin-mode",
      icon: Shield,
    },
  ],
  2: [
    {
      name: "Dashboard",
      href: "/faculty/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/faculty/profile",
      icon: User,
    },
    {
      name: "Events",
      href: "/faculty/events",
      icon: Calendar,
    },
    {
      name: "Visitors",
      href: "/faculty/visitors",
      icon: Users,
    },
    {
      name: "Development Programs",
      href: "/faculty/development-programs",
      icon: BookOpen,
    },
    {
      name: "Staff",
      href: "/faculty/staff",
      icon: UserCog,
    },
    {
      name: "Activities",
      href: "/faculty/activities",
      icon: Briefcase,
    },
    {
      name: "Student Progression",
      href: "/faculty/student-progression",
      icon: Users,
    },
    {
      name: "Student Support",
      href: "/faculty/student-support",
      icon: UserCheck,
    },
    {
      name: "Enrolled Students",
      href: "/faculty/enrolled-student",
      icon: GraduationCap,
    },
    {
      name: "Departments",
      href: "/faculty/departments",
      icon: Building,
    },
    {
      name: "Alumni",
      href: "/faculty/alumni",
      icon: Medal,
    },
    {
      name: "Collaborations",
      href: "/faculty/collaborations",
      icon: Building,
    },
    {
      name: "Curriculum",
      href: "/faculty/curriculum",
      icon: BookOpen,
    },
    {
      name: "Report",
      href: "/faculty/report",
      icon: FileText,
    },
    {
      name: "Infrastructure",
      href: "/faculty/infrastructure",
      icon: Building,
    },
    {
      name: "Criterion 5",
      href: "/faculty/criterion-5",
      icon: Star,
    },
    {
      name: "Criterion 6",
      href: "/faculty/criterion-6",
      icon: Globe,
    },
    {
      name: "Criterion 7",
      href: "/faculty/criterion-7",
      icon: Lightbulb,
    },
    {
      name: "AQAR Report",
      href: "/faculty/aqar-report",
      icon: FileCheck,
    },
    {
      name: "Qualitative Matrix",
      href: "/faculty/qualitative-matrix",
      icon: BarChart3,
    },
    {
      name: "Teachers ARMS Report",
      href: "/faculty/teachers-arms-report",
      icon: FileCheck,
    },
    {
      name: "Departments ARMS Report",
      href: "/faculty/departments-arms-report",
      icon: FileText,
    },
    {
      name: "Download Menu",
      href: "/faculty/download-menu",
      icon: Download,
    },
  ],
  3: [
    {
      name: "Dashboard",
      href: "/department/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/department/profile",
      icon: User,
    },
    {
      name: "Events",
      href: "/department/events",
      icon: Calendar,
    },
    {
      name: "Visitors",
      href: "/department/visitors",
      icon: Users,
    },
    {
      name: "Academic Programs",
      href: "/department/academic-programs",
      icon: GraduationCap,
    },
    {
      name: "Development Programs",
      href: "/department/development-programs",
      icon: BookOpen,
    },
    {
      name: "Staff",
      href: "/department/staff",
      icon: UserCog,
    },
    {
      name: "Activities",
      href: "/department/activities",
      icon: Briefcase,
    },
    {
      name: "Awards",
      href: "/department/awards",
      icon: Trophy,
    },
    {
      name: "Student Progression",
      href: "/department/student-progression",
      icon: Users,
    },
    {
      name: "Student Support",
      href: "/department/student-support",
      icon: UserCheck,
    },
    {
      name: "Alumni",
      href: "/department/alumni",
      icon: Medal,
    },
    {
      name: "Collaborations",
      href: "/department/collaborations",
      icon: Building,
    },
    {
      name: "Curriculum Enrichment",
      href: "/department/curriculum-enrichment",
      icon: BookOpen,
    },
    {
      name: "PhD Details",
      href: "/department/phd-details",
      icon: GraduationCap,
    },
    {
      name: "Report",
      href: "/department/report",
      icon: FileText,
    },
    {
      name: "Infrastructure",
      href: "/department/infrastructure",
      icon: Building,
    },
    {
      name: "Criterion 5",
      href: "/department/criterion-5",
      icon: Star,
    },
    {
      name: "Criterion 6",
      href: "/department/criterion-6",
      icon: Globe,
    },
    {
      name: "Criterion 7",
      href: "/department/criterion-7",
      icon: Lightbulb,
    },
    {
      name: "Sanctioned Teacher",
      href: "/department/sanctioned-teacher",
      icon: UserPlus,
    },
    {
      name: "Teacher's ARMS Report",
      href: "/department/teachers-arms-report",
      icon: FileCheck,
    },
    {
      name: "Department's Download Report",
      href: "/department/departments-download-report",
      icon: Download,
    },
    {
      name: "Change Password",
      href: "/change-password",
      icon: Settings,
    },
  ],
  4: [
    {
      name: "Dashboard",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/teacher/profile",
      icon: User,
    },
    // {
    //   name: "Faculty Management",
    //   href: "/teacher/faculty-management",
    //   icon: Users,
    // },
    {
      name: "Research Projects",
      href: "/teacher/research",
      icon: Award,
    },
    {
      name: "Publications",
      href: "/teacher/publication",
      icon: BookOpen,
      subItems: [
        { name: "Published Articles/Journals", href: "/teacher/publication?tab=journals", icon: "FileText" },
        { name: "Books/Book Chapters", href: "/teacher/publication?tab=books", icon: "BookOpen" },
        { name: "Papers Presented", href: "/teacher/publication?tab=papers", icon: "Presentation" },
      ],
    },
    {
      name: "Research & Academic Contributions",
      href: "/teacher/research-contributions",
      icon: GraduationCap,
      subItems: [
        { name: "Patents", href: "/teacher/research-contributions?tab=patents", icon: "Lightbulb" },
        { name: "Policy Documents", href: "/teacher/research-contributions?tab=policy", icon: "FileText" },
        { name: "E-Content", href: "/teacher/research-contributions?tab=econtent", icon: "Monitor" },
        { name: "Consultancy", href: "/teacher/research-contributions?tab=consultancy", icon: "Briefcase" },
        { name: "Collaborations / MoUs", href: "/teacher/research-contributions?tab=collaborations", icon: "UserCheck" },
        { name: "Academic Visits", href: "/teacher/research-contributions?tab=visits", icon: "Plane" },
        { name: "Financial Support", href: "/teacher/research-contributions?tab=financial", icon: "IndianRupee" },
        { name: "JRF/SRF", href: "/teacher/research-contributions?tab=jrfSrf", icon: "Users" },
        { name: "PhD Guidance", href: "/teacher/research-contributions?tab=phd", icon: "GraduationCap" },
        { name: "Copyrights", href: "/teacher/research-contributions?tab=copyrights", icon: "Copyright" },
      ],
    },
    {
      name: "Events & Activities",
      href: "/teacher/talks-events",
      icon: Calendar,
      subItems: [
        { name: "Refresher/Orientation", href: "/teacher/talks-events?tab=refresher", icon: "FileText" },
        { name: "Academic Programs", href: "/teacher/talks-events?tab=academic-programs", icon: "Users" },
        { name: "Academic Bodies", href: "/teacher/talks-events?tab=academic-bodies", icon: "Building" },
        { name: "University Committees", href: "/teacher/talks-events?tab=committees", icon: "Users" },
        { name: "Academic Talks", href: "/teacher/talks-events?tab=talks", icon: "Presentation" },
      ],
    },
    {
      name: "Awards & Recognition",
      href: "/teacher/awards-recognition",
      icon: Trophy,
      subItems: [
        { name: "Performance", href: "/teacher/awards-recognition?tab=performance", icon: "BarChart3" },
        { name: "Awards Recognition", href: "/teacher/awards-recognition?tab=awards", icon: "Trophy" },
        { name: "Extension Activities", href: "/teacher/awards-recognition?tab=extension", icon: "Users" },
      ],
    },
    {
      name: "Academic Recommendations",
      href: "/teacher/academic-recommendations",
      icon: GraduationCap,
      subItems: [
        { name: "Articles/Journals", href: "/teacher/academic-recommendations?tab=articles", icon: "FileText" },
        { name: "Books", href: "/teacher/academic-recommendations?tab=books", icon: "BookOpen" },
        { name: "Magazines", href: "/teacher/academic-recommendations?tab=magazines", icon: "FileImage" },
        { name: "Technical Reports", href: "/teacher/academic-recommendations?tab=technical", icon: "FileCheck" },
      ],
    },
    {
      name: "Publication Certificate",
      href: "/teacher/publication-certificate",
      icon: FileCheck,
    },
    // {
    //   name: "Analytics",
    //   href: "/teacher/analytics",
    //   icon: BarChart3,
    // },
    {
      name: "Generate CV",
      href: "/teacher/generate-cv",
      icon: FileText,
    },
    // {
    //   name: "Online Engagement",
    //   href: "/teacher/online-engagement",
    //   icon: Globe,
    // },
    {
      name: "Change Password",
      href: "/change-password",
      icon: Settings,
    },
  ],
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Get navigation based on user role
  const navigation = navigationConfig[user?.user_type || 0]

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Lightbulb,
      FileText,
      Monitor,
      Briefcase,
      UserCheck,
      Plane,
      IndianRupee,
      Users,
      GraduationCap,
      Copyright,
      BookOpen,
      Presentation,
      FileCheck,
      Trophy,
      Award,
      Star,
      Globe,
      FileImage,
      Medal,
      BarChart3,
      Building,
      Activity,
      Shield,
    }
    return iconMap[iconName] || FileText
  }

  const getRoleDisplayName = (user_type: number) => {
    const roleNames = {
      1: "University Admin",
      2: "Faculty Dean",
      3: "Department Head",
      4: "Teacher",
    }
    return roleNames[user_type as keyof typeof roleNames] || "User"
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-black bg-opacity-50 lg:hidden" onClick={handleOverlayClick} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-40 flex w-64 flex-col transition-transform duration-300 ease-in-out",
          "lg:top-16 lg:bottom-0 lg:left-0 lg:translate-x-0",
          "top-0 bottom-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg border-r border-gray-200">
          {/* Mobile header */}
          <div className="flex h-16 shrink-0 items-center justify-end lg:hidden">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          {/* Desktop spacing */}
          <div className="hidden lg:block h-4 shrink-0"></div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
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
                                const IconComponent = getIconComponent(subItem.icon)
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

              {/* Logout button at bottom */}
              <li className="mt-auto">
                <button
                  onClick={logout}
                  className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>

          {/* User info */}
          {/* <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{getRoleDisplayName(user?.role || "teacher")}</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  )
}
