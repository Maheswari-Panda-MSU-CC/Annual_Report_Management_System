"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  ImageIcon,
  Monitor,
  Briefcase,
  Handshake,
  Plane,
  DollarSign,
  Users,
  GraduationCap,
  Copyright,
  ChevronRight,
} from "lucide-react"

// Sample data for each section
const sampleData = {
  patents: [
    {
      id: 1,
      title: "Smart IoT Device for Environmental Monitoring",
      patentNumber: "IN202341001234",
      applicationDate: "2023-01-15",
      status: "Published",
      inventors: "Dr. John Doe, Dr. Jane Smith",
      category: "Utility Patent",
      documents: ["patent_application.pdf"],
    },
  ],
  policy: [
    {
      id: 1,
      title: "Digital Education Policy Framework",
      organization: "Ministry of Education",
      dateSubmitted: "2023-03-20",
      status: "Under Review",
      description: "Comprehensive policy document on digital transformation in education",
      documents: ["policy_draft.pdf"],
    },
  ],
  econtent: [
    {
      id: 1,
      title: "Machine Learning Fundamentals Course",
      platform: "SWAYAM",
      type: "Video Lectures",
      duration: "40 hours",
      launchDate: "2023-02-10",
      enrollments: "5000+",
      documents: ["course_outline.pdf"],
    },
  ],
  consultancy: [
    {
      id: 1,
      organization: "Tech Solutions Pvt Ltd",
      project: "AI-based Quality Control System",
      duration: "6 months",
      amount: "₹5,00,000",
      startDate: "2023-01-01",
      status: "Completed",
      documents: ["consultancy_report.pdf"],
    },
  ],
  collaborations: [
    {
      id: 1,
      partner: "Stanford University",
      type: "Research Collaboration",
      title: "Joint AI Research Initiative",
      startDate: "2023-01-15",
      duration: "3 years",
      status: "Active",
      documents: ["mou_stanford.pdf"],
    },
  ],
  visits: [
    {
      id: 1,
      institution: "MIT, USA",
      purpose: "Research Collaboration",
      duration: "2 weeks",
      startDate: "2023-06-01",
      endDate: "2023-06-15",
      funding: "University Grant",
      documents: ["visit_report.pdf"],
    },
  ],
  financial: [
    {
      id: 1,
      agency: "Department of Science & Technology",
      scheme: "SERB Core Research Grant",
      amount: "₹25,00,000",
      duration: "3 years",
      startDate: "2023-04-01",
      status: "Ongoing",
      documents: ["grant_sanction.pdf"],
    },
  ],
  jrfSrf: [
    {
      id: 1,
      studentName: "Rahul Kumar",
      fellowship: "JRF",
      agency: "CSIR",
      startDate: "2023-01-01",
      duration: "3 years",
      researchArea: "Machine Learning",
      status: "Active",
      documents: ["fellowship_letter.pdf"],
    },
  ],
  phd: [
    {
      id: 1,
      studentName: "Priya Sharma",
      registrationNumber: "PhD2023001",
      registrationDate: "2023-01-15",
      researchTitle: "Deep Learning Applications in Healthcare",
      status: "Ongoing",
      stage: "Coursework Completed",
      documents: ["registration_certificate.pdf"],
    },
  ],
  copyrights: [
    {
      id: 1,
      title: "Educational Software for Mathematics Learning",
      registrationNumber: "L-12345/2023",
      registrationDate: "2023-05-10",
      category: "Literary/Dramatic Work",
      applicant: "Dr. John Doe",
      status: "Registered",
      documents: ["copyright_certificate.pdf"],
    },
  ],
}

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

