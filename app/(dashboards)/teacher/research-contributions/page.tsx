"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Lightbulb,
  FileText,
  Monitor,
  Briefcase,
  UserCheck,
  Plane,
  IndianRupee,
  Users,
  GraduationCap,
  Copyright,
  Save,
  Calendar,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal"
import { PatentForm } from "@/components/forms/PatentForm"
import { useForm } from "react-hook-form"
import PolicyForm from "@/components/forms/PolicyForm"
import { EContentForm } from "@/components/forms/EcontentForm"
import { ConsultancyForm } from "@/components/forms/ConsultancyForm"
import { CollaborationForm } from "@/components/forms/CollaborationForm"
import { AcademicVisitForm } from "@/components/forms/AcademicVisitForm"
import { FinancialForm } from "@/components/forms/FinancialFom"
import { JrfSrfForm } from "@/components/forms/JrfSrfForm"
import { PhdGuidanceForm } from "@/components/forms/PhdGuidanceForm"
import { CopyrightForm } from "@/components/forms/CopyrightForm"

// Sample data for each section
const initialSampleData = {
  patents: [
    {
      id: 1,
      srNo: 1,
      title: "AI-Based Medical Diagnosis System",
      level: "National",
      status: "Granted",
      date: "2023-03-15",
      transferOfTechnology: "Yes",
      earningGenerated: "250000",
      patentApplicationNo: "IN202301234567",
      supportingDocument: ["http://localhost:3000/images/msu-logo.png"],
    },
  ],
  policy: [
    {
      id: 1,
      srNo: 1,
      title: "Digital Education Policy Framework",
      level: "National",
      organisation: "Ministry of Education",
      date: "2023-05-20",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  econtent: [
    {
      id: 1,
      srNo: 1,
      title: "Interactive Machine Learning Course",
      typeOfEContentPlatform: "SWAYAM",
      briefDetails: "Comprehensive course on ML fundamentals",
      quadrant: "Q1",
      publishingDate: "2023-04-10",
      publishingAuthorities: "IIT Madras",
      link: "https://swayam.gov.in/course123",
      typeOfEContent: "Video Lectures",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  consultancy: [
    {
      id: 1,
      srNo: 1,
      title: "AI Implementation Strategy",
      collaboratingInstitute: "Tech Solutions Pvt Ltd",
      address: "Mumbai, Maharashtra",
      startDate: "2023-01-15",
      duration: "6",
      amount: "500000",
      detailsOutcome: "Successfully implemented AI solutions",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  collaborations: [
    {
      id: 1,
      srNo: 1,
      category: "Research Collaboration",
      collaboratingInstitute: "MIT, USA",
      nameOfCollaborator: "Dr. John Smith",
      qsTheRanking: "1",
      address: "Cambridge, MA, USA",
      details: "Joint research on quantum computing",
      collaborationOutcome: "3 joint publications",
      status: "Active",
      startingDate: "2023-02-28",
      duration: "36",
      level: "International",
      noOfBeneficiary: "25",
      mouSigned: "Yes",
      signingDate: "2023-02-25",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  visits: [
    {
      id: 1,
      srNo: 1,
      instituteVisited: "Stanford University",
      durationOfVisit: "30",
      role: "Visiting Researcher",
      sponsoredBy: "DST",
      remarks: "Collaborative research on AI",
      date: "2023-07-01",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  financial: [
    {
      id: 1,
      srNo: 1,
      nameOfSupport: "SERB Core Research Grant",
      type: "Research Grant",
      supportingAgency: "SERB",
      grantReceived: "2500000",
      detailsOfEvent: "Advanced AI Research Project",
      purposeOfGrant: "Equipment and research activities",
      date: "2023-01-01",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
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
      date: "2023-01-15",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  phd: [
    {
      id: 1,
      srNo: 1,
      regNo: "PHD2020001",
      nameOfStudent: "Priya Sharma",
      dateOfRegistration: "2020-07-01",
      topic: "Deep Learning Applications in Healthcare",
      status: "Ongoing",
      yearOfCompletion: "2024",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  copyrights: [
    {
      id: 1,
      srNo: 1,
      title: "Educational Software for Mathematics",
      referenceNo: "L-12345/2023",
      publicationDate: "2023-08-15",
      link: "https://copyright.gov.in/document123",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
}

const sections = [
  {
    id: "patents",
    title: "Patents",
    icon: Lightbulb,
    columns: [
      "Sr No.",
      "Title",
      "Level",
      "Status",
      "Date",
      "Transfer of Technology with Licence",
      "Earning Generated (Rupees)",
      "Patent Application/Publication/Grant No.",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "policy",
    title: "Policy Documents",
    icon: FileText,
    columns: ["Sr No.", "Title", "Level", "Organisation", "Date", "Supporting Document", "Actions"],
  },
  {
    id: "econtent",
    title: "E-Content",
    icon: Monitor,
    columns: [
      "Sr No.",
      "Title",
      "Type of E-Content Platform",
      "Brief Details",
      "Quadrant",
      "Publishing Date",
      "Publishing Authorities",
      "Link",
      "Type of E Content",
      "Supporting Document",
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
      "Collaborating Institute / Industry",
      "Address",
      "Start Date",
      "Duration(in Months)",
      "Amount(Rs.)",
      "Details / Outcome",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "collaborations",
    title: "Collaborations/MOUs/Linkages",
    icon: UserCheck,
    columns: [
      "Sr No.",
      "Category",
      "Collaborating Institute",
      "Name of Collaborator",
      "QS/THE Ranking",
      "Address",
      "Details",
      "Collaboration Outcome",
      "Status",
      "Starting Date",
      "Duration(months)",
      "Level",
      "No. of Beneficiary",
      "MOU Signed?",
      "Signing Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "visits",
    title: "Academic/Research Visits",
    icon: Plane,
    columns: [
      "Sr No.",
      "Institute/Industry Visited",
      "Duration of Visit(days)",
      "Role",
      "Sponsored By",
      "Remarks",
      "Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "financial",
    title: "Financial Support/Aid",
    icon: IndianRupee,
    columns: [
      "Sr No.",
      "Name Of Support",
      "Type",
      "Supporting Agency",
      "Grant Received",
      "Details Of Event",
      "Purpose Of Grant",
      "Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "jrfSrf",
    title: "JRF/SRF Details",
    icon: Users,
    columns: [
      "Sr No.",
      "Name Of Fellow",
      "Type",
      "Project Title",
      "Duration [in months]",
      "Monthly Stipend",
      "Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "phd",
    title: "PhD Guidance",
    icon: GraduationCap,
    columns: [
      "Sr No.",
      "Reg No",
      "Name of Student",
      "Date of Registration",
      "Topic",
      "Status",
      "Year of Completion",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "copyrights",
    title: "Copyrights",
    icon: Copyright,
    columns: ["Sr No.", "Title", "Reference No.", "Publication Date", "Link", "Supporting Document", "Actions"],
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
  
  const form=useForm();
  const [isExtracting,setIsExtracting]=useState(false);
  
  const [isSubmitting,setIsSubmitting]=useState(false);
  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleDelete = async (sectionId: string, itemId: number) => {
    try {
      // Simulate API/delete logic
      setData((prevData) => ({
        ...prevData,
        [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).filter((item: any) => item.id !== itemId),
      }))

      toast({
        title: "Deleted!",
        description: "Item deleted successfully.",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while deleting the item.",
        variant: "destructive",
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
      [editingItem.sectionId]: (prevData[editingItem.sectionId as keyof typeof prevData] || []).map((item: any) =>
        item.id === editingItem.id ? { ...item, ...formData } : item,
      ),
    }))

    setIsEditDialogOpen(false)
    setEditingItem(null)
    setFormData({})
    setSelectedFiles(null)
    form.reset();
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
        [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).map((item: any) =>
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
              <Badge variant={item.status === "Granted" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.transferOfTechnology === "Yes" ? "default" : "secondary"}>
                {item.transferOfTechnology}
              </Badge>
            </TableCell>
            <TableCell>₹ {Number.parseInt(item.earningGenerated || "0").toLocaleString()}</TableCell>
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
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      case "econtent":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.typeOfEContentPlatform}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.briefDetails}>
                {item.briefDetails}
              </div>
            </TableCell>
            <TableCell>{item.quadrant}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publishingDate}</span>
              </div>
            </TableCell>
            <TableCell>{item.publishingAuthorities}</TableCell>
            <TableCell>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Link
                </a>
              )}
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
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.startDate}</span>
              </div>
            </TableCell>
            <TableCell>{item.duration} months</TableCell>
            <TableCell>₹ {Number.parseInt(item.amount).toLocaleString()}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.detailsOutcome}>
                {item.detailsOutcome}
              </div>
            </TableCell>
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
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.details}>
                {item.details}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.collaborationOutcome}>
                {item.collaborationOutcome}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.startingDate}</span>
              </div>
            </TableCell>
            <TableCell>{item.duration} months</TableCell>
            <TableCell>{item.level}</TableCell>
            <TableCell>{item.noOfBeneficiary}</TableCell>
            <TableCell>
              <Badge variant={item.mouSigned === "Yes" ? "default" : "secondary"}>{item.mouSigned}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.signingDate}</span>
              </div>
            </TableCell>
          </>
        )
      case "visits":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.instituteVisited}</TableCell>
            <TableCell>{item.durationOfVisit} days</TableCell>
            <TableCell>{item.role}</TableCell>
            <TableCell>{item.sponsoredBy}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.remarks}>
                {item.remarks}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      case "financial":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfSupport}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.supportingAgency}</TableCell>
            <TableCell>₹ {Number.parseInt(item.grantReceived).toLocaleString()}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.detailsOfEvent}>
                {item.detailsOfEvent}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.purposeOfGrant}>
                {item.purposeOfGrant}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      case "jrfSrf":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfFellow}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.type}</Badge>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.projectTitle}>
                {item.projectTitle}
              </div>
            </TableCell>
            <TableCell>{item.duration} months</TableCell>
            <TableCell>₹ {Number.parseInt(item.monthlyStipend).toLocaleString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      case "phd":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell>{item.regNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfStudent}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.dateOfRegistration}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.topic}>
                {item.topic}
              </div>
            </TableCell>
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
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publicationDate}</span>
              </div>
            </TableCell>
            <TableCell>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Link
                </a>
              )}
            </TableCell>
          </>
        )
        default:
          return null
        }
      }

  const handleExtractInfo = async () => {
          if (!selectedFiles || selectedFiles.length === 0) {
            toast({
              title: "Error",
              description: "Please upload a document first.",
              variant: "destructive",
            })
            return
          }
      
          setIsExtracting(true)
          try {
            const res = await fetch("/api/llm/get-category", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: activeTab }),
            })
            const { category } = await res.json()
      
            const res2 = await fetch("/api/llm/get-formfields", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category, type: activeTab }),
            })
            const { data, success, extracted_fields, confidence } = await res2.json()
      
            if (success) {
              Object.entries(data).forEach(([key, value]) => {
                form.setValue(key, value)
              })
      
              toast({
                title: "Success",
                description: `Form auto-filled with ${extracted_fields} fields (${Math.round(
                  confidence * 100
                )}% confidence)`,
              })
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to auto-fill form.",
              variant: "destructive",
            })
          } finally {
            setIsExtracting(false)
          }
        }
      
  const handleSubmit = async (data: any) => {
          setIsSubmitting(true)
          try {
            await new Promise((res) => setTimeout(res, 1000))
            toast({
              title: "Success",
              description: "Patent added successfully!",
            })
            router.push("/teacher/research-contributions?tab=patents")
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to add patent.",
              variant: "destructive",
            })
          } finally {
            setIsSubmitting(false)
                    
            setSelectedFiles(null)
            form.reset();
          }
        }

      
      
  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}    
        
    switch (sectionId) {
      case "patents":
      
        return (
          <PatentForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
          />
        )
      case "policy":
       return (
          <PolicyForm
          form={form}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isExtracting = {isExtracting}
          selectedFiles = {selectedFiles}
          handleFileSelect={handleFileSelect}
          handleExtractInfo={handleExtractInfo}
          isEdit={true}
          editData={currentData}
        />
       );
      case "econtent":
        return (
          <EContentForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting = {isExtracting}
            selectedFiles = {selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
          />
        )
      case "consultancy":
        return (
          <ConsultancyForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting = {isExtracting}
            selectedFiles = {selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
        />
        )
      case "collaborations":
        return (
          <CollaborationForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting = {isExtracting}
            selectedFiles = {selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}/>
          )
      case "visits":
        return (
          <AcademicVisitForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting = {isExtracting}
            selectedFiles = {selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}/>
          )
      case "financial":
        return (
          <FinancialForm
          form={form}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isExtracting = {isExtracting}
          selectedFiles = {selectedFiles}
          handleFileSelect={handleFileSelect}
          handleExtractInfo={handleExtractInfo}
          isEdit={true}
          editData={currentData}/>
        )
      case "jrfSrf":
        return (
            <JrfSrfForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isExtracting = {isExtracting}
              selectedFiles = {selectedFiles}
              handleFileSelect={handleFileSelect}
              handleExtractInfo={handleExtractInfo}
              isEdit={true}
              editData={currentData}/>
        )
      case "phd":
        return (
          <PhdGuidanceForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isExtracting = {isExtracting}
              selectedFiles = {selectedFiles}
              handleFileSelect={handleFileSelect}
              handleExtractInfo={handleExtractInfo}
              isEdit={true}
              editData={currentData}/>
        )
      case "copyrights":
        return (
          <CopyrightForm
          form={form}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isExtracting = {isExtracting}
          selectedFiles = {selectedFiles}
          handleFileSelect={handleFileSelect}
          handleExtractInfo={handleExtractInfo}
          isEdit={true}
          editData={currentData}/>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research & Academic Contributions</h1>
        <p className="text-muted-foreground">Manage your research contributions, patents, and academic activities</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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
                        router.push("/teacher/research-contributions/patents/add")
                        break
                      case "policy":
                        router.push("/teacher/research-contributions/policy/add")
                        break
                      case "econtent":
                        router.push("/teacher/research-contributions/econtent/add")
                        break
                      case "consultancy":
                        router.push("/teacher/research-contributions/consultancy/add")
                        break
                      case "collaborations":
                        router.push("/teacher/research-contributions/collaborations/add")
                        break
                      case "visits":
                        router.push("/teacher/research-contributions/visits/add")
                        break
                      case "financial":
                        router.push("/teacher/research-contributions/financial/add")
                        break
                      case "jrfSrf":
                        router.push("/teacher/research-contributions/jrf-srf/add")
                        break
                      case "phd":
                        router.push("/teacher/research-contributions/phd/add")
                        break
                      case "copyrights":
                        router.push("/teacher/research-contributions/copyrights/add")
                        break
                      default:
                        router.push("/teacher/research-contributions")
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
                      {!data[section.id as keyof typeof data] ||
                        data[section.id as keyof typeof data].length === 0 ? (
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
                                {item.supportingDocument && item.supportingDocument.length > 0 ? (
                                  <>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" title="View Document">
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent
                                        className="w-[90vw] max-w-4xl h-[80vh] p-0 overflow-hidden"
                                        style={{ display: "flex", flexDirection: "column" }}
                                      >
                                        <DialogHeader className="p-4 border-b">
                                          <DialogTitle>View Document</DialogTitle>
                                        </DialogHeader>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                          <div className="w-full h-full">
                                            <DocumentViewer
                                              documentUrl={item.supportingDocument[0]}
                                              documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Badge variant="outline" className="text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
                                  </>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" title="Upload Document">
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
                                )}
                              </div>
                            </TableCell>



                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <ConfirmDeleteModal
                                  itemName={item.title} // or whatever field you want
                                  trigger={<Button variant="ghost" size="sm" >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>}
                                  onConfirm={() => handleDelete(section.id, item.id)}
                                />
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
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] pr-2">
            {editingItem && renderForm(editingItem.sectionId, true)}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Update {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
