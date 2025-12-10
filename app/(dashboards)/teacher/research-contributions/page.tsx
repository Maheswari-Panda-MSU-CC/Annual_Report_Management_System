"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useNavigationWithLoading } from "@/hooks/use-navigation-with-loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import type { ColumnDef } from "@tanstack/react-table"
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
import { SECTION_ROUTES, API_ENDPOINTS, type SectionId } from "./utils/research-contributions-config"
import { createUpdateMapper, UPDATE_REQUEST_BODIES, UPDATE_SUCCESS_MESSAGES } from "./utils/update-mappers"
import { 
  useTeacherPatents, 
  useTeacherPolicy, 
  useTeacherEContent, 
  useTeacherConsultancy, 
  useTeacherCollaborations, 
  useTeacherVisits, 
  useTeacherFinancial, 
  useTeacherJrfSrf, 
  useTeacherPhd, 
  useTeacherCopyrights 
} from "@/hooks/use-teacher-research-contributions-data"
import { 
  usePatentMutations, 
  usePolicyMutations, 
  useEContentMutations, 
  useConsultancyMutations, 
  useCollaborationMutations, 
  useVisitMutations, 
  useFinancialMutations, 
  useJrfSrfMutations, 
  usePhdMutations, 
  useCopyrightMutations 
} from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"

