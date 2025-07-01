"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
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
  Save,
} from "lucide-react"

// Sample data for each section with correct field names
const initialSampleData = {
  patents: [
    {
      id: 1,
      srNo: 1,
      title: "Smart IoT Device for Environmental Monitoring",
      level: "National",
      status: "Published",
      date: "2023-01-15",
      transferOfTechnology: "Yes",
      earningGenerated: "50000",
      patentApplicationNo: "IN202341001234",
      supportingDocument: ["patent_application.pdf"],
    },
  ],
  policy: [
    {
      id: 1,
      srNo: 1,
      title: "Digital Education Policy Framework",
      level: "National",
      organisation: "Ministry of Education",
      date: "2023-03-20",
      supportingDocument: ["policy_draft.pdf"],
    },
  ],
  econtent: [
    {
      id: 1,
      srNo: 1,
      title: "Machine Learning Fundamentals Course",
      typeOfEContentPlatform: "SWAYAM",
      briefDetails: "Comprehensive course on ML fundamentals",
      quadrant: "Q1",
      publishingDate: "2023-02-10",
      publishingAuthorities: "AICTE",
      link: "https://swayam.gov.in/course123",
      typeOfEContent: "Video Lectures",
      supportingDocument: ["course_outline.pdf"],
    },
  ],
  consultancy: [
    {
      id: 1,
      srNo: 1,
      title: "AI-based Quality Control System",
      collaboratingInstitute: "Tech Solutions Pvt Ltd",
      address: "Mumbai, Maharashtra",
      startDate: "2023-01-01",
      duration: "6",
      amount: "500000",
      detailsOutcome: "Successfully implemented AI system for quality control",
      supportingDocument: ["consultancy_report.pdf"],
    },
  ],
  collaborations: [
    {
      id: 1,
      srNo: 1,
      category: "Research Collaboration",
      collaboratingInstitute: "Stanford University",
      nameOfCollaborator: "Dr. John Smith",
      qsTheRanking: "3",
      address: "Stanford, CA, USA",
      details: "Joint AI Research Initiative",
      collaborationOutcome: "3 joint publications",
      status: "Active",
      startingDate: "2023-01-15",
      duration: "36",
      level: "International",
      noOfBeneficiary: "50",
      mouSigned: "Yes",
      signingDate: "2023-01-10",
      supportingDocument: ["mou_stanford.pdf"],
    },
  ],
  visits: [
    {
      id: 1,
      srNo: 1,
      instituteVisited: "MIT, USA",
      durationOfVisit: "14",
      role: "Visiting Researcher",
      sponsoredBy: "University Grant",
      remarks: "Research collaboration on AI",
      date: "2023-06-01",
      supportingDocument: ["visit_report.pdf"],
    },
  ],
  financial: [
    {
      id: 1,
      srNo: 1,
      nameOfSupport: "SERB Core Research Grant",
      type: "Research Grant",
      supportingAgency: "Department of Science & Technology",
      grantReceived: "2500000",
      detailsOfEvent: "AI Research Project",
      purposeOfGrant: "Research Activities",
      date: "2023-04-01",
      supportingDocument: ["grant_sanction.pdf"],
    },
  ],
  jrfSrf: [
    {
      id: 1,
      srNo: 1,
      nameOfFellow: "Rahul Kumar",
      type: "JRF",
      projectTitle: "Machine Learning Applications",
      duration: "36",
      monthlyStipend: "31000",
      date: "2023-01-01",
      supportingDocument: ["fellowship_letter.pdf"],
    },
  ],
  phd: [
    {
      id: 1,
      srNo: 1,
      regNo: "PhD2023001",
      nameOfStudent: "Priya Sharma",
      dateOfRegistration: "2023-01-15",
      topic: "Deep Learning Applications in Healthcare",
      status: "Ongoing",
      yearOfCompletion: "2026",
      supportingDocument: ["registration_certificate.pdf"],
    },
  ],
  copyrights: [
    {
      id: 1,
      srNo: 1,
      title: "Educational Software for Mathematics Learning",
      referenceNo: "L-12345/2023",
      publicationDate: "2023-05-10",
      link: "https://copyright.gov.in/L-12345-2023",
      supportingDocument: ["copyright_certificate.pdf"],
    },
  ],
}

