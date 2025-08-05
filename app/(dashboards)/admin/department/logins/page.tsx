"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Building, Search, Filter, Mail, User, Shield } from "lucide-react"

const faculties = [
  { id: "1", name: "Faculty of Science" },
  { id: "2", name: "Faculty of Arts" },
  { id: "3", name: "Faculty of Commerce" },
  { id: "4", name: "Faculty of Engineering" },
]

const departments = {
  "1": [
    { id: "1", name: "Computer Science" },
    { id: "2", name: "Mathematics" },
    { id: "3", name: "Physics" },
  ],
  "2": [
    { id: "4", name: "English Literature" },
    { id: "5", name: "History" },
    { id: "6", name: "Philosophy" },
  ],
}

const mockLoginData = {
  faculty: [
    {
      srNo: 1,
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@msubaroda.ac.in",
      role: "Dean",
      faculty: "Faculty of Science",
      lastLogin: "2024-03-22 10:30 AM",
      status: "Active",
    },
    {
      srNo: 2,
      name: "Prof. Anita Sharma",
      email: "anita.sharma@msubaroda.ac.in",
      role: "Associate Dean",
      faculty: "Faculty of Science",
      lastLogin: "2024-03-21 02:15 PM",
      status: "Active",
    },
    {
      srNo: 3,
      name: "Dr. Priya Patel",
      email: "priya.patel@msubaroda.ac.in",
      role: "Dean",
      faculty: "Faculty of Commerce",
      lastLogin: "2024-03-20 09:45 AM",
      status: "Inactive",
    },
  ],
  department: [
    {
      srNo: 1,
      name: "Dr. Amit Singh",
      email: "amit.singh@msubaroda.ac.in",
      role: "Head of Department",
      department: "Computer Science",
      faculty: "Faculty of Science",
      lastLogin: "2024-03-22 11:20 AM",
      status: "Active",
    },
    {
      srNo: 2,
      name: "Prof. Meera Joshi",
      email: "meera.joshi@msubaroda.ac.in",
      role: "Head of Department",
      department: "Mathematics",
      faculty: "Faculty of Science",
      lastLogin: "2024-03-21 04:30 PM",
      status: "Active",
    },
  ],
  teachers: [
    {
      srNo: 1,
      name: "Dr. Viral Kapadia",
      email: "viral.kapadia@msubaroda.ac.in",
      role: "Assistant Professor",
      department: "Computer Science",
      faculty: "Faculty of Science",
      lastLogin: "2024-03-22 08:15 AM",
      status: "Active",
    },
    {
      srNo: 2,
      name: "Ms. Ritu Sharma",
      email: "ritu.sharma@msubaroda.ac.in",
      role: "Lecturer",
      department: "Mathematics",
      faculty: "Faculty of Science",
      lastLogin: "2024-03-21 01:45 PM",
      status: "Active",
    },
  ],
}

export default function DepartmentLogins() {
  const [selectedFaculty, setSelectedFaculty] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("faculty")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      case "Suspended":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Dean":
        return "bg-purple-100 text-purple-800"
      case "Associate Dean":
        return "bg-blue-100 text-blue-800"
      case "Head of Department":
        return "bg-orange-100 text-orange-800"
      case "Assistant Professor":
        return "bg-green-100 text-green-800"
      case "Lecturer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredData = mockLoginData[activeTab as keyof typeof mockLoginData].filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFaculty =
      selectedFaculty === "all" || user.faculty === faculties.find((f) => f.id === selectedFaculty)?.name

    const matchesDepartment =
      selectedDepartment === "all" ||
      !("department" in user) ||
      user.department ===
        departments[selectedFaculty as keyof typeof departments]?.find((d) => d.id === selectedDepartment)?.name

    return matchesSearch && matchesFaculty && matchesDepartment
  })

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Logins</h1>
          <p className="text-gray-600 mt-2">Manage faculty, department, and teacher login information</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter logins by faculty, department, and search criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Faculties</SelectItem>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                  disabled={selectedFaculty === "all" || activeTab === "faculty"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {selectedFaculty !== "all" &&
                      departments[selectedFaculty as keyof typeof departments]?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredData.length}</span> users found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Login Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="faculty" className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Faculty Logins
                </TabsTrigger>
                <TabsTrigger value="department" className="flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Department Logins
                </TabsTrigger>
                <TabsTrigger value="teachers" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Teacher Logins
                </TabsTrigger>
              </TabsList>

              <TabsContent value="faculty" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((user) => (
                        <TableRow key={user.srNo}>
                          <TableCell className="font-medium">{user.srNo}</TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.faculty}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="department" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((user) => (
                        <TableRow key={user.srNo}>
                          <TableCell className="font-medium">{user.srNo}</TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{"department" in user ? user.department : "-"}</TableCell>
                          <TableCell>{user.faculty}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="teachers" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((user) => (
                        <TableRow key={user.srNo}>
                          <TableCell className="font-medium">{user.srNo}</TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{"department" in user ? user.department : "-"}</TableCell>
                          <TableCell>{user.faculty}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{mockLoginData.faculty.length}</div>
                  <div className="text-sm font-medium text-gray-500">Faculty Logins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{mockLoginData.department.length}</div>
                  <div className="text-sm font-medium text-gray-500">Department Logins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{mockLoginData.teachers.length}</div>
                  <div className="text-sm font-medium text-gray-500">Teacher Logins</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
