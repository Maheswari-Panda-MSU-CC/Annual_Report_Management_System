"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Building, Computer, BookOpen, Wifi, DollarSign } from "lucide-react"
import { useState } from "react"

interface InfrastructureData {
  id: number
  srNo: number
  description: string
  details: string
  year: string
  amount?: string
}

export default function FacultyInfrastructurePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("facilities")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InfrastructureData | null>(null)

  // Infrastructure Facilities Data
  const [facilities, setFacilities] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "New Computer Laboratory Setup",
      details: "Established state-of-the-art computer lab with 60 high-end workstations",
      year: "2024",
      amount: "Rs. 45,00,000",
    },
    {
      id: 2,
      srNo: 2,
      description: "Auditorium Renovation",
      details: "Complete renovation of main auditorium with modern AV equipment",
      year: "2023",
      amount: "Rs. 25,00,000",
    },
  ])

  // Digitization Data
  const [digitization, setDigitization] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "Library Management System",
      details: "Implementation of digital library management system with RFID technology",
      year: "2024",
    },
    {
      id: 2,
      srNo: 2,
      description: "Administrative Process Automation",
      details: "Digitization of student admission and examination processes",
      year: "2023",
    },
  ])

  // Library Services Data
  const [libraryServices, setLibraryServices] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "Digital Repository",
      details: "Access to international journals and research databases",
      year: "2024",
    },
    {
      id: 2,
      srNo: 2,
      description: "E-Book Collection",
      details: "Subscription to comprehensive e-book platforms",
      year: "2023",
    },
  ])

  // ICT Facilities Data
  const [ictFacilities, setIctFacilities] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "Campus-wide WiFi Upgrade",
      details: "High-speed internet connectivity across all buildings",
      year: "2024",
    },
    {
      id: 2,
      srNo: 2,
      description: "Smart Classroom Setup",
      details: "Interactive whiteboards and projection systems in all classrooms",
      year: "2023",
    },
  ])

  // Technology Upgradation Data
  const [techUpgradation, setTechUpgradation] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "Server Infrastructure Upgrade",
      details: "High-performance servers for research and academic computing",
      year: "2024",
    },
    {
      id: 2,
      srNo: 2,
      description: "Software License Renewal",
      details: "Updated licenses for engineering and design software",
      year: "2023",
    },
  ])

  // Training Programs Data
  const [trainingPrograms, setTrainingPrograms] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "Faculty IT Training Program",
      details: "Training on latest educational technologies and digital tools",
      year: "2024",
    },
    {
      id: 2,
      srNo: 2,
      description: "Student Digital Literacy Program",
      details: "Basic to advanced computer skills training for students",
      year: "2023",
    },
  ])

  // Maintenance Data
  const [maintenance, setMaintenance] = useState<InfrastructureData[]>([
    {
      id: 1,
      srNo: 1,
      description: "Annual Maintenance Contract",
      details: "Comprehensive maintenance of all IT equipment and infrastructure",
      year: "2024",
      amount: "Rs. 12.5",
    },
    {
      id: 2,
      srNo: 2,
      description: "Building Maintenance",
      details: "Regular maintenance of faculty buildings and facilities",
      year: "2023",
      amount: "Rs. 8.3",
    },
  ])

  const [formData, setFormData] = useState<Partial<InfrastructureData>>({
    description: "",
    details: "",
    year: "",
    amount: "",
  })

  const getCurrentData = () => {
    switch (activeTab) {
      case "facilities":
        return facilities
      case "digitization":
        return digitization
      case "library":
        return libraryServices
      case "ict":
        return ictFacilities
      case "tech":
        return techUpgradation
      case "training":
        return trainingPrograms
      case "maintenance":
        return maintenance
      default:
        return []
    }
  }

  const setCurrentData = (data: InfrastructureData[]) => {
    switch (activeTab) {
      case "facilities":
        setFacilities(data)
        break
      case "digitization":
        setDigitization(data)
        break
      case "library":
        setLibraryServices(data)
        break
      case "ict":
        setIctFacilities(data)
        break
      case "tech":
        setTechUpgradation(data)
        break
      case "training":
        setTrainingPrograms(data)
        break
      case "maintenance":
        setMaintenance(data)
        break
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "facilities":
        return "Details of increase in Infrastructure Facilities"
      case "digitization":
        return "Digitization of Administration and Library"
      case "library":
        return "Library Services"
      case "ict":
        return "Details of ICT Facilities"
      case "tech":
        return "Technology Upgradation Details"
      case "training":
        return "Computer, Internet access, Training to Teachers and Students"
      case "maintenance":
        return "Amount Spent On Maintenance (in lakhs)"
      default:
        return "Infrastructure"
    }
  }

  const getTabIcon = () => {
    switch (activeTab) {
      case "facilities":
        return Building
      case "digitization":
        return Computer
      case "library":
        return BookOpen
      case "ict":
        return Wifi
      case "tech":
        return Computer
      case "training":
        return Computer
      case "maintenance":
        return DollarSign
      default:
        return Building
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      description: "",
      details: "",
      year: "",
      amount: activeTab === "maintenance" ? "" : undefined,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: InfrastructureData) => {
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
      const updatedData = currentData.map((item) =>
        item.id === editingItem.id
          ? ({ ...formData, id: editingItem.id, srNo: editingItem.srNo } as InfrastructureData)
          : item,
      )
      setCurrentData(updatedData)
    } else {
      const newItem: InfrastructureData = {
        ...(formData as InfrastructureData),
        id: Math.max(...currentData.map((item) => item.id), 0) + 1,
        srNo: currentData.length + 1,
      }
      setCurrentData([...currentData, newItem])
    }
    setIsDialogOpen(false)
  }

  const TabIcon = getTabIcon()

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Infrastructure</h1>
            <p className="text-gray-600 mt-2">Manage infrastructure details for {user?.faculty}</p>
          </div>
        </div>

        {/* Infrastructure Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="digitization">Digitization</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="ict">ICT</TabsTrigger>
            <TabsTrigger value="tech">Tech Upgrade</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TabIcon className="h-5 w-5" />
                    {getTabTitle()}
                  </CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Year</TableHead>
                      {(activeTab === "facilities" || activeTab === "maintenance") && <TableHead>Amount</TableHead>}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentData().map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.srNo}</TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.details}</TableCell>
                        <TableCell>{item.year}</TableCell>
                        {(activeTab === "facilities" || activeTab === "maintenance") && (
                          <TableCell>
                            {item.amount && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                {item.amount}
                              </div>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
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
              <DialogTitle>{editingItem ? "Edit" : "Add New"} Infrastructure Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={formData.details || ""}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Enter detailed information"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={formData.year || ""}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="Enter year"
                  />
                </div>
                {(activeTab === "facilities" || activeTab === "maintenance") && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount {activeTab === "maintenance" ? "(in lakhs)" : ""}</Label>
                    <Input
                      id="amount"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder={activeTab === "maintenance" ? "Enter amount in lakhs" : "Enter amount"}
                    />
                  </div>
                )}
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
