"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, FileText, Monitor } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OnlineEngagement {
  id: number
  faculty: string
  department: string
  format: string
  programme: string
  subject: string
  teacherName: string
  email: string
  mobile: string
  researchGroup?: string
  externalExpert?: string
  participantCount: number
  participantNames: string
  description: string
  certificateIssued: boolean
  activityName: string
  platform: string
  date: string
  attachment1?: string
  attachment2?: string
  document?: string
}

// Sample data
const sampleEngagements: OnlineEngagement[] = [
  {
    id: 1,
    faculty: "Dr. John Smith",
    department: "Computer Science",
    format: "Online",
    programme: "Workshop",
    subject: "Machine Learning",
    teacherName: "Dr. John Smith",
    email: "john.smith@university.edu",
    mobile: "+1234567890",
    researchGroup: "AI Research Lab",
    externalExpert: "Dr. Jane Doe, MIT",
    participantCount: 45,
    participantNames: "Student A, Student B, Student C...",
    description: "Comprehensive workshop on machine learning fundamentals and applications",
    certificateIssued: true,
    activityName: "ML Workshop 2024",
    platform: "Zoom",
    date: "2024-01-15",
    attachment1: "workshop_agenda.pdf",
    attachment2: "participant_list.pdf",
    document: "certificate_template.pdf",
  },
  {
    id: 2,
    faculty: "Dr. Sarah Johnson",
    department: "Mathematics",
    format: "Hybrid",
    programme: "Seminar",
    subject: "Statistics",
    teacherName: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    mobile: "+1234567891",
    researchGroup: "Statistics Research Group",
    externalExpert: "Prof. Michael Brown, Harvard",
    participantCount: 30,
    participantNames: "Faculty A, Faculty B, Student X...",
    description: "Advanced statistical methods and their applications in research",
    certificateIssued: false,
    activityName: "Statistics Seminar",
    platform: "Microsoft Teams",
    date: "2024-01-20",
    attachment1: "seminar_slides.pdf",
    document: "research_paper.pdf",
  },
  {
    id: 3,
    faculty: "Dr. Robert Wilson",
    department: "Physics",
    format: "Online",
    programme: "Conference",
    subject: "Quantum Physics",
    teacherName: "Dr. Robert Wilson",
    email: "robert.wilson@university.edu",
    mobile: "+1234567892",
    researchGroup: "Quantum Research Lab",
    externalExpert: "Dr. Lisa Chen, Stanford",
    participantCount: 75,
    participantNames: "International participants from 15 countries",
    description: "International conference on quantum computing and applications",
    certificateIssued: true,
    activityName: "Quantum Physics Conference 2024",
    platform: "Google Meet",
    date: "2024-02-01",
    attachment1: "conference_program.pdf",
    attachment2: "speaker_bios.pdf",
    document: "proceedings.pdf",
  },
]

export default function OnlineEngagementPage() {
  const [engagements, setEngagements] = useState<OnlineEngagement[]>(sampleEngagements)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const filteredEngagements = engagements.filter(
    (engagement) =>
      engagement.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (id: number) => {
    router.push(`/add-online-engagement?edit=${id}`)
  }

  const handleDelete = (id: number) => {
    setEngagements((prev) => prev.filter((engagement) => engagement.id !== id))
    toast({
      title: "Success",
      description: "Online engagement record deleted successfully",
    })
  }

  const handleAddNew = () => {
    router.push("/add-online-engagement")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Online Engagement Information Summary</h1>
            <p className="text-muted-foreground">Manage and track online engagement activities and programs</p>
          </div>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Online Engagement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{engagements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {engagements.reduce((sum, eng) => sum + eng.participantCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{engagements.filter((eng) => eng.certificateIssued).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(engagements.map((eng) => eng.department)).size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Online Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by activity name, teacher, department, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Engagements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Online Engagement Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr No.</TableHead>
                    <TableHead>Activity Name</TableHead>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEngagements.map((engagement, index) => (
                    <TableRow key={engagement.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{engagement.activityName}</TableCell>
                      <TableCell>{engagement.teacherName}</TableCell>
                      <TableCell>{engagement.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            engagement.format === "Online"
                              ? "default"
                              : engagement.format === "Offline"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {engagement.format}
                        </Badge>
                      </TableCell>
                      <TableCell>{engagement.programme}</TableCell>
                      <TableCell>{engagement.subject}</TableCell>
                      <TableCell>{engagement.platform}</TableCell>
                      <TableCell>{engagement.participantCount}</TableCell>
                      <TableCell>{new Date(engagement.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={engagement.certificateIssued ? "default" : "secondary"}>
                          {engagement.certificateIssued ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(engagement.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(engagement.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