const sections = [
  {
    id: "patents",
    title: "Patents",
    icon: ImageIcon,
    columns: [
      "Sr No.",
      "Title",
      "Level",
      "Status",
      "Date",
      "Transfer of Technology",
      "Earning Generated (₹)",
      "Patent Application No.",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "policy",
    title: "Policy Documents",
    icon: FileText,
    columns: ["Sr No.", "Title", "Level", "Organisation", "Date", "Documents", "Actions"],
  },
  {
    id: "econtent",
    title: "E-Content Development",
    icon: Monitor,
    columns: [
      "Sr No.",
      "Title",
      "Platform",
      "Brief Details",
      "Quadrant",
      "Publishing Date",
      "Publishing Authorities",
      "Link",
      "Type",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "consultancy",
    title: "Consultancy Undertaken",
    icon: Briefcase,
    columns: [
      "Sr No.",
      "Title",
      "Collaborating Institute",
      "Address",
      "Start Date",
      "Duration (Months)",
      "Amount (₹)",
      "Details/Outcome",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "collaborations",
    title: "Collaborations / MoUs / Linkages",
    icon: Handshake,
    columns: [
      "Sr No.",
      "Category",
      "Collaborating Institute",
      "Collaborator Name",
      "QS/THE Ranking",
      "Address",
      "Details",
      "Outcome",
      "Status",
      "Start Date",
      "Duration",
      "Level",
      "Beneficiaries",
      "MOU Signed",
      "Signing Date",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "visits",
    title: "Academic / Research Visits",
    icon: Plane,
    columns: [
      "Sr No.",
      "Institute Visited",
      "Duration (Days)",
      "Role",
      "Sponsored By",
      "Remarks",
      "Date",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "financial",
    title: "Financial Support for Academic/Research",
    icon: DollarSign,
    columns: [
      "Sr No.",
      "Name of Support",
      "Type",
      "Supporting Agency",
      "Grant Received (₹)",
      "Details of Event",
      "Purpose",
      "Date",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "jrfSrf",
    title: "JRF/SRF Supervision",
    icon: Users,
    columns: [
      "Sr No.",
      "Name of Fellow",
      "Type",
      "Project Title",
      "Duration (Months)",
      "Monthly Stipend (₹)",
      "Date",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "phd",
    title: "PhD Guidance",
    icon: GraduationCap,
    columns: [
      "Sr No.",
      "Reg No.",
      "Student Name",
      "Registration Date",
      "Topic",
      "Status",
      "Year of Completion",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "copyrights",
    title: "Copyrights",
    icon: Copyright,
    columns: ["Sr No.", "Title", "Reference No.", "Publication Date", "Link", "Documents", "Actions"],
  },
]

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
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("patents")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [data, setData] = useState(initialSampleData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleDelete = (sectionId: string, itemId: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setData((prevData) => ({
        ...prevData,
        [sectionId]: prevData[sectionId as keyof typeof prevData].filter((item: any) => item.id !== itemId),
      }))
      toast({
        title: "Success",
        description: "Item deleted successfully!",
        duration: 2000,
      })
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    setFormData({ ...item })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    setData((prevData) => ({
      ...prevData,
      [editingItem.sectionId]: prevData[editingItem.sectionId as keyof typeof prevData].map((item: any) =>
        item.id === editingItem.id ? { ...item, ...formData } : item,
      ),
    }))

    setIsEditDialogOpen(false)
    setEditingItem(null)
    setFormData({})
    toast({
      title: "Success",
      description: "Item updated successfully!",
      duration: 2000,
    })
  }

  const handleFileUpload = (sectionId: string, itemId: number) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const fileNames = Array.from(selectedFiles).map((f) => f.name)
      setData((prevData) => ({
        ...prevData,
        [sectionId]: prevData[sectionId as keyof typeof prevData].map((item: any) =>
          item.id === itemId
            ? { ...item, supportingDocument: [...(item.supportingDocument || []), ...fileNames] }
            : item,
        ),
      }))
      toast({
        title: "Files Uploaded",
        description: "Supporting documents uploaded successfully!",
        duration: 2000,
      })
    }
  }

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "patents":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.level}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Published" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.transferOfTechnology}</TableCell>
            <TableCell>₹{item.earningGenerated}</TableCell>
            <TableCell>{item.patentApplicationNo}</TableCell>
          </>
        )
      case "policy":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.level}</TableCell>
            <TableCell>{item.organisation}</TableCell>
            <TableCell>{item.date}</TableCell>
          </>
        )
      case "econtent":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.typeOfEContentPlatform}</TableCell>
            <TableCell>{item.briefDetails}</TableCell>
            <TableCell>{item.quadrant}</TableCell>
            <TableCell>{item.publishingDate}</TableCell>
            <TableCell>{item.publishingAuthorities}</TableCell>
            <TableCell>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Link
              </a>
            </TableCell>
            <TableCell>{item.typeOfEContent}</TableCell>
          </>
        )
      case "consultancy":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.collaboratingInstitute}</TableCell>
            <TableCell>{item.address}</TableCell>
            <TableCell>{item.startDate}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>₹{item.amount}</TableCell>
            <TableCell>{item.detailsOutcome}</TableCell>
          </>
        )
      case "collaborations":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell className="font-medium">{item.collaboratingInstitute}</TableCell>
            <TableCell>{item.nameOfCollaborator}</TableCell>
            <TableCell>{item.qsTheRanking}</TableCell>
            <TableCell>{item.address}</TableCell>
            <TableCell>{item.details}</TableCell>
            <TableCell>{item.collaborationOutcome}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.startingDate}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{item.level}</TableCell>
            <TableCell>{item.noOfBeneficiary}</TableCell>
            <TableCell>{item.mouSigned}</TableCell>
            <TableCell>{item.signingDate}</TableCell>
          </>
        )
      case "visits":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.instituteVisited}</TableCell>
            <TableCell>{item.durationOfVisit}</TableCell>
            <TableCell>{item.role}</TableCell>
            <TableCell>{item.sponsoredBy}</TableCell>
            <TableCell>{item.remarks}</TableCell>
            <TableCell>{item.date}</TableCell>
          </>
        )
      case "financial":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfSupport}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.supportingAgency}</TableCell>
            <TableCell>₹{item.grantReceived}</TableCell>
            <TableCell>{item.detailsOfEvent}</TableCell>
            <TableCell>{item.purposeOfGrant}</TableCell>
            <TableCell>{item.date}</TableCell>
          </>
        )
      case "jrfSrf":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfFellow}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.projectTitle}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>₹{item.monthlyStipend}</TableCell>
            <TableCell>{item.date}</TableCell>
          </>
        )
      case "phd":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell>{item.regNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfStudent}</TableCell>
            <TableCell>{item.dateOfRegistration}</TableCell>
            <TableCell>{item.topic}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Ongoing" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.yearOfCompletion}</TableCell>
          </>
        )
      case "copyrights":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.referenceNo}</TableCell>
            <TableCell>{item.publicationDate}</TableCell>
            <TableCell>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Link
              </a>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "patents":
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter patent title"
                  value={currentData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  value={currentData.level || ""}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentData.status || ""}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Filed">Filed</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Granted">Granted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferOfTechnology">Transfer of Technology with Licence</Label>
                <Select
                  value={currentData.transferOfTechnology || ""}
                  onValueChange={(value) => setFormData({ ...formData, transferOfTechnology: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="earningGenerated">Earning Generated (Rupees)</Label>
                <Input
                  id="earningGenerated"
                  type="number"
                  placeholder="Enter amount"
                  value={currentData.earningGenerated || ""}
                  onChange={(e) => setFormData({ ...formData, earningGenerated: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="patentApplicationNo">Patent Application/Publication/Grant No.</Label>
              <Input
                id="patentApplicationNo"
                placeholder="Enter patent number"
                value={currentData.patentApplicationNo || ""}
                onChange={(e) => setFormData({ ...formData, patentApplicationNo: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "policy":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter policy document title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  value={currentData.level || ""}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Institutional">Institutional</SelectItem>
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="organisation">Organisation</Label>
                <Input
                  id="organisation"
                  placeholder="Enter organisation name"
                  value={currentData.organisation || ""}
                  onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "econtent":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter e-content title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="typeOfEContentPlatform">Type of E-Content Platform</Label>
                <Select
                  value={currentData.typeOfEContentPlatform || ""}
                  onValueChange={(value) => setFormData({ ...formData, typeOfEContentPlatform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SWAYAM">SWAYAM</SelectItem>
                    <SelectItem value="NPTEL">NPTEL</SelectItem>
                    <SelectItem value="Coursera">Coursera</SelectItem>
                    <SelectItem value="edX">edX</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quadrant">Quadrant</Label>
                <Select
                  value={currentData.quadrant || ""}
                  onValueChange={(value) => setFormData({ ...formData, quadrant: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quadrant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="briefDetails">Brief Details</Label>
              <Textarea
                id="briefDetails"
                placeholder="Enter brief details"
                value={currentData.briefDetails || ""}
                onChange={(e) => setFormData({ ...formData, briefDetails: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishingDate">Publishing Date</Label>
                <Input
                  id="publishingDate"
                  type="date"
                  value={currentData.publishingDate || ""}
                  onChange={(e) => setFormData({ ...formData, publishingDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publishingAuthorities">Publishing Authorities</Label>
                <Input
                  id="publishingAuthorities"
                  placeholder="Enter publishing authorities"
                  value={currentData.publishingAuthorities || ""}
                  onChange={(e) => setFormData({ ...formData, publishingAuthorities: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="Enter link"
                  value={currentData.link || ""}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="typeOfEContent">Type of E Content</Label>
                <Select
                  value={currentData.typeOfEContent || ""}
                  onValueChange={(value) => setFormData({ ...formData, typeOfEContent: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video Lectures">Video Lectures</SelectItem>
                    <SelectItem value="Interactive Content">Interactive Content</SelectItem>
                    <SelectItem value="Simulation">Simulation</SelectItem>
                    <SelectItem value="E-Book">E-Book</SelectItem>
                    <SelectItem value="Quiz/Assessment">Quiz/Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "consultancy":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter consultancy title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collaboratingInstitute">Collaborating Institute/Industry</Label>
                <Input
                  id="collaboratingInstitute"
                  placeholder="Enter institute/industry name"
                  value={currentData.collaboratingInstitute || ""}
                  onChange={(e) => setFormData({ ...formData, collaboratingInstitute: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  value={currentData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={currentData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (in Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Enter duration"
                  value={currentData.duration || ""}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (Rs.)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={currentData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="detailsOutcome">Details / Outcome</Label>
              <Textarea
                id="detailsOutcome"
                placeholder="Enter details and outcome"
                value={currentData.detailsOutcome || ""}
                onChange={(e) => setFormData({ ...formData, detailsOutcome: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "collaborations":
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={currentData.category || ""}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Research Collaboration">Research Collaboration</SelectItem>
                    <SelectItem value="Academic Exchange">Academic Exchange</SelectItem>
                    <SelectItem value="Joint Program">Joint Program</SelectItem>
                    <SelectItem value="MoU">MoU</SelectItem>
                    <SelectItem value="Linkage">Linkage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="collaboratingInstitute">Collaborating Institute</Label>
                <Input
                  id="collaboratingInstitute"
                  placeholder="Enter institute name"
                  value={currentData.collaboratingInstitute || ""}
                  onChange={(e) => setFormData({ ...formData, collaboratingInstitute: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameOfCollaborator">Name of Collaborator (At other institute)</Label>
                <Input
                  id="nameOfCollaborator"
                  placeholder="Enter collaborator name"
                  value={currentData.nameOfCollaborator || ""}
                  onChange={(e) => setFormData({ ...formData, nameOfCollaborator: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="qsTheRanking">QS/THE World University Ranking of Institute</Label>
                <Input
                  id="qsTheRanking"
                  placeholder="Enter ranking"
                  value={currentData.qsTheRanking || ""}
                  onChange={(e) => setFormData({ ...formData, qsTheRanking: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter address"
                value={currentData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="Enter collaboration details"
                value={currentData.details || ""}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="collaborationOutcome">Collaboration Outcome</Label>
              <Textarea
                id="collaborationOutcome"
                placeholder="Enter collaboration outcome"
                value={currentData.collaborationOutcome || ""}
                onChange={(e) => setFormData({ ...formData, collaborationOutcome: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentData.status || ""}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startingDate">Starting Date</Label>
                <Input
                  id="startingDate"
                  type="date"
                  value={currentData.startingDate || ""}
                  onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Enter duration"
                  value={currentData.duration || ""}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  value={currentData.level || ""}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="noOfBeneficiary">No. of Beneficiary</Label>
                <Input
                  id="noOfBeneficiary"
                  type="number"
                  placeholder="Enter number"
                  value={currentData.noOfBeneficiary || ""}
                  onChange={(e) => setFormData({ ...formData, noOfBeneficiary: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mouSigned">MOU Signed?</Label>
                <Select
                  value={currentData.mouSigned || ""}
                  onValueChange={(value) => setFormData({ ...formData, mouSigned: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="signingDate">Signing Date</Label>
              <Input
                id="signingDate"
                type="date"
                value={currentData.signingDate || ""}
                onChange={(e) => setFormData({ ...formData, signingDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "visits":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="instituteVisited">Institute/Industry Visited</Label>
              <Input
                id="instituteVisited"
                placeholder="Enter institute/industry name"
                value={currentData.instituteVisited || ""}
                onChange={(e) => setFormData({ ...formData, instituteVisited: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationOfVisit">Duration of Visit (days)</Label>
                <Input
                  id="durationOfVisit"
                  type="number"
                  placeholder="Enter duration in days"
                  value={currentData.durationOfVisit || ""}
                  onChange={(e) => setFormData({ ...formData, durationOfVisit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="Enter your role"
                  value={currentData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsoredBy">Sponsored By</Label>
                <Input
                  id="sponsoredBy"
                  placeholder="Enter sponsor name"
                  value={currentData.sponsoredBy || ""}
                  onChange={(e) => setFormData({ ...formData, sponsoredBy: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks"
                value={currentData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "financial":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="nameOfSupport">Name Of Support</Label>
              <Input
                id="nameOfSupport"
                placeholder="Enter support name"
                value={currentData.nameOfSupport || ""}
                onChange={(e) => setFormData({ ...formData, nameOfSupport: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={currentData.type || ""}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Research Grant">Research Grant</SelectItem>
                    <SelectItem value="Travel Grant">Travel Grant</SelectItem>
                    <SelectItem value="Equipment Grant">Equipment Grant</SelectItem>
                    <SelectItem value="Fellowship">Fellowship</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supportingAgency">Supporting Agency</Label>
                <Input
                  id="supportingAgency"
                  placeholder="Enter agency name"
                  value={currentData.supportingAgency || ""}
                  onChange={(e) => setFormData({ ...formData, supportingAgency: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grantReceived">Grant Received</Label>
                <Input
                  id="grantReceived"
                  type="number"
                  placeholder="Enter amount"
                  value={currentData.grantReceived || ""}
                  onChange={(e) => setFormData({ ...formData, grantReceived: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="detailsOfEvent">Details Of Event</Label>
              <Textarea
                id="detailsOfEvent"
                placeholder="Enter event details"
                value={currentData.detailsOfEvent || ""}
                onChange={(e) => setFormData({ ...formData, detailsOfEvent: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="purposeOfGrant">Purpose Of Grant</Label>
              <Textarea
                id="purposeOfGrant"
                placeholder="Enter purpose of grant"
                value={currentData.purposeOfGrant || ""}
                onChange={(e) => setFormData({ ...formData, purposeOfGrant: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "jrfSrf":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="nameOfFellow">Name Of Fellow</Label>
              <Input
                id="nameOfFellow"
                placeholder="Enter fellow name"
                value={currentData.nameOfFellow || ""}
                onChange={(e) => setFormData({ ...formData, nameOfFellow: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={currentData.type || ""}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JRF">JRF</SelectItem>
                    <SelectItem value="SRF">SRF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="projectTitle">Project Title</Label>
              <Input
                id="projectTitle"
                placeholder="Enter project title"
                value={currentData.projectTitle || ""}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration [in months]</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Enter duration"
                  value={currentData.duration || ""}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="monthlyStipend">Monthly Stipend</Label>
                <Input
                  id="monthlyStipend"
                  type="number"
                  placeholder="Enter stipend amount"
                  value={currentData.monthlyStipend || ""}
                  onChange={(e) => setFormData({ ...formData, monthlyStipend: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "phd":
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regNo">Reg No</Label>
                <Input
                  id="regNo"
                  placeholder="Enter registration number"
                  value={currentData.regNo || ""}
                  onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nameOfStudent">Name of Student</Label>
                <Input
                  id="nameOfStudent"
                  placeholder="Enter student name"
                  value={currentData.nameOfStudent || ""}
                  onChange={(e) => setFormData({ ...formData, nameOfStudent: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfRegistration">Date of Registration</Label>
                <Input
                  id="dateOfRegistration"
                  type="date"
                  value={currentData.dateOfRegistration || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfRegistration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="yearOfCompletion">Year of Completion</Label>
                <Input
                  id="yearOfCompletion"
                  placeholder="Enter completion year"
                  value={currentData.yearOfCompletion || ""}
                  onChange={(e) => setFormData({ ...formData, yearOfCompletion: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                placeholder="Enter research topic"
                value={currentData.topic || ""}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentData.status || ""}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Awarded">Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      case "copyrights":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter copyright title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referenceNo">Reference No.</Label>
                <Input
                  id="referenceNo"
                  placeholder="Enter reference number"
                  value={currentData.referenceNo || ""}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={currentData.publicationDate || ""}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                type="url"
                placeholder="Enter link"
                value={currentData.link || ""}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research & Academic Contributions</h1>
          <p className="text-muted-foreground">
            Manage your patents, publications, consultancy work, and other academic contributions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex min-w-max w-full">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-xs">{section.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      switch (section.id) {
                        case "patents":
                          router.push("/add-patents")
                          break
                        case "policy":
                          router.push("/add-policy")
                          break
                        case "econtent":
                          router.push("/add-econtent")
                          break
                        case "consultancy":
                          router.push("/add-consultancy")
                          break
                        case "collaborations":
                          router.push("/add-collaborations")
                          break
                        case "visits":
                          router.push("/add-visits")
                          break
                        case "financial":
                          router.push("/add-financial")
                          break
                        case "jrfSrf":
                          router.push("/add-jrf-srf")
                          break
                        case "phd":
                          router.push("/add-phd")
                          break
                        case "copyrights":
                          router.push("/add-copyrights")
                          break
                        default:
                          break
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {section.title}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.columns.map((column) => (
                            <TableHead key={column} className="whitespace-nowrap">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data[section.id as keyof typeof data].length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={section.columns.length}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No {section.title.toLowerCase()} found. Click "Add {section.title}" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data[section.id as keyof typeof data].map((item: any) => (
                            <TableRow key={item.id}>
                              {renderTableData(section, item)}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Upload Supporting Documents</DialogTitle>
                                      </DialogHeader>
                                      <FileUpload onFileSelect={handleFileSelect} />
                                      <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={() => handleFileUpload(section.id, item.id)}>
                                          Upload Files
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  {item.supportingDocument && item.supportingDocument.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(section.id, item.id)}>
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
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit {editingItem?.sectionId && sections.find((s) => s.id === editingItem.sectionId)?.title}
              </DialogTitle>
            </DialogHeader>
            {editingItem && renderForm(editingItem.sectionId, true)}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
