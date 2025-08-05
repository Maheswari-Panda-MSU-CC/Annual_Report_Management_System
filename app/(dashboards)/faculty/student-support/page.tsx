"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, DollarSign, Building, User } from "lucide-react"
import { useState } from "react"

interface PlacementData {
  id: number
  srNo: number
  studentName: string
  course: string
  companyName: string
  package: string
  jobRole: string
  placementDate: string
}

interface ScholarshipData {
  id: number
  srNo: number
  studentName: string
  scholarshipName: string
  amount: string
  duration: string
  provider: string
  awardDate: string
}

export default function FacultyStudentSupportPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("placements")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Placements Data
  const [placements, setPlacements] = useState<PlacementData[]>([
    {
      id: 1,
      srNo: 1,
      studentName: "Rahul Sharma",
      course: "B.Tech Computer Science",
      companyName: "TCS",
      package: "Rs. 6,50,000",
      jobRole: "Software Developer",
      placementDate: "2024-03-15",
    },
    {
      id: 2,
      srNo: 2,
      studentName: "Priya Patel",
      course: "B.Tech Information Technology",
      companyName: "Infosys",
      package: "Rs. 7,00,000",
      jobRole: "System Engineer",
      placementDate: "2024-03-10",
    },
    {
      id: 3,
      srNo: 3,
      studentName: "Amit Kumar",
      course: "M.Tech Software Engineering",
      companyName: "Microsoft",
      package: "Rs. 25,00,000",
      jobRole: "Software Engineer",
      placementDate: "2024-02-28",
    },
  ])

  // Scholarships Data
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([
    {
      id: 1,
      srNo: 1,
      studentName: "Kavita Singh",
      scholarshipName: "Merit Scholarship",
      amount: "Rs. 50,000",
      duration: "1 Year",
      provider: "MSU Baroda",
      awardDate: "2024-01-15",
    },
    {
      id: 2,
      srNo: 2,
      studentName: "Ravi Joshi",
      scholarshipName: "Need-based Scholarship",
      amount: "Rs. 30,000",
      duration: "1 Year",
      provider: "Government of Gujarat",
      awardDate: "2024-02-01",
    },
    {
      id: 3,
      srNo: 3,
      studentName: "Neha Gupta",
      scholarshipName: "Research Fellowship",
      amount: "Rs. 1,20,000",
      duration: "2 Years",
      provider: "UGC",
      awardDate: "2024-01-20",
    },
  ])

  const [placementFormData, setPlacementFormData] = useState<Partial<PlacementData>>({})
  const [scholarshipFormData, setScholarshipFormData] = useState<Partial<ScholarshipData>>({})

  const handleAdd = () => {
    setEditingItem(null)
    if (activeTab === "placements") {
      setPlacementFormData({
        studentName: "",
        course: "",
        companyName: "",
        package: "",
        jobRole: "",
        placementDate: "",
      })
    } else {
      setScholarshipFormData({
        studentName: "",
        scholarshipName: "",
        amount: "",
        duration: "",
        provider: "",
        awardDate: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    if (activeTab === "placements") {
      setPlacementFormData(item)
    } else {
      setScholarshipFormData(item)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (activeTab === "placements") {
      setPlacements((prev) => prev.filter((item) => item.id !== id))
    } else {
      setScholarships((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleSave = () => {
    if (activeTab === "placements") {
      if (editingItem) {
        setPlacements((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? ({ ...placementFormData, id: editingItem.id, srNo: editingItem.srNo } as PlacementData)
              : item,
          ),
        )
      } else {
        const newItem: PlacementData = {
          ...(placementFormData as PlacementData),
          id: Math.max(...placements.map((item) => item.id), 0) + 1,
          srNo: placements.length + 1,
        }
        setPlacements((prev) => [...prev, newItem])
      }
    } else {
      if (editingItem) {
        setScholarships((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? ({ ...scholarshipFormData, id: editingItem.id, srNo: editingItem.srNo } as ScholarshipData)
              : item,
          ),
        )
      } else {
        const newItem: ScholarshipData = {
          ...(scholarshipFormData as ScholarshipData),
          id: Math.max(...scholarships.map((item) => item.id), 0) + 1,
          srNo: scholarships.length + 1,
        }
        setScholarships((prev) => [...prev, newItem])
      }
    }
    setIsDialogOpen(false)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Support</h1>
            <p className="text-gray-600 mt-2">Manage student placements and scholarships for {user?.faculty}</p>
          </div>
        </div>

        {/* Support Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships Awarded Details</TabsTrigger>
          </TabsList>

          {/* Placements Tab */}
          <TabsContent value="placements" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Placements</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Placement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Job Role</TableHead>
                      <TableHead>Placement Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placements.map((placement) => (
                      <TableRow key={placement.id}>
                        <TableCell>{placement.srNo}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {placement.studentName}
                          </div>
                        </TableCell>
                        <TableCell>{placement.course}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            {placement.companyName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            {placement.package}
                          </div>
                        </TableCell>
                        <TableCell>{placement.jobRole}</TableCell>
                        <TableCell>{new Date(placement.placementDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(placement)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(placement.id)}>
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

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Scholarships Awarded Details</CardTitle>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scholarship
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Scholarship Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Award Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scholarships.map((scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell>{scholarship.srNo}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {scholarship.studentName}
                          </div>
                        </TableCell>
                        <TableCell>{scholarship.scholarshipName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            {scholarship.amount}
                          </div>
                        </TableCell>
                        <TableCell>{scholarship.duration}</TableCell>
                        <TableCell>{scholarship.provider}</TableCell>
                        <TableCell>{new Date(scholarship.awardDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(scholarship)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(scholarship.id)}>
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
                {editingItem ? "Edit" : "Add New"} {activeTab === "placements" ? "Placement" : "Scholarship"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {activeTab === "placements" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={placementFormData.studentName || ""}
                        onChange={(e) => setPlacementFormData({ ...placementFormData, studentName: e.target.value })}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Input
                        id="course"
                        value={placementFormData.course || ""}
                        onChange={(e) => setPlacementFormData({ ...placementFormData, course: e.target.value })}
                        placeholder="Enter course"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={placementFormData.companyName || ""}
                        onChange={(e) => setPlacementFormData({ ...placementFormData, companyName: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="package">Package</Label>
                      <Input
                        id="package"
                        value={placementFormData.package || ""}
                        onChange={(e) => setPlacementFormData({ ...placementFormData, package: e.target.value })}
                        placeholder="Enter package amount"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobRole">Job Role</Label>
                      <Input
                        id="jobRole"
                        value={placementFormData.jobRole || ""}
                        onChange={(e) => setPlacementFormData({ ...placementFormData, jobRole: e.target.value })}
                        placeholder="Enter job role"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placementDate">Placement Date</Label>
                      <Input
                        id="placementDate"
                        type="date"
                        value={placementFormData.placementDate || ""}
                        onChange={(e) => setPlacementFormData({ ...placementFormData, placementDate: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={scholarshipFormData.studentName || ""}
                        onChange={(e) =>
                          setScholarshipFormData({ ...scholarshipFormData, studentName: e.target.value })
                        }
                        placeholder="Enter student name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scholarshipName">Scholarship Name</Label>
                      <Input
                        id="scholarshipName"
                        value={scholarshipFormData.scholarshipName || ""}
                        onChange={(e) =>
                          setScholarshipFormData({ ...scholarshipFormData, scholarshipName: e.target.value })
                        }
                        placeholder="Enter scholarship name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        value={scholarshipFormData.amount || ""}
                        onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, amount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={scholarshipFormData.duration || ""}
                        onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, duration: e.target.value })}
                        placeholder="Enter duration"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={scholarshipFormData.provider || ""}
                        onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, provider: e.target.value })}
                        placeholder="Enter provider"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awardDate">Award Date</Label>
                      <Input
                        id="awardDate"
                        type="date"
                        value={scholarshipFormData.awardDate || ""}
                        onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, awardDate: e.target.value })}
                      />
                    </div>
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
