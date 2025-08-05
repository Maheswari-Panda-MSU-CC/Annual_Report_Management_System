"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Presentation, Users, Building, Search, Filter, Eye } from "lucide-react"

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

const teachers = [
  { id: "T001", name: "Dr. Rajesh Kumar", department: "Computer Science", faculty: "Faculty of Science" },
  { id: "T002", name: "Prof. Anita Sharma", department: "Physics", faculty: "Faculty of Science" },
  { id: "T003", name: "Dr. Priya Patel", department: "Commerce", faculty: "Faculty of Commerce" },
]

const mockPaperData = [
  {
    papid: "PAP001",
    tid: "T001",
    theme: "Artificial Intelligence in Healthcare",
    organising_body: "IEEE Computer Society",
    place: "Mumbai, India",
    date: "2024-03-15",
    title_of_paper: "Machine Learning Applications in Medical Diagnosis",
    level: "International",
    authors: "Dr. Rajesh Kumar, Dr. Anita Sharma",
    image: "/placeholder.svg?height=100&width=150&text=Paper+Image",
    teacher_name: "Dr. Rajesh Kumar",
    department: "Computer Science",
    faculty: "Faculty of Science",
  },
  {
    papid: "PAP002",
    tid: "T002",
    theme: "Quantum Computing",
    organising_body: "Indian Physics Association",
    place: "Delhi, India",
    date: "2024-03-10",
    title_of_paper: "Quantum Algorithms for Optimization Problems",
    level: "National",
    authors: "Prof. Anita Sharma, Dr. Rajesh Kumar",
    image: "/placeholder.svg?height=100&width=150&text=Quantum+Paper",
    teacher_name: "Prof. Anita Sharma",
    department: "Physics",
    faculty: "Faculty of Science",
  },
  {
    papid: "PAP003",
    tid: "T003",
    theme: "Digital Marketing",
    organising_body: "Marketing Research Society",
    place: "Bangalore, India",
    date: "2024-03-20",
    title_of_paper: "Social Media Impact on Consumer Behavior",
    level: "Regional",
    authors: "Dr. Priya Patel",
    image: "/placeholder.svg?height=100&width=150&text=Marketing+Study",
    teacher_name: "Dr. Priya Patel",
    department: "Commerce",
    faculty: "Faculty of Commerce",
  },
]

export default function PaperPresented() {
  const [selectedFaculty, setSelectedFaculty] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("department")

  const getLevelColor = (level: string) => {
    switch (level) {
      case "International":
        return "bg-purple-100 text-purple-800"
      case "National":
        return "bg-blue-100 text-blue-800"
      case "Regional":
        return "bg-green-100 text-green-800"
      case "State":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredData = mockPaperData.filter((paper) => {
    const matchesSearch =
      paper.title_of_paper.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFaculty =
      selectedFaculty === "all" || paper.faculty === faculties.find((f) => f.id === selectedFaculty)?.name
    const matchesDepartment =
      selectedDepartment === "all" ||
      paper.department ===
        departments[selectedFaculty as keyof typeof departments]?.find((d) => d.id === selectedDepartment)?.name
    const matchesTeacher = selectedTeacher === "all" || paper.tid === selectedTeacher

    const paperDate = new Date(paper.date)
    const matchesStartDate = !startDate || paperDate >= new Date(startDate)
    const matchesEndDate = !endDate || paperDate <= new Date(endDate)

    return matchesSearch && matchesFaculty && matchesDepartment && matchesTeacher && matchesStartDate && matchesEndDate
  })

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Papers Presented</h1>
          <p className="text-gray-600 mt-2">View and manage papers presented with detailed information</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter papers by faculty, department, teacher, and date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search papers..."
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
                  disabled={selectedFaculty === "all"}
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

              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Papers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Presentation className="mr-2 h-5 w-5" />
              Papers Presented ({filteredData.length})
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
                <div className="space-y-4">
                  {filteredData.map((paper) => (
                    <Card key={paper.papid} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title_of_paper}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Paper ID:</span> {paper.papid}
                              </div>
                              <div>
                                <span className="font-medium">Teacher ID:</span> {paper.tid}
                              </div>
                              <div>
                                <span className="font-medium">Theme:</span> {paper.theme}
                              </div>
                              <div>
                                <span className="font-medium">Organising Body:</span> {paper.organising_body}
                              </div>
                              <div>
                                <span className="font-medium">Place:</span> {paper.place}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(paper.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Badge className={getLevelColor(paper.level)}>{paper.level}</Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Image
                            </Button>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Authors:</span> {paper.authors}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Teacher:</span> {paper.teacher_name} |
                            <span className="font-medium ml-2">Department:</span> {paper.department} |
                            <span className="font-medium ml-2">Faculty:</span> {paper.faculty}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="faculty" className="mt-6">
                <div className="space-y-4">
                  {filteredData.map((paper) => (
                    <Card key={paper.papid} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title_of_paper}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Paper ID:</span> {paper.papid}
                              </div>
                              <div>
                                <span className="font-medium">Teacher ID:</span> {paper.tid}
                              </div>
                              <div>
                                <span className="font-medium">Theme:</span> {paper.theme}
                              </div>
                              <div>
                                <span className="font-medium">Organising Body:</span> {paper.organising_body}
                              </div>
                              <div>
                                <span className="font-medium">Place:</span> {paper.place}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(paper.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Badge className={getLevelColor(paper.level)}>{paper.level}</Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Image
                            </Button>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Authors:</span> {paper.authors}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Department:</span> {paper.department} |
                            <span className="font-medium ml-2">Faculty:</span> {paper.faculty}
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
      </div>
  )
}
