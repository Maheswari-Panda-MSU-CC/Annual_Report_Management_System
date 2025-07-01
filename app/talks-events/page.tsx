"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Upload, FileText, Users, Building, Presentation, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function TalksEventsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("refresher")
  const [searchTerm, setSearchTerm] = useState("")

  const [editingItem, setEditingItem] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

  // Mock data for all sections
  const [refresherCourses] = useState([
    {
      id: 1,
      name: "Advanced Research Methodology",
      courseType: "Refresher Course",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-06-15"),
      organizingUniversity: "University of Delhi",
      organizingInstitute: "Academic Staff College",
      organizingDepartment: "Education Department",
      centre: "UGC-HRDC",
      supportingDocument: "certificate.pdf",
    },
    {
      id: 2,
      name: "Digital Pedagogy",
      courseType: "Orientation Course",
      startDate: new Date("2023-08-10"),
      endDate: new Date("2023-08-24"),
      organizingUniversity: "Jawaharlal Nehru University",
      organizingInstitute: "Centre for Professional Development",
      organizingDepartment: "Computer Science",
      centre: "UGC-HRDC",
      supportingDocument: "orientation_cert.pdf",
    },
  ])

  const [academicPrograms] = useState([
    {
      id: 1,
      name: "International Conference on AI",
      programme: "Conference",
      place: "New Delhi",
      date: new Date("2023-09-15"),
      year: "2023",
      participatedAs: "Organizer",
      supportingDocument: "conference_report.pdf",
    },
    {
      id: 2,
      name: "Faculty Development Workshop",
      programme: "Workshop",
      place: "Mumbai",
      date: new Date("2023-07-20"),
      year: "2023",
      participatedAs: "Co-organizer",
      supportingDocument: "workshop_photos.jpg",
    },
  ])

  const [academicBodies] = useState([
    {
      id: 1,
      courseTitle: "PhD Thesis Evaluation",
      academicBody: "Board of Studies",
      place: "Bangalore University",
      participatedAs: "External Examiner",
      year: "2023",
      supportingDocument: "appointment_letter.pdf",
    },
    {
      id: 2,
      courseTitle: "Curriculum Development",
      academicBody: "Academic Council",
      place: "Pune University",
      participatedAs: "Expert Member",
      year: "2023",
      supportingDocument: "invitation.pdf",
    },
  ])

  const [universityCommittees] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      committeeName: "Research Committee",
      level: "University",
      participatedAs: "Chairman",
      year: "2023",
      supportingDocument: "appointment_order.pdf",
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      committeeName: "Academic Planning Committee",
      level: "Faculty",
      participatedAs: "Member",
      year: "2023",
      supportingDocument: "committee_order.pdf",
    },
  ])

  const [academicTalks] = useState([
    {
      id: 1,
      name: "Machine Learning Applications",
      programme: "Guest Lecture",
      place: "IIT Delhi",
      talkDate: new Date("2023-10-05"),
      titleOfEvent: "AI in Healthcare",
      participatedAs: "Keynote Speaker",
      supportingDocument: "invitation_letter.pdf",
    },
    {
      id: 2,
      name: "Data Science Trends",
      programme: "Invited Talk",
      place: "NIT Kurukshetra",
      talkDate: new Date("2023-11-12"),
      titleOfEvent: "Future of Data Analytics",
      participatedAs: "Guest Speaker",
      supportingDocument: "talk_certificate.pdf",
    },
  ])

  const handleAddEvent = () => {
    router.push("/add-event")
  }

  const handleEdit = (id: number, type: string) => {
    let item = null
    switch (type) {
      case "refresher":
        item = refresherCourses.find((c) => c.id === id)
        break
      case "academic-program":
        item = academicPrograms.find((p) => p.id === id)
        break
      case "academic-body":
        item = academicBodies.find((b) => b.id === id)
        break
      case "committee":
        item = universityCommittees.find((c) => c.id === id)
        break
      case "talk":
        item = academicTalks.find((t) => t.id === id)
        break
    }

    if (item) {
      setEditingItem({ ...item, type })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  const handleDelete = (id: number, type: string) => {
    console.log(`Delete ${type} with id:`, id)
    // Implement delete functionality
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Events & Activities Record</h1>
          <Button onClick={handleAddEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event/Talk
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs defaultValue="refresher" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[800px] grid-cols-5 h-auto p-1">
              <TabsTrigger value="refresher" className="text-xs px-2 py-2">
                <FileText className="mr-1 h-3 w-3" />
                Refresher/Orientation
              </TabsTrigger>
              <TabsTrigger value="academic-programs" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                Academic Programs
              </TabsTrigger>
              <TabsTrigger value="academic-bodies" className="text-xs px-2 py-2">
                <Building className="mr-1 h-3 w-3" />
                Academic Bodies
              </TabsTrigger>
              <TabsTrigger value="committees" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                University Committees
              </TabsTrigger>
              <TabsTrigger value="talks" className="text-xs px-2 py-2">
                <Presentation className="mr-1 h-3 w-3" />
                Academic Talks
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Refresher/Orientation Courses Tab */}
          <TabsContent value="refresher" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Refresher/Orientation Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Sr. No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Organizing University</TableHead>
                        <TableHead>Organizing Institute</TableHead>
                        <TableHead>Organizing Department</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead>Supporting Document</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refresherCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-4">
                            No refresher courses found. Add your first course.
                          </TableCell>
                        </TableRow>
                      ) : (
                        refresherCourses.map((course, index) => (
                          <TableRow key={course.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{course.name}</TableCell>
                            <TableCell>{course.courseType}</TableCell>
                            <TableCell>{format(course.startDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{format(course.endDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{course.organizingUniversity}</TableCell>
                            <TableCell>{course.organizingInstitute}</TableCell>
                            <TableCell>{course.organizingDepartment}</TableCell>
                            <TableCell>{course.centre}</TableCell>
                            <TableCell>
                              {course.supportingDocument ? (
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <Upload className="h-4 w-4" />
                                  View
                                </a>
                              ) : (
                                "No file"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(course.id, "refresher")}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(course.id, "refresher")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Programs Tab */}
          <TabsContent value="academic-programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contribution in Organizing Academic Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Sr. No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Programme</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Participated As</TableHead>
                        <TableHead>Supporting Document</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicPrograms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            No academic programs found. Add your first program.
                          </TableCell>
                        </TableRow>
                      ) : (
                        academicPrograms.map((program, index) => (
                          <TableRow key={program.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{program.name}</TableCell>
                            <TableCell>{program.programme}</TableCell>
                            <TableCell>{program.place}</TableCell>
                            <TableCell>{format(program.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{program.year}</TableCell>
                            <TableCell>{program.participatedAs}</TableCell>
                            <TableCell>
                              {program.supportingDocument ? (
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <Upload className="h-4 w-4" />
                                  View
                                </a>
                              ) : (
                                "No file"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(program.id, "academic-program")}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(program.id, "academic-program")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Bodies Tab */}
          <TabsContent value="academic-bodies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Participation in Academic Bodies of Other Universities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Sr. No.</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Academic Body</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Participated As</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Supporting Document</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicBodies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            No academic body participations found. Add your first participation.
                          </TableCell>
                        </TableRow>
                      ) : (
                        academicBodies.map((body, index) => (
                          <TableRow key={body.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{body.courseTitle}</TableCell>
                            <TableCell>{body.academicBody}</TableCell>
                            <TableCell>{body.place}</TableCell>
                            <TableCell>{body.participatedAs}</TableCell>
                            <TableCell>{body.year}</TableCell>
                            <TableCell>
                              {body.supportingDocument ? (
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <Upload className="h-4 w-4" />
                                  View
                                </a>
                              ) : (
                                "No file"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(body.id, "academic-body")}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(body.id, "academic-body")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* University Committees Tab */}
          <TabsContent value="committees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participation in Committees of University
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Sr. No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Committee Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Participated As</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Supporting Document</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {universityCommittees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            No committee participations found. Add your first participation.
                          </TableCell>
                        </TableRow>
                      ) : (
                        universityCommittees.map((committee, index) => (
                          <TableRow key={committee.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{committee.name}</TableCell>
                            <TableCell>{committee.committeeName}</TableCell>
                            <TableCell>{committee.level}</TableCell>
                            <TableCell>{committee.participatedAs}</TableCell>
                            <TableCell>{committee.year}</TableCell>
                            <TableCell>
                              {committee.supportingDocument ? (
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <Upload className="h-4 w-4" />
                                  View
                                </a>
                              ) : (
                                "No file"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(committee.id, "committee")}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(committee.id, "committee")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Talks Tab */}
          <TabsContent value="talks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  Talks of Academic/Research Nature (Other than MSUB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Sr. No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Programme</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Talk Date</TableHead>
                        <TableHead>Title of Event/Talk</TableHead>
                        <TableHead>Participated As</TableHead>
                        <TableHead>Supporting Document</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicTalks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            No academic talks found. Add your first talk.
                          </TableCell>
                        </TableRow>
                      ) : (
                        academicTalks.map((talk, index) => (
                          <TableRow key={talk.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{talk.name}</TableCell>
                            <TableCell>{talk.programme}</TableCell>
                            <TableCell>{talk.place}</TableCell>
                            <TableCell>{format(talk.talkDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{talk.titleOfEvent}</TableCell>
                            <TableCell>{talk.participatedAs}</TableCell>
                            <TableCell>
                              {talk.supportingDocument ? (
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <Upload className="h-4 w-4" />
                                  View
                                </a>
                              ) : (
                                "No file"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(talk.id, "talk")}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(talk.id, "talk")}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.type?.replace("-", " ").toUpperCase()}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(editFormData).map((key) => {
                  if (key === "id" || key === "type") return null
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      {key.includes("Date") ? (
                        <Input
                          id={key}
                          type="date"
                          value={
                            editFormData[key] instanceof Date
                              ? editFormData[key].toISOString().split("T")[0]
                              : editFormData[key]
                          }
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          id={key}
                          value={editFormData[key] || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle save logic here
                    console.log("Saving:", editFormData)
                    setEditModalOpen(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
