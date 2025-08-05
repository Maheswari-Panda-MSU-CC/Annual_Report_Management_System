"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Award, BookOpen, Calendar, TrendingUp, Building, GraduationCap } from "lucide-react"
import Link from "next/link"

const quickStats = [
  {
    title: "Total Faculty",
    value: "245",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Active Departments",
    value: "18",
    change: "+2",
    icon: Building,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Research Publications",
    value: "1,234",
    change: "+23%",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Awards & Recognition",
    value: "89",
    change: "+15%",
    icon: Award,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const quickActions = [
  {
    title: "Generate Faculty Report",
    description: "Create comprehensive faculty performance reports",
    href: "/admin/reports/faculty",
    icon: FileText,
  },
  {
    title: "Manage Academic Year",
    description: "Add, edit, or manage academic years",
    href: "/admin/year",
    icon: Calendar,
  },
  {
    title: "View Activities",
    description: "Monitor department and faculty activities",
    href: "/admin/academic/activities",
    icon: TrendingUp,
  },
  {
    title: "User Management",
    description: "Manage faculty and staff accounts",
    href: "/admin/user-management",
    icon: Users,
  },
]

export default function AdminDashboard() {
  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the MSU Annual Report Management System - Administrative Panel
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} from last year</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <action.icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={action.href}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Access
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest updates and activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">New faculty member registered</p>
                  <p className="text-xs text-gray-600">Dr. Smith joined Computer Science Department</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Annual report generated</p>
                  <p className="text-xs text-gray-600">Physics Department - Academic Year 2023-24</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Research publication added</p>
                  <p className="text-xs text-gray-600">New journal article in Mathematics Department</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
