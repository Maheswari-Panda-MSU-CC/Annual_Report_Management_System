"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react"
import { useState } from "react"

interface DevelopmentProgramData {
  id: number
  srNo: number
  programTitle: string
  place: string
  noOfParticipants: number
  programDate: string
  image: string
}

export default function FacultyDevelopmentProgramsPage() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DevelopmentProgramData | null>(null)

  const [programs, setPrograms] = useState<DevelopmentProgramData[]>([
    {
      id: 1,
      srNo: 1,
      programTitle: "Faculty Development Program on Emerging Technologies",
      place: "Faculty Auditorium",
      noOfParticipants: 45,
      programDate: "2024-03-15",
      image: "/placeholder.svg?height=100&width=100&text=FDP1",
    },
    {
      id: 2,
      srNo: 2,
      programTitle: "Workshop on Research Methodology",
      place: "Conference Hall A",
      noOfParticipants: 32,
      programDate: "2024-02-28",
      image: "/placeholder.svg?height=100&width=100&text=Workshop",
    },
    {
      id: 3,
      srNo: 3,
      programTitle: "Training Program on Digital Learning Tools",
      place: "Computer Lab 1",
      noOfParticipants: 28,
      programDate: "2024-04-10",
      image: "/placeholder.svg?height=100&width=100&text=Training",
    },
  ])

  const [formData, setFormData] = useState<Partial<DevelopmentProgramData>>({
    programTitle: "",
    place: "",
    noOfParticipants: 0,
    programDate: "",
    image: "",
  })

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      programTitle: "",
      place: "",
      noOfParticipants: 0,
      programDate: "",
      image: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: DevelopmentProgramData) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setPrograms((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSave = () => {
    if (editingItem) {
      // Update existing item
      setPrograms((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? ({ ...formData, id: editingItem.id, srNo: editingItem.srNo } as DevelopmentProgramData)
            : item,
        ),
      )
    } else {
      // Add new item
      const newItem: DevelopmentProgramData = {
        ...(formData as DevelopmentProgramData),
        id: Math.max(...programs.map((item) => item.id), 0) + 1,
        srNo: programs.length + 1,
      }
      setPrograms((prev) => [...prev, newItem])
    }
    setIsDialogOpen(false)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Development Programs</h1>
            <p className="text-gray-600 mt-2">Manage development programs organized by {user?.faculty}</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>

        {/* Programs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Development Programs Organized</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Program Title</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>No. of Participants</TableHead>
                  <TableHead>Program Date</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>{program.srNo}</TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{program.programTitle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {program.place}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        {program.noOfParticipants}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(program.programDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <img
                        src={program.image || "/placeholder.svg"}
                        alt="Program"
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(program.id)}>
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
              <DialogTitle>{editingItem ? "Edit" : "Add New"} Development Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="programTitle">Program Title</Label>
                <Input
                  id="programTitle"
                  value={formData.programTitle || ""}
                  onChange={(e) => setFormData({ ...formData, programTitle: e.target.value })}
                  placeholder="Enter program title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    value={formData.place || ""}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="Enter venue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noOfParticipants">No. of Participants</Label>
                  <Input
                    id="noOfParticipants"
                    type="number"
                    value={formData.noOfParticipants || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, noOfParticipants: Number.parseInt(e.target.value) || 0 })
                    }
                    placeholder="Enter number of participants"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="programDate">Program Date</Label>
                <Input
                  id="programDate"
                  type="date"
                  value={formData.programDate || ""}
                  onChange={(e) => setFormData({ ...formData, programDate: e.target.value })}
                />
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
