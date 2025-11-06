"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/api/auth/auth-provider"
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
  Loader2,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal"
import { PatentForm } from "@/components/forms/PatentForm"
import { useForm } from "react-hook-form"
import { useDropDowns } from "@/hooks/use-dropdowns"
import PolicyForm from "@/components/forms/PolicyForm"
import { EContentForm } from "@/components/forms/EcontentForm"
import { ConsultancyForm } from "@/components/forms/ConsultancyForm"
import { CollaborationForm } from "@/components/forms/CollaborationForm"
import { AcademicVisitForm } from "@/components/forms/AcademicVisitForm"
import { FinancialForm } from "@/components/forms/FinancialFom"
import { JrfSrfForm } from "@/components/forms/JrfSrfForm"
import { PhdGuidanceForm } from "@/components/forms/PhdGuidanceForm"
import { CopyrightForm } from "@/components/forms/CopyrightForm"
import { PatentFormProps } from "@/types/interfaces"

// Initial data structure
const initialData = {
  patents: [],
  policy: [],
  econtent: [],
  consultancy: [],
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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("patents")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [data, setData] = useState(initialData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  const form=useForm();
  const [isExtracting,setIsExtracting]=useState(false);
  
  const [isSubmitting,setIsSubmitting]=useState(false);
  
  // Fetch dropdowns at page level
  const { resPubLevelOptions, patentStatusOptions, eContentTypeOptions, typeEcontentValueOptions, fetchResPubLevels, fetchPatentStatuses, fetchEContentTypes, fetchTypeEcontentValues } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (resPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
    if (patentStatusOptions.length === 0) {
      fetchPatentStatuses()
    }
    if (eContentTypeOptions.length === 0) {
      fetchEContentTypes()
    }
    if (typeEcontentValueOptions.length === 0) {
      fetchTypeEcontentValues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Fetch patents, policy, e-content, and consultancy data
  useEffect(() => {
    if (user?.role_id) {
      fetchPatents()
      fetchPolicies()
      fetchEContent()
      fetchConsultancy()
    }
  }, [user?.role_id])


  const fetchPatents = async () => {
    if (!user?.role_id) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/teacher/research-contributions/patents?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch patents")
      }

      // Map database fields to UI format
      // Note: SP returns 'name' from Patents_Level (status) and 'Expr2' from Res_Pub_Level (level)
      const mappedPatents = (data.patents || []).map((item: any, index: number) => ({
        id: item.Pid,
        srNo: index + 1,
        title: item.title || "",
        level: item.Expr2 || "", // Res_Pub_Level.name
        levelId: item.level,
        status: item.name || "", // Patents_Level.name
        statusId: item.status,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        Tech_Licence: item.Tech_Licence || "",
        Earnings_Generate: item.Earnings_Generate?.toString() || "",
        PatentApplicationNo: item.PatentApplicationNo || "",
        supportingDocument: item.doc ? [item.doc] : [],
        doc: item.doc,
      }))

      setData((prev) => ({
        ...prev,
        patents: mappedPatents,
      }))
    } catch (error: any) {
      console.error("Error fetching patents:", error)
      toast({
        title: "Error",
        description: "Failed to load patents",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPolicies = async () => {
    if (!user?.role_id) return

    try {
      const res = await fetch(`/api/teacher/research-contributions/policy?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch policy documents")
      }

      // Map database fields to UI format
      const mappedPolicies = (data.policies || []).map((item: any, index: number) => ({
        id: item.Id,
        srNo: index + 1,
        title: item.Title || "",
        level: item.Level || "",
        levelId: null, // Will be resolved from level name using resPubLevelOptions
        organisation: item.Organisation || "",
        date: item.Date ? new Date(item.Date).toISOString().split('T')[0] : "",
        supportingDocument: item.Doc ? [item.Doc] : [],
        doc: item.Doc,
      }))

      // Resolve level IDs from level names (use current resPubLevelOptions state)
      setData((prev) => {
        const policiesWithLevelIds = mappedPolicies.map((policy: any) => {
          const levelOption = resPubLevelOptions.find(l => l.name === policy.level)
          return {
            ...policy,
            levelId: levelOption ? levelOption.id : null,
          }
        })
        return {
          ...prev,
          policy: policiesWithLevelIds,
        }
      })
    } catch (error: any) {
      console.error("Error fetching policy documents:", error)
      toast({
        title: "Error",
        description: "Failed to load policy documents",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const fetchEContent = async () => {
    if (!user?.role_id) return

    try {
      const res = await fetch(`/api/teacher/research-contributions/e-content?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch e-content")
      }

      // Map database fields to UI format
      // Note: SP returns 'EcontentTypeName' from type_econtent_value.name and 'Econtent_PlatformName' from e_content_type.name
      const mappedEContent = (data.eContent || []).map((item: any, index: number) => ({
        id: item.Eid,
        srNo: index + 1,
        title: item.title || "",
        Brief_Details: item.Brief_Details || "",
        Quadrant: item.Quadrant,
        Publishing_date: item.Publishing_date ? new Date(item.Publishing_date).toISOString().split('T')[0] : "",
        Publishing_Authorities: item.Publishing_Authorities || "",
        link: item.link || "",
        type_econtent: item.type_econtent,
        type_econtent_name: item.EcontentTypeName || "", // type_econtent_value.name
        e_content_type: item.e_content_type,
        e_content_type_name: item.Econtent_PlatformName || "", // e_content_type.name
        supportingDocument: item.doc ? [item.doc] : [],
        doc: item.doc,
      }))

      setData((prev) => ({
        ...prev,
        econtent: mappedEContent,
      }))
    } catch (error: any) {
      console.error("Error fetching e-content:", error)
      toast({
        title: "Error",
        description: "Failed to load e-content",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const fetchConsultancy = async () => {
    if (!user?.role_id) return

    try {
      const res = await fetch(`/api/teacher/research-contributions/consultancy?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch consultancy records")
      }

      // Map database fields to UI format
      const mappedConsultancy = (data.consultancies || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        title: item.name || "",
        name: item.name || "",
        collaborating_inst: item.collaborating_inst || "",
        collaboratingInstitute: item.collaborating_inst || "",
        address: item.address || "",
        Start_Date: item.Start_Date ? new Date(item.Start_Date).toISOString().split('T')[0] : "",
        startDate: item.Start_Date ? new Date(item.Start_Date).toISOString().split('T')[0] : "",
        duration: item.duration || null,
        amount: item.amount || "",
        outcome: item.outcome || "",
        detailsOutcome: item.outcome || "",
        supportingDocument: item.doc ? [item.doc] : [],
        doc: item.doc,
      }))

      setData((prev) => ({
        ...prev,
        consultancy: mappedConsultancy,
      }))
    } catch (error: any) {
      console.error("Error fetching consultancy records:", error)
      toast({
        title: "Error",
        description: "Failed to load consultancy records",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

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
      if (sectionId === "patents") {
        const res = await fetch(`/api/teacher/research-contributions/patents?patentId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete patent")
        }

        toast({
          title: "Success",
          description: "Patent deleted successfully!",
          duration: 3000,
        })

        // Refresh data
        await fetchPatents()
      } else if (sectionId === "policy") {
        const res = await fetch(`/api/teacher/research-contributions/policy?policyId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete policy document")
        }

        toast({
          title: "Success",
          description: "Policy document deleted successfully!",
          duration: 3000,
        })

        // Refresh data
        await fetchPolicies()
      } else if (sectionId === "econtent") {
        const res = await fetch(`/api/teacher/research-contributions/e-content?eContentId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete e-content")
        }

        toast({
          title: "Success",
          description: "E-Content deleted successfully!",
          duration: 3000,
        })

        // Refresh data
        await fetchEContent()
      } else if (sectionId === "consultancy") {
        const res = await fetch(`/api/teacher/research-contributions/consultancy?consultancyId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete consultancy record")
        }

        toast({
          title: "Success",
          description: "Consultancy record deleted successfully!",
          duration: 3000,
        })

        // Refresh data
        await fetchConsultancy()
      } else {
        // For other sections, use the old logic
        setData((prevData) => ({
          ...prevData,
          [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).filter((item: any) => item.id !== itemId),
        }))

        toast({
          title: "Success",
          description: "Item deleted successfully.",
          duration: 3000,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while deleting the item.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }


  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    setFormData({ ...item })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async (data?: any) => {
    if (!editingItem) {
      toast({
        title: "Error",
        description: "No item selected for editing.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User information not available. Please refresh the page.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Use form data if provided, otherwise use formData state
    const submitData = data || formData

    if (editingItem.sectionId === "patents") {
      setIsSubmitting(true)
      try {
        // Handle dummy document upload if files are selected
        let docUrl = editingItem.doc
        if (selectedFiles && selectedFiles.length > 0) {
          docUrl = `https://dummy-document-url-${Date.now()}.pdf`
        }

        // Ensure all required fields are present
        const patentData = {
          title: submitData.title || editingItem.title,
          level: submitData.level || editingItem.levelId,
          status: submitData.status || editingItem.statusId,
          date: submitData.date || editingItem.date,
          Tech_Licence: submitData.Tech_Licence || editingItem.Tech_Licence || "",
          Earnings_Generate: submitData.Earnings_Generate ? Number(submitData.Earnings_Generate) : (editingItem.Earnings_Generate ? Number(editingItem.Earnings_Generate) : null),
          PatentApplicationNo: submitData.PatentApplicationNo || editingItem.PatentApplicationNo || "",
          doc: docUrl || editingItem.doc || null,
        }

        const res = await fetch("/api/teacher/research-contributions/patents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patentId: editingItem.id,
            teacherId: user.role_id,
            patent: patentData,
          }),
        })

        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update patent")
        }
        toast({
          title: "Success",
          description: "Patent updated successfully!",
          duration: 3000,
        })

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        setSelectedFiles(null)
        form.reset()

        // Refresh data
        await fetchPatents()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update patent. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "policy") {
      setIsSubmitting(true)
      try {
        // Handle dummy document upload if files are selected
        let docUrl = editingItem.doc
        if (selectedFiles && selectedFiles.length > 0) {
          docUrl = `https://dummy-document-url-${Date.now()}.pdf`
        }

        // Get level name from levelId if levelId is provided, otherwise use level string
        let levelName = submitData.level || editingItem.level
        if (submitData.level && typeof submitData.level === 'number') {
          const levelOption = resPubLevelOptions.find(l => l.id === submitData.level)
          levelName = levelOption ? levelOption.name : editingItem.level
        } else if (editingItem.levelId) {
          const levelOption = resPubLevelOptions.find(l => l.id === editingItem.levelId)
          levelName = levelOption ? levelOption.name : editingItem.level
        }

        // Ensure all required fields are present
        const policyData = {
          title: submitData.title || editingItem.title,
          level: levelName,
          organisation: submitData.organisation || editingItem.organisation,
          date: submitData.date || editingItem.date,
          doc: docUrl || editingItem.doc || null,
        }

        const res = await fetch("/api/teacher/research-contributions/policy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            policyId: editingItem.id,
            teacherId: user.role_id,
            policy: policyData,
          }),
        })

        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update policy document")
        }

        toast({
          title: "Success",
          description: "Policy document updated successfully!",
          duration: 3000,
        })

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        setSelectedFiles(null)
        form.reset()

        // Refresh data
        await fetchPolicies()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update policy document. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "econtent") {
      setIsSubmitting(true)
      try {
        // Handle dummy document upload if files are selected
        let docUrl = editingItem.doc
        if (selectedFiles && selectedFiles.length > 0) {
          docUrl = `https://dummy-document-url-${Date.now()}.pdf`
        }

        // Ensure all required fields are present
        const eContentData = {
          title: submitData.title || editingItem.title,
          Brief_Details: submitData.briefDetails || editingItem.Brief_Details,
          Quadrant: submitData.quadrant ? Number(submitData.quadrant) : editingItem.Quadrant,
          Publishing_date: submitData.publishingDate || editingItem.Publishing_date,
          Publishing_Authorities: submitData.publishingAuthorities || editingItem.Publishing_Authorities,
          link: submitData.link || editingItem.link || null,
          type_econtent: submitData.typeOfEContent ? Number(submitData.typeOfEContent) : (editingItem.type_econtent || null),
          e_content_type: submitData.typeOfEContentPlatform ? Number(submitData.typeOfEContentPlatform) : (editingItem.e_content_type || null),
          doc: docUrl || editingItem.doc || null,
        }

        const res = await fetch("/api/teacher/research-contributions/e-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eContentId: editingItem.id,
            teacherId: user.role_id,
            eContent: eContentData,
          }),
        })

        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update e-content")
        }

        toast({
          title: "Success",
          description: "E-Content updated successfully!",
          duration: 3000,
        })

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        setSelectedFiles(null)
        form.reset()

        // Refresh data
        await fetchEContent()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update e-content. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "consultancy") {
      setIsSubmitting(true)
      try {
        // Handle dummy document upload if files are selected
        let docUrl = editingItem.doc
        if (selectedFiles && selectedFiles.length > 0) {
          docUrl = `https://dummy-document-url-${Date.now()}.pdf`
        }

        // Ensure all required fields are present
        const consultancyData = {
          name: submitData.title || editingItem.name || editingItem.title,
          collaborating_inst: submitData.collaboratingInstitute || editingItem.collaborating_inst || editingItem.collaboratingInstitute,
          address: submitData.address || editingItem.address,
          duration: submitData.duration ? Number(submitData.duration) : (editingItem.duration || null),
          amount: submitData.amount ? submitData.amount.toString() : (editingItem.amount || null),
          submit_date: new Date().toISOString().split('T')[0], // Current date
          Start_Date: submitData.startDate || editingItem.Start_Date || editingItem.startDate,
          outcome: submitData.detailsOutcome || editingItem.outcome || editingItem.detailsOutcome || null,
          doc: docUrl || editingItem.doc || null,
        }

        const res = await fetch("/api/teacher/research-contributions/consultancy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultancyId: editingItem.id,
            teacherId: user.role_id,
            consultancy: consultancyData,
          }),
        })

        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update consultancy record")
        }

        toast({
          title: "Success",
          description: "Consultancy record updated successfully!",
          duration: 3000,
        })

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        setSelectedFiles(null)
        form.reset()

        // Refresh data
        await fetchConsultancy()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update consultancy record. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // For other sections, use the old logic
      setData((prevData) => ({
        ...prevData,
        [editingItem.sectionId]: (prevData[editingItem.sectionId as keyof typeof prevData] || []).map((item: any) =>
          item.id === editingItem.id ? { ...item, ...submitData } : item,
        ),
      }))

      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setSelectedFiles(null)
      form.reset()
      
      toast({
        title: "Success",
        description: "Item updated successfully!",
        duration: 3000,
      })
    }
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
        title: "Success",
        description: "Supporting documents uploaded successfully!",
        duration: 3000,
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
              <Badge variant={item.status?.toLowerCase() === "granted" ? "default" : "secondary"}>{item.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.Tech_Licence ? "default" : "secondary"}>
                {item.Tech_Licence || "No"}
              </Badge>
            </TableCell>
            <TableCell>₹ {Number.parseInt(item.Earnings_Generate || "0").toLocaleString()}</TableCell>
            <TableCell>{item.PatentApplicationNo}</TableCell>
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
            <TableCell>{item.e_content_type_name || ""}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.Brief_Details}>
                {item.Brief_Details}
              </div>
            </TableCell>
            <TableCell>{item.Quadrant}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.Publishing_date}</span>
              </div>
            </TableCell>
            <TableCell>{item.Publishing_Authorities}</TableCell>
            <TableCell>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Link
                </a>
              )}
            </TableCell>
            <TableCell>{item.type_econtent_name || ""}</TableCell>
          </>
        )
      case "consultancy":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title || item.name}</TableCell>
            <TableCell>{item.collaboratingInstitute || item.collaborating_inst}</TableCell>
            <TableCell>{item.address}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.startDate || item.Start_Date}</span>
              </div>
            </TableCell>
            <TableCell>{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell>{item.amount ? `₹ ${Number(item.amount).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.detailsOutcome || item.outcome}>
                {item.detailsOutcome || item.outcome || "-"}
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
              duration: 3000,
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
                duration: 3000,
              })
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to auto-fill form.",
              variant: "destructive",
              duration: 3000,
            })
          } finally {
            setIsExtracting(false)
          }
        }
      
  // This handleSubmit is only used for the edit dialog form submission
  // For add page, use the handleSubmit in patents/add/page.tsx
  const handleSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User information not available. Please refresh the page.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Handle dummy document upload
      let docUrl = null
      if (selectedFiles && selectedFiles.length > 0) {
        docUrl = `https://dummy-document-url-${Date.now()}.pdf`
      }

      const patentData = {
        title: data.title,
        level: data.level,
        status: data.status,
        date: data.date,
        Tech_Licence: data.Tech_Licence || "",
        Earnings_Generate: data.Earnings_Generate ? Number(data.Earnings_Generate) : null,
        PatentApplicationNo: data.PatentApplicationNo || "",
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/patents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          patent: patentData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add patent")
      }

      toast({
        title: "Success",
        description: "Patent added successfully!",
        duration: 3000,
      })
      
      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=patents")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add patent. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      setSelectedFiles(null)
      form.reset()
    }
  }

      
      
  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}    
        
    switch (sectionId) {
      case "patents":
        return (
          <PatentForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
            patentStatusOptions={patentStatusOptions}
          />
        )
      case "policy":
        return (
          <PolicyForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
          />
        )
      case "econtent":
        return (
          <EContentForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            eContentTypeOptions={eContentTypeOptions}
            typeEcontentValueOptions={typeEcontentValueOptions}
          />
        )
      case "consultancy":
        return (
          <ConsultancyForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
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
                      {isLoading && section.id === "patents" ? (
                        <TableRow>
                          <TableCell
                            colSpan={section.columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : !data[section.id as keyof typeof data] ||
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
            <Button 
              onClick={async () => {
                if (editingItem?.sectionId === "patents" || editingItem?.sectionId === "policy" || editingItem?.sectionId === "econtent" || editingItem?.sectionId === "consultancy") {
                  // Use form.handleSubmit to trigger validation and get form data
                  form.handleSubmit(handleSaveEdit)()
                } else {
                  handleSaveEdit()
                }
              }}
              disabled={isSubmitting}
              className="transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
