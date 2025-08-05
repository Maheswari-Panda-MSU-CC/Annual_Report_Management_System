"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react"
import { useState } from "react"

interface ActivityData {
  id: number
  srNo: number
  activityName: string
  description: string
  date: string
  participants: number
  venue: string
  organizer: string
}

export default function FacultyStudentProgressionPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("department")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ActivityData | null>(null)

  // Activities Organized in the Department
  const [departmentActivities, setDepartmentActivities] = useState<ActivityData[]>([
    {
      id: 1,
      srNo: 1,
      activityName: "Technical Paper Presentation Competition",
      description: "Students present their research papers on emerging technologies",
      date: "2024-03-15",
      participants: 45,
      venue: "Faculty Auditorium",
      organizer: "Department of Computer Science",
    },
    {
      id: 2,
      srNo: 2,
      activityName: "Project Exhibition",
      description: "Final year students showcase their capstone projects",
      date: "2024-02-28",
      participants: 120,
      venue: "Exhibition Hall",
      organizer: "All Departments",
    },
  ])

  // Activities Organized outside MSU
  const [outsideActivities, setOutsideActivities] = useState<ActivityData[]>([
    {
      id: 1,
      srNo: 1,
      activityName: "National Level Hackathon",
      description: "Students participated in 48-hour coding competition",
      date: "2024-01-20",
      participants: 12,
      venue: "IIT Bombay",
      organizer: "IEEE Student Chapter",
    },
    {
      id: 2,
      srNo: 2,
      activityName: "International Conference Presentation",
      description: "Research paper presentation at international conference",
      date: "2024-03-10",
      participants: 3,
      venue: "Singapore",
      organizer: "Faculty Research Committee",
    },
  ])

  // Other Activities Organised
  const [otherActivities, setOtherActivities] = useState<ActivityData[]>([
    {
      id: 1,
      srNo: 1,
      activityName: "Industry Visit Program",
      description: "Educational visit to manufacturing industries",
      date: "2024-02-15",
      participants: 60,
      venue: "Various Industries",
      organizer: "Training & Placement Cell",
    },
    {
      id: 2,
      srNo: 2,
      activityName: "Alumni Interaction Session",
      description: "Career guidance session by successful alumni",
      date: "2024-03-05",
      participants: 80,
      venue: "Conference Hall",
      organizer: "Alumni Association",
    },
  ])

  const [formData, setFormData] = useState<Partial<ActivityData>>({
    activityName: "",
    description: "",
    date: "",
    participants: 0,
    venue: "",
    organizer: "",
  })

  const getCurrentData = () => {
    switch (activeTab) {
      case "department":
        return departmentActivities
      case "outside":
        return outsideActivities
      case "other":
        return otherActivities
      default:
        return []
    }
  }

  const setCurrentData = (data: ActivityData[]) => {
    switch (activeTab) {
      case "department":
        setDepartmentActivities(data)
        break
      case "outside":
        setOutsideActivities(data)
        break
      case "other":
        setOtherActivities(data)
        break
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      activityName: "",
      description: "",
      date: "",
      participants: 0,
      venue: "",
      organizer: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: ActivityData) => {
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
      const updatedData = currentData.map((item) =>
        item.id === editingItem.id
          ? ({ ...formData, id: editingItem.id, srNo: editingItem.srNo } as ActivityData)
          : item,
      )
      setCurrentData(updatedData)
    } else {
      const newItem: ActivityData = {
        ...(formData as ActivityData),
        id: Math.max(...currentData.map((item) => item.id), 0) + 1,
        srNo: currentData.length + 1,
      }
      setCurrentData([...currentData, newItem])
    }
    setIsDialogOpen(false)
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "department":
        return "Activities Organized in the Department"
      case "outside":
        return "Activities Organized outside MSU"
      case "other":
        return "Other Activities Organised"
      default:
        return "Activities"
    }
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Progression Activities</h1>
            <p className="text-gray-600 mt-2">Manage student activities and progression for {user?.faculty}</p>
          </div>
        </div>

        {/* Activities Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="department">Activities in Department</TabsTrigger>
            <TabsTrigger value="outside">Activities outside MSU</TabsTrigger>
            <TabsTrigger value="other">Other Activities</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{getTabTitle()}</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
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
                      <TableHead>Venue</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentData().map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.srNo}</TableCell>
                        <TableCell className="font-medium">{activity.activityName}</TableCell>
                        <TableCell className="max-w-xs truncate">{activity.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            {activity.participants}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {activity.venue}
                          </div>
                        </TableCell>
                        <TableCell>{activity.organizer}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(activity.id)}>
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
              <DialogTitle>{editingItem ? "Edit" : "Add New"} Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityName">Activity Name</Label>
                <Input
                  id="activityName"
                  value={formData.activityName || ""}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="Enter activity name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter activity description"
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
                    onChange={(e) => setFormData({ ...formData, participants: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Number of participants"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue || ""}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter venue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer || ""}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Enter organizer"
                  />
                </div>
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
