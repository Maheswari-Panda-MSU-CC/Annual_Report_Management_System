"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GraduationCap, Users, Building, Search, Filter, TrendingUp } from "lucide-react"

const mockProgressionData = {
  department: [
    {
      id: 1,
      studentName: "Rahul Sharma",
      studentId: "CS2021001",
      program: "B.Tech Computer Science",
      department: "Computer Science",
      faculty: "Faculty of Technology",
      currentYear: "Final Year",
      cgpa: 8.5,
      progressStatus: "On Track",
      completionDate: "2024-05-15",
      placementStatus: "Placed",
      company: "TCS",
    },
    {
      id: 2,
      studentName: "Priya Patel",
      studentId: "CS2021002",
      program: "M.Sc Mathematics",
      department: "Mathematics",
      faculty: "Faculty of Science",
      currentYear: "Second Year",
      cgpa: 9.2,
      progressStatus: "Excellent",
      completionDate: "2025-04-30",
      placementStatus: "Seeking",
      company: "-",
    },
  ],
  faculty: [
    {
      id: 1,
      program: "Engineering Programs",
      totalStudents: 1250,
      graduated: 298,
      inProgress: 952,
      dropoutRate: 3.2,
      averageCGPA: 7.8,
      placementRate: 85,
      faculty: "Faculty of Technology",
    },
    {
      id: 2,
      program: "Science Programs",
      totalStudents: 890,
      graduated: 215,
      inProgress: 675,
      dropoutRate: 2.1,
      averageCGPA: 8.1,
      placementRate: 78,
      faculty: "Faculty of Science",
    },
  ],
}

export default function StudentProgression() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("department")
  const [showResults, setShowResults] = useState(false)

  const handleShowData = () => {
    setShowResults(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "On Track":
        return "bg-blue-100 text-blue-800"
      case "At Risk":
        return "bg-yellow-100 text-yellow-800"
      case "Critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlacementColor = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-green-100 text-green-800"
      case "Seeking":
        return "bg-blue-100 text-blue-800"
      case "Not Interested":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const filteredDepartmentData = mockProgressionData.department.filter((student) => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program.toLowerCase().includes(searchTerm.toLowerCase())

    const completionDate = new Date(student.completionDate)
    const matchesStartDate = !startDate || completionDate >= new Date(startDate)
    const matchesEndDate = !endDate || completionDate <= new Date(endDate)

    return matchesSearch && matchesStartDate && matchesEndDate
  })

  const filteredFacultyData = mockProgressionData.faculty.filter((program) => {
    return program.program.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Progression</h1>
          <p className="text-gray-600 mt-2">Track student academic progression at department and faculty levels</p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Date Range & Filters
            </CardTitle>
            <CardDescription>Select date range and search criteria to view student progression data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button onClick={handleShowData} className="w-full">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Show Progression Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Progression Results */}
        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Student Progression Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="department" className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Department Level
                  </TabsTrigger>
                  <TabsTrigger value="faculty" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Faculty Level
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="department" className="mt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Current Year</TableHead>
                          <TableHead>CGPA</TableHead>
                          <TableHead>Progress Status</TableHead>
                          <TableHead>Expected Completion</TableHead>
                          <TableHead>Placement Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDepartmentData.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.studentName}</TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell className="max-w-32 truncate" title={student.program}>
                              {student.program}
                            </TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell>{student.currentYear}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {student.cgpa}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(student.progressStatus)}>{student.progressStatus}</Badge>
                            </TableCell>
                            <TableCell>{new Date(student.completionDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={getPlacementColor(student.placementStatus)}>
                                {student.placementStatus}
                              </Badge>
                              {student.company !== "-" && (
                                <div className="text-xs text-gray-500 mt-1">{student.company}</div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="faculty" className="mt-6">
                  <div className="space-y-4">
                    {filteredFacultyData.map((program) => (
                      <Card key={program.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.program}</h3>
                              <div className="text-sm text-gray-600 mb-3">
                                <span className="font-medium">Faculty:</span> {program.faculty}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-blue-50 p-3 rounded">
                                  <div className="font-medium text-blue-900">Total Students</div>
                                  <div className="text-xl font-bold text-blue-800">{program.totalStudents}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded">
                                  <div className="font-medium text-green-900">Graduated</div>
                                  <div className="text-xl font-bold text-green-800">{program.graduated}</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded">
                                  <div className="font-medium text-purple-900">In Progress</div>
                                  <div className="text-xl font-bold text-purple-800">{program.inProgress}</div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded">
                                  <div className="font-medium text-orange-900">Dropout Rate</div>
                                  <div className="text-xl font-bold text-orange-800">{program.dropoutRate}%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="border-t pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Average CGPA:</span>
                                <Badge variant="outline" className="font-mono">
                                  {program.averageCGPA}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Placement Rate:</span>
                                <div className="flex items-center">
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="font-semibold text-green-700">{program.placementRate}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
  )
}
