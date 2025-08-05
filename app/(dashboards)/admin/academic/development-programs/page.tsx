"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, Star, Filter, Search, Download, Plus, BookOpen, Award } from "lucide-react"
import { useState } from "react"

// Mock data for development programs
const mockPrograms = [
  {
    id: 1,
    title: "Faculty Development Program on Digital Pedagogy",
    type: "FDP",
    startDate: "2024-02-15",
    endDate: "2024-02-19",
    duration: "5 days",
    organizer: "Academic Development Center",
    faculty: "All Faculties",
    department: "Central",
    speakers: ["Dr. Rajesh Kumar", "Prof. Priya Sharma", "Dr. Amit Patel"],
    topics: ["Digital Teaching", "Online Assessment", "Educational Technology"],
    participants: 45,
    budget: 250000,
    status: "Completed",
    rating: 4.7,
    outcomes: ["Improved digital skills", "Better online teaching methods", "Enhanced student engagement"],
    description: "Comprehensive program to enhance faculty digital teaching capabilities",
  },
  {
    id: 2,
    title: "Research Methodology Workshop",
    type: "Workshop",
    startDate: "2024-03-10",
    endDate: "2024-03-14",
    duration: "5 days",
    organizer: "Research and Development Cell",
    faculty: "Faculty of Science",
    department: "Multi-disciplinary",
    speakers: ["Dr. Suresh Gupta", "Prof. Meera Joshi"],
    topics: ["Research Design", "Data Analysis", "Publication Ethics"],
    participants: 30,
    budget: 180000,
    status: "Completed",
    rating: 4.5,
    outcomes: ["Enhanced research skills", "Better proposal writing", "Improved publication quality"],
    description: "Intensive workshop on modern research methodologies and practices",
  },
  {
    id: 3,
    title: "Leadership Development Program for HODs",
    type: "Leadership Program",
    startDate: "2024-04-20",
    endDate: "2024-04-24",
    duration: "5 days",
    organizer: "Human Resource Development",
    faculty: "All Faculties",
    department: "Administrative",
    speakers: ["Dr. Vikram Singh", "Prof. Sunita Rao", "Mr. Anil Mehta"],
    topics: ["Leadership Skills", "Team Management", "Strategic Planning"],
    participants: 25,
    budget: 300000,
    status: "Ongoing",
    rating: null,
    outcomes: [],
    description: "Specialized program for department heads to enhance leadership capabilities",
  },
  {
    id: 4,
    title: "Innovation and Entrepreneurship Bootcamp",
    type: "Bootcamp",
    startDate: "2024-05-15",
    endDate: "2024-05-17",
    duration: "3 days",
    organizer: "Innovation Cell",
    faculty: "Faculty of Technology",
    department: "Engineering",
    speakers: ["Mr. Rohit Agarwal", "Ms. Kavya Nair"],
    topics: ["Innovation Management", "Startup Ecosystem", "Intellectual Property"],
    participants: 40,
    budget: 200000,
    status: "Planned",
    rating: null,
    outcomes: [],
    description: "Intensive bootcamp on innovation and entrepreneurship for faculty and students",
  },
]

const programTypes = ["All", "FDP", "Workshop", "Leadership Program", "Bootcamp", "Seminar", "Training"]
const faculties = [
  "All",
  "All Faculties",
  "Faculty of Technology",
  "Faculty of Science",
  "Faculty of Management",
  "Faculty of Arts",
]
const statusOptions = ["All", "Completed", "Ongoing", "Planned", "Cancelled"]

export default function AdminDevelopmentProgramsPage() {
  const [selectedProgramType, setSelectedProgramType] = useState("All")
  const [selectedFaculty, setSelectedFaculty] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredPrograms = mockPrograms.filter((program) => {
    const matchesType = selectedProgramType === "All" || program.type === selectedProgramType
    const matchesFaculty = selectedFaculty === "All" || program.faculty === selectedFaculty
    const matchesStatus = selectedStatus === "All" || program.status === selectedStatus
    const matchesSearch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDateRange =
      (!startDate || program.startDate >= startDate) && (!endDate || program.startDate <= endDate)

    return matchesType && matchesFaculty && matchesStatus && matchesSearch && matchesDateRange
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Ongoing":
        return "bg-blue-100 text-blue-800"
      case "Planned":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgramTypeColor = (type: string) => {
    switch (type) {
      case "FDP":
        return "bg-purple-100 text-purple-800"
      case "Workshop":
        return "bg-blue-100 text-blue-800"
      case "Leadership Program":
        return "bg-orange-100 text-orange-800"
      case "Bootcamp":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Development Programs</h1>
            <p className="text-gray-600 mt-2">Manage faculty and staff development programs across all departments</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="program-type">Program Type</Label>
                <Select value={selectedProgramType} onValueChange={setSelectedProgramType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {programTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="faculty">Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs Display */}
        <Tabs defaultValue="faculty" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faculty">Faculty Level</TabsTrigger>
            <TabsTrigger value="department">Department Level</TabsTrigger>
          </TabsList>

          <TabsContent value="faculty" className="space-y-4">
            <div className="grid gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{program.title}</CardTitle>
                        <CardDescription>{program.description}</CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {program.startDate} - {program.endDate}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {program.duration}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {program.participants} participants
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                        <Badge className={getProgramTypeColor(program.type)}>{program.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Organizer</h4>
                        <p className="text-sm">{program.organizer}</p>
                        <p className="text-xs text-gray-500">{program.faculty}</p>
                        <p className="text-xs text-gray-500">{program.department}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Speakers</h4>
                        <div className="space-y-1">
                          {program.speakers.map((speaker, index) => (
                            <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                              {speaker}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Topics Covered</h4>
                        <div className="flex flex-wrap gap-1">
                          {program.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Program Details</h4>
                        <div className="space-y-1 text-sm">
                          <p>Budget: ₹{program.budget.toLocaleString()}</p>
                          {program.status === "Completed" && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Rating:</p>
                              {renderStars(program.rating)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {program.outcomes.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          Key Outcomes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {program.outcomes.map((outcome, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {outcome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="department" className="space-y-4">
            <div className="grid gap-6">
              {filteredPrograms.map((program) => (
                <Card key={`dept-${program.id}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{program.title}</CardTitle>
                        <CardDescription className="text-sm">{program.organizer}</CardDescription>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {program.startDate}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {program.duration}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {program.type}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Department:</span>
                        <p>{program.department}</p>
                      </div>
                      <div>
                        <span className="font-medium">Participants:</span>
                        <p>{program.participants}</p>
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span>
                        <p>₹{program.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Rating:</span>
                        {renderStars(program.rating)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">{filteredPrograms.length}</h3>
                <p className="text-sm text-gray-600">Total Programs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {filteredPrograms.filter((p) => p.status === "Completed").length}
                </h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-600">
                  {filteredPrograms.filter((p) => p.status === "Ongoing").length}
                </h3>
                <p className="text-sm text-gray-600">Ongoing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-purple-600">
                  {filteredPrograms.reduce((sum, program) => sum + program.participants, 0)}
                </h3>
                <p className="text-sm text-gray-600">Total Participants</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
