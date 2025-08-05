"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Calendar, Award, FileText, GraduationCap, Building } from "lucide-react"

export default function DepartmentDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Total Faculty",
      value: "24",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Students Enrolled",
      value: "456",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Research Projects",
      value: "12",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Publications",
      value: "38",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const recentActivities = [
    {
      title: "Faculty Development Program",
      date: "2024-03-15",
      type: "Event",
      status: "Completed",
    },
    {
      title: "Research Paper Submission",
      date: "2024-03-12",
      type: "Publication",
      status: "In Review",
    },
    {
      title: "Industry Collaboration Meeting",
      date: "2024-03-10",
      type: "Meeting",
      status: "Scheduled",
    },
    {
      title: "Student Project Presentation",
      date: "2024-03-08",
      type: "Academic",
      status: "Completed",
    },
  ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
            <p className="text-sm text-gray-500">
              {user?.department} - {user?.faculty}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-xs">Manage Staff</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Event</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-xs">Publications</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Award className="h-6 w-6 mb-2" />
                <span className="text-xs">Awards</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Building className="h-6 w-6 mb-2" />
                <span className="text-xs">Infrastructure</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-xs">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">
                        {activity.date} • {activity.type}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "In Review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Faculty Strength</span>
                  <span className="font-semibold">24/30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Student Enrollment</span>
                  <span className="font-semibold">456/500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Projects</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Collaborations</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Awards This Year</span>
                  <span className="font-semibold">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
