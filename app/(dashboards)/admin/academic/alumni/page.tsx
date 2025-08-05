"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Building, Search, Filter, MapPin, Briefcase } from "lucide-react"

const mockAlumniData = {
  department: [
    {
      id: 1,
      name: "Dr. Amit Sharma",
      graduationYear: "2018",
      program: "Ph.D Computer Science",
      department: "Computer Science",
      faculty: "Faculty of Technology",
      currentPosition: "Senior Software Engineer",
      company: "Google India",
      location: "Bangalore",
      industry: "Technology",
      achievements: "Published 15 research papers",
      contactDate: "2024-03-15",
    },
    {
      id: 2,
      name: "Ms. Priya Patel",
      graduationYear: "2020",
      program: "M.Com Finance",
      department: "Commerce",
      faculty: "Faculty of Commerce",
      currentPosition: "Financial Analyst",
      company: "HDFC Bank",
      location: "Mumbai",
      industry: "Banking",
      achievements: "CFA Level 2 Certified",
      contactDate: "2024-03-12",
    },
  ],
  faculty: [
    {
      id: 1,
      faculty: "Faculty of Technology",
      totalAlumni: 2450,
      recentGraduates: 298,
      employmentRate: 92,
      higherStudies: 15,
      entrepreneurship: 8,
      averageSalary: "12.5 LPA",
      topRecruiters: ["TCS", "Infosys", "Google", "Microsoft"],
    },
    {
      id: 2,
      faculty: "Faculty of Science",
      totalAlumni: 1890,
      recentGraduates: 215,
      employmentRate: 88,
      higherStudies: 25,
      entrepreneurship: 5,
      averageSalary: "8.2 LPA",
      topRecruiters: ["ISRO", "DRDO", "Pharma Companies", "Research Labs"],
    },
  ],
}

export default function Alumni() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("department")
  const [showResults, setShowResults] = useState(false)

  const handleShowData = () => {
    setShowResults(true)
  }

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case "Technology":
        return "bg-blue-100 text-blue-800"
      case "Banking":
        return "bg-green-100 text-green-800"
      case "Healthcare":
        return "bg-red-100 text-red-800"
      case "Education":
        return "bg-purple-100 text-purple-800"
      case "Government":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDepartmentData = mockAlumniData.department.filter((alumni) => {
    const matchesSearch =
      alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchTerm.toLowerCase())

    const contactDate = new Date(alumni.contactDate)
    const matchesStartDate = !startDate || contactDate >= new Date(startDate)
    const matchesEndDate = !endDate || contactDate <= new Date(endDate)

    return matchesSearch && matchesStartDate && matchesEndDate
  })

  const filteredFacultyData = mockAlumniData.faculty.filter((faculty) => {
    return faculty.faculty.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alumni Activities</h1>
          <p className="text-gray-600 mt-2">Track alumni engagement and activities at department and faculty levels</p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Date Range & Filters
            </CardTitle>
            <CardDescription>Select date range and search criteria to view alumni activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Alumni</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search alumni..."
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
                  <Users className="mr-2 h-4 w-4" />
                  Show Alumni Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alumni Results */}
        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Alumni Activities Data
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
                          <TableHead>Name</TableHead>
                          <TableHead>Graduation Year</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Current Position</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Achievements</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDepartmentData.map((alumni) => (
                          <TableRow key={alumni.id}>
                            <TableCell className="font-medium">{alumni.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{alumni.graduationYear}</Badge>
                            </TableCell>
                            <TableCell className="max-w-32 truncate" title={alumni.program}>
                              {alumni.program}
                            </TableCell>
                            <TableCell>{alumni.department}</TableCell>
                            <TableCell className="max-w-32 truncate" title={alumni.currentPosition}>
                              {alumni.currentPosition}
                            </TableCell>
                            <TableCell>{alumni.company}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                {alumni.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getIndustryColor(alumni.industry)}>{alumni.industry}</Badge>
                            </TableCell>
                            <TableCell className="max-w-32 truncate" title={alumni.achievements}>
                              {alumni.achievements}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="faculty" className="mt-6">
                  <div className="space-y-4">
                    {filteredFacultyData.map((faculty) => (
                      <Card key={faculty.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faculty.faculty}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div className="bg-blue-50 p-3 rounded">
                                  <div className="font-medium text-blue-900">Total Alumni</div>
                                  <div className="text-xl font-bold text-blue-800">{faculty.totalAlumni}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded">
                                  <div className="font-medium text-green-900">Recent Graduates</div>
                                  <div className="text-xl font-bold text-green-800">{faculty.recentGraduates}</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded">
                                  <div className="font-medium text-purple-900">Employment Rate</div>
                                  <div className="text-xl font-bold text-purple-800">{faculty.employmentRate}%</div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded">
                                  <div className="font-medium text-orange-900">Average Salary</div>
                                  <div className="text-xl font-bold text-orange-800">{faculty.averageSalary}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Higher Studies:</span>
                                <Badge variant="outline">{faculty.higherStudies}%</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Entrepreneurship:</span>
                                <Badge variant="outline">{faculty.entrepreneurship}%</Badge>
                              </div>
                              <div className="flex items-center">
                                <Briefcase className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="font-medium text-gray-700">Top Recruiters</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {faculty.topRecruiters.map((recruiter, index) => (
                                <Badge key={index} variant="secondary">
                                  {recruiter}
                                </Badge>
                              ))}
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
