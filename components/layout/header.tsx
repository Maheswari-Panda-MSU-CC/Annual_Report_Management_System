"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Key, Menu, User } from "lucide-react"
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
