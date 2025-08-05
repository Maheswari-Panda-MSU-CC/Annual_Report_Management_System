"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Key, Menu, User, Users, Building, GraduationCap, Settings, FileText } from "lucide-react"
import Image from "next/image"

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "university_admin":
        return "University Admin"
      case "faculty_dean":
        return "Faculty Dean"
      case "department_head":
        return "Department Head"
      case "teacher":
        return "Teacher"
      default:
        return role
    }
  }

  const handleChangePassword = () => {
    router.push("/change-password")
  }

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Role-specific menu items
  const getAdminMenuItems = () => (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Users className="mr-2 h-4 w-4" />
          <span>User Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/user-management")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Manage Users</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/register-user")}>
            <User className="mr-2 h-4 w-4" />
            <span>Register User</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <FileText className="mr-2 h-4 w-4" />
          <span>Reports</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/reports")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>All Reports</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/reports/faculty")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Faculty Reports</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Building className="mr-2 h-4 w-4" />
          <span>Academic Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/activities")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Activities</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/events")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Events</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/development-programs")}>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Development Programs</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )

  const getDeanMenuItems = () => (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Building className="mr-2 h-4 w-4" />
          <span>Department Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/department/introduction")}>
            <Building className="mr-2 h-4 w-4" />
            <span>Department Info</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/faculty-management")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Faculty Overview</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <GraduationCap className="mr-2 h-4 w-4" />
          <span>Teacher Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/add-faculty")}>
            <User className="mr-2 h-4 w-4" />
            <span>Add Teacher</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/faculty-management")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Manage Teachers</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )

  const getHeadMenuItems = () => (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <GraduationCap className="mr-2 h-4 w-4" />
          <span>Teacher Data</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/faculty-management")}>
            <Users className="mr-2 h-4 w-4" />
            <span>All Teachers</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/add-faculty")}>
            <User className="mr-2 h-4 w-4" />
            <span>Add Teacher</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Building className="mr-2 h-4 w-4" />
          <span>Department Info</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/department/introduction")}>
            <Building className="mr-2 h-4 w-4" />
            <span>Department Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/activities")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Academic Activities</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 h-16">
      <div className="flex h-full items-center justify-between px-4 lg:px-6 lg:pl-6">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMobileMenuToggle}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* University Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src="/images/msu-logo.png"
                alt="MSU Baroda Logo"
                width={40}
                height={40}
                className="rounded-full object-contain"
              />
            </div>
            <h2 className="text-sm lg:text-lg font-semibold text-gray-900 truncate">
              The Maharaja Sayajirao University of Baroda
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* User Info Display */}
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  {user?.profilePicture ? (
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user?.name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user ? getInitials(user.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Guest User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                  <p className="text-xs leading-none text-muted-foreground">{getRoleDisplay(user?.role || "")}</p>
                  {user?.department && <p className="text-xs leading-none text-muted-foreground">{user.department}</p>}
                  {user?.faculty && <p className="text-xs leading-none text-muted-foreground">{user.faculty}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Role-specific menu items */}
              {user?.role === "university_admin" && getAdminMenuItems()}
              {user?.role === "faculty_dean" && getDeanMenuItems()}
              {user?.role === "department_head" && getHeadMenuItems()}

              {user && <DropdownMenuSeparator />}

              <DropdownMenuItem onClick={handleChangePassword}>
                <Key className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
