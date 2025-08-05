"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  status: "active" | "inactive"
  createdAt: string
}

const mockYears: AcademicYear[] = [
  {
    id: "1",
    year: "2023-24",
    startDate: "2023-07-01",
    endDate: "2024-06-30",
    status: "active",
    createdAt: "2023-06-15",
  },
  {
    id: "2",
    year: "2022-23",
    startDate: "2022-07-01",
    endDate: "2023-06-30",
    status: "inactive",
    createdAt: "2022-06-15",
  },
  {
    id: "3",
    year: "2021-22",
    startDate: "2021-07-01",
    endDate: "2022-06-30",
    status: "inactive",
    createdAt: "2021-06-15",
  },
]

export default function YearManagement() {
  const [years, setYears] = useState<AcademicYear[]>(mockYears)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [formData, setFormData] = useState({
    year: "",
    startDate: "",
    endDate: "",
    status: "inactive" as "active" | "inactive",
  })
  const { toast } = useToast()

  const handleAdd = () => {
    if (!formData.year || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newYear: AcademicYear = {
      id: Date.now().toString(),
      year: formData.year,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setYears([...years, newYear])
    setIsAddDialogOpen(false)
    setFormData({ year: "", startDate: "", endDate: "", status: "inactive" })

    toast({
      title: "Success",
      description: "Academic year added successfully",
    })
  }

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year)
    setFormData({
      year: year.year,
      startDate: year.startDate,
      endDate: year.endDate,
      status: year.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!editingYear) return

    const updatedYears = years.map((year) => (year.id === editingYear.id ? { ...year, ...formData } : year))

    setYears(updatedYears)
    setIsEditDialogOpen(false)
    setEditingYear(null)
    setFormData({ year: "", startDate: "", endDate: "", status: "inactive" })

    toast({
      title: "Success",
      description: "Academic year updated successfully",
    })
  }

  const handleDelete = (id: string) => {
    setYears(years.filter((year) => year.id !== id))
    toast({
      title: "Success",
      description: "Academic year deleted successfully",
    })
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Year Management</h1>
            <p className="text-gray-600 mt-2">Manage academic years for the university</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Academic Year</DialogTitle>
                <DialogDescription>Create a new academic year for the university</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">
                    Year
                  </Label>
                  <Input
                    id="year"
                    placeholder="2024-25"
                    className="col-span-3"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="col-span-3"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="col-span-3"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <select
                    id="status"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>Add Academic Year</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Academic Years Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Academic Years
            </CardTitle>
            <CardDescription>List of all academic years in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.year}</TableCell>
                    <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          year.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {year.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(year.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(year)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(year.id)}>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Academic Year</DialogTitle>
              <DialogDescription>Update the academic year information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-year" className="text-right">
                  Year
                </Label>
                <Input
                  id="edit-year"
                  placeholder="2024-25"
                  className="col-span-3"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  className="col-span-3"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  className="col-span-3"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <select
                  id="edit-status"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate}>Update Academic Year</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
