"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useRouter } from "next/navigation"

// Mock faculty data based on university structure
const mockFacultyData = [
  {
    id: "FAC001",
    employeeId: "EMP2019001",
    name: "Dr. Viral Vinod Kapadia",
    email: "viral.kapadia-cse@msubaroda.ac.in",
    phone: "6353861988",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Technology and Engineering",
    joiningDate: "2019-11-28",
    dateOfBirth: "1985-03-15",
    qualification: "PhD in Computer Science",
    specialization: "Machine Learning, IoT, Network Security",
    experience: "8 years",
    status: "Active",
    address: "Vadodara, Gujarat",
    publications: 25,
    projects: 3,
    awards: 2,
    courses: ["Data Structures", "Machine Learning", "Network Security"],
    researchAreas: ["Machine Learning", "IoT", "Network Security", "Data Mining"],
    salary: "₹85,000",
    lastPromotion: "2022-07-01",
  },
  {
    id: "FAC002",
    employeeId: "EMP2015002",
    name: "Dr. Rajesh Kumar Patel",
    email: "rajesh.patel@msubaroda.ac.in",
    phone: "9876543210",
    designation: "Professor",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Technology and Engineering",
    joiningDate: "2015-07-15",
    dateOfBirth: "1978-08-22",
    qualification: "PhD in Software Engineering",
    specialization: "Software Engineering, Database Systems",
    experience: "12 years",
    status: "Active",
    address: "Vadodara, Gujarat",
    publications: 45,
    projects: 8,
    awards: 5,
    courses: ["Software Engineering", "Database Management", "System Analysis"],
    researchAreas: ["Software Engineering", "Database Systems", "Cloud Computing"],
    salary: "₹1,20,000",
    lastPromotion: "2020-01-01",
  },
  {
    id: "FAC003",
    employeeId: "EMP2020003",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@msubaroda.ac.in",
    phone: "9123456789",
    designation: "Assistant Professor",
    department: "Information Technology",
    faculty: "Faculty of Technology and Engineering",
    joiningDate: "2020-01-10",
    dateOfBirth: "1988-12-05",
    qualification: "PhD in Information Technology",
    specialization: "Cybersecurity, Blockchain",
    experience: "5 years",
    status: "On Leave",
    address: "Vadodara, Gujarat",
    publications: 18,
    projects: 4,
    awards: 1,
    courses: ["Cybersecurity", "Blockchain Technology", "Network Programming"],
    researchAreas: ["Cybersecurity", "Blockchain", "Cryptography"],
    salary: "₹65,000",
    lastPromotion: "2023-01-01",
  },
  {
    id: "FAC004",
    employeeId: "EMP2018004",
    name: "Dr. Amit Singh",
    email: "amit.singh@msubaroda.ac.in",
    phone: "8765432109",
    designation: "Associate Professor",
    department: "Electronics & Communication",
    faculty: "Faculty of Technology and Engineering",
    joiningDate: "2018-03-20",
    dateOfBirth: "1982-06-18",
    qualification: "PhD in Electronics Engineering",
    specialization: "VLSI Design, Embedded Systems",
    experience: "9 years",
    status: "Active",
    address: "Vadodara, Gujarat",
    publications: 32,
    projects: 6,
    awards: 3,
    courses: ["VLSI Design", "Embedded Systems", "Digital Electronics"],
    researchAreas: ["VLSI Design", "Embedded Systems", "IoT Hardware"],
    salary: "₹90,000",
    lastPromotion: "2021-07-01",
  },
]

export default function FacultyManagementPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [faculty, setFaculty] = useState(mockFacultyData)
  const [filteredFaculty, setFilteredFaculty] = useState(mockFacultyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFaculty, setSelectedFaculty] = useState(mockFacultyData[0])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = faculty

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((f) => f.department === departmentFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredFaculty(filtered)
  }, [searchTerm, departmentFilter, statusFilter, faculty])

  const getStatusBadge = (status:string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "on leave":
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case "Professor":
        return "text-purple-600 bg-purple-50"
      case "Associate Professor":
        return "text-blue-600 bg-blue-50"
      case "Assistant Professor":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading Faculty Management...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
            <p className="text-gray-600 mt-1">Manage faculty members in {user?.faculty || "your faculty"}</p>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/teacher/faculty-management/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{faculty.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {faculty.filter((f) => f.status === "Active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Publications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {faculty.reduce((sum, f) => sum + f.publications, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Awards</p>
                  <p className="text-2xl font-bold text-gray-900">{faculty.reduce((sum, f) => sum + f.awards, 0)}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setDepartmentFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Table */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty List ({filteredFaculty.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Publications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((facultyMember) => (
                    <TableRow key={facultyMember.id}>
                      <TableCell className="font-medium">{facultyMember.employeeId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{facultyMember.name}</div>
                          <div className="text-sm text-gray-500">{facultyMember.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDesignationColor(facultyMember.designation)}>
                          {facultyMember.designation}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{facultyMember.department}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {facultyMember.phone}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {facultyMember.email.split("@")[0]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(facultyMember.status)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{facultyMember.publications}</div>
                          <div className="text-xs text-gray-500">papers</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFaculty(facultyMember)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFaculty.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No faculty members found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Faculty Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Faculty Details</DialogTitle>
              <DialogDescription>Complete information about the faculty member</DialogDescription>
            </DialogHeader>

            {selectedFaculty && (
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="research">Research</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-lg font-semibold">{selectedFaculty.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Employee ID</label>
                      <p className="text-lg font-semibold">{selectedFaculty.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p>{selectedFaculty.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p>{selectedFaculty.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p>{selectedFaculty.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p>{selectedFaculty.address}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Designation</label>
                      <p className="text-lg font-semibold">{selectedFaculty.designation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      <p>{selectedFaculty.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Qualification</label>
                      <p>{selectedFaculty.qualification}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p>{selectedFaculty.experience}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Joining Date</label>
                      <p>{selectedFaculty.joiningDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Promotion</label>
                      <p>{selectedFaculty.lastPromotion}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Courses Teaching</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedFaculty.courses.map((course, index) => (
                        <Badge key={index} variant="outline">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="research" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{selectedFaculty.publications}</p>
                      <p className="text-sm text-gray-600">Publications</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{selectedFaculty.projects}</p>
                      <p className="text-sm text-gray-600">Projects</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{selectedFaculty.awards}</p>
                      <p className="text-sm text-gray-600">Awards</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Research Areas</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedFaculty.researchAreas.map((area, index) => (
                        <Badge key={index} className="bg-purple-100 text-purple-800">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Specialization</label>
                    <p className="mt-1">{selectedFaculty.specialization}</p>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Status</label>
                      <div className="mt-1">{getStatusBadge(selectedFaculty.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Salary</label>
                      <p className="text-lg font-semibold text-green-600">{selectedFaculty.salary}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Performance Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p>• Publications: {selectedFaculty.publications} research papers</p>
                      <p>• Active Projects: {selectedFaculty.projects} ongoing projects</p>
                      <p>• Awards Received: {selectedFaculty.awards} recognitions</p>
                      <p>• Teaching Load: {selectedFaculty.courses.length} courses</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
