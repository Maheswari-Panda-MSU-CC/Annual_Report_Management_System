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
import { Plus, Edit, Trash2, Users } from "lucide-react"

interface DistinguishedVisitor {
  id: string
  name: string
  designation: string
  organization: string
  visitDate: string
  purpose: string
  duration: string
}

interface VisitingFaculty {
  id: string
  name: string
  designation: string
  organization: string
  visitDate: string
  duration: string
  subject: string
  purpose: string
}

export default function DepartmentVisitors() {
  const [distinguishedVisitors, setDistinguishedVisitors] = useState<DistinguishedVisitor[]>([
    {
      id: "1",
      name: "Dr. Rajesh Kumar",
      designation: "Director",
      organization: "IIT Bombay",
      visitDate: "2024-03-15",
      purpose: "Guest Lecture on AI",
      duration: "1 day",
    },
  ])

  const [visitingFaculty, setVisitingFaculty] = useState<VisitingFaculty[]>([
    {
      id: "1",
      name: "Prof. Sarah Johnson",
      designation: "Professor",
      organization: "Stanford University",
      visitDate: "2024-02-20",
      duration: "1 week",
      subject: "Machine Learning",
      purpose: "Research Collaboration",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("distinguished")
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

    if (activeTab === "distinguished") {
      if (editingItem) {
        setDistinguishedVisitors(distinguishedVisitors.map((v) => (v.id === editingItem.id ? newItem : v)))
      } else {
        setDistinguishedVisitors([...distinguishedVisitors, newItem])
      }
    } else if (activeTab === "faculty") {
      if (editingItem) {
        setVisitingFaculty(visitingFaculty.map((f) => (f.id === editingItem.id ? newItem : f)))
      } else {
        setVisitingFaculty([...visitingFaculty, newItem])
      }
    }

    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string, type: string) => {
    if (confirm("Are you sure you want to delete this visitor?")) {
      if (type === "distinguished") {
        setDistinguishedVisitors(distinguishedVisitors.filter((v) => v.id !== id))
      } else if (type === "faculty") {
        setVisitingFaculty(visitingFaculty.filter((f) => f.id !== id))
      }
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Department Visitors
          </h1>
        </div>

        <Tabs defaultValue="distinguished" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distinguished">Distinguished Visitors</TabsTrigger>
            <TabsTrigger value="faculty">Visiting Faculty</TabsTrigger>
          </TabsList>

          <TabsContent value="distinguished">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Distinguished Visitors at Department</CardTitle>
                <Button onClick={() => handleAdd("distinguished")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visitor
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distinguishedVisitors.map((visitor, index) => (
                      <TableRow key={visitor.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{visitor.name}</TableCell>
                        <TableCell>{visitor.designation}</TableCell>
                        <TableCell>{visitor.organization}</TableCell>
                        <TableCell>{new Date(visitor.visitDate).toLocaleDateString()}</TableCell>
                        <TableCell>{visitor.purpose}</TableCell>
                        <TableCell>{visitor.duration}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(visitor, "distinguished")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(visitor.id, "distinguished")}
                            >
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

          <TabsContent value="faculty">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Visiting Faculty (Other than MSU Faculty members)</CardTitle>
                <Button onClick={() => handleAdd("faculty")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Faculty
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitingFaculty.map((faculty, index) => (
                      <TableRow key={faculty.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{faculty.name}</TableCell>
                        <TableCell>{faculty.designation}</TableCell>
                        <TableCell>{faculty.organization}</TableCell>
                        <TableCell>{new Date(faculty.visitDate).toLocaleDateString()}</TableCell>
                        <TableCell>{faculty.duration}</TableCell>
                        <TableCell>{faculty.subject}</TableCell>
                        <TableCell>{faculty.purpose}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(faculty, "faculty")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(faculty.id, "faculty")}>
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
                {activeTab === "distinguished" ? "Distinguished Visitor" : "Visiting Faculty"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation || ""}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization || ""}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Visit Date</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={formData.visitDate || ""}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 1 day, 1 week"
                  />
                </div>
              </div>

              {activeTab === "faculty" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose || ""}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                />
              </div>

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
