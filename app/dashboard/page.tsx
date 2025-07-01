"use client"

import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Award, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Total Faculty",
      value: "245",
      description: "Active faculty members",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Annual Reports",
      value: "12",
      description: "Reports generated this year",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Research Projects",
      value: "89",
      description: "Ongoing research projects",
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "Publications",
      value: "156",
      description: "Papers published this year",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      title: "New faculty member added",
      description: "Dr. Viral Kapadia - Computer Science",
      color: "bg-blue-500",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Annual report generated",
      description: "Faculty of Science - 2023-24",
      color: "bg-green-500",
      time: "4 hours ago",
    },
    {
      id: 3,
      title: "Research project updated",
      description: "IoT Security Research",
      color: "bg-purple-500",
      time: "6 hours ago",
    },
    {
      id: 4,
      title: "Publication submitted",
      description: "Machine Learning in Healthcare",
      color: "bg-orange-500",
      time: "1 day ago",
    },
  ]

  const quickActions = [
    {
      title: "Add New Faculty",
      description: "Register a new faculty member",
      href: "/faculty",
    },
    {
      title: "Generate Report",
      description: "Create annual department report",
      href: "/reports",
    },
    {
      title: "Update Profile",
      description: "Modify faculty information",
      href: "/profile",
    },
    {
      title: "View Publications",
      description: "Browse recent publications",
      href: "/publications",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => (window.location.href = action.href)}
                  >
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Computer Science</span>
                  <span className="text-sm font-medium">45 Faculty</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mathematics</span>
                  <span className="text-sm font-medium">32 Faculty</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Physics</span>
                  <span className="text-sm font-medium">28 Faculty</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Chemistry</span>
                  <span className="text-sm font-medium">35 Faculty</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Projects</span>
                  <span className="text-sm font-medium text-green-600">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Projects</span>
                  <span className="text-sm font-medium text-blue-600">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Funding</span>
                  <span className="text-sm font-medium text-purple-600">₹2.5Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Publications</span>
                  <span className="text-sm font-medium text-orange-600">234</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-3">
                  <p className="text-sm font-medium">Research Symposium</p>
                  <p className="text-xs text-gray-500">March 15, 2024</p>
                </div>
                <div className="border-l-2 border-green-500 pl-3">
                  <p className="text-sm font-medium">Faculty Meeting</p>
                  <p className="text-xs text-gray-500">March 20, 2024</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <p className="text-sm font-medium">Annual Conference</p>
                  <p className="text-xs text-gray-500">April 5, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
