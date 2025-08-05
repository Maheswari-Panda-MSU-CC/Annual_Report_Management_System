"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  Award,
  BookOpen,
  Calendar,
  Building,
  BarChart3,
  UserCheck,
  Clock,
  Target,
  Activity,
  GraduationCap,
  Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"

const facultyStats = [
  {
    title: "Total Departments",
    value: "12",
    change: "+2 this year",
    icon: Building,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Faculty Members",
    value: "156",
    change: "+8 new hires",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Research Publications",
    value: "342",
    change: "+15% from last year",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Active Projects",
    value: "28",
    change: "+5 new projects",
    icon: Award,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const quickActions = [
  {
    title: "Faculty Events",
    description: "Manage faculty-wide events and activities",
    href: "/faculty/events",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Department Reports",
    description: "View and generate department reports",
    href: "/faculty/report",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Faculty Profile",
    description: "Update faculty information and settings",
    href: "/faculty/profile",
    icon: UserCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Academic Activities",
    description: "Monitor academic activities across departments",
    href: "/faculty/activities",
    icon: Activity,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Student Support",
    description: "Manage student support services",
    href: "/faculty/student-support",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Development Programs",
    description: "Faculty development and training programs",
    href: "/faculty/development-programs",
    icon: GraduationCap,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

const recentActivities = [
  {
    id: 1,
    title: "New Department Added",
    description: "Department of Data Science established",
    color: "bg-blue-500",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Faculty Meeting Scheduled",
    description: "Monthly faculty meeting on Dec 15, 2024",
    color: "bg-green-500",
    time: "4 hours ago",
  },
  {
    id: 3,
    title: "Research Grant Approved",
    description: "Rs. 50,00,000 grant approved for AI research",
    color: "bg-purple-500",
    time: "6 hours ago",
  },
  {
    id: 4,
    title: "New Publication",
    description: "Faculty published 5 new research papers",
    color: "bg-orange-500",
    time: "1 day ago",
  },
  {
    id: 5,
    title: "Student Achievement",
    description: "Students won national competition",
    color: "bg-red-500",
    time: "2 days ago",
  },
]

const performanceMetrics = [
  {
    name: "Research Output",
    value: 85,
    color: "bg-green-600",
    textColor: "text-green-600",
  },
  {
    name: "Faculty Satisfaction",
    value: 92,
    color: "bg-blue-600",
    textColor: "text-blue-600",
  },
  {
    name: "Grant Success Rate",
    value: 78,
    color: "bg-purple-600",
    textColor: "text-purple-600",
  },
  {
    name: "Student Outcomes",
    value: 88,
    color: "bg-orange-600",
    textColor: "text-orange-600",
  },
]

export default function FacultyDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name} - {user?.faculty || "Faculty of Sciences"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className={`text-sm font-medium ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleNavigation(action.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-gray-50 bg-transparent">
                    Access →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Faculty Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest updates across the faculty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-3 h-3 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Faculty performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                      <span className={`text-sm font-semibold ${metric.textColor}`}>{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Department Overview
            </CardTitle>
            <CardDescription>Summary of departments under {user?.faculty || "your faculty"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-sm font-medium text-gray-700">Total Departments</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="text-3xl font-bold text-green-600 mb-2">156</div>
                <div className="text-sm font-medium text-gray-700">Faculty Members</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="text-3xl font-bold text-purple-600 mb-2">2,340</div>
                <div className="text-sm font-medium text-gray-700">Students Enrolled</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="text-3xl font-bold text-orange-600 mb-2">28</div>
                <div className="text-sm font-medium text-gray-700">Active Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
