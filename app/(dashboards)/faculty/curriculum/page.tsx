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
import { Plus, Edit, Trash2, Search, BookOpen, Users, CalendarIcon, FileText } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CurriculumMeeting {
  id: string
  meetingTitle: string
  meetingDate: Date
  meetingType: "Board Meeting" | "Curriculum Review" | "Syllabus Update" | "Assessment Review" | "Faculty Meeting"
  department: string
  chairperson: string
  attendees: string[]
  agenda: string
  decisions: string
  actionItems: string
  nextMeetingDate?: Date
  status: "Scheduled" | "Completed" | "Cancelled" | "Postponed"
  documents: string[]
}

export default function FacultyCurriculumPage() {
  const [meetings, setMeetings] = useState<CurriculumMeeting[]>([
    {
      id: "1",
      meetingTitle: "Curriculum Board Meeting - Spring 2024",
      meetingDate: new Date("2024-02-15"),
      meetingType: "Board Meeting",
      department: "Computer Science",
      chairperson: "Dr. Rajesh Kumar",
      attendees: ["Dr. Priya Sharma", "Prof. Amit Singh", "Dr. Neha Gupta", "Prof. Suresh Patel"],
      agenda: "Review of current curriculum, Discussion on new course additions, Assessment of industry requirements",
      decisions:
        "Approved addition of AI/ML courses, Updated programming language requirements, Revised assessment criteria",
      actionItems: "Develop new course syllabus by March 2024, Conduct industry survey, Update course materials",
      nextMeetingDate: new Date("2024-05-15"),
      status: "Completed",
      documents: ["Meeting_Minutes_Feb2024.pdf", "Curriculum_Proposal.pdf"],
    },
    {
      id: "2",
      meetingTitle: "Syllabus Review Committee Meeting",
      meetingDate: new Date("2024-03-20"),
      meetingType: "Syllabus Update",
      department: "Electronics",
      chairperson: "Prof. Sarah Johnson",
      attendees: ["Dr. Michael Brown", "Prof. Lisa Davis", "Dr. Robert Wilson"],
      agenda:
        "Review of Electronics Engineering syllabus, Integration of IoT concepts, Laboratory equipment requirements",
      decisions: "Updated lab requirements, Added IoT module, Revised project guidelines",
      actionItems: "Procure new equipment, Train faculty on IoT, Update lab manuals",
      nextMeetingDate: new Date("2024-06-20"),
      status: "Completed",
      documents: ["Syllabus_Review_Mar2024.pdf"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Board Meeting")
  const [selectedDepartment, setSelectedDepartment] = useState("Computer Science")
  const [selectedStatus, setSelectedStatus] = useState("Completed")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<CurriculumMeeting | null>(null)
  const [formData, setFormData] = useState<Partial<CurriculumMeeting>>({})

  const handleAddMeeting = () => {
    setEditingMeeting(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEditMeeting = (meeting: CurriculumMeeting) => {
    setEditingMeeting(meeting)
    setFormData(meeting)
    setIsDialogOpen(true)
  }

  const handleSaveMeeting = () => {
    if (editingMeeting) {
      setMeetings(meetings.map((m) => (m.id === editingMeeting.id ? { ...(formData as CurriculumMeeting) } : m)))
    } else {
      const newMeeting: CurriculumMeeting = {
        ...(formData as CurriculumMeeting),
        id: Date.now().toString(),
      }
      setMeetings([...meetings, newMeeting])
    }
    setIsDialogOpen(false)
    setFormData({})
  }

  const handleDeleteMeeting = (id: string) => {
    if (confirm("Are you sure you want to delete this meeting record?")) {
      setMeetings(meetings.filter((m) => m.id !== id))
    }
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.chairperson.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || meeting.meetingType === selectedType
    const matchesDepartment = !selectedDepartment || meeting.department === selectedDepartment
    const matchesStatus = !selectedStatus || meeting.status === selectedStatus
    return matchesSearch && matchesType && matchesDepartment && matchesStatus
  })

  const meetingTypes = ["Board Meeting", "Curriculum Review", "Syllabus Update", "Assessment Review", "Faculty Meeting"]
  const departments = [...new Set(meetings.map((m) => m.department))]
  const statusOptions = ["Scheduled", "Completed", "Cancelled", "Postponed"]

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Board Meetings</h1>
          <Button onClick={handleAddMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meeting
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {meetings.filter((m) => m.status === "Completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {meetings.filter((m) => m.status === "Scheduled").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Meetings</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by title or chairperson..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Meeting Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Board Meeting">All types</SelectItem>
                    {meetingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
                    <SelectItem value="Computer Science">All departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
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
                    <SelectItem value="Completed">All statuses</SelectItem>
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

        {/* Meetings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meeting Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Chairperson</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.meetingTitle}</TableCell>
                    <TableCell>{format(meeting.meetingDate, "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{meeting.meetingType}</Badge>
                    </TableCell>
                    <TableCell>{meeting.department}</TableCell>
                    <TableCell>{meeting.chairperson}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          meeting.status === "Completed"
                            ? "default"
                            : meeting.status === "Scheduled"
                              ? "secondary"
                              : meeting.status === "Postponed"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditMeeting(meeting)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteMeeting(meeting.id)}>
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

        {/* Add/Edit Meeting Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMeeting ? "Edit Meeting" : "Add New Meeting"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="meetingTitle">Meeting Title</Label>
                <Input
                  id="meetingTitle"
                  value={formData.meetingTitle || ""}
                  onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                />
              </div>

              <div>
                <Label>Meeting Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.meetingDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.meetingDate ? format(formData.meetingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.meetingDate}
                      onSelect={(date) => setFormData({ ...formData, meetingDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select
                  value={formData.meetingType || "Board Meeting"}
                  onValueChange={(value) => setFormData({ ...formData, meetingType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || "Computer Science"}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="chairperson">Chairperson</Label>
                <Input
                  id="chairperson"
                  value={formData.chairperson || ""}
                  onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Completed"}
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
                <Label>Next Meeting Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.nextMeetingDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.nextMeetingDate ? format(formData.nextMeetingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.nextMeetingDate}
                      onSelect={(date) => setFormData({ ...formData, nextMeetingDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="agenda">Meeting Agenda</Label>
                <Textarea
                  id="agenda"
                  value={formData.agenda || ""}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="decisions">Decisions Made</Label>
                <Textarea
                  id="decisions"
                  value={formData.decisions || ""}
                  onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="actionItems">Action Items</Label>
                <Textarea
                  id="actionItems"
                  value={formData.actionItems || ""}
                  onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="attendees">Attendees (comma-separated)</Label>
                <Textarea
                  id="attendees"
                  value={formData.attendees?.join(", ") || ""}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value.split(", ").filter(Boolean) })}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMeeting}>{editingMeeting ? "Update" : "Add"} Meeting</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
