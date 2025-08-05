"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, BookOpen, Upload } from "lucide-react"

interface DevelopmentProgram {
  id: string
  programTitle: string
  venue: string
  participants: number
  programType: string
  startDate: string
  days: number
  image?: string
}

export default function DepartmentDevelopmentPrograms() {
  const [programs, setPrograms] = useState<DevelopmentProgram[]>([
    {
      id: "1",
      programTitle: "Faculty Development Program on AI",
      venue: "Department Seminar Hall",
      participants: 25,
      programType: "Workshop",
      startDate: "2024-03-15",
      days: 5,
      image: "",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<DevelopmentProgram | null>(null)
  const [formData, setFormData] = useState<Partial<DevelopmentProgram>>({})

  const handleAdd = () => {
    setEditingProgram(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEdit = (program: DevelopmentProgram) => {
    setEditingProgram(program)
    setFormData(program)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const newProgram: DevelopmentProgram = {
      ...(formData as DevelopmentProgram),
      id: editingProgram?.id || Date.now().toString(),
    }

    if (editingProgram) {
      setPrograms(programs.map((p) => (p.id === editingProgram.id ? newProgram : p)))
    } else {
      setPrograms([...programs, newProgram])
    }

    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this program?")) {
      setPrograms(programs.filter((p) => p.id !== id))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Development Programs
          </h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Development Programs Organized</CardTitle>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Program Title</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>No. of Participants</TableHead>
                  <TableHead>Type of Program</TableHead>
                  <TableHead>Program Start Date</TableHead>
                  <TableHead>No. of Days</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program, index) => (
                  <TableRow key={program.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{program.programTitle}</TableCell>
                    <TableCell>{program.venue}</TableCell>
                    <TableCell>{program.participants}</TableCell>
                    <TableCell>{program.programType}</TableCell>
                    <TableCell>{new Date(program.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{program.days}</TableCell>
                    <TableCell>
                      {program.image ? (
                        <img
                          src={program.image || "/placeholder.svg"}
                          alt="Program"
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
              <DialogTitle>{editingProgram ? "Edit Program" : "Add New Program"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="programTitle">Program Title</Label>
                <Input
                  id="programTitle"
                  value={formData.programTitle || ""}
                  onChange={(e) => setFormData({ ...formData, programTitle: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participants">No. of Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={formData.participants || ""}
                    onChange={(e) => setFormData({ ...formData, participants: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programType">Type of Program</Label>
                  <select
                    id="programType"
                    className="w-full p-2 border rounded-md"
                    value={formData.programType || ""}
                    onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Training">Training</option>
                    <option value="Conference">Conference</option>
                    <option value="FDP">Faculty Development Program</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Program Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">No. of Days</Label>
                  <Input
                    id="days"
                    type="number"
                    value={formData.days || ""}
                    onChange={(e) => setFormData({ ...formData, days: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center space-x-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image || "/placeholder.svg"}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>{editingProgram ? "Update" : "Add"} Program</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
