"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  FileText, 
  GraduationCap, 
  Building,
  Handshake,
  Briefcase,
  Sparkles,
  UserCog,
  Laptop,
  TrendingUp,
  Mail
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface DashboardData {
  dashboardCounts: {
    TotalTeachers: number
    AcademicPrograms: number
    AchievementsAwards: number
    Collaborations: number
    Consultancy: number
    Events: number
    ExtensionActivities: number
    FacultyDevelopmentPrograms: number
    PhDAwarded: number
    Placements: number
    Scholarships: number
    StudentActivities: number
    TechnologyDetails: number
    VisitingFaculty: number
  }
  departmentInfo: {
    Deptid: number | null
    name: string | null
    email_id: string | null
  }
  recentActivities: Array<{
    ActivitySource: string
    ActivityDate: string
  }>
}

export default function DepartmentDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.dept_id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/department/dashboard?deptId=${user.dept_id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.dept_id, toast])

  const stats = dashboardData ? [
    {
      title: "Total Teachers",
      value: dashboardData.dashboardCounts.TotalTeachers.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Academic Programs",
      value: dashboardData.dashboardCounts.AcademicPrograms.toString(),
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Achievements & Awards",
      value: dashboardData.dashboardCounts.AchievementsAwards.toString(),
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Collaborations",
      value: dashboardData.dashboardCounts.Collaborations.toString(),
      icon: Handshake,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Consultancy",
      value: dashboardData.dashboardCounts.Consultancy.toString(),
      icon: Briefcase,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Events",
      value: dashboardData.dashboardCounts.Events.toString(),
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Extension Activities",
      value: dashboardData.dashboardCounts.ExtensionActivities.toString(),
      icon: Sparkles,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Faculty Development",
      value: dashboardData.dashboardCounts.FacultyDevelopmentPrograms.toString(),
      icon: UserCog,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "PhD Awarded",
      value: dashboardData.dashboardCounts.PhDAwarded.toString(),
      icon: GraduationCap,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      title: "Placements",
      value: dashboardData.dashboardCounts.Placements.toString(),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Scholarships",
      value: dashboardData.dashboardCounts.Scholarships.toString(),
      icon: Award,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Student Activities",
      value: dashboardData.dashboardCounts.StudentActivities.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Technology Details",
      value: dashboardData.dashboardCounts.TechnologyDetails.toString(),
      icon: Laptop,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
    {
      title: "Visiting Faculty",
      value: dashboardData.dashboardCounts.VisitingFaculty.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ] : []

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Department Dashboard</h1>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Department Dashboard</h1>
            <p className="text-red-600 mt-2">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Department Dashboard</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Welcome back, {user?.name || "User"}
          </p>
          {dashboardData?.departmentInfo?.name && (
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-xs sm:text-sm text-gray-500">
                {dashboardData.departmentInfo.name}
                {user?.faculty && ` - ${user.faculty}`}
              </p>
              {dashboardData.departmentInfo.email_id && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{dashboardData.departmentInfo.email_id}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto sm:h-20 flex-col bg-transparent py-3 sm:py-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs">Manage Staff</span>
            </Button>
            <Button variant="outline" className="h-auto sm:h-20 flex-col bg-transparent py-3 sm:py-4">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs">Add Event</span>
            </Button>
            <Button variant="outline" className="h-auto sm:h-20 flex-col bg-transparent py-3 sm:py-4">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs">Publications</span>
            </Button>
            <Button variant="outline" className="h-auto sm:h-20 flex-col bg-transparent py-3 sm:py-4">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs">Awards</span>
            </Button>
            <Button variant="outline" className="h-auto sm:h-20 flex-col bg-transparent py-3 sm:py-4">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs">Infrastructure</span>
            </Button>
            <Button variant="outline" className="h-auto sm:h-20 flex-col bg-transparent py-3 sm:py-4">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs">Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {activity.ActivitySource}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {formatDate(activity.ActivityDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                No recent activities found
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Total Teachers</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {dashboardData.dashboardCounts.TotalTeachers}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Academic Programs</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {dashboardData.dashboardCounts.AcademicPrograms}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Collaborations</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {dashboardData.dashboardCounts.Collaborations}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Achievements & Awards</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {dashboardData.dashboardCounts.AchievementsAwards}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">PhD Awarded</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {dashboardData.dashboardCounts.PhDAwarded}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Placements</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {dashboardData.dashboardCounts.Placements}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
