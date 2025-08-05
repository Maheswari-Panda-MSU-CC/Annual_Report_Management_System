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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Edit, Trash2, Search, Building, Users, FileText, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Collaboration {
  id: string
  title: string
  partnerInstitution: string
  partnerCountry: string
  collaborationType: "Research" | "Academic Exchange" | "Joint Program" | "MOU" | "Industry Partnership"
  startDate: Date
  endDate: Date
  status: "Active" | "Completed" | "Pending" | "Cancelled"
  description: string
  keyPersonnel: string
  outcomes: string
  fundingAmount: string
  documents: string[]
}

export default function FacultyCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([
    {
      id: "1",
      title: "AI Research Collaboration",
      partnerInstitution: "MIT, USA",
      partnerCountry: "United States",
      collaborationType: "Research",
      startDate: new Date("2023-01-15"),
      endDate: new Date("2025-01-15"),
      status: "Active",
      description: "Joint research on artificial intelligence and machine learning applications",
      keyPersonnel: "Dr. John Smith, Prof. Sarah Johnson",
      outcomes: "5 joint publications, 2 patents filed",
      fundingAmount: "₹50,00,000",
      documents: ["MOU_MIT_2023.pdf", "Research_Proposal.pdf"],
    },
    {
      id: "2",
      title: "Student Exchange Program",
      partnerInstitution: "University of Oxford, UK",
      partnerCountry: "United Kingdom",
      collaborationType: "Academic Exchange",
      startDate: new Date("2022-09-01"),
      endDate: new Date("2024-08-31"),
      status: "Active",
      description: "Bilateral student exchange program for undergraduate and postgraduate students",
      keyPersonnel: "Prof. Emily Brown, Dr. Michael Davis",
      outcomes: "25 students exchanged, 3 joint courses developed",
      fundingAmount: "₹25,00,000",
      documents: ["Exchange_Agreement.pdf", "Student_Guidelines.pdf"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Research")
  const [selectedStatus, setSelectedStatus] = useState("Active")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCollaboration, setEditingCollaboration] = useState<Collaboration | null>(null)
  const [formData, setFormData] = useState<Partial<Collaboration>>({})

  const handleAddCollaboration = () => {
    setEditingCollaboration(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEditCollaboration = (collaboration: Collaboration) => {
    setEditingCollaboration(collaboration)
    setFormData(collaboration)
    setIsDialogOpen(true)
  }

  const handleSaveCollaboration = () => {
    if (editingCollaboration) {
      setCollaborations(
        collaborations.map((c) => (c.id === editingCollaboration.id ? { ...(formData as Collaboration) } : c)),
      )
    } else {
      const newCollaboration: Collaboration = {
        ...(formData as Collaboration),
        id: Date.now().toString(),
      }
      setCollaborations([...collaborations, newCollaboration])
    }
    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDeleteCollaboration = (id: string) => {
    if (confirm("Are you sure you want to delete this collaboration?")) {
      setCollaborations(collaborations.filter((c) => c.id !== id))
    }
  }

  const filteredCollaborations = collaborations.filter((collaboration) => {
    const matchesSearch =
      collaboration.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaboration.partnerInstitution.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || collaboration.collaborationType === selectedType
    const matchesStatus = !selectedStatus || collaboration.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const collaborationTypes = ["Research", "Academic Exchange", "Joint Program", "MOU", "Industry Partnership"]
  const statusOptions = ["Active", "Completed", "Pending", "Cancelled"]

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Collaborations & MOUs</h1>
          <Button onClick={handleAddCollaboration}>
            <Plus className="h-4 w-4 mr-2" />
            Add Collaboration
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Collaborations</p>
                  <p className="text-2xl font-bold text-gray-900">{collaborations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collaborations.filter((c) => c.status === "Active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Research</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collaborations.filter((c) => c.collaborationType === "Research").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">International</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collaborations.filter((c) => c.partnerCountry !== "India").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter Collaborations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Collaborations</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by title or partner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Collaboration Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Research">All types</SelectItem>
                    {collaborationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">All statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collaborations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Collaboration Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Partner Institution</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollaborations.map((collaboration) => (
                  <TableRow key={collaboration.id}>
                    <TableCell className="font-medium">{collaboration.title}</TableCell>
                    <TableCell>{collaboration.partnerInstitution}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{collaboration.collaborationType}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(collaboration.startDate, "MMM yyyy")} - {format(collaboration.endDate, "MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          collaboration.status === "Active"
                            ? "default"
                            : collaboration.status === "Completed"
                              ? "secondary"
                              : collaboration.status === "Pending"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {collaboration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCollaboration(collaboration)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCollaboration(collaboration.id)}>
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

        {/* Add/Edit Collaboration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCollaboration ? "Edit Collaboration" : "Add New Collaboration"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Collaboration Title</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="partnerInstitution">Partner Institution</Label>
                <Input
                  id="partnerInstitution"
                  value={formData.partnerInstitution || ""}
                  onChange={(e) => setFormData({ ...formData, partnerInstitution: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="partnerCountry">Partner Country</Label>
                <Input
                  id="partnerCountry"
                  value={formData.partnerCountry || ""}
                  onChange={(e) => setFormData({ ...formData, partnerCountry: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="collaborationType">Collaboration Type</Label>
                <Select
                  value={formData.collaborationType || "Research"}
                  onValueChange={(value) => setFormData({ ...formData, collaborationType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Active"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="fundingAmount">Funding Amount</Label>
                <Input
                  id="fundingAmount"
                  value={formData.fundingAmount || ""}
                  onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                  placeholder="₹0"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="keyPersonnel">Key Personnel</Label>
                <Textarea
                  id="keyPersonnel"
                  value={formData.keyPersonnel || ""}
                  onChange={(e) => setFormData({ ...formData, keyPersonnel: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="outcomes">Outcomes & Achievements</Label>
                <Textarea
                  id="outcomes"
                  value={formData.outcomes || ""}
                  onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCollaboration}>{editingCollaboration ? "Update" : "Add"} Collaboration</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
