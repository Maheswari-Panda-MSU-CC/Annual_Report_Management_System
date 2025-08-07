"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Calendar, MapPin, Users, BookOpen } from "lucide-react"
import { useState } from "react"

interface EventData {
  id: number
  srNo: number
  eventName: string
  description: string
  eventDate: string
  place: string
  image: string
}

export default function FacultyEventsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("events")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EventData | null>(null)

  // Sample data for Events
  const [events, setEvents] = useState<EventData[]>([
    {
      id: 1,
      srNo: 1,
      eventName: "Annual Tech Fest 2024",
      description: "Technical festival showcasing student innovations and projects",
      eventDate: "2024-03-15",
      place: "Main Auditorium",
      image: "/placeholder.svg?height=100&width=100&text=Event1",
    },
    {
      id: 2,
      srNo: 2,
      eventName: "Industry Expert Lecture Series",
      description: "Weekly lectures by industry professionals on emerging technologies",
      eventDate: "2024-03-20",
      place: "Conference Hall A",
      image: "/placeholder.svg?height=100&width=100&text=Event2",
    },
  ])

  // Sample data for Student Academic Activities
  const [studentActivities, setStudentActivities] = useState<EventData[]>([
    {
      id: 1,
      srNo: 1,
      eventName: "Research Paper Presentation",
      description: "Students presenting their research work in various domains",
      eventDate: "2024-02-28",
      place: "Seminar Hall",
      image: "/placeholder.svg?height=100&width=100&text=Research",
    },
  ])

  // Sample data for Seminars/Conferences/Workshops
  const [seminars, setSeminars] = useState<EventData[]>([
    {
      id: 1,
      srNo: 1,
      eventName: "AI & ML Workshop",
      description: "Workshop on Artificial Intelligence and Machine Learning organized by Student Association",
      eventDate: "2024-04-10",
      place: "Computer Lab",
      image: "/placeholder.svg?height=100&width=100&text=Workshop",
    },
  ])

  const [formData, setFormData] = useState<Partial<EventData>>({
    eventName: "",
    description: "",
    eventDate: "",
    place: "",
    image: "",
  })

  const getCurrentData = () => {
    switch (activeTab) {
      case "events":
        return events
      case "activities":
        return studentActivities
      case "seminars":
        return seminars
      default:
        return []
    }
  }

  const setCurrentData = (data: EventData[]) => {
    switch (activeTab) {
      case "events":
        setEvents(data)
        break
      case "activities":
        setStudentActivities(data)
        break
      case "seminars":
        setSeminars(data)
        break
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      eventName: "",
      description: "",
      eventDate: "",
      place: "",
      image: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: EventData) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    const currentData = getCurrentData()
    const updatedData = currentData.filter((item) => item.id !== id)
    setCurrentData(updatedData)
  }

  const handleSave = () => {
    const currentData = getCurrentData()
    if (editingItem) {
      // Update existing item
      const updatedData = currentData.map((item) =>
        item.id === editingItem.id ? ({ ...formData, id: editingItem.id, srNo: editingItem.srNo } as EventData) : item,
      )
      setCurrentData(updatedData)
    } else {
      // Add new item
      const newItem: EventData = {
        ...(formData as EventData),
        id: Math.max(...currentData.map((item) => item.id), 0) + 1,
        srNo: currentData.length + 1,
      }
      setCurrentData([...currentData, newItem])
    }
    setIsDialogOpen(false)
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "events":
        return "Events"
      case "activities":
        return "Student Academic Activities"
      case "seminars":
        return "Seminars/Conferences/Workshops organized by Students' Associations/Bodies"
      default:
        return "Events"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Research":
        return <BookOpen className="h-4 w-4" />
      case "Workshop":
        return <Users className="h-4 w-4" />
      case "Development":
        return <Users className="h-4 w-4" />
      case "Meeting":
        return <Calendar className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Events</h1>
            <p className="text-gray-600 mt-2">Manage events and activities for {user?.faculty}</p>
          </div>
        </div>

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="activities">Student Academic Activities</TabsTrigger>
            <TabsTrigger value="seminars">Seminars/Conferences/Workshops</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{getTabTitle()}</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Event/Activity Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentData().map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.srNo}</TableCell>
                        <TableCell className="font-medium">{item.eventName}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(item.eventDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {item.place}
                          </div>
                        </TableCell>
                        <TableCell>
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt="Event"
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit" : "Add New"} {getTabTitle()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event/Activity Name</Label>
                <Input
                  id="eventName"
                  value={formData.eventName || ""}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="Enter event name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate || ""}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    value={formData.place || ""}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="Enter venue"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image || ""}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>{editingItem ? "Update" : "Add"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
