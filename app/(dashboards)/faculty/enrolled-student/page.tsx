"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Heart, Globe } from "lucide-react"

interface CourseData {
  id: number
  srNo: number
  courseName: string
  level: string
  duration: string
  totalSeats: number
  enrolledStudents: number
  department: string
}

interface CountryStudentData {
  id: number
  srNo: number
  state: string
  ugStudents: number
  pgStudents: number
  phdStudents: number
  totalStudents: number
}

interface DisabledStudentData {
  id: number
  srNo: number
  disabilityType: string
  ugStudents: number
  pgStudents: number
  phdStudents: number
  totalStudents: number
}

interface ForeignStudentData {
  id: number
  srNo: number
  country: string
  ugStudents: number
  pgStudents: number
  phdStudents: number
  totalStudents: number
}

export default function FacultyEnrolledStudentPage() {
  const { user } = useAuth()

  // Course Data
  const courseData: CourseData[] = [
    {
      id: 1,
      srNo: 1,
      courseName: "B.Tech Computer Science",
      level: "Undergraduate",
      duration: "4 years",
      totalSeats: 120,
      enrolledStudents: 118,
      department: "Computer Science",
    },
    {
      id: 2,
      srNo: 2,
      courseName: "M.Tech Software Engineering",
      level: "Postgraduate",
      duration: "2 years",
      totalSeats: 60,
      enrolledStudents: 55,
      department: "Computer Science",
    },
    {
      id: 3,
      srNo: 3,
      courseName: "Ph.D Computer Science",
      level: "Doctoral",
      duration: "3-5 years",
      totalSeats: 20,
      enrolledStudents: 18,
      department: "Computer Science",
    },
  ]

  // Students From within the Country
  const countryStudentData: CountryStudentData[] = [
    {
      id: 1,
      srNo: 1,
      state: "Gujarat",
      ugStudents: 450,
      pgStudents: 180,
      phdStudents: 45,
      totalStudents: 675,
    },
    {
      id: 2,
      srNo: 2,
      state: "Maharashtra",
      ugStudents: 120,
      pgStudents: 45,
      phdStudents: 12,
      totalStudents: 177,
    },
    {
      id: 3,
      srNo: 3,
      state: "Rajasthan",
      ugStudents: 80,
      pgStudents: 25,
      phdStudents: 8,
      totalStudents: 113,
    },
    {
      id: 4,
      srNo: 4,
      state: "Madhya Pradesh",
      ugStudents: 60,
      pgStudents: 20,
      phdStudents: 5,
      totalStudents: 85,
    },
  ]

  // Differently abled Students
  const disabledStudentData: DisabledStudentData[] = [
    {
      id: 1,
      srNo: 1,
      disabilityType: "Visual Impairment",
      ugStudents: 8,
      pgStudents: 3,
      phdStudents: 1,
      totalStudents: 12,
    },
    {
      id: 2,
      srNo: 2,
      disabilityType: "Hearing Impairment",
      ugStudents: 5,
      pgStudents: 2,
      phdStudents: 0,
      totalStudents: 7,
    },
    {
      id: 3,
      srNo: 3,
      disabilityType: "Physical Disability",
      ugStudents: 12,
      pgStudents: 4,
      phdStudents: 2,
      totalStudents: 18,
    },
    {
      id: 4,
      srNo: 4,
      disabilityType: "Learning Disability",
      ugStudents: 6,
      pgStudents: 1,
      phdStudents: 0,
      totalStudents: 7,
    },
  ]

  // Number Of Foreign Students
  const foreignStudentData: ForeignStudentData[] = [
    {
      id: 1,
      srNo: 1,
      country: "Nepal",
      ugStudents: 15,
      pgStudents: 8,
      phdStudents: 3,
      totalStudents: 26,
    },
    {
      id: 2,
      srNo: 2,
      country: "Bangladesh",
      ugStudents: 12,
      pgStudents: 6,
      phdStudents: 2,
      totalStudents: 20,
    },
    {
      id: 3,
      srNo: 3,
      country: "Sri Lanka",
      ugStudents: 8,
      pgStudents: 4,
      phdStudents: 1,
      totalStudents: 13,
    },
    {
      id: 4,
      srNo: 4,
      country: "Afghanistan",
      ugStudents: 5,
      pgStudents: 2,
      phdStudents: 1,
      totalStudents: 8,
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Undergraduate":
        return "bg-blue-100 text-blue-800"
      case "Postgraduate":
        return "bg-green-100 text-green-800"
      case "Doctoral":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enrolled Students</h1>
            <p className="text-gray-600 mt-2">Student enrollment information for {user?.faculty}</p>
          </div>
        </div>

        {/* Student Enrollment Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Course</TabsTrigger>
            <TabsTrigger value="country">Students From within the Country</TabsTrigger>
            <TabsTrigger value="disabled">Differently abled Students</TabsTrigger>
            <TabsTrigger value="foreign">Number Of Foreign Students</TabsTrigger>
          </TabsList>

          {/* Course Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Seats</TableHead>
                      <TableHead>Enrolled Students</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.srNo}</TableCell>
                        <TableCell className="font-medium">{course.courseName}</TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                        </TableCell>
                        <TableCell>{course.duration}</TableCell>
                        <TableCell>{course.totalSeats}</TableCell>
                        <TableCell className="font-medium">{course.enrolledStudents}</TableCell>
                        <TableCell>{course.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(course.enrolledStudents / course.totalSeats) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm">
                              {Math.round((course.enrolledStudents / course.totalSeats) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students From within the Country Tab */}
          <TabsContent value="country" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students From within the Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>UG Students</TableHead>
                      <TableHead>PG Students</TableHead>
                      <TableHead>PhD Students</TableHead>
                      <TableHead>Total Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryStudentData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>{data.srNo}</TableCell>
                        <TableCell className="font-medium">{data.state}</TableCell>
                        <TableCell>{data.ugStudents}</TableCell>
                        <TableCell>{data.pgStudents}</TableCell>
                        <TableCell>{data.phdStudents}</TableCell>
                        <TableCell className="font-bold">{data.totalStudents}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Differently abled Students Tab */}
          <TabsContent value="disabled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Differently abled Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Disability Type</TableHead>
                      <TableHead>UG Students</TableHead>
                      <TableHead>PG Students</TableHead>
                      <TableHead>PhD Students</TableHead>
                      <TableHead>Total Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disabledStudentData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>{data.srNo}</TableCell>
                        <TableCell className="font-medium">{data.disabilityType}</TableCell>
                        <TableCell>{data.ugStudents}</TableCell>
                        <TableCell>{data.pgStudents}</TableCell>
                        <TableCell>{data.phdStudents}</TableCell>
                        <TableCell className="font-bold">{data.totalStudents}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Number Of Foreign Students Tab */}
          <TabsContent value="foreign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Number Of Foreign Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>UG Students</TableHead>
                      <TableHead>PG Students</TableHead>
                      <TableHead>PhD Students</TableHead>
                      <TableHead>Total Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foreignStudentData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>{data.srNo}</TableCell>
                        <TableCell className="font-medium">{data.country}</TableCell>
                        <TableCell>{data.ugStudents}</TableCell>
                        <TableCell>{data.pgStudents}</TableCell>
                        <TableCell>{data.phdStudents}</TableCell>
                        <TableCell className="font-bold">{data.totalStudents}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courseData.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {countryStudentData.reduce((sum, data) => sum + data.totalStudents, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Differently Abled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {disabledStudentData.reduce((sum, data) => sum + data.totalStudents, 0)}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Foreign Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {foreignStudentData.reduce((sum, data) => sum + data.totalStudents, 0)}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
