"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Download, Search, Filter } from "lucide-react"
import Link from "next/link"

// Mock faculty data based on the biodata structure
const mockFaculty = [
  {
    id: "1",
    name: "Dr. Viral Vinod Kapadia",
    email: "viral.kapadia-cse@msubaroda.ac.in",
    phone: "6353861988",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Technology and Engineering",
    status: "active",
    joiningDate: "2019-11-28",
    qualifications: ["PhD", "Post Graduate", "Graduate"],
    researchAreas: ["Machine Learning", "IoT", "Network Security"],
    publications: 25,
    projects: 3,
  },
  {
    id: "2",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@msubaroda.ac.in",
    phone: "9876543210",
    designation: "Professor",
    department: "Physics",
    faculty: "Faculty of Science",
    status: "active",
    joiningDate: "2015-07-15",
    qualifications: ["PhD", "M.Sc.", "B.Sc."],
    researchAreas: ["Quantum Physics", "Nanotechnology"],
    publications: 45,
    projects: 5,
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@msubaroda.ac.in",
    phone: "9123456789",
    designation: "Assistant Professor",
    department: "Chemistry",
    faculty: "Faculty of Science",
    status: "on_leave",
    joiningDate: "2020-01-10",
    qualifications: ["PhD", "M.Sc.", "B.Sc."],
    researchAreas: ["Organic Chemistry", "Drug Discovery"],
    publications: 18,
    projects: 2,
  },
]

export function FacultyList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredFaculty = mockFaculty.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || faculty.department === departmentFilter
    const matchesStatus = statusFilter === "all" || faculty.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case "on_leave":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            On Leave
          </Badge>
        )
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((faculty) => (
          <Card key={faculty.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{faculty.name}</CardTitle>
                  <p className="text-sm text-gray-600">{faculty.designation}</p>
                  <p className="text-sm text-gray-500">{faculty.department}</p>
                </div>
                {getStatusBadge(faculty.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm">
                    <strong>Email:</strong> {faculty.email}
                  </p>
                  <p className="text-sm">
                    <strong>Phone:</strong> {faculty.phone}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {faculty.researchAreas.slice(0, 2).map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {faculty.researchAreas.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{faculty.researchAreas.length - 2} more
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-600">{faculty.publications}</div>
                    <div className="text-xs text-gray-600">Publications</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-600">{faculty.projects}</div>
                    <div className="text-xs text-gray-600">Projects</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/faculty/${faculty.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No faculty members found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
