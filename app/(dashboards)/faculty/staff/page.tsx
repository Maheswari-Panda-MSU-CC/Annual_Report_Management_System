"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Calendar, User } from "lucide-react"
import { useState } from "react"

interface StaffData {
  id: number
  srNo: number
  designation: string
  appointmentDate: string
  name: string
}

export default function FacultyStaffPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("teaching")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StaffData | null>(null)

  // Teaching Staff Data
  const [teachingStaff, setTeachingStaff] = useState<StaffData[]>([
    {
      id: 1,
      srNo: 1,
      designation: "Professor",
      appointmentDate: "2018-07-15",
      name: "Dr. Rajesh Kumar",
    },
    {
      id: 2,
      srNo: 2,
      designation: "Associate Professor",
      appointmentDate: "2020-01-10",
      name: "Dr. Priya Sharma",
    },
    {
      id: 3,
      srNo: 3,
      designation: "Assistant Professor",
      appointmentDate: "2022-08-01",
      name: "Dr. Amit Patel",
    },
  ])

  // Non-Teaching Staff Data
  const [nonTeachingStaff, setNonTeachingStaff] = useState<StaffData[]>([
    {
      id: 1,
      srNo: 1,
      designation: "Administrative Officer",
      appointmentDate: "2019-03-20",
      name: "Mr. Suresh Gupta",
    },
    {
      id: 2,
      srNo: 2,
      designation: "Lab Assistant",
      appointmentDate: "2021-06-15",
      name: "Ms. Kavita Singh",
    },
    {
      id: 3,
      srNo: 3,
      designation: "Office Assistant",
      appointmentDate: "2020-11-10",
      name: "Mr. Ravi Joshi",
    },
  ])

  const [formData, setFormData] = useState<Partial<StaffData>>({
    designation: "",
    appointmentDate: "",
    name: "",
  })

  const getCurrentData = () => {
    return activeTab === "teaching" ? teachingStaff : nonTeachingStaff
  }

  const setCurrentData = (data: StaffData[]) => {
    if (activeTab === "teaching") {
      setTeachingStaff(data)
    } else {
      setNonTeachingStaff(data)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      designation: "",
      appointmentDate: "",
      name: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: StaffData) => {
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
        item.id === editingItem.id ? ({ ...formData, id: editingItem.id, srNo: editingItem.srNo } as StaffData) : item,
      )
      setCurrentData(updatedData)
    } else {
      // Add new item
      const newItem: StaffData = {
        ...(formData as StaffData),
        id: Math.max(...currentData.map((item) => item.id), 0) + 1,
        srNo: currentData.length + 1,
      }
      setCurrentData([...currentData, newItem])
    }
    setIsDialogOpen(false)
  }

  const getTabTitle = () => {
    return activeTab === "teaching" ? "Teaching Staff" : "Non-Teaching Staff"
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Staff</h1>
            <p className="text-gray-600 mt-2">Manage staff information for {user?.faculty}</p>
          </div>
        </div>

        {/* Staff Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
            <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{getTabTitle()}</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
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
                    {getCurrentData().map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.srNo}</TableCell>
                        <TableCell className="font-medium">{staff.designation}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(staff.appointmentDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {staff.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(staff.id)}>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter staff name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation || ""}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Enter designation"
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
