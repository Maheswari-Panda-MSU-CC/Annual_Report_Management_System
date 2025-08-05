"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Star, Filter, Search, Download, Plus } from "lucide-react"
import { useState } from "react"

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "International Conference on AI and Machine Learning",
    type: "Conference",
    date: "2024-03-15",
    endDate: "2024-03-17",
    venue: "Main Auditorium",
    organizer: "Computer Science Department",
    faculty: "Faculty of Technology",
    speakers: ["Dr. John Smith", "Prof. Sarah Johnson"],
    topics: ["Artificial Intelligence", "Machine Learning", "Deep Learning"],
    attendees: 250,
    budget: 500000,
    status: "Completed",
    rating: 4.8,
    description: "A comprehensive conference on latest developments in AI and ML",
  },
  {
    id: 2,
    title: "Workshop on Sustainable Energy Solutions",
    type: "Workshop",
    date: "2024-04-10",
    endDate: "2024-04-12",
    venue: "Engineering Block",
    organizer: "Mechanical Engineering Department",
    faculty: "Faculty of Technology",
    speakers: ["Dr. Michael Brown", "Dr. Lisa Wilson"],
    topics: ["Renewable Energy", "Solar Power", "Wind Energy"],
    attendees: 80,
    budget: 150000,
    status: "Ongoing",
    rating: null,
    description: "Hands-on workshop on sustainable energy technologies",
  },
  {
    id: 3,
    title: "Seminar on Digital Marketing Trends",
    type: "Seminar",
    date: "2024-05-20",
    endDate: "2024-05-20",
    venue: "Business School Auditorium",
    organizer: "Management Department",
    faculty: "Faculty of Management",
    speakers: ["Mr. David Lee", "Ms. Emma Davis"],
    topics: ["Digital Marketing", "Social Media", "E-commerce"],
    attendees: 120,
    budget: 75000,
    status: "Planned",
    rating: null,
    description: "Latest trends and strategies in digital marketing",
  },
]

const eventTypes = ["All", "Conference", "Workshop", "Seminar", "Symposium", "Lecture"]
const faculties = ["All", "Faculty of Technology", "Faculty of Science", "Faculty of Management", "Faculty of Arts"]
const statusOptions = ["All", "Completed", "Ongoing", "Planned", "Cancelled"]

export default function AdminEventsPage() {
  const [selectedEventType, setSelectedEventType] = useState("All")
  const [selectedFaculty, setSelectedFaculty] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredEvents = mockEvents.filter((event) => {
    const matchesType = selectedEventType === "All" || event.type === selectedEventType
    const matchesFaculty = selectedFaculty === "All" || event.faculty === selectedFaculty
    const matchesStatus = selectedStatus === "All" || event.status === selectedStatus
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDateRange = (!startDate || event.date >= startDate) && (!endDate || event.date <= endDate)

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
            <h1 className="text-3xl font-bold text-gray-900">Academic Events</h1>
            <p className="text-gray-600 mt-2">Manage and track academic events across all faculties and departments</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
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
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
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

        {/* Events Display */}
        <Tabs defaultValue="faculty" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faculty">Faculty Level</TabsTrigger>
            <TabsTrigger value="department">Department Level</TabsTrigger>
          </TabsList>

          <TabsContent value="faculty" className="space-y-4">
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {event.date} {event.endDate !== event.date && `- ${event.endDate}`}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.venue}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees} attendees
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Organizer</h4>
                        <p className="text-sm">{event.organizer}</p>
                        <p className="text-xs text-gray-500">{event.faculty}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Speakers</h4>
                        <div className="space-y-1">
                          {event.speakers.map((speaker, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {speaker}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Topics</h4>
                        <div className="flex flex-wrap gap-1">
                          {event.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Details</h4>
                        <div className="space-y-1 text-sm">
                          <p>Budget: ₹{event.budget.toLocaleString()}</p>
                          {event.status === "Completed" && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Rating:</p>
                              {renderStars(event.rating)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="department" className="space-y-4">
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={`dept-${event.id}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription className="text-sm">{event.organizer}</CardDescription>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {event.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.type}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Venue:</span>
                        <p>{event.venue}</p>
                      </div>
                      <div>
                        <span className="font-medium">Attendees:</span>
                        <p>{event.attendees}</p>
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span>
                        <p>₹{event.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Rating:</span>
                        {renderStars(event.rating)}
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
                <h3 className="text-2xl font-bold text-blue-600">{filteredEvents.length}</h3>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {filteredEvents.filter((e) => e.status === "Completed").length}
                </h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-600">
                  {filteredEvents.filter((e) => e.status === "Ongoing").length}
                </h3>
                <p className="text-sm text-gray-600">Ongoing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-purple-600">
                  {filteredEvents.reduce((sum, event) => sum + event.attendees, 0)}
                </h3>
                <p className="text-sm text-gray-600">Total Attendees</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
