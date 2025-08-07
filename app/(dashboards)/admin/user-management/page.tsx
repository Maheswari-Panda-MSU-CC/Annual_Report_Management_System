"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  Building,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "Dr. Viral Kapadia",
    email: "viral.kapadia-cse@msubaroda.ac.in",
    phone: "6353861988",
    userType: "teacher",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Technology and Engineering",
    designation: "Associate Professor",
    employeeId: "EMP2019001",
    status: "active",
    lastLogin: "2024-01-14",
    createdAt: "2019-11-28",
  },
  {
    id: "2",
    name: "Dr. Rajesh Patel",
    email: "rajesh.patel@msubaroda.ac.in",
    phone: "9876543210",
    userType: "faculty",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Technology and Engineering",
    designation: "Head of Department",
    employeeId: "EMP2015002",
    status: "active",
    lastLogin: "2024-01-13",
    createdAt: "2015-07-15",
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@msubaroda.ac.in",
    phone: "9123456789",
    userType: "teacher",
    department: "Information Technology",
    faculty: "Faculty of Technology and Engineering",
    designation: "Assistant Professor",
    employeeId: "EMP2020003",
    status: "inactive",
    lastLogin: "2024-01-10",
    createdAt: "2020-01-10",
  },
  {
    id: "4",
    name: "Dr. University Admin",
    email: "admin@msubaroda.ac.in",
    phone: "9999999999",
    userType: "university",
    department: "Administration",
    faculty: "University Administration",
    designation: "Registrar",
    employeeId: "EMP2018001",
    status: "active",
    lastLogin: "2024-01-14",
    createdAt: "2018-01-01",
  },
]

export default function UserManagementPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const [isAccessDenied, setIsAccessDenied] = useState(false)

  useEffect(() => {
    if (user?.user_type !== 1) {
      setIsAccessDenied(true)
    }
  }, [user])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // User type filter
    if (userTypeFilter !== "all") {
      filtered = filtered.filter((u) => u.userType === userTypeFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((u) => u.department === departmentFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, userTypeFilter, statusFilter, departmentFilter, users])

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "teacher":
        return <GraduationCap className="h-4 w-4" />
      case "faculty":
        return <Users className="h-4 w-4" />
      case "university":
        return <Building className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getUserTypeBadge = (type: string) => {
    const colors = {
      teacher: "bg-blue-100 text-blue-800",
      faculty: "bg-green-100 text-green-800",
      university: "bg-purple-100 text-purple-800",
    }

    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {getUserTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
      ),
    )
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((user) => user.id !== userId))
    }
  }

  const uniqueDepartments = [...new Set(users.map((u) => u.department))]

  if (isAccessDenied) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Access denied. Only University Administrators can manage users.</AlertDescription>
          </Alert>
        </div>
    )
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading User Management...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and their access permissions</p>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/admin/register-user")}>
            <Plus className="h-4 w-4 mr-2" />
            Register New User
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.userType === "teacher").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.userType === "faculty").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setUserTypeFilter("all")
                  setStatusFilter("all")
                  setDepartmentFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.employeeId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.designation}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                      <TableCell className="text-sm">{user.department}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email.split("@")[0]}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-sm">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id)}
                            className={user.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            {user.status === "active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
