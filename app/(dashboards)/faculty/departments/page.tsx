"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Building, Mail } from "lucide-react"
import { useState } from "react"

interface DepartmentData {
  id: number
  srNo: number
  name: string
  emailId: string
}

export default function FacultyDepartmentsPage() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DepartmentData | null>(null)

  const [departments, setDepartments] = useState<DepartmentData[]>([
    {
      id: 1,
      srNo: 1,
      name: "Computer Science and Engineering",
      emailId: "cse@msubaroda.ac.in",
    },
    {
      id: 2,
      srNo: 2,
      name: "Information Technology",
      emailId: "it@msubaroda.ac.in",
    },
    {
      id: 3,
      srNo: 3,
      name: "Electronics and Communication Engineering",
      emailId: "ece@msubaroda.ac.in",
    },
    {
      id: 4,
      srNo: 4,
      name: "Mechanical Engineering",
      emailId: "mech@msubaroda.ac.in",
    },
    {
      id: 5,
      srNo: 5,
      name: "Civil Engineering",
      emailId: "civil@msubaroda.ac.in",
    },
    {
      id: 6,
      srNo: 6,
      name: "Electrical Engineering",
      emailId: "electrical@msubaroda.ac.in",
    },
  ])

  const [formData, setFormData] = useState<Partial<DepartmentData>>({
    name: "",
    emailId: "",
  })

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      emailId: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: DepartmentData) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setDepartments((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSave = () => {
    if (editingItem) {
      setDepartments((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? ({ ...formData, id: editingItem.id, srNo: editingItem.srNo } as DepartmentData)
            : item,
        ),
      )
    } else {
      const newItem: DepartmentData = {
        ...(formData as DepartmentData),
        id: Math.max(...departments.map((item) => item.id), 0) + 1,
        srNo: departments.length + 1,
      }
      setDepartments((prev) => [...prev, newItem])
    }
    setIsDialogOpen(false)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Departments</h1>
            <p className="text-gray-600 mt-2">Manage departments in {user?.faculty}</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email Id</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.srNo}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        {department.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${department.emailId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {department.emailId}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(department)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(department.id)}>
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add New"} Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter department name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailId">Email Id</Label>
                <Input
                  id="emailId"
                  type="email"
                  value={formData.emailId || ""}
                  onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                  placeholder="Enter department email"
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

        {/* Department Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engineering Departments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.filter((dept) => dept.name.includes("Engineering")).length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Email Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
