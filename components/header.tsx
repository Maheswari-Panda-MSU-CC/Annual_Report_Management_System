"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "../app/api/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
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
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Force refresh trigger

  // Fetch profile image from S3 for teachers when profilePicture path changes
  // This fetches the S3 presigned URL using the path format: upload/Profile/teacheremailId.extension
  useEffect(() => {
    const fetchProfileImage = async () => {
      // Only fetch for teachers (user_type === 4) and if profilePicture exists
      if (user?.user_type !== 4 || !user?.profilePicture) {
        setProfileImageUrl(null)
        return
      }

      try {
        // Call API to get S3 presigned URL or local URL
        // The API handles both S3 (upload/Profile/...) and local paths
        const response = await fetch("/api/teacher/profile/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: user.profilePicture }),
        })

        if (!response.ok) {
          // 404 or other error - file doesn't exist, show default icon
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 404) {
            console.warn("Profile image not found:", errorData.error || "File not found")
          } else {
            console.error(`Failed to fetch image URL: ${response.status} ${response.statusText}`)
          }
          setProfileImageUrl(null)
          return
        }

        const data = await response.json()
        if (data.success && data.url) {
          const imageUrl = `${data.url}`
          setProfileImageUrl(imageUrl)
        } else {
          // File not found or error - show default icon
          console.warn("Profile image fetch failed:", data.error || "No URL returned")
          setProfileImageUrl(null)
        }
      } catch (error) {
        console.error("Error fetching profile image URL:", error)
        // On error, show default icon
        setProfileImageUrl(null)
      }
    }

    fetchProfileImage()
  }, [user?.profilePicture, user?.user_type, refreshTrigger])

  // Listen for custom event to force refresh profile image
  // This is triggered when profile is updated from the profile page
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleProfileImageUpdate = () => {
      // Clear current image and trigger refresh to fetch new image
      setProfileImageUrl(null)
      // Small delay to ensure AuthContext has updated with new profilePicture
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1)
      }, 100)
    }

    window.addEventListener("profileImageUpdated" as any, handleProfileImageUpdate as EventListener)
    return () => {
      window.removeEventListener("profileImageUpdated" as any, handleProfileImageUpdate as EventListener)
    }
  }, [])

  // Listen for localStorage changes to detect profilePicture updates from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        try {
          if (e.newValue) {
            const updatedUser = JSON.parse(e.newValue)
            // If profilePicture changed (including when removed), trigger a refresh
            const newProfilePicture = updatedUser.profilePicture || null
            const currentProfilePicture = user?.profilePicture || null
            if (newProfilePicture !== currentProfilePicture) {
              setProfileImageUrl(null) // Clear current image to force reload
              setRefreshTrigger(prev => prev + 1)
            }
          } else {
            // User data cleared - clear image
            setProfileImageUrl(null)
          }
        } catch (error) {
          console.error("Error parsing user from storage:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [user?.profilePicture])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleDisplay = (user_type: number) => {
    switch (user_type) {
      case 1:
        return "University Admin"
      case 2:
        return "Faculty Dean"
      case 3:
        return "Department Head"
      case 4:
        return "Teacher"
      default:
        return user_type
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
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>User Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/user-management")} className="text-xs sm:text-sm">
            <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Manage Users</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/register-user")} className="text-xs sm:text-sm">
            <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Register User</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <FileText className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Reports</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/reports")} className="text-xs sm:text-sm">
            <FileText className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>All Reports</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/reports/faculty")} className="text-xs sm:text-sm">
            <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Faculty Reports</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <Building className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Academic Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/activities")} className="text-xs sm:text-sm">
            <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Activities</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/events")} className="text-xs sm:text-sm">
            <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Events</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/development-programs")} className="text-xs sm:text-sm">
            <GraduationCap className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Development Programs</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )

  const getDeanMenuItems = () => (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <Building className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Department Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/department/introduction")} className="text-xs sm:text-sm">
            <Building className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Department Info</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/faculty-management")} className="text-xs sm:text-sm">
            <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Faculty Overview</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <GraduationCap className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Teacher Management</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/add-faculty")} className="text-xs sm:text-sm">
            <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Add Teacher</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/faculty-management")} className="text-xs sm:text-sm">
            <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Manage Teachers</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )

  const getHeadMenuItems = () => (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <GraduationCap className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Teacher Data</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/faculty-management")} className="text-xs sm:text-sm">
            <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>All Teachers</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/add-faculty")} className="text-xs sm:text-sm">
            <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Add Teacher</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs sm:text-sm">
          <Building className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Department Info</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/department/introduction")} className="text-xs sm:text-sm">
            <Building className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Department Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/admin/academic/activities")} className="text-xs sm:text-sm">
            <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Academic Activities</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 h-14 sm:h-16">
      <div className="flex h-full items-center justify-between px-2 sm:px-4 lg:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0 flex-shrink-0" onClick={onMobileMenuToggle}>
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* University Logo and Name */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 min-w-0 flex-1">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <Image
                src="/images/msu-logo.png"
                alt="MSU Baroda Logo"
                width={40}
                height={40}
                className="rounded-full object-contain w-full h-full"
              />
            </div>
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900 truncate min-w-0">
              <span className="hidden sm:inline">The Maharaja Sayajirao University of Baroda</span>
              <span className="sm:hidden">MSU Baroda</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
          {/* User Info Display - Better responsive handling */}
          {user && (
            <div className="text-right hidden md:block lg:block">
              <p className="text-xs lg:text-sm font-medium text-gray-900 truncate max-w-[120px] lg:max-w-none">
                {user.name}
              </p>
              <p className="text-[10px] lg:text-xs text-gray-500 truncate max-w-[120px] lg:max-w-none">
                {getRoleDisplay(user.user_type)}
              </p>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full p-0 flex-shrink-0">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                  {profileImageUrl ? (
                    <AvatarImage 
                      src={profileImageUrl} 
                      alt={user?.name || "User"}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        console.error("Header profile image load error:", {
                          url: profileImageUrl,
                          src: target?.src,
                          errorMessage: "Image failed to load"
                        })
                        // For S3 URLs, try to refresh after a delay (might be temporary CORS issue)
                        if (profileImageUrl.includes('s3.amazonaws.com') || profileImageUrl.includes('amazonaws.com')) {
                          setTimeout(() => {
                            setRefreshTrigger(prev => prev + 1)
                          }, 2000)
                        } else {
                          // For non-S3 URLs, clear immediately to show default icon
                          setProfileImageUrl(null)
                        }
                      }}
                      onLoad={() => {
                        console.log("Header profile image loaded successfully:", profileImageUrl)
                      }}
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-500 text-white text-[10px] sm:text-xs">
                      {user ? getInitials(user.email) : <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </AvatarFallback>
                  )}
                </Avatar> 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 sm:w-64 max-w-[calc(100vw-2rem)]" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs sm:text-sm font-medium leading-tight break-words">{user?.name || "Guest User"}</p>
                  <p className="text-[10px] sm:text-xs leading-tight text-muted-foreground break-all">{user?.email || ""}</p>
                  <p className="text-[10px] sm:text-xs leading-tight text-muted-foreground">{getRoleDisplay(user?.user_type || 0)}</p>
                  {user?.department && <p className="text-[10px] sm:text-xs leading-tight text-muted-foreground break-words">{user.department}</p>}
                  {user?.faculty && <p className="text-[10px] sm:text-xs leading-tight text-muted-foreground break-words">{user.faculty}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Role-specific menu items */}
              {user?.user_type === 1 && getAdminMenuItems()}
              {user?.user_type === 2 && getDeanMenuItems()}
              {user?.user_type === 3 && getHeadMenuItems()}

              {user && <DropdownMenuSeparator />}

              <DropdownMenuItem onClick={handleChangePassword} className="text-xs sm:text-sm">
                <Key className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 text-xs sm:text-sm">
                <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
