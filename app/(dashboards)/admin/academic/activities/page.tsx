"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Calendar, Users, Building, Search, Filter } from "lucide-react"

const mockActivitiesData = {
  department: [
    {
      id: 1,
      title: "Research Methodology Workshop",
      type: "Workshop",
      department: "Computer Science",
      faculty: "Faculty of Science",
      date: "2024-03-15",
      participants: 45,
      duration: "3 days",
      coordinator: "Dr. Rajesh Kumar",
      status: "Completed",
    },
    {
      id: 2,
      title: "Industry-Academia Interface",
      type: "Seminar",
      department: "Commerce",
      faculty: "Faculty of Commerce",
      date: "2024-03-20",
      participants: 60,
      duration: "1 day",
      coordinator: "Prof. Priya Patel",
      status: "Upcoming",
    },
  ],
  faculty: [
    {
      id: 1,
      title: "Inter-Faculty Sports Meet",
      type: "Sports Event",
      department: "All Departments",
      faculty: "Faculty of Science",
      date: "2024-03-25",
      participants: 200,
      duration: "5 days",
      coordinator: "Sports Committee",
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Annual Cultural Festival",
      type: "Cultural Event",
      department: "All Departments",
      faculty: "Faculty of Arts",
      date: "2024-04-10",
      participants: 500,
      duration: "3 days",
      coordinator: "Cultural Committee",
      status: "Planning",
    },
  ],
}

export default function AcademicActivities() {
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
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Upcoming":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Workshop":
        return "bg-purple-100 text-purple-800"
      case "Seminar":
        return "bg-orange-100 text-orange-800"
      case "Sports Event":
        return "bg-teal-100 text-teal-800"
      case "Cultural Event":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredData = mockActivitiesData[activeTab as keyof typeof mockActivitiesData].filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.coordinator.toLowerCase().includes(searchTerm.toLowerCase())

    const activityDate = new Date(activity.date)
    const matchesStartDate = !startDate || activityDate >= new Date(startDate)
    const matchesEndDate = !endDate || activityDate <= new Date(endDate)

    return matchesSearch && matchesStartDate && matchesEndDate
  })

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Activities</h1>
          <p className="text-gray-600 mt-2">View and manage academic activities at department and faculty levels</p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Date Range & Filters
            </CardTitle>
            <CardDescription>Select date range and search criteria to view activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Activities</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search activities..."
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
                  <Activity className="mr-2 h-4 w-4" />
                  Show Activities
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Results */}
        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Academic Activities ({filteredData.length})
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
                          <TableHead>Activity Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Coordinator</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.title}</TableCell>
                            <TableCell>
                              <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                            </TableCell>
                            <TableCell>{activity.department}</TableCell>
                            <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                            <TableCell>{activity.participants}</TableCell>
                            <TableCell>{activity.duration}</TableCell>
                            <TableCell>{activity.coordinator}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="faculty" className="mt-6">
                  <div className="space-y-4">
                    {filteredData.map((activity) => (
                      <Card key={activity.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="mr-1 h-4 w-4" />
                                  {new Date(activity.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Users className="mr-1 h-4 w-4" />
                                  {activity.participants} participants
                                </div>
                                <div className="flex items-center">
                                  <Building className="mr-1 h-4 w-4" />
                                  {activity.department}
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span> {activity.duration}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                              <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t pt-3">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Coordinator:</span> {activity.coordinator}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Faculty:</span> {activity.faculty}
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