export default function ResearchContributionsPage() {
  const [activeSection, setActiveSection] = useState("patents")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const sections = [
    {
      id: "patents",
      title: "Patents",
      icon: ImageIcon,
      data: sampleData.patents,
      columns: ["Title", "Patent Number", "Application Date", "Status", "Inventors", "Actions"],
    },
    {
      id: "policy",
      title: "Policy Documents",
      icon: FileText,
      data: sampleData.policy,
      columns: ["Title", "Organization", "Date Submitted", "Status", "Actions"],
    },
    {
      id: "econtent",
      title: "E-Content Development",
      icon: Monitor,
      data: sampleData.econtent,
      columns: ["Title", "Platform", "Type", "Duration", "Launch Date", "Enrollments", "Actions"],
    },
    {
      id: "consultancy",
      title: "Consultancy Undertaken",
      icon: Briefcase,
      data: sampleData.consultancy,
      columns: ["Organization", "Project", "Duration", "Amount", "Status", "Actions"],
    },
    {
      id: "collaborations",
      title: "Collaborations / MoUs / Linkages",
      icon: Handshake,
      data: sampleData.collaborations,
      columns: ["Partner", "Type", "Title", "Start Date", "Duration", "Status", "Actions"],
    },
    {
      id: "visits",
      title: "Academic / Research Visits",
      icon: Plane,
      data: sampleData.visits,
      columns: ["Institution", "Purpose", "Duration", "Start Date", "End Date", "Actions"],
    },
    {
      id: "financial",
      title: "Financial Support for Academic/Research",
      icon: DollarSign,
      data: sampleData.financial,
      columns: ["Agency", "Scheme", "Amount", "Duration", "Start Date", "Status", "Actions"],
    },
    {
      id: "jrfSrf",
      title: "JRF/SRF Supervision",
      icon: Users,
      data: sampleData.jrfSrf,
      columns: ["Student Name", "Fellowship", "Agency", "Start Date", "Research Area", "Status", "Actions"],
    },
    {
      id: "phd",
      title: "PhD Guidance",
      icon: GraduationCap,
      data: sampleData.phd,
      columns: ["Student Name", "Registration No.", "Registration Date", "Research Title", "Status", "Actions"],
    },
    {
      id: "copyrights",
      title: "Copyrights",
      icon: Copyright,
      data: sampleData.copyrights,
      columns: ["Title", "Registration Number", "Registration Date", "Category", "Status", "Actions"],
    },
  ]

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "patents":
        return (
          <>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.patentNumber}</TableCell>
            <TableCell>{item.applicationDate}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Published" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.inventors}</TableCell>
          </>
        )
      case "policy":
        return (
          <>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.organization}</TableCell>
            <TableCell>{item.dateSubmitted}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Approved" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      case "econtent":
        return (
          <>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.platform}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{item.launchDate}</TableCell>
            <TableCell>{item.enrollments}</TableCell>
          </>
        )
      case "consultancy":
        return (
          <>
            <TableCell className="font-medium">{item.organization}</TableCell>
            <TableCell>{item.project}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{item.amount}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Completed" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      case "collaborations":
        return (
          <>
            <TableCell className="font-medium">{item.partner}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell>{item.startDate}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      case "visits":
        return (
          <>
            <TableCell className="font-medium">{item.institution}</TableCell>
            <TableCell>{item.purpose}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{item.startDate}</TableCell>
            <TableCell>{item.endDate}</TableCell>
          </>
        )
      case "financial":
        return (
          <>
            <TableCell className="font-medium">{item.agency}</TableCell>
            <TableCell>{item.scheme}</TableCell>
            <TableCell>{item.amount}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{item.startDate}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Ongoing" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      case "jrfSrf":
        return (
          <>
            <TableCell className="font-medium">{item.studentName}</TableCell>
            <TableCell>{item.fellowship}</TableCell>
            <TableCell>{item.agency}</TableCell>
            <TableCell>{item.startDate}</TableCell>
            <TableCell>{item.researchArea}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      case "phd":
        return (
          <>
            <TableCell className="font-medium">{item.studentName}</TableCell>
            <TableCell>{item.registrationNumber}</TableCell>
            <TableCell>{item.registrationDate}</TableCell>
            <TableCell>{item.researchTitle}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Ongoing" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      case "copyrights":
        return (
          <>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.registrationNumber}</TableCell>
            <TableCell>{item.registrationDate}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Registered" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string) => {
    switch (sectionId) {
      case "patents":
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Patent Title</Label>
                <Input id="title" placeholder="Enter patent title" />
              </div>
              <div>
                <Label htmlFor="patentNumber">Patent Number</Label>
                <Input id="patentNumber" placeholder="Enter patent number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applicationDate">Application Date</Label>
                <Input id="applicationDate" type="date" />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filed">Filed</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="granted">Granted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="inventors">Inventors</Label>
              <Input id="inventors" placeholder="Enter inventor names (comma separated)" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utility">Utility Patent</SelectItem>
                  <SelectItem value="design">Design Patent</SelectItem>
                  <SelectItem value="plant">Plant Patent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter patent description" />
            </div>
            <div>
              <Label>Supporting Documents</Label>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )
      case "policy":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Policy Title</Label>
              <Input id="title" placeholder="Enter policy document title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" placeholder="Enter organization name" />
              </div>
              <div>
                <Label htmlFor="dateSubmitted">Date Submitted</Label>
                <Input id="dateSubmitted" type="date" />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter policy description" />
            </div>
            <div>
              <Label>Supporting Documents</Label>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )
      // Add more form cases for other sections...
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter description" />
            </div>
            <div>
              <Label>Supporting Documents</Label>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )
    }
  }

  const activeData = sections.find((section) => section.id === activeSection) || sections[0]

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research & Academic Contributions</h1>
          <p className="text-muted-foreground">
            Manage your patents, publications, consultancy work, and other academic contributions
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 p-3 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        activeSection === section.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      <section.icon
                        className={`h-5 w-5 ${activeSection === section.id ? "text-blue-600" : "text-gray-500"}`}
                      />
                      <span>{section.title}</span>
                      {activeSection === section.id && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <activeData.icon className="h-5 w-5" />
                  {activeData.title}
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {activeData.title}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New {activeData.title}</DialogTitle>
                    </DialogHeader>
                    {renderForm(activeData.id)}
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {activeData.columns.map((column) => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeData.data.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={activeData.columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No {activeData.title.toLowerCase()} found. Click "Add {activeData.title}" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeData.data.map((item: any) => (
                          <TableRow key={item.id}>
                            {renderTableData(activeData, item)}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {item.documents && item.documents.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.documents.length} file(s)
                                  </Badge>
                                )}
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
          </div>
        </div>
      </div>
  )
}
