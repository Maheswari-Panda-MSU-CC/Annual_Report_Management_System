"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Users, Award, Building } from "lucide-react"

interface AlumniRecord {
  id: string
  name: string
  graduationYear: string
  degree: string
  department: string
  currentPosition: string
  company: string
  location: string
  email: string
  phone: string
  achievements: string
  contribution: string
  status: "Active" | "Inactive"
}

export default function FacultyAlumniPage() {
  const [alumni, setAlumni] = useState<AlumniRecord[]>([
    {
      id: "1",
      name: "Dr. Rajesh Kumar",
      graduationYear: "2015",
      degree: "Ph.D. Computer Science",
      department: "Computer Science",
      currentPosition: "Senior Software Engineer",
      company: "Google Inc.",
      location: "Bangalore, India",
      email: "rajesh.kumar@gmail.com",
      phone: "+91-9876543210",
      achievements: "Published 15 research papers, Patent holder",
      contribution: "Guest lectures, Industry mentorship",
      status: "Active",
    },
    {
      id: "2",
      name: "Ms. Priya Sharma",
      graduationYear: "2018",
      degree: "M.Tech Electronics",
      department: "Electronics",
      currentPosition: "Research Scientist",
      company: "ISRO",
      location: "Hyderabad, India",
      email: "priya.sharma@isro.gov.in",
      phone: "+91-9876543211",
      achievements: "Chandrayaan-3 mission contributor",
      contribution: "Research collaboration, Student guidance",
      status: "Active",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("All years")
  const [selectedDepartment, setSelectedDepartment] = useState("All departments")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAlumni, setEditingAlumni] = useState<AlumniRecord | null>(null)
  const [formData, setFormData] = useState<Partial<AlumniRecord>>({})

  const handleAddAlumni = () => {
    setEditingAlumni(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEditAlumni = (alumniRecord: AlumniRecord) => {
    setEditingAlumni(alumniRecord)
    setFormData(alumniRecord)
    setIsDialogOpen(true)
  }

  const handleSaveAlumni = () => {
    if (editingAlumni) {
      setAlumni(alumni.map((a) => (a.id === editingAlumni.id ? { ...(formData as AlumniRecord) } : a)))
    } else {
      const newAlumni: AlumniRecord = {
        ...(formData as AlumniRecord),
        id: Date.now().toString(),
      }
      setAlumni([...alumni, newAlumni])
    }
    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDeleteAlumni = (id: string) => {
    if (confirm("Are you sure you want to delete this alumni record?")) {
      setAlumni(alumni.filter((a) => a.id !== id))
    }
  }

  const filteredAlumni = alumni.filter((alumniRecord) => {
    const matchesSearch =
      alumniRecord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumniRecord.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === "All years" || alumniRecord.graduationYear === selectedYear
    const matchesDepartment = selectedDepartment === "All departments" || alumniRecord.department === selectedDepartment
    return matchesSearch && matchesYear && matchesDepartment
  })

  const departments = [...new Set(alumni.map((a) => a.department))]
  const graduationYears = [...new Set(alumni.map((a) => a.graduationYear))].sort()

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Alumni Management</h1>
          <Button onClick={handleAddAlumni}>
            <Plus className="h-4 w-4 mr-2" />
            Add Alumni
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                  <p className="text-2xl font-bold text-gray-900">{alumni.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Alumni</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {alumni.filter((a) => a.status === "Active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Graduates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {alumni.filter((a) => Number.parseInt(a.graduationYear) >= 2020).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Alumni</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="year">Graduation Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All years">All years</SelectItem>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All departments">All departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alumni Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Graduation Year</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Current Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.map((alumniRecord) => (
                  <TableRow key={alumniRecord.id}>
                    <TableCell className="font-medium">{alumniRecord.name}</TableCell>
                    <TableCell>{alumniRecord.graduationYear}</TableCell>
                    <TableCell>{alumniRecord.degree}</TableCell>
                    <TableCell>{alumniRecord.currentPosition}</TableCell>
                    <TableCell>{alumniRecord.company}</TableCell>
                    <TableCell>
                      <Badge variant={alumniRecord.status === "Active" ? "default" : "secondary"}>
                        {alumniRecord.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditAlumni(alumniRecord)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAlumni(alumniRecord.id)}>
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

        {/* Add/Edit Alumni Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAlumni ? "Edit Alumni Record" : "Add New Alumni"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  value={formData.graduationYear || ""}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={formData.degree || ""}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input
                  id="currentPosition"
                  value={formData.currentPosition || ""}
                  onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Active"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "Active" | "Inactive" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements || ""}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contribution">Contribution to Institution</Label>
                <Textarea
                  id="contribution"
                  value={formData.contribution || ""}
                  onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAlumni}>{editingAlumni ? "Update" : "Add"} Alumni</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
