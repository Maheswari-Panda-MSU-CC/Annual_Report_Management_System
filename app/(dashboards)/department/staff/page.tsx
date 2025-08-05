"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, UserCog } from "lucide-react"

interface TeachingStaff {
  id: string
  teacherName: string
  emailId: string
  serviceStatus: string
}

interface ResearchStaff {
  id: string
  designation: string
  name: string
  duration: number
}

interface NonTeachingStaff {
  id: string
  designation: string
  appointmentDate: string
  name: string
}

export default function DepartmentStaff() {
  const [teachingStaff, setTeachingStaff] = useState<TeachingStaff[]>([
    {
      id: "1",
      teacherName: "Dr. John Smith",
      emailId: "john.smith@university.edu",
      serviceStatus: "Permanent",
    },
  ])

  const [researchStaff, setResearchStaff] = useState<ResearchStaff[]>([
    {
      id: "1",
      designation: "Research Associate",
      name: "Dr. Jane Doe",
      duration: 24,
    },
  ])

  const [nonTeachingStaff, setNonTeachingStaff] = useState<NonTeachingStaff[]>([
    {
      id: "1",
      designation: "Lab Assistant",
      appointmentDate: "2023-01-15",
      name: "Mr. Robert Johnson",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("teaching")
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

    if (activeTab === "teaching") {
      if (editingItem) {
        setTeachingStaff(teachingStaff.map((s) => (s.id === editingItem.id ? newItem : s)))
      } else {
        setTeachingStaff([...teachingStaff, newItem])
      }
    } else if (activeTab === "research") {
      if (editingItem) {
        setResearchStaff(researchStaff.map((s) => (s.id === editingItem.id ? newItem : s)))
      } else {
        setResearchStaff([...researchStaff, newItem])
      }
    } else if (activeTab === "nonteaching") {
      if (editingItem) {
        setNonTeachingStaff(nonTeachingStaff.map((s) => (s.id === editingItem.id ? newItem : s)))
      } else {
        setNonTeachingStaff([...nonTeachingStaff, newItem])
      }
    }

    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string, type: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      if (type === "teaching") {
        setTeachingStaff(teachingStaff.filter((s) => s.id !== id))
      } else if (type === "research") {
        setResearchStaff(researchStaff.filter((s) => s.id !== id))
      } else if (type === "nonteaching") {
        setNonTeachingStaff(nonTeachingStaff.filter((s) => s.id !== id))
      }
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="h-8 w-8 text-blue-600" />
            Department Staff
          </h1>
        </div>

        <Tabs defaultValue="teaching" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
            <TabsTrigger value="research">Research/Other Staff</TabsTrigger>
            <TabsTrigger value="nonteaching">Non-Teaching Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="teaching">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Teaching Staff</CardTitle>
                <Button onClick={() => handleAdd("teaching")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Teacher's Name</TableHead>
                      <TableHead>Email ID</TableHead>
                      <TableHead>Service Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachingStaff.map((staff, index) => (
                      <TableRow key={staff.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{staff.teacherName}</TableCell>
                        <TableCell>{staff.emailId}</TableCell>
                        <TableCell>{staff.serviceStatus}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(staff, "teaching")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(staff.id, "teaching")}>
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

          <TabsContent value="research">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Research/Other Staff</CardTitle>
                <Button onClick={() => handleAdd("research")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration (months)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {researchStaff.map((staff, index) => (
                      <TableRow key={staff.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{staff.designation}</TableCell>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.duration}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(staff, "research")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(staff.id, "research")}>
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

          <TabsContent value="nonteaching">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Non-Teaching Staff</CardTitle>
                <Button onClick={() => handleAdd("nonteaching")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Appointment Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonTeachingStaff.map((staff, index) => (
                      <TableRow key={staff.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{staff.designation}</TableCell>
                        <TableCell>{new Date(staff.appointmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(staff, "nonteaching")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(staff.id, "nonteaching")}>
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
                {activeTab === "teaching"
                  ? "Teaching Staff"
                  : activeTab === "research"
                    ? "Research Staff"
                    : "Non-Teaching Staff"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {activeTab === "teaching" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teacherName">Teacher's Name</Label>
                    <Input
                      id="teacherName"
                      value={formData.teacherName || ""}
                      onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailId">Email ID</Label>
                    <Input
                      id="emailId"
                      type="email"
                      value={formData.emailId || ""}
                      onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceStatus">Service Status</Label>
                    <select
                      id="serviceStatus"
                      className="w-full p-2 border rounded-md"
                      value={formData.serviceStatus || ""}
                      onChange={(e) => setFormData({ ...formData, serviceStatus: e.target.value })}
                    >
                      <option value="">Select Status</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Contract">Contract</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "research" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation || ""}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (months)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {activeTab === "nonteaching" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation || ""}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Appointment Date</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate || ""}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
