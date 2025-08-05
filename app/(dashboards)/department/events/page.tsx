"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  venue: string
  participants: number
  organizer: string
}

interface StudentActivity {
  id: string
  activityName: string
  description: string
  date: string
  participants: number
  coordinator: string
}

interface SeminarWorkshop {
  id: string
  title: string
  type: "Seminar" | "Conference" | "Workshop"
  organizedBy: string
  date: string
  venue: string
  participants: number
}

export default function DepartmentEvents() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Technical Symposium 2024",
      description: "Annual technical symposium featuring latest research",
      date: "2024-04-15",
      venue: "Department Auditorium",
      participants: 150,
      organizer: "Dr. John Smith",
    },
  ])

  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([
    {
      id: "1",
      activityName: "Coding Competition",
      description: "Inter-department coding competition",
      date: "2024-03-20",
      participants: 80,
      coordinator: "Student Council",
    },
  ])

  const [seminarsWorkshops, setSeminarsWorkshops] = useState<SeminarWorkshop[]>([
    {
      id: "1",
      title: "AI and Machine Learning Workshop",
      type: "Workshop",
      organizedBy: "Computer Science Association",
      date: "2024-03-10",
      venue: "Lab 101",
      participants: 60,
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("events")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  const handleAdd = (type: string) => {
    setActiveTab(type)
    setEditingItem(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEdit = (item: any, type: string) => {
    setActiveTab(type)
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const newItem = {
      ...formData,
      id: editingItem?.id || Date.now().toString(),
    }

    if (activeTab === "events") {
      if (editingItem) {
        setEvents(events.map((e) => (e.id === editingItem.id ? newItem : e)))
      } else {
        setEvents([...events, newItem])
      }
    } else if (activeTab === "activities") {
      if (editingItem) {
        setStudentActivities(studentActivities.map((a) => (a.id === editingItem.id ? newItem : a)))
      } else {
        setStudentActivities([...studentActivities, newItem])
      }
    } else if (activeTab === "seminars") {
      if (editingItem) {
        setSeminarsWorkshops(seminarsWorkshops.map((s) => (s.id === editingItem.id ? newItem : s)))
      } else {
        setSeminarsWorkshops([...seminarsWorkshops, newItem])
      }
    }

    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string, type: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      if (type === "events") {
        setEvents(events.filter((e) => e.id !== id))
      } else if (type === "activities") {
        setStudentActivities(studentActivities.filter((a) => a.id !== id))
      } else if (type === "seminars") {
        setSeminarsWorkshops(seminarsWorkshops.filter((s) => s.id !== id))
      }
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Department Events
          </h1>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="activities">Student Academic Activities</TabsTrigger>
            <TabsTrigger value="seminars">Seminars/Conferences/Workshops</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Events</CardTitle>
                <Button onClick={() => handleAdd("events")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, index) => (
                      <TableRow key={event.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.description}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell>{event.participants}</TableCell>
                        <TableCell>{event.organizer}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(event, "events")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(event.id, "events")}>
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

          <TabsContent value="activities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Student Academic Activities</CardTitle>
                <Button onClick={() => handleAdd("activities")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Activity Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Coordinator</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentActivities.map((activity, index) => (
                      <TableRow key={activity.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{activity.activityName}</TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                        <TableCell>{activity.participants}</TableCell>
                        <TableCell>{activity.coordinator}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(activity, "activities")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(activity.id, "activities")}>
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

          <TabsContent value="seminars">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Seminars/Conferences/Workshops organized by Students' Associations/Bodies</CardTitle>
                <Button onClick={() => handleAdd("seminars")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Seminar/Workshop
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Organized By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seminarsWorkshops.map((seminar, index) => (
                      <TableRow key={seminar.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{seminar.title}</TableCell>
                        <TableCell>{seminar.type}</TableCell>
                        <TableCell>{seminar.organizedBy}</TableCell>
                        <TableCell>{new Date(seminar.date).toLocaleDateString()}</TableCell>
                        <TableCell>{seminar.venue}</TableCell>
                        <TableCell>{seminar.participants}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(seminar, "seminars")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(seminar.id, "seminars")}>
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
                {editingItem ? "Edit" : "Add"}{" "}
                {activeTab === "events" ? "Event" : activeTab === "activities" ? "Activity" : "Seminar/Workshop"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {activeTab === "events" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue || ""}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="participants">Participants</Label>
                      <Input
                        id="participants"
                        type="number"
                        value={formData.participants || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, participants: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizer">Organizer</Label>
                      <Input
                        id="organizer"
                        value={formData.organizer || ""}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "activities" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="activityName">Activity Name</Label>
                    <Input
                      id="activityName"
                      value={formData.activityName || ""}
                      onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="participants">Participants</Label>
                      <Input
                        id="participants"
                        type="number"
                        value={formData.participants || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, participants: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coordinator">Coordinator</Label>
                    <Input
                      id="coordinator"
                      value={formData.coordinator || ""}
                      onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeTab === "seminars" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        className="w-full p-2 border rounded-md"
                        value={formData.type || ""}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="">Select Type</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Conference">Conference</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizedBy">Organized By</Label>
                      <Input
                        id="organizedBy"
                        value={formData.organizedBy || ""}
                        onChange={(e) => setFormData({ ...formData, organizedBy: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue || ""}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants">Participants</Label>
                    <Input
                      id="participants"
                      type="number"
                      value={formData.participants || ""}
                      onChange={(e) => setFormData({ ...formData, participants: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
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