// Initial data structure
const initialData = {
  patents: [],
  policy: [],
  econtent: [],
  consultancy: [],
  collaborations: [],
  visits: [],
  financial: [],
  jrfSrf: [],
  phd: [],
  copyrights: [],
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
  // Track which sections have been fetched to enable lazy loading
  const [fetchedSections, setFetchedSections] = useState<Set<string>>(new Set(["patents"]))
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()
  const { navigate, isPending: isNavigating } = useNavigationWithLoading()
  
  const form=useForm();
  const { setValue, watch, reset } = form
  const [isExtracting,setIsExtracting]=useState(false);
  
  const [isSubmitting,setIsSubmitting]=useState(false);
  
  // Document analysis context
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  
  // Dropdowns - already available from Context, no need to fetch
  const { 
    resPubLevelOptions, 
    patentStatusOptions, 
    eContentTypeOptions, 
    typeEcontentValueOptions,
    collaborationsLevelOptions,
    collaborationsOutcomeOptions,
    collaborationsTypeOptions,
    academicVisitRoleOptions,
    financialSupportTypeOptions,
    jrfSrfTypeOptions,
    phdGuidanceStatusOptions,
  } = useDropDowns()
  
  // Auto-fill hook for edit modal - dynamically set form type based on editing item
  const getFormTypeFromSectionId = (sectionId: string): string => {
    const formTypeMap: Record<string, string> = {
      patents: "patents",
      policy: "policy",
      econtent: "econtent",
      consultancy: "consultancy",
      collaborations: "collaborations",
      visits: "visits",
      financial: "financial",
      jrfSrf: "jrf-srf", // Note: sectionId is "jrfSrf" but formType is "jrf-srf"
      phd: "phd",
      copyrights: "copyrights",
    }
    return formTypeMap[sectionId] || ""
  }
  
  // Get dropdown options based on section
  const getDropdownOptions = (sectionId: string): { [fieldName: string]: Array<{ id: number | string; name: string }> } => {
    switch (sectionId) {
      case "patents":
        return { level: resPubLevelOptions, status: patentStatusOptions }
      case "policy":
        return { level: resPubLevelOptions }
      case "econtent":
        return { type: eContentTypeOptions, typeEcontentValue: typeEcontentValueOptions }
      case "collaborations":
        return { level: collaborationsLevelOptions, outcome: collaborationsOutcomeOptions, type: collaborationsTypeOptions }
      case "visits":
        return { role: academicVisitRoleOptions }
      case "financial":
        return { type: financialSupportTypeOptions }
      case "jrfSrf":
        return { type: jrfSrfTypeOptions }
      case "phd":
        return { status: phdGuidanceStatusOptions }
      default:
        return {}
    }
  }
  
  // Auto-fill hook for edit modal - only active when editing
  const formType = editingItem ? getFormTypeFromSectionId(editingItem.sectionId) : ""
  const { 
    documentUrl: autoFillDocumentUrl, 
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType,
    dropdownOptions: editingItem ? getDropdownOptions(editingItem.sectionId) : {},
    onlyFillEmpty: false, // REPLACE existing data in edit mode
    getFormValues: () => watch(),
    onAutoFill: (fields) => {
      // Auto-fill form fields - replace existing data
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          setValue(key, value)
        }
      })
      
      // Show toast notification
      const filledCount = Object.keys(fields).filter(
        k => fields[k] !== null && fields[k] !== undefined && fields[k] !== ""
      ).length
      if (filledCount > 0) {
        toast({
          title: "Form Updated",
          description: `${filledCount} field(s) replaced with new extracted data`,
        })
      }
    },
    clearAfterUse: false,
  })
  
  // Cancel handler for edit modal - custom implementation for modal
  const { confirm, DialogComponent: CancelDialog } = useConfirmationDialog()
  const cancelHandlerRef = useRef(false) // Track if cancel is being processed
  
  const handleModalCancel = async (event?: React.MouseEvent) => {
    // Prevent trigger from toast dismissals or other non-button interactions
    if (event) {
      const target = event.target as HTMLElement
      // Check if click is from toast or its children
      if (target.closest('[data-sonner-toast]') || target.closest('[role="status"]') || target.closest('.toast')) {
        return false
      }
    }
    
    // Prevent multiple simultaneous calls
    if (cancelHandlerRef.current) {
      return false
    }
    
    cancelHandlerRef.current = true
    
    try {
      const isDirty = form.formState.isDirty
      const formValues = form.getValues()
      // Check for document in Pdf field, supportingDocument field, or Image field
      const hasDocument = formValues.Pdf || formValues.supportingDocument?.[0] || formValues.Image || false
      const hasUnsavedChanges = isDirty || hasDocument || hasDocumentData
      
      // Show dialog if there are unsaved changes
      if (hasUnsavedChanges) {
        const shouldLeave = await confirm({
          title: "Discard Changes?",
          description: "Are you sure to discard the unsaved changes?",
          confirmText: "Discard",
          cancelText: "Cancel",
        })
        if (!shouldLeave) {
          return false  // User cancelled - don't close modal
        }
      }
      
      // Cleanup and close modal
      form.reset()
      clearDocumentData()
      clearAutoFillData()
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setSelectedFiles(null)
      return true
    } finally {
      // Reset the ref after a short delay to allow for async operations
      setTimeout(() => {
        cancelHandlerRef.current = false
      }, 100)
    }
  }
  
  // Handle dialog close attempt - prevent close if user cancels confirmation
  const handleDialogClose = (open: boolean) => {
    if (!open && isEditDialogOpen) {
      // Check if the active element is a toast or toast-related element
      // This prevents toast dismissals from triggering dialog close
      const activeElement = document.activeElement
      const isToastElement = activeElement?.closest('[data-sonner-toast]') || 
                            activeElement?.closest('[role="status"]') ||
                            activeElement?.closest('.toast') ||
                            activeElement?.closest('[data-radix-toast-viewport]')
      
      if (isToastElement) {
        // Don't close dialog if click is on toast
        return
      }
      
      // Dialog is trying to close - check for unsaved changes
      handleModalCancel().then((shouldClose) => {
        // If user confirmed or no unsaved changes, dialog will be closed by handleModalCancel
        // If user cancelled, we need to keep dialog open (state won't change)
        if (!shouldClose) {
          // Force dialog to stay open by setting state back to true
          // This is a workaround since Dialog's onOpenChange doesn't support preventing close
          setTimeout(() => {
            setIsEditDialogOpen(true)
          }, 0)
        }
      })
      return // Don't update state here - let handleModalCancel handle it
    }
    setIsEditDialogOpen(open)
  }
  
  // Clear fields handler
  const handleClearFields = () => {
    reset()
  }
  
  // React Query hooks for data fetching - LAZY LOADING: Only fetch active tab and previously fetched tabs
  const patentsQuery = useTeacherPatents(resPubLevelOptions, { 
    enabled: activeTab === 'patents' || fetchedSections.has('patents') 
  })
  const policyQuery = useTeacherPolicy(resPubLevelOptions, { 
    enabled: activeTab === 'policy' || fetchedSections.has('policy') 
  })
  const econtentQuery = useTeacherEContent({ 
    enabled: activeTab === 'econtent' || fetchedSections.has('econtent') 
  })
  const consultancyQuery = useTeacherConsultancy({ 
    enabled: activeTab === 'consultancy' || fetchedSections.has('consultancy') 
  })
  const collaborationsQuery = useTeacherCollaborations({ 
    enabled: activeTab === 'collaborations' || fetchedSections.has('collaborations') 
  })
  const visitsQuery = useTeacherVisits({ 
    enabled: activeTab === 'visits' || fetchedSections.has('visits') 
  })
  const financialQuery = useTeacherFinancial({ 
    enabled: activeTab === 'financial' || fetchedSections.has('financial') 
  })
  const jrfSrfQuery = useTeacherJrfSrf({ 
    enabled: activeTab === 'jrfSrf' || fetchedSections.has('jrfSrf') 
  })
  const phdQuery = useTeacherPhd({ 
    enabled: activeTab === 'phd' || fetchedSections.has('phd') 
  })
  const copyrightsQuery = useTeacherCopyrights({ 
    enabled: activeTab === 'copyrights' || fetchedSections.has('copyrights') 
  })

  // Mutations for delete operations
  const { delete: deletePatent } = usePatentMutations()
  const { delete: deletePolicy } = usePolicyMutations()
  const { delete: deleteEContent } = useEContentMutations()
  const { delete: deleteConsultancy } = useConsultancyMutations()
  const { delete: deleteCollaboration } = useCollaborationMutations()
  const { delete: deleteVisit } = useVisitMutations()
  const { delete: deleteFinancial } = useFinancialMutations()
  const { delete: deleteJrfSrf } = useJrfSrfMutations()
  const { delete: deletePhd } = usePhdMutations()
  const { delete: deleteCopyright } = useCopyrightMutations()

  // Mutations for update operations
  const { update: updatePatent } = usePatentMutations()
  const { update: updatePolicy } = usePolicyMutations()
  const { update: updateEContent } = useEContentMutations()
  const { update: updateConsultancy } = useConsultancyMutations()
  const { update: updateCollaboration } = useCollaborationMutations()
  const { update: updateVisit } = useVisitMutations()
  const { update: updateFinancial } = useFinancialMutations()
  const { update: updateJrfSrf } = useJrfSrfMutations()
  const { update: updatePhd } = usePhdMutations()
  const { update: updateCopyright } = useCopyrightMutations()

  // Map React Query data to UI format using useMemo
  const mappedData = useMemo(() => {
    return {
      patents: patentsQuery.data || [],
      policy: policyQuery.data || [],
      econtent: econtentQuery.data || [],
      consultancy: consultancyQuery.data || [],
      collaborations: collaborationsQuery.data || [],
      visits: visitsQuery.data || [],
      financial: financialQuery.data || [],
      jrfSrf: jrfSrfQuery.data || [],
      phd: phdQuery.data || [],
      copyrights: copyrightsQuery.data || [],
    }
  }, [
    patentsQuery.data,
    policyQuery.data,
    econtentQuery.data,
    consultancyQuery.data,
    collaborationsQuery.data,
    visitsQuery.data,
    financialQuery.data,
    jrfSrfQuery.data,
    phdQuery.data,
    copyrightsQuery.data,
  ])

  // Use mapped data instead of state
  const data = mappedData

  // Loading states from React Query
  const loadingStates = useMemo(() => ({
    patents: patentsQuery.isLoading,
    policy: policyQuery.isLoading,
    econtent: econtentQuery.isLoading,
    consultancy: consultancyQuery.isLoading,
    collaborations: collaborationsQuery.isLoading,
    visits: visitsQuery.isLoading,
    financial: financialQuery.isLoading,
    jrfSrf: jrfSrfQuery.isLoading,
    phd: phdQuery.isLoading,
    copyrights: copyrightsQuery.isLoading,
  }), [
    patentsQuery.isLoading,
    policyQuery.isLoading,
    econtentQuery.isLoading,
    consultancyQuery.isLoading,
    collaborationsQuery.isLoading,
    visitsQuery.isLoading,
    financialQuery.isLoading,
    jrfSrfQuery.isLoading,
    phdQuery.isLoading,
    copyrightsQuery.isLoading,
  ])
  
  // React Query handles data fetching automatically - no manual fetching needed

  // Handle URL tab parameter on initial load
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
      // Mark the tab from URL as fetched
      setFetchedSections(prev => new Set([...prev, tab]))
    }
  }, [searchParams])

  // Update URL when tab changes - Enable lazy loading for new tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Mark this tab as fetched so data will load
    setFetchedSections(prev => new Set([...prev, value]))
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleDelete = useCallback((sectionId: string, itemId: number) => {
    const section = sectionId as SectionId
    switch (section) {
      case "patents":
        deletePatent.mutate(itemId)
        break
      case "policy":
        deletePolicy.mutate(itemId)
        break
      case "econtent":
        deleteEContent.mutate(itemId)
        break
      case "consultancy":
        deleteConsultancy.mutate(itemId)
        break
      case "collaborations":
        deleteCollaboration.mutate(itemId)
        break
      case "visits":
        deleteVisit.mutate(itemId)
        break
      case "financial":
        deleteFinancial.mutate(itemId)
        break
      case "jrfSrf":
        deleteJrfSrf.mutate(itemId)
        break
      case "phd":
        deletePhd.mutate(itemId)
        break
      case "copyrights":
        deleteCopyright.mutate(itemId)
        break
    }
  }, [deletePatent, deletePolicy, deleteEContent, deleteConsultancy, deleteCollaboration, deleteVisit, deleteFinancial, deleteJrfSrf, deletePhd, deleteCopyright])

  const handleEdit = useCallback((sectionId: string, item: any) => {
    // Clear any previous document data before opening edit modal
    clearDocumentData()
    clearAutoFillData()
    setEditingItem({ ...item, sectionId })
    setFormData({ ...item })
    setIsEditDialogOpen(true)
  }, [clearDocumentData, clearAutoFillData])

  // Update handlers using mutations
  const updateHandlers: Record<SectionId, (id: number, data: any) => void> = {
    patents: (id, data) => updatePatent.mutate({ id, data }),
    policy: (id, data) => updatePolicy.mutate({ id, data }),
    econtent: (id, data) => updateEContent.mutate({ id, data }),
    consultancy: (id, data) => updateConsultancy.mutate({ id, data }),
    collaborations: (id, data) => updateCollaboration.mutate({ id, data }),
    visits: (id, data) => updateVisit.mutate({ id, data }),
    financial: (id, data) => updateFinancial.mutate({ id, data }),
    jrfSrf: (id, data) => updateJrfSrf.mutate({ id, data }),
    phd: (id, data) => updatePhd.mutate({ id, data }),
    copyrights: (id, data) => updateCopyright.mutate({ id, data }),
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

    const submitData = data || formData
    const sectionId = editingItem.sectionId as SectionId
    const updateHandler = updateHandlers[sectionId]

    if (!updateHandler) {
      toast({
        title: "Error",
        description: "Unknown section type.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get document URL from form data (DocumentUpload provides this)
      const documentUrl = Array.isArray(submitData.supportingDocument) && submitData.supportingDocument.length > 0 
        ? submitData.supportingDocument[0] 
        : editingItem.doc || editingItem.supportingDocument?.[0] || null

      // Handle document upload to S3 if a new document was uploaded
      let docUrl = documentUrl

      // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
      if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
        try {
          // Extract fileName from local URL
          const fileName = documentUrl.split("/").pop()
          
          if (fileName) {
            // Upload to S3 using the file in /public/uploaded-document/
            const s3Response = await fetch("/api/shared/s3", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fileName: fileName,
              }),
            })

            if (!s3Response.ok) {
              const s3Error = await s3Response.json()
              throw new Error(s3Error.error || "Failed to upload document to S3")
            }

            const s3Data = await s3Response.json()
            docUrl = s3Data.url // Use S3 URL for database storage

            // Delete local file after successful S3 upload
            await fetch("/api/shared/local-document-upload", {
              method: "DELETE",
            })
          }
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // Create update payload using mapper - pass docUrl instead of selectedFiles
      const updateData = createUpdateMapper(
        sectionId,
        { ...submitData, doc: docUrl },
        editingItem,
        null, // selectedFiles no longer needed, docUrl is passed in submitData
        {
          resPubLevelOptions,
          collaborationsTypeOptions,
        }
      )

      // Ensure doc is set from our processed docUrl
      if (docUrl) {
        updateData.doc = docUrl
      }

      // Use mutation to update
      updateHandler(editingItem.id, updateData)

      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setSelectedFiles(null)
      form.reset()
      // Clear document data after successful save
      clearDocumentData()
      clearAutoFillData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${sectionId} record. Please try again.`,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // File upload is handled in edit dialog - mutations will update the data automatically

  // Helper function to display N/A for empty/null/undefined values
  const displayValue = (value: any, fallback: string = "N/A"): string => {
    if (value === null || value === undefined || value === "") return fallback
    return String(value)
  }

  // Helper function to format date to dd/mm/yyyy
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "N/A"
    
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return "N/A"
      
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      
      return `${day}/${month}/${year}`
    } catch {
      // If it's already a formatted string, try to parse it
      if (typeof dateValue === 'string') {
        // Try to parse common date formats
        const parsed = new Date(dateValue)
        if (!isNaN(parsed.getTime())) {
          const day = String(parsed.getDate()).padStart(2, '0')
          const month = String(parsed.getMonth() + 1).padStart(2, '0')
          const year = parsed.getFullYear()
          return `${day}/${month}/${year}`
        }
        // If it's already in dd/mm/yyyy format, return as is
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
          return dateValue
        }
      }
      return String(dateValue)
    }
  }

  // Create columns for enhanced table - preserves exact same rendering as renderTableData
  const createColumnsForSection = (section: any, handleEdit: (sectionId: string, item: any) => void, handleDelete: (sectionId: string, itemId: number) => void): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = []

    // Patents columns
    if (section.id === "patents") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.title)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={title}>{title}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "level", header: "Level", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.level)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "status", header: "Status", enableSorting: true, cell: ({ row }) => {
          const status = typeof row.original.status === 'string' ? row.original.status : row.original.statusName || row.original.status || 'N/A'
          const statusValue = displayValue(status)
          return statusValue === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4">N/A</span> : <Badge variant={statusValue.toLowerCase() === "granted" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{statusValue}</Badge>
        } },
        { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.date)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "Tech_Licence", header: "Transfer of Technology with Licence", enableSorting: true, cell: ({ row }) => {
          const techLicence = displayValue(row.original.Tech_Licence, "No")
          return <Badge variant={row.original.Tech_Licence ? "default" : "secondary"} className="text-[10px] sm:text-xs">{techLicence}</Badge>
        } },
        { accessorKey: "Earnings_Generate", header: "Earning Generated (Rupees)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">₹ {Number.parseInt(row.original.Earnings_Generate || "0").toLocaleString()}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "PatentApplicationNo", header: "Patent Application/Publication/Grant No.", enableSorting: true, cell: ({ row }) => {
          const patentNo = displayValue(row.original.PatentApplicationNo)
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={patentNo}>{patentNo}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
      )
    }
    // Policy columns
    else if (section.id === "policy") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.title)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[150px] sm:max-w-none truncate" title={title}>{title}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[150px] sm:max-w-none truncate" } },
        { accessorKey: "level", header: "Level", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.level)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "organisation", header: "Organisation", enableSorting: true, cell: ({ row }) => {
          const org = displayValue(row.original.organisation)
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={org}>{org}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.date)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // E-Content columns
    else if (section.id === "econtent") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.title)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={title}>{title}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "e_content_type_name", header: "Type of E-Content Platform", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.e_content_type_name)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "Brief_Details", header: "Brief Details", enableSorting: true, cell: ({ row }) => {
          const details = displayValue(row.original.Brief_Details)
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={details}>{details}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "Quadrant", header: "Quadrant", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.Quadrant)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "Publishing_date", header: "Publishing Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.Publishing_date)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "Publishing_Authorities", header: "Publishing Authorities", enableSorting: true, cell: ({ row }) => {
          const authorities = displayValue(row.original.Publishing_Authorities)
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={authorities}>{authorities}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "link", header: "Link", enableSorting: true, cell: ({ row }) => {
          const link = row.original.link
          return link ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm px-2 sm:px-4">Link</a> : <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4">N/A</span>
        } },
        { accessorKey: "type_econtent_name", header: "Type of E Content", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.type_econtent_name)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // Consultancy columns
    else if (section.id === "consultancy") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.title || row.original.name)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={title}>{title}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "collaboratingInstitute", header: "Collaborating Institute / Industry", enableSorting: true, cell: ({ row }) => {
          const inst = displayValue(row.original.collaboratingInstitute || row.original.collaborating_inst)
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={inst}>{inst}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "address", header: "Address", enableSorting: true, cell: ({ row }) => {
          const addr = displayValue(row.original.address)
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={addr}>{addr}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "startDate", header: "Start Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.startDate || row.original.Start_Date)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "duration", header: "Duration(in Months)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.duration ? `${row.original.duration} months` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "amount", header: "Amount(Rs.)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.amount ? `₹ ${Number(row.original.amount).toLocaleString()}` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "detailsOutcome", header: "Details / Outcome", enableSorting: true, cell: ({ row }) => {
          const outcome = displayValue(row.original.detailsOutcome || row.original.outcome, "-")
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={outcome}>{outcome}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
      )
    }
    // Collaborations columns
    else if (section.id === "collaborations") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "category", header: "Category", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.category)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "collaboratingInstitute", header: "Collaborating Institute", enableSorting: true, cell: ({ row }) => {
          const inst = displayValue(row.original.collaboratingInstitute)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={inst}>{inst}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "nameOfCollaborator", header: "Name of Collaborator", enableSorting: true, cell: ({ row }) => {
          const name = displayValue(row.original.nameOfCollaborator || row.original.collab_name, "-")
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={name}>{name}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "qsTheRanking", header: "QS/THE Ranking", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.qsTheRanking || row.original.collab_rank, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "address", header: "Address", enableSorting: true, cell: ({ row }) => {
          const addr = displayValue(row.original.address, "-")
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={addr}>{addr}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "details", header: "Details", enableSorting: true, cell: ({ row }) => {
          const details = displayValue(row.original.details, "-")
          return <div className="max-w-[80px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={details}>{details}</div>
        }, meta: { className: "max-w-[80px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "collaborationOutcome", header: "Collaboration Outcome", enableSorting: true, cell: ({ row }) => {
          const outcome = displayValue(row.original.collaborationOutcome, "-")
          return <div className="max-w-[80px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={outcome}>{outcome}</div>
        }, meta: { className: "max-w-[80px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "status", header: "Status", enableSorting: true, cell: ({ row }) => {
          const status = displayValue(row.original.status, "-")
          return status === "N/A" || status === "-" ? <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4">N/A</span> : <Badge variant={status === "Active" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{status}</Badge>
        } },
        { accessorKey: "startingDate", header: "Starting Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.startingDate) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "duration", header: "Duration(months)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.duration ? `${row.original.duration} months` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "levelName", header: "Level", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.levelName, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "noOfBeneficiary", header: "No. of Beneficiary", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.noOfBeneficiary || row.original.beneficiary_num, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "mouSigned", header: "MOU Signed?", enableSorting: true, cell: ({ row }) => {
          const mou = displayValue(row.original.mouSigned, "No")
          return <Badge variant={row.original.mouSigned === "Yes" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{mou}</Badge>
        } },
        { accessorKey: "signingDate", header: "Signing Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.signingDate) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // Visits columns
    else if (section.id === "visits") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "instituteVisited", header: "Institute/Industry Visited", enableSorting: true, cell: ({ row }) => {
          const inst = displayValue(row.original.instituteVisited || row.original.Institute_visited, "-")
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={inst}>{inst}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "durationOfVisit", header: "Duration of Visit(days)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.durationOfVisit || row.original.duration ? `${row.original.durationOfVisit || row.original.duration} days` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "roleName", header: "Role", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.roleName, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "sponsoredBy", header: "Sponsored By", enableSorting: true, cell: ({ row }) => {
          const sponsor = displayValue(row.original.sponsoredBy || row.original.Sponsored_by, "-")
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={sponsor}>{sponsor}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "remarks", header: "Remarks", enableSorting: true, cell: ({ row }) => {
          const remarks = displayValue(row.original.remarks, "-")
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={remarks}>{remarks}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.date) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // Financial columns
    else if (section.id === "financial") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "nameOfSupport", header: "Name Of Support", enableSorting: true, cell: ({ row }) => {
          const name = displayValue(row.original.nameOfSupport || row.original.name, "-")
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={name}>{name}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "typeName", header: "Type", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.typeName, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "supportingAgency", header: "Supporting Agency", enableSorting: true, cell: ({ row }) => {
          const agency = displayValue(row.original.supportingAgency || row.original.support, "-")
          return <div className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" title={agency}>{agency}</div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate" } },
        { accessorKey: "grantReceived", header: "Grant Received", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.grantReceived || row.original.grant_received ? `₹ ${Number(row.original.grantReceived || row.original.grant_received).toLocaleString()}` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "detailsOfEvent", header: "Details Of Event", enableSorting: true, cell: ({ row }) => {
          const details = displayValue(row.original.detailsOfEvent || row.original.details, "-")
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={details}>{details}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "purposeOfGrant", header: "Purpose Of Grant", enableSorting: true, cell: ({ row }) => {
          const purpose = displayValue(row.original.purposeOfGrant || row.original.purpose, "-")
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={purpose}>{purpose}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.date) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // JRF/SRF columns
    else if (section.id === "jrfSrf") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "nameOfFellow", header: "Name Of Fellow", enableSorting: true, cell: ({ row }) => {
          const name = displayValue(row.original.nameOfFellow || row.original.name, "-")
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={name}>{name}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "typeName", header: "Type", enableSorting: true, cell: ({ row }) => <Badge variant="outline" className="text-[10px] sm:text-xs">{displayValue(row.original.typeName, "-")}</Badge> },
        { accessorKey: "projectTitle", header: "Project Title", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.projectTitle || row.original.title, "-")
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={title}>{title}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "duration", header: "Duration [in months]", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.duration ? `${row.original.duration} months` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "monthlyStipend", header: "Monthly Stipend", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{row.original.monthlyStipend || row.original.stipend ? `₹ ${Number(row.original.monthlyStipend || row.original.stipend).toLocaleString()}` : "N/A"}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.date) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // PhD columns
    else if (section.id === "phd") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "regNo", header: "Reg No", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.regNo || row.original.regno, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "nameOfStudent", header: "Name of Student", enableSorting: true, cell: ({ row }) => {
          const name = displayValue(row.original.nameOfStudent || row.original.name, "-")
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={name}>{name}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "dateOfRegistration", header: "Date of Registration", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.dateOfRegistration || row.original.start_date) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "topic", header: "Topic", enableSorting: true, cell: ({ row }) => {
          const topic = displayValue(row.original.topic, "-")
          return <div className="max-w-[100px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={topic}>{topic}</div>
        }, meta: { className: "max-w-[100px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "statusName", header: "Status", enableSorting: true, cell: ({ row }) => <Badge variant="outline" className="text-[10px] sm:text-xs">{displayValue(row.original.statusName, "-")}</Badge> },
        { accessorKey: "yearOfCompletion", header: "Year of Completion", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.yearOfCompletion || row.original.year_of_completion, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }
    // Copyrights columns
    else if (section.id === "copyrights") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.title || row.original.Title, "-")
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={title}>{title}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "referenceNo", header: "Reference No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.referenceNo || row.original.RefNo, "-")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "publicationDate", header: "Publication Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.publicationDate || row.original.PublicationDate) || "N/A"
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "link", header: "Link", enableSorting: true, cell: ({ row }) => {
          const link = row.original.link || row.original.Link
          return link ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm px-2 sm:px-4">Link</a> : <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4">N/A</span>
        } },
      )
    }

    // Add Supporting Document column (common for all sections)
    columns.push({
      id: "supportingDocument",
      header: "Supporting Document",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            {item.supportingDocument && item.supportingDocument.length > 0 ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="View Document" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="w-[95vw] sm:w-[90vw] max-w-4xl h-[85vh] sm:h-[80vh] p-0 overflow-hidden"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <DialogHeader className="p-3 sm:p-4 border-b">
                      <DialogTitle className="text-sm sm:text-base">View Document</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                      <div className="w-full h-full">
                        <DocumentViewer
                          documentUrl={item.supportingDocument[0]}
                          documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Badge variant="outline" className="text-[10px] sm:text-xs">file</Badge>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Upload Document" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base">Upload Supporting Documents</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">Please edit the item to upload documents</p>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )
      },
    })

    // Add Actions column (common for all sections)
    columns.push({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(section.id, item)
              }} 
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              title="Edit"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <ConfirmDeleteModal
              itemName={item.title || item.name || "this item"}
              trigger={<Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>}
              onConfirm={() => handleDelete(section.id, item.id)}
            />
          </div>
        )
      },
    })

    return columns
  }

  // Memoize columns for all sections at once (outside of map to follow Rules of Hooks)
  const columnsBySection = useMemo(() => {
    const columnsMap: Record<string, ColumnDef<any>[]> = {}
    sections.forEach((section) => {
      columnsMap[section.id] = createColumnsForSection(
        section,
        handleEdit,
        handleDelete
      )
    })
    return columnsMap
  }, [sections, handleEdit, handleDelete])

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "patents":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.level}</TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={typeof item.status === 'string' && item.status.toLowerCase() === "granted" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{typeof item.status === 'string' ? item.status : item.statusName || item.status || 'N/A'}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date}</span>
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.Tech_Licence ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                {item.Tech_Licence || "No"}
              </Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">₹ {Number.parseInt(item.Earnings_Generate || "0").toLocaleString()}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.PatentApplicationNo}</TableCell>
          </>
        )
      case "policy":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[150px] sm:max-w-none truncate">{item.title}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.level}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.organisation}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      case "econtent":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.e_content_type_name || ""}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.Brief_Details}>
                {item.Brief_Details}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.Quadrant}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.Publishing_date}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.Publishing_Authorities}</TableCell>
            <TableCell className="px-2 sm:px-4">
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm">
                  Link
                </a>
              )}
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.type_econtent_name || ""}</TableCell>
          </>
        )
      case "consultancy":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title || item.name}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.collaboratingInstitute || item.collaborating_inst}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.address}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.startDate || item.Start_Date}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.amount ? `₹ ${Number(item.amount).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.detailsOutcome || item.outcome}>
                {item.detailsOutcome || item.outcome || "-"}
              </div>
            </TableCell>
          </>
        )
      case "collaborations":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.category}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.collaboratingInstitute}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.nameOfCollaborator || item.collab_name || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.qsTheRanking || item.collab_rank || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.address || "-"}</TableCell>
            <TableCell className="max-w-[80px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.details}>
                {item.details || "-"}
              </div>
            </TableCell>
            <TableCell className="max-w-[80px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.collaborationOutcome}>
                {item.collaborationOutcome || "-"}
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{item.status || "-"}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.startingDate || "-"}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.levelName || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.noOfBeneficiary || item.beneficiary_num || "-"}</TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.mouSigned === "Yes" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{item.mouSigned || "No"}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.signingDate || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "visits":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.instituteVisited || item.Institute_visited || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.durationOfVisit || item.duration ? `${item.durationOfVisit || item.duration} days` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.roleName || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.sponsoredBy || item.Sponsored_by || "-"}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.remarks}>
                {item.remarks || "-"}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "financial":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.nameOfSupport || item.name || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.typeName || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.supportingAgency || item.support || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.grantReceived || item.grant_received ? `₹ ${Number(item.grantReceived || item.grant_received).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.detailsOfEvent || item.details}>
                {item.detailsOfEvent || item.details || "-"}
              </div>
            </TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.purposeOfGrant || item.purpose}>
                {item.purposeOfGrant || item.purpose || "-"}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "jrfSrf":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.nameOfFellow || item.name || "-"}</TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant="outline" className="text-[10px] sm:text-xs">{item.typeName || "-"}</Badge>
            </TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.projectTitle || item.title}>
                {item.projectTitle || item.title || "-"}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.monthlyStipend || item.stipend ? `₹ ${Number(item.monthlyStipend || item.stipend).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "phd":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.regNo || item.regno || "-"}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.nameOfStudent || item.name || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.dateOfRegistration || item.start_date || "-"}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.topic}>
                {item.topic || "-"}
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant="outline" className="text-[10px] sm:text-xs">{item.statusName || "-"}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.yearOfCompletion || item.year_of_completion || "-"}</TableCell>
          </>
        )
      case "copyrights":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title || item.Title || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.referenceNo || item.RefNo || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.publicationDate || item.PublicationDate || "-"}</span>
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              {item.link || item.Link ? (
                <a 
                  href={item.link || item.Link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-xs sm:text-sm"
                >
                  Link
                </a>
              ) : (
                "-"
              )}
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const handleExtractInfo = async () => {
          // Check for document in multiple places:
          // 1. selectedFiles (new upload)
          // 2. form's supportingDocument field (existing document in edit mode)
          // 3. autoFillDocumentUrl (from document analysis context)
          // 4. editingItem's supportingDocument (existing document)
          const formValues = form.getValues()
          const hasSelectedFiles = selectedFiles && selectedFiles.length > 0
          const hasFormDocument = formValues?.supportingDocument && 
                                 (Array.isArray(formValues.supportingDocument) ? formValues.supportingDocument[0] : formValues.supportingDocument)
          const hasAutoFillDocument = !!autoFillDocumentUrl
          const hasEditItemDocument = editingItem?.supportingDocument && 
                                     (Array.isArray(editingItem.supportingDocument) ? editingItem.supportingDocument[0] : editingItem.supportingDocument)
          
          const hasDocument = hasSelectedFiles || hasFormDocument || hasAutoFillDocument || hasEditItemDocument
          
          if (!hasDocument) {
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
      
      // Navigate back to main page
      navigate("/teacher/research-contributions?tab=patents")
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
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
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
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
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
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
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
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      case "collaborations":
        return (
          <CollaborationForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            collaborationsLevelOptions={collaborationsLevelOptions}
            collaborationsOutcomeOptions={collaborationsOutcomeOptions}
            collaborationsTypeOptions={collaborationsTypeOptions}
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      case "visits":
        return (
          <AcademicVisitForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            academicVisitRoleOptions={academicVisitRoleOptions}
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      case "financial":
        return (
          <FinancialForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            financialSupportTypeOptions={financialSupportTypeOptions}
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      case "jrfSrf":
        return (
          <JrfSrfForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            jrfSrfTypeOptions={jrfSrfTypeOptions}
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      case "phd":
        return (
          <PhdGuidanceForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            phdGuidanceStatusOptions={phdGuidanceStatusOptions}
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      case "copyrights":
        return (
          <CopyrightForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            initialDocumentUrl={isEdit ? autoFillDocumentUrl : undefined}
            onClearFields={handleClearFields}
            onCancel={isEdit ? handleModalCancel : undefined}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Research & Academic Contributions</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your research contributions, patents, and academic activities</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-3 sm:space-y-4">
        <div className="border-b mb-3 sm:mb-4">
          <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2 sm:px-0">
            <TabsList className="inline-flex min-w-max w-full">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                >
                  <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {section.title}
                </CardTitle>
                <Button
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
                  onClick={() => {
                    const route = SECTION_ROUTES[section.id as SectionId]
                    navigate(route || "/teacher/research-contributions")
                  }}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Add </span>
                      {section.title}
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <EnhancedDataTable
                  columns={columnsBySection[section.id] || []}
                  data={data[section.id as keyof typeof data] || []}
                  loading={loadingStates[section.id as SectionId]}
                  pageSize={10}
                  exportable={true}
                  enableGlobalFilter={true}
                  emptyMessage={`No ${section.title.toLowerCase()} found. Click "Add ${section.title}" to get started.`}
                  wrapperClassName="rounded-md border overflow-x-auto -mx-2 sm:mx-0"
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <CancelDialog />
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-2 sm:p-4 md:p-6 overflow-hidden flex flex-col">
          <DialogHeader className="pb-2 sm:pb-3 md:pb-4 flex-shrink-0">
            <DialogTitle className="text-sm sm:text-base md:text-lg">
              Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 sm:pr-2 -mx-2 sm:mx-0 px-2 sm:px-0">
            {editingItem && renderForm(editingItem.sectionId, true)}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation()
                handleModalCancel(e)
              }} 
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (editingItem?.sectionId === "patents" || editingItem?.sectionId === "policy" || editingItem?.sectionId === "econtent" || editingItem?.sectionId === "consultancy" || editingItem?.sectionId === "collaborations" || editingItem?.sectionId === "visits" || editingItem?.sectionId === "financial" || editingItem?.sectionId === "jrfSrf" || editingItem?.sectionId === "phd" || editingItem?.sectionId === "copyrights") {
                  // Use form.handleSubmit to trigger validation and get form data
                  form.handleSubmit(handleSaveEdit)()
                } else {
                  handleSaveEdit()
                }
              }}
              disabled={isSubmitting}
              className="transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                  <span className="text-xs sm:text-sm">Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Update {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

