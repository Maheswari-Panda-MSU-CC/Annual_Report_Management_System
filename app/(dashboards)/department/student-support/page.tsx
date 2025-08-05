"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"

interface CareerSession {
  id: number
  srNo: number
  speakerName: string
  designation: string
  topic: string
  address: string
  place: string
  sessionStartDate: string
  noOfDays: number
  noOfParticipants: number
}

interface Placement {
  id: number
  srNo: number
  programme: string
  noOfPlacements: number
  minSalary: number
  maxSalary: number
  top5Recruiters: string
  details: string
  year: string
}

interface Scholarship {
  id: number
  srNo: number
  studentName: string
  programme: string
  details: string
  amount: number
  scholarshipDate: string
  supportingDocument: string
}

export default function DepartmentStudentSupport() {
  const [careerSessions, setCareerSessions] = useState<CareerSession[]>([
    {
      id: 1,
      srNo: 1,
      speakerName: "Dr. John Smith",
      designation: "Career Counselor",
      topic: "Career Opportunities in IT",
      address: "123 Main Street, City",
      place: "Auditorium",
      sessionStartDate: "2024-01-15",
      noOfDays: 1,
      noOfParticipants: 100,
    },
  ])

  const [placements, setPlacements] = useState<Placement[]>([
    {
      id: 1,
      srNo: 1,
      programme: "Computer Science",
      noOfPlacements: 45,
      minSalary: 300000,
      maxSalary: 1200000,
      top5Recruiters: "TCS, Infosys, Wipro, Accenture, IBM",
      details: "Excellent placement record with top companies",
      year: "2024",
    },
  ])

  const [scholarships, setScholarships] = useState<Scholarship[]>([
    {
      id: 1,
      srNo: 1,
      studentName: "Alice Johnson",
      programme: "M.Sc. Computer Science",
      details: "Merit-based scholarship for academic excellence",
      amount: 50000,
      scholarshipDate: "2024-01-10",
      supportingDocument: "scholarship_certificate.pdf",
    },
  ])

  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false)
  const [isPlacementDialogOpen, setIsPlacementDialogOpen] = useState(false)
  const [isScholarshipDialogOpen, setIsScholarshipDialogOpen] = useState(false)

  const handleAddCareerSession = (formData: FormData) => {
    const newSession: CareerSession = {
      id: Date.now(),
      srNo: careerSessions.length + 1,
      speakerName: formData.get("speakerName") as string,
      designation: formData.get("designation") as string,
      topic: formData.get("topic") as string,
      address: formData.get("address") as string,
      place: formData.get("place") as string,
      sessionStartDate: formData.get("sessionStartDate") as string,
      noOfDays: Number.parseInt(formData.get("noOfDays") as string),
      noOfParticipants: Number.parseInt(formData.get("noOfParticipants") as string),
    }
    setCareerSessions([...careerSessions, newSession])
    setIsCareerDialogOpen(false)
  }

  const handleAddPlacement = (formData: FormData) => {
    const newPlacement: Placement = {
      id: Date.now(),
      srNo: placements.length + 1,
      programme: formData.get("programme") as string,
      noOfPlacements: Number.parseInt(formData.get("noOfPlacements") as string),
      minSalary: Number.parseInt(formData.get("minSalary") as string),
      maxSalary: Number.parseInt(formData.get("maxSalary") as string),
      top5Recruiters: formData.get("top5Recruiters") as string,
      details: formData.get("details") as string,
      year: formData.get("year") as string,
    }
    setPlacements([...placements, newPlacement])
    setIsPlacementDialogOpen(false)
  }

  const handleAddScholarship = (formData: FormData) => {
    const newScholarship: Scholarship = {
      id: Date.now(),
      srNo: scholarships.length + 1,
      studentName: formData.get("studentName") as string,
      programme: formData.get("programme") as string,
      details: formData.get("details") as string,
      amount: Number.parseInt(formData.get("amount") as string),
      scholarshipDate: formData.get("scholarshipDate") as string,
      supportingDocument: (formData.get("supportingDocument") as File)?.name || "",
    }
    setScholarships([...scholarships, newScholarship])
    setIsScholarshipDialogOpen(false)
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Support</h1>

        <Tabs defaultValue="career" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="career">Career Sessions</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          </TabsList>

          <TabsContent value="career">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Career and Counselling Sessions</CardTitle>
                <Dialog open={isCareerDialogOpen} onOpenChange={setIsCareerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Career Session</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddCareerSession} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="speakerName">Speaker Name</Label>
                          <Input id="speakerName" name="speakerName" required />
                        </div>
                        <div>
                          <Label htmlFor="designation">Designation</Label>
                          <Input id="designation" name="designation" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="topic">Topic</Label>
                          <Input id="topic" name="topic" required />
                        </div>
                        <div>
                          <Label htmlFor="place">Place</Label>
                          <Input id="place" name="place" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" name="address" required />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="sessionStartDate">Session Start Date</Label>
                          <Input id="sessionStartDate" name="sessionStartDate" type="date" required />
                        </div>
                        <div>
                          <Label htmlFor="noOfDays">No. of Days</Label>
                          <Input id="noOfDays" name="noOfDays" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="noOfParticipants">No. of Participants</Label>
                          <Input id="noOfParticipants" name="noOfParticipants" type="number" required />
                        </div>
                      </div>
                      <Button type="submit">Add Session</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Speaker Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Session Start Date</TableHead>
                      <TableHead>No. of Days</TableHead>
                      <TableHead>No. of Participants</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {careerSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.srNo}</TableCell>
                        <TableCell>{session.speakerName}</TableCell>
                        <TableCell>{session.designation}</TableCell>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>{session.address}</TableCell>
                        <TableCell>{session.place}</TableCell>
                        <TableCell>{session.sessionStartDate}</TableCell>
                        <TableCell>{session.noOfDays}</TableCell>
                        <TableCell>{session.noOfParticipants}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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

          <TabsContent value="placements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Placements</CardTitle>
                <Dialog open={isPlacementDialogOpen} onOpenChange={setIsPlacementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Placement Record</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddPlacement} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="programme">Programme</Label>
                          <Input id="programme" name="programme" required />
                        </div>
                        <div>
                          <Label htmlFor="year">Year</Label>
                          <Input id="year" name="year" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="noOfPlacements">No. of Placements</Label>
                          <Input id="noOfPlacements" name="noOfPlacements" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="minSalary">Min Salary (Rs.)</Label>
                          <Input id="minSalary" name="minSalary" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="maxSalary">Max Salary (Rs.)</Label>
                          <Input id="maxSalary" name="maxSalary" type="number" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="top5Recruiters">Top 5 Recruiters</Label>
                        <Input id="top5Recruiters" name="top5Recruiters" required />
                      </div>
                      <div>
                        <Label htmlFor="details">Details</Label>
                        <Textarea id="details" name="details" required />
                      </div>
                      <Button type="submit">Add Placement</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>No. of Placements</TableHead>
                      <TableHead>Min Salary (Rs.)</TableHead>
                      <TableHead>Max Salary (Rs.)</TableHead>
                      <TableHead>Top 5 Recruiters</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placements.map((placement) => (
                      <TableRow key={placement.id}>
                        <TableCell>{placement.srNo}</TableCell>
                        <TableCell>{placement.programme}</TableCell>
                        <TableCell>{placement.noOfPlacements}</TableCell>
                        <TableCell>{placement.minSalary.toLocaleString()}</TableCell>
                        <TableCell>{placement.maxSalary.toLocaleString()}</TableCell>
                        <TableCell>{placement.top5Recruiters}</TableCell>
                        <TableCell>{placement.details}</TableCell>
                        <TableCell>{placement.year}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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

          <TabsContent value="scholarships">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Scholarships/Freeship Awarded</CardTitle>
                <Dialog open={isScholarshipDialogOpen} onOpenChange={setIsScholarshipDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Scholarship Record</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddScholarship} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentName">Student Name</Label>
                          <Input id="studentName" name="studentName" required />
                        </div>
                        <div>
                          <Label htmlFor="programme">Programme</Label>
                          <Input id="programme" name="programme" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="details">Details</Label>
                        <Textarea id="details" name="details" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">Amount (Rs.)</Label>
                          <Input id="amount" name="amount" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="scholarshipDate">Scholarship Date</Label>
                          <Input id="scholarshipDate" name="scholarshipDate" type="date" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="supportingDocument">Supporting Document (PDF/Image only)</Label>
                        <Input id="supportingDocument" name="supportingDocument" type="file" accept=".pdf,image/*" />
                      </div>
                      <Button type="submit">Add Scholarship</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Amount (Rs.)</TableHead>
                      <TableHead>Scholarship Date</TableHead>
                      <TableHead>Supporting Document</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scholarships.map((scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell>{scholarship.srNo}</TableCell>
                        <TableCell>{scholarship.studentName}</TableCell>
                        <TableCell>{scholarship.programme}</TableCell>
                        <TableCell>{scholarship.details}</TableCell>
                        <TableCell>{scholarship.amount.toLocaleString()}</TableCell>
                        <TableCell>{scholarship.scholarshipDate}</TableCell>
                        <TableCell>{scholarship.supportingDocument}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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
      </div>
  )
}
