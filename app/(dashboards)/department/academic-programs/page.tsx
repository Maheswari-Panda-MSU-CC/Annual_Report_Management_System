"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react"

interface AcademicProgram {
  id: string
  programLevel: string
  pattern: string
  specialization: string
  duration: number
  intakeCapacity: number
  financeType: "Regular" | "Self Finance"
  interdisciplinary: boolean
  innovative: boolean
  valueAdded: boolean
  careerOriented: boolean
  introductionDate: string
}

export default function DepartmentAcademicPrograms() {
  const [programs, setPrograms] = useState<AcademicProgram[]>([
    {
      id: "1",
      programLevel: "Undergraduate",
      pattern: "Semester",
      specialization: "Computer Science",
      duration: 48,
      intakeCapacity: 60,
      financeType: "Regular",
      interdisciplinary: true,
      innovative: false,
      valueAdded: true,
      careerOriented: true,
      introductionDate: "2020-07-01",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null)
  const [formData, setFormData] = useState<Partial<AcademicProgram>>({})

  const handleAdd = () => {
    setEditingProgram(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEdit = (program: AcademicProgram) => {
    setEditingProgram(program)
    setFormData(program)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const newProgram: AcademicProgram = {
      ...(formData as AcademicProgram),
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

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            Academic Programs
          </h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Academic Programmes</CardTitle>
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
                  <TableHead>Program Level</TableHead>
                  <TableHead>Pattern of Programme</TableHead>
                  <TableHead>Name of Specialization</TableHead>
                  <TableHead>Duration (months)</TableHead>
                  <TableHead>Intake Capacity</TableHead>
                  <TableHead>Regular/Self Finance</TableHead>
                  <TableHead>Interdisciplinary</TableHead>
                  <TableHead>Innovative</TableHead>
                  <TableHead>Value Added</TableHead>
                  <TableHead>Career Oriented</TableHead>
                  <TableHead>Introduction Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program, index) => (
                  <TableRow key={program.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{program.programLevel}</TableCell>
                    <TableCell>{program.pattern}</TableCell>
                    <TableCell>{program.specialization}</TableCell>
                    <TableCell>{program.duration}</TableCell>
                    <TableCell>{program.intakeCapacity}</TableCell>
                    <TableCell>{program.financeType}</TableCell>
                    <TableCell>{program.interdisciplinary ? "Yes" : "No"}</TableCell>
                    <TableCell>{program.innovative ? "Yes" : "No"}</TableCell>
                    <TableCell>{program.valueAdded ? "Yes" : "No"}</TableCell>
                    <TableCell>{program.careerOriented ? "Yes" : "No"}</TableCell>
                    <TableCell>{new Date(program.introductionDate).toLocaleDateString()}</TableCell>
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingProgram ? "Edit Program" : "Add New Program"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programLevel">Program Level</Label>
                  <select
                    id="programLevel"
                    className="w-full p-2 border rounded-md"
                    value={formData.programLevel || ""}
                    onChange={(e) => setFormData({ ...formData, programLevel: e.target.value })}
                  >
                    <option value="">Select Level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Doctoral">Doctoral</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern of Programme</Label>
                  <select
                    id="pattern"
                    className="w-full p-2 border rounded-md"
                    value={formData.pattern || ""}
                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  >
                    <option value="">Select Pattern</option>
                    <option value="Semester">Semester</option>
                    <option value="Annual">Annual</option>
                    <option value="Trimester">Trimester</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Name of Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization || ""}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intakeCapacity">Intake Capacity</Label>
                  <Input
                    id="intakeCapacity"
                    type="number"
                    value={formData.intakeCapacity || ""}
                    onChange={(e) => setFormData({ ...formData, intakeCapacity: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financeType">Regular/Self Finance</Label>
                  <select
                    id="financeType"
                    className="w-full p-2 border rounded-md"
                    value={formData.financeType || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, financeType: e.target.value as "Regular" | "Self Finance" })
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="Regular">Regular</option>
                    <option value="Self Finance">Self Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interdisciplinary"
                      checked={formData.interdisciplinary || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, interdisciplinary: !!checked })}
                    />
                    <Label htmlFor="interdisciplinary">Interdisciplinary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="innovative"
                      checked={formData.innovative || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, innovative: !!checked })}
                    />
                    <Label htmlFor="innovative">Innovative</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="valueAdded"
                      checked={formData.valueAdded || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, valueAdded: !!checked })}
                    />
                    <Label htmlFor="valueAdded">Value Added</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="careerOriented"
                      checked={formData.careerOriented || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, careerOriented: !!checked })}
                    />
                    <Label htmlFor="careerOriented">Career Oriented</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="introductionDate">Introduction Date</Label>
                <Input
                  id="introductionDate"
                  type="date"
                  value={formData.introductionDate || ""}
                  onChange={(e) => setFormData({ ...formData, introductionDate: e.target.value })}
                />
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
