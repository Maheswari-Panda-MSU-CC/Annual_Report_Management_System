"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { useState } from "react"

interface VisitorData {
  id: number
  srNo: number
  name: string
  designation: string
  organization: string
  visitDate: string
  purpose: string
  duration: string
}

interface VisitingFacultyData {
  id: number
  srNo: number
  name: string
  qualification: string
  specialization: string
  homeInstitution: string
  visitPeriod: string
  subjectsTaught: string
}

export default function FacultyVisitorsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("distinguished")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Distinguished Visitors Data
  const [distinguishedVisitors, setDistinguishedVisitors] = useState<VisitorData[]>([
    {
      id: 1,
      srNo: 1,
      name: "Dr. Rajesh Kumar",
      designation: "Director",
      organization: "IIT Bombay",
      visitDate: "2024-03-15",
      purpose: "Guest Lecture on AI in Engineering",
      duration: "1 Day",
    },
    {
      id: 2,
      srNo: 2,
      name: "Prof. Priya Sharma",
      designation: "Head of Department",
      organization: "NIT Surat",
      visitDate: "2024-02-28",
      purpose: "Research Collaboration Discussion",
      duration: "2 Days",
    },
  ])

  // Visiting Faculty Data
  const [visitingFaculty, setVisitingFaculty] = useState<VisitingFacultyData[]>([
    {
      id: 1,
      srNo: 1,
      name: "Dr. Amit Patel",
      qualification: "Ph.D. in Computer Science",
      specialization: "Machine Learning",
      homeInstitution: "IIT Delhi",
      visitPeriod: "Jan 2024 - Jun 2024",
      subjectsTaught: "Advanced Machine Learning, Data Mining",
    },
  ])

  const [visitorFormData, setVisitorFormData] = useState<Partial<VisitorData>>({})
  const [facultyFormData, setFacultyFormData] = useState<Partial<VisitingFacultyData>>({})

  const handleAdd = () => {
    setEditingItem(null)
    if (activeTab === "distinguished") {
      setVisitorFormData({
        name: "",
        designation: "",
        organization: "",
        visitDate: "",
        purpose: "",
        duration: "",
      })
    } else {
      setFacultyFormData({
        name: "",
        qualification: "",
        specialization: "",
        homeInstitution: "",
        visitPeriod: "",
        subjectsTaught: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    if (activeTab === "distinguished") {
      setVisitorFormData(item)
    } else {
      setFacultyFormData(item)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (activeTab === "distinguished") {
      setDistinguishedVisitors((prev) => prev.filter((item) => item.id !== id))
    } else {
      setVisitingFaculty((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleSave = () => {
    if (activeTab === "distinguished") {
      if (editingItem) {
        setDistinguishedVisitors((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? ({ ...visitorFormData, id: editingItem.id, srNo: editingItem.srNo } as VisitorData)
              : item,
          ),
        )
      } else {
        const newItem: VisitorData = {
          ...(visitorFormData as VisitorData),
          id: Math.max(...distinguishedVisitors.map((item) => item.id), 0) + 1,
          srNo: distinguishedVisitors.length + 1,
        }
        setDistinguishedVisitors((prev) => [...prev, newItem])
      }
    } else {
      if (editingItem) {
        setVisitingFaculty((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? ({ ...facultyFormData, id: editingItem.id, srNo: editingItem.srNo } as VisitingFacultyData)
              : item,
          ),
        )
      } else {
        const newItem: VisitingFacultyData = {
          ...(facultyFormData as VisitingFacultyData),
          id: Math.max(...visitingFaculty.map((item) => item.id), 0) + 1,
          srNo: visitingFaculty.length + 1,
        }
        setVisitingFaculty((prev) => [...prev, newItem])
      }
    }
    setIsDialogOpen(false)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Visitors</h1>
            <p className="text-gray-600 mt-2">Manage visitor information for {user?.faculty}</p>
          </div>
        </div>

        {/* Visitors Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distinguished">Distinguished Visitors at Department</TabsTrigger>
            <TabsTrigger value="visiting">Visiting Faculty (Other than MSU Faculty members)</TabsTrigger>
          </TabsList>

          {/* Distinguished Visitors Tab */}
          <TabsContent value="distinguished" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Distinguished Visitors at Department</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Visitor
                  </Button>
                </div>
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
                    {distinguishedVisitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell>{visitor.srNo}</TableCell>
                        <TableCell className="font-medium">{visitor.name}</TableCell>
                        <TableCell>{visitor.designation}</TableCell>
                        <TableCell>{visitor.organization}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(visitor.visitDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{visitor.purpose}</TableCell>
                        <TableCell>{visitor.duration}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(visitor)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(visitor.id)}>
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

          {/* Visiting Faculty Tab */}
          <TabsContent value="visiting" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Visiting Faculty (Other than MSU Faculty members)</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Qualification</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Home Institution</TableHead>
                      <TableHead>Visit Period</TableHead>
                      <TableHead>Subjects Taught</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitingFaculty.map((faculty) => (
                      <TableRow key={faculty.id}>
                        <TableCell>{faculty.srNo}</TableCell>
                        <TableCell className="font-medium">{faculty.name}</TableCell>
                        <TableCell>{faculty.qualification}</TableCell>
                        <TableCell>{faculty.specialization}</TableCell>
                        <TableCell>{faculty.homeInstitution}</TableCell>
                        <TableCell>{faculty.visitPeriod}</TableCell>
                        <TableCell className="max-w-xs truncate">{faculty.subjectsTaught}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(faculty)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(faculty.id)}>
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
                {editingItem ? "Edit" : "Add New"}{" "}
                {activeTab === "distinguished" ? "Distinguished Visitor" : "Visiting Faculty"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {activeTab === "distinguished" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={visitorFormData.name || ""}
                        onChange={(e) => setVisitorFormData({ ...visitorFormData, name: e.target.value })}
                        placeholder="Enter visitor name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={visitorFormData.designation || ""}
                        onChange={(e) => setVisitorFormData({ ...visitorFormData, designation: e.target.value })}
                        placeholder="Enter designation"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={visitorFormData.organization || ""}
                      onChange={(e) => setVisitorFormData({ ...visitorFormData, organization: e.target.value })}
                      placeholder="Enter organization"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visitDate">Visit Date</Label>
                      <Input
                        id="visitDate"
                        type="date"
                        value={visitorFormData.visitDate || ""}
                        onChange={(e) => setVisitorFormData({ ...visitorFormData, visitDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={visitorFormData.duration || ""}
                        onChange={(e) => setVisitorFormData({ ...visitorFormData, duration: e.target.value })}
                        placeholder="e.g., 1 Day, 2 Days"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      value={visitorFormData.purpose || ""}
                      onChange={(e) => setVisitorFormData({ ...visitorFormData, purpose: e.target.value })}
                      placeholder="Enter purpose of visit"
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={facultyFormData.name || ""}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                        placeholder="Enter faculty name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        value={facultyFormData.qualification || ""}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, qualification: e.target.value })}
                        placeholder="Enter qualification"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={facultyFormData.specialization || ""}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, specialization: e.target.value })}
                        placeholder="Enter specialization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="homeInstitution">Home Institution</Label>
                      <Input
                        id="homeInstitution"
                        value={facultyFormData.homeInstitution || ""}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, homeInstitution: e.target.value })}
                        placeholder="Enter home institution"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visitPeriod">Visit Period</Label>
                    <Input
                      id="visitPeriod"
                      value={facultyFormData.visitPeriod || ""}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, visitPeriod: e.target.value })}
                      placeholder="e.g., Jan 2024 - Jun 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectsTaught">Subjects Taught</Label>
                    <Textarea
                      id="subjectsTaught"
                      value={facultyFormData.subjectsTaught || ""}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, subjectsTaught: e.target.value })}
                      placeholder="Enter subjects taught"
                      rows={3}
                    />
                  </div>
                </>
              )}
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
