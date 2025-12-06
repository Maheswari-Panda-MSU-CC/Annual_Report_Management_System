"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Users,
  Building,
  Presentation,
  Save,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"
import { RefresherOrientationForm } from "@/components/forms/RefresherOrientationForm"
import { useForm } from "react-hook-form"
import { DocumentViewer } from "@/components/document-viewer"
import { AcademicProgramForm } from "@/components/forms/AcademicProgramForm"
import { AcademicBodiesForm } from "@/components/forms/AcademicBodiesForm"
import { UniversityCommitteeParticipationForm } from "@/components/forms/UniversityComitteeParticipationForm"
import { AcademicTalkForm } from "@/components/forms/AcademicTalkForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherTalksEvents, teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useQueryClient } from "@tanstack/react-query"
import {
  useRefresherMutations,
  useAcademicProgramMutations,
  useAcademicBodiesMutations,
  useCommitteeMutations,
  useTalksMutations,
} from "@/hooks/use-teacher-talks-events-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"

// Data is now fetched using React Query hooks (useTeacherTalksEvents)

const sections = [
  {
    id: "refresher",
    title: "Refresher/Orientation",
    icon: FileText,
    columns: [
      "Sr No.",
      "Name",
      "Course Type",
      "Start Date",
      "End Date",
      "Organizing University",
      "Organizing Institute",
      "Organizing Department",
      "Centre",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "academic-programs",
    title: "Academic Programs",
    icon: Users,
    columns: ["Sr No.", "Name", "Programme", "Place", "Date", "Year", "Participated As", "Documents", "Actions"],
  },
  {
    id: "academic-bodies",
    title: "Academic Bodies",
    icon: Building,
    columns: ["Sr No.", "Name", "Academic Body", "Place", "Participated As", "Submit Date", "Year", "Documents", "Actions"],
  },
  {
    id: "committees",
    title: "University Committees",
    icon: Users,
    columns: ["Sr No.", "Name", "Committee Name", "Level", "Participated As", "Submit Date", "Year", "Documents", "Actions"],
  },
  {
    id: "talks",
    title: "Academic Talks",
    icon: Presentation,
    columns: [
      "Sr No.",
      "Name",
      "Programme",
      "Place",
      "Talk Date",
      "Title of Event",
      "Participated As",
      "Documents",
      "Actions",
    ],
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

export default function TalksEventsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("refresher")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)
  const [formData, setFormData] = useState<any>({})
  const form = useForm()
  const router = useRouter()
  const queryClient = useQueryClient()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')
  
  // Document analysis context
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  const { confirm, DialogComponent: ConfirmDialog } = useConfirmationDialog()
  const cancelHandlerRef = useRef(false) // Track if cancel is being processed
  
  // Use React Query hook for data fetching
  const {
    talks: talksQuery,
    academicContri: academicContriQuery,
    academicParticipation: academicParticipationQuery,
    committees: committeesQuery,
    refresher: refresherQuery,
    isLoading: isDataLoading,
  } = useTeacherTalksEvents()

  // Mutations for each section
  const refresherMutations = useRefresherMutations()
  const academicProgramMutations = useAcademicProgramMutations()
  const academicBodiesMutations = useAcademicBodiesMutations()
  const committeeMutations = useCommitteeMutations()
  const talksMutations = useTalksMutations()
  
  // Fetch dropdowns (simplified - useDropDowns handles caching internally)
  const { 
    refresherTypeOptions,
    academicProgrammeOptions,
    participantTypeOptions,
    reportYearsOptions,
    committeeLevelOptions,
    talksProgrammeTypeOptions,
    talksParticipantTypeOptions,
  } = useDropDowns()

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Map React Query data to UI format
  const data = useMemo(() => {
    const mappedData: any = {
      refresher: [],
      "academic-programs": [],
      "academic-bodies": [],
      committees: [],
      talks: [],
    }

    // Map refresher details
    if (refresherQuery.data?.refresherDetails) {
      mappedData.refresher = refresherQuery.data.refresherDetails.map((item: any, index: number) => ({
        id: item.Id,
        srNo: index + 1,
        name: item.name || "",
        courseType: item.Refresher_Course_Type_Name || "",
        courseTypeId: item.Refresher_Course_Type_Id,
        startDate: item.startdate ? new Date(item.startdate).toISOString().split('T')[0] : "",
        endDate: item.enddate ? new Date(item.enddate).toISOString().split('T')[0] : "",
        organizingUniversity: item.university || "",
        organizingInstitute: item.institute || "",
        organizingDepartment: item.department || "",
        centre: item.centre || "",
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        refresher_type: item.Refresher_Course_Type_Id,
        startdate: item.startdate ? new Date(item.startdate).toISOString().split('T')[0] : "",
        enddate: item.enddate ? new Date(item.enddate).toISOString().split('T')[0] : "",
        university: item.university || "",
        institute: item.institute || "",
        department: item.department || "",
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))
    }

    // Map academic contributions
    if (academicContriQuery.data?.academicContributions) {
      mappedData["academic-programs"] = academicContriQuery.data.academicContributions.map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        programme: item.programme || "",
        programmeId: item.programme,
        place: item.place || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        year: item.year_name?.toString() || "",
        year_name: item.year_name || new Date().getFullYear(),
        participatedAs: item.participated_as || "",
        participated_as: item.participated_as,
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))
    }

    // Map academic bodies participation
    if (academicParticipationQuery.data?.academicBodiesParticipation) {
      mappedData["academic-bodies"] = academicParticipationQuery.data.academicBodiesParticipation.map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        courseTitle: item.name || "",
        acad_body: item.acad_body || "",
        academicBody: item.acad_body || "",
        place: item.place || "",
        participated_as: item.participated_as || "",
        participatedAs: item.participated_as || "",
        submit_date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        year: item.year_name?.toString() || "",
        year_name: item.year_name || new Date().getFullYear(),
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))
    }

    // Map university committees
    if (committeesQuery.data?.universityCommittees) {
      mappedData.committees = committeesQuery.data.universityCommittees.map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        committeeName: item.committee_name || "",
        committee_name: item.committee_name || "",
        level: item.level || "",
        levelId: item.level,
        participated_as: item.participated_as || "",
        participatedAs: item.participated_as || "",
        submit_date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        year: item.year_name?.toString() || "",
        year_name: item.year_name || new Date().getFullYear(),
        BOS: item.BOS || false,
        FB: item.FB || false,
        CDC: item.CDC || false,
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))
    }

    // Map teacher talks
    if (talksQuery.data?.teacherTalks) {
      mappedData.talks = talksQuery.data.teacherTalks.map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        programme: item.teacher_talks_prog_name || "",
        programmeId: item.programme,
        place: item.place || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        talkDate: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        title: item.title || "",
        titleOfEvent: item.title || "",
        participated_as: item.participated_as,
        participatedAs: item.teacher_talks_parti_name || "",
        Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
        supportingDocument: item.Image ? [item.Image] : [],
      }))
    }

    return mappedData
  }, [
    refresherQuery.data,
    academicContriQuery.data,
    academicParticipationQuery.data,
    committeesQuery.data,
    talksQuery.data,
  ])

  // Get loading states for each section
  const loadingStates = useMemo(() => ({
    refresher: refresherQuery.isLoading || refresherQuery.isFetching,
    "academic-programs": academicContriQuery.isLoading || academicContriQuery.isFetching,
    "academic-bodies": academicParticipationQuery.isLoading || academicParticipationQuery.isFetching,
    committees: committeesQuery.isLoading || committeesQuery.isFetching,
    talks: talksQuery.isLoading || talksQuery.isFetching,
  }), [
    refresherQuery.isLoading,
    refresherQuery.isFetching,
    academicContriQuery.isLoading,
    academicContriQuery.isFetching,
    academicParticipationQuery.isLoading,
    academicParticipationQuery.isFetching,
    committeesQuery.isLoading,
    committeesQuery.isFetching,
    talksQuery.isLoading,
    talksQuery.isFetching,
  ])

  // Helper function to invalidate queries for a specific section
  const invalidateSection = (sectionId: string) => {
    if (sectionId === "refresher") {
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.talks.refresher(teacherId) })
    } else if (sectionId === "academic-programs") {
      queryClient.invalidateQueries({ queryKey: [...teacherQueryKeys.talks.all(teacherId), "academic-contri"] })
    } else if (sectionId === "academic-bodies") {
      queryClient.invalidateQueries({ queryKey: [...teacherQueryKeys.talks.all(teacherId), "academic-participation"] })
    } else if (sectionId === "committees") {
      queryClient.invalidateQueries({ queryKey: [...teacherQueryKeys.talks.all(teacherId), "committees"] })
    } else if (sectionId === "talks") {
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.talks.talks(teacherId) })
    }
  }

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

  const handleDeleteClick = (sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { sectionId, itemId } = deleteConfirm
    setIsDeleting(true)

    try {
      // Get the appropriate mutation based on section
      let deleteMutation
      if (sectionId === "refresher") {
        deleteMutation = refresherMutations.deleteMutation
      } else if (sectionId === "academic-programs") {
        deleteMutation = academicProgramMutations.deleteMutation
      } else if (sectionId === "academic-bodies") {
        deleteMutation = academicBodiesMutations.deleteMutation
      } else if (sectionId === "committees") {
        deleteMutation = committeeMutations.deleteMutation
      } else if (sectionId === "talks") {
        deleteMutation = talksMutations.deleteMutation
      } else {
        throw new Error(`Unknown section: ${sectionId}`)
      }

      // Execute delete mutation (toast and UI update handled by mutation)
      await deleteMutation.mutateAsync(itemId)
      setDeleteConfirm(null)
    } catch (error: any) {
      // Error toast is handled by mutation, but we can add additional handling if needed
      console.error("Error deleting:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "refresher") {
      formItem = {
        ...item,
        refresher_type: item.courseTypeId || item.refresher_type,
        startdate: item.startDate || item.startdate,
        enddate: item.endDate || item.enddate,
        university: item.organizingUniversity || item.university,
        institute: item.organizingInstitute || item.institute,
        department: item.organizingDepartment || item.department,
      }
    } else if (sectionId === "academic-programs") {
      formItem = {
        ...item,
        programme: item.programmeId || item.programme,
        date: item.date,
        year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        participated_as: item.participated_as || item.participatedAs,
      }
    } else if (sectionId === "academic-bodies") {
      formItem = {
        ...item,
        name: item.name || item.courseTitle,
        acad_body: item.acad_body || item.academicBody,
        participated_as: item.participated_as || item.participatedAs,
        submit_date: item.submit_date || item.date,
        year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
      }
    } else if (sectionId === "committees") {
      formItem = {
        ...item,
        committee_name: item.committee_name || item.committeeName,
        level: item.levelId || item.level,
        participated_as: item.participated_as || item.participatedAs,
        submit_date: item.submit_date || item.date,
        year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        BOS: item.BOS || false,
        FB: item.FB || false,
        CDC: item.CDC || false,
      }
    } else if (sectionId === "talks") {
      formItem = {
        ...item,
        programme: item.programmeId || item.programme,
        date: item.date || item.talkDate,
        title: item.title || item.titleOfEvent,
        participated_as: item.participated_as || item.participatedAs,
      }
    } else {
      formItem = { ...item }
    }
    
    setFormData(formItem)
    form.reset(formItem)
    setIsEditDialogOpen(true)
  }

  // Get form type from section ID for auto-fill
  const getFormTypeFromSectionId = (sectionId: string): string => {
    return sectionId // formType is same as sectionId
  }

  // Get dropdown options based on section
  const getDropdownOptions = (sectionId: string): { [fieldName: string]: Array<{ id: number | string; name: string }> } => {
    switch (sectionId) {
      case "refresher":
        return { refresher_type: refresherTypeOptions }
      case "academic-programs":
        return {
          programme: academicProgrammeOptions,
          participated_as: participantTypeOptions,
          year_name: reportYearsOptions,
        }
      case "academic-bodies":
        return {
          participated_as: participantTypeOptions,
          year_name: reportYearsOptions,
        }
      case "committees":
        return {
          level: committeeLevelOptions,
          participated_as: participantTypeOptions,
          year_name: reportYearsOptions,
        }
      case "talks":
        return {
          programme: talksProgrammeTypeOptions,
          participated_as: talksParticipantTypeOptions,
        }
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
    getFormValues: () => form.watch(),
    onAutoFill: (fields) => {
      // Auto-fill form fields - replace existing data
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          form.setValue(key, value)
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

  // Cancel handler for edit modal
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
      // Check for document in supportingDocument field or Image field
      const hasDocument = formValues.supporting_doc || formValues.Image || false
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
  const handleDialogOpenChange = async (open: boolean) => {
    if (!open && isEditDialogOpen) {
      // User is trying to close the dialog
      const shouldClose = await handleModalCancel()
      if (!shouldClose) {
        // Prevent closing by not updating state
        return
      }
    }
    setIsEditDialogOpen(open)
  }

  // Helper function to upload document to S3
  const uploadDocumentToS3 = async (documentUrl: string | undefined): Promise<string> => {
    if (!documentUrl) {
      return "http://localhost:3000/assets/demo_document.pdf"
    }

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl.startsWith("/uploaded-document/")) {
      try {
        const fileName = documentUrl.split("/").pop()
        if (!fileName) {
          throw new Error("Invalid file name")
        }

        const s3Response = await fetch("/api/shared/s3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        })

        if (!s3Response.ok) {
          const s3Error = await s3Response.json()
          throw new Error(s3Error.error || "Failed to upload document to S3")
        }

        const s3Data = await s3Response.json()
        const s3Url = s3Data.url

        // Delete local file after successful S3 upload
        await fetch("/api/shared/local-document-upload", {
          method: "DELETE",
        })

        return s3Url
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document. Using existing URL.",
          variant: "destructive",
        })
        // Return existing URL if S3 upload fails
        return documentUrl
      }
    }

    // If it's already an S3 URL or external URL, return as is
    return documentUrl
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !user?.role_id) return

    setIsSubmitting(true)

    try {
      const formValues = form.getValues()
      let updateMutation
      let updateData: any

      // Prepare data and get appropriate mutation based on section
      if (editingItem.sectionId === "refresher") {
        updateMutation = refresherMutations.updateMutation
        // Handle document upload to S3
        const docUrl = await uploadDocumentToS3(formValues.supporting_doc)
        updateData = {
          name: formValues.name,
          refresher_type: formValues.refresher_type,
          startdate: formValues.startdate,
          enddate: formValues.enddate || null,
          university: formValues.university || null,
          institute: formValues.institute || null,
          department: formValues.department || null,
          centre: formValues.centre && formValues.centre.trim() !== "" ? formValues.centre.trim() : null,
          supporting_doc: docUrl,
        }
      } else if (editingItem.sectionId === "academic-programs") {
        updateMutation = academicProgramMutations.updateMutation
        const docUrl = await uploadDocumentToS3(formValues.supporting_doc)
        updateData = {
          name: formValues.name,
          programme: formValues.programme,
          place: formValues.place,
          date: formValues.date,
          participated_as: formValues.participated_as,
          supporting_doc: docUrl,
          year_name: formValues.year_name || new Date().getFullYear(),
        }
      } else if (editingItem.sectionId === "academic-bodies") {
        updateMutation = academicBodiesMutations.updateMutation
        const docUrl = await uploadDocumentToS3(formValues.supporting_doc)
        updateData = {
          name: formValues.name,
          acad_body: formValues.acad_body,
          place: formValues.place,
          participated_as: formValues.participated_as,
          submit_date: formValues.submit_date,
          supporting_doc: docUrl,
          year_name: formValues.year_name || new Date().getFullYear(),
        }
      } else if (editingItem.sectionId === "committees") {
        updateMutation = committeeMutations.updateMutation
        const docUrl = await uploadDocumentToS3(formValues.supporting_doc)
        updateData = {
          name: formValues.name,
          committee_name: formValues.committee_name,
          level: formValues.level,
          participated_as: formValues.participated_as,
          submit_date: formValues.submit_date,
          supporting_doc: docUrl,
          BOS: formValues.BOS || false,
          FB: formValues.FB || false,
          CDC: formValues.CDC || false,
          year_name: formValues.year_name || new Date().getFullYear(),
        }
      } else if (editingItem.sectionId === "talks") {
        updateMutation = talksMutations.updateMutation
        const docUrl = await uploadDocumentToS3(formValues.Image || formValues.supporting_doc)
        updateData = {
          name: formValues.name,
          programme: formValues.programme,
          place: formValues.place,
          date: formValues.date,
          title: formValues.title,
          participated_as: formValues.participated_as,
          Image: docUrl,
        }
      } else {
        throw new Error(`Unknown section: ${editingItem.sectionId}`)
      }

      // Execute update mutation (toast and UI update handled by mutation)
      await updateMutation.mutateAsync({ id: editingItem.id, data: updateData })

      // Close dialog - DO NOT clear form in edit mode (data fields remain)
      // Only clear document context data
      clearDocumentData()
      clearAutoFillData()
      setIsEditDialogOpen(false)
      setEditingItem(null)
      // Note: form data is preserved in edit mode - user can continue editing if needed
    } catch (error: any) {
      // Error toast is handled by mutation, but we can add additional handling if needed
      console.error("Error updating:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to upload File to local storage then S3
  const uploadFileToS3 = async (file: File): Promise<string> => {
    try {
      // Step 1: Upload to local storage
      const formData = new FormData()
      formData.append("file", file)

      const localResponse = await fetch("/api/shared/local-document-upload", {
        method: "POST",
        body: formData,
      })

      if (!localResponse.ok) {
        const localError = await localResponse.json()
        throw new Error(localError.error || "Failed to upload file to local storage")
      }

      const localData = await localResponse.json()
      const localUrl = localData.url

      // Step 2: Upload to S3
      const fileName = localUrl.split("/").pop()
      if (!fileName) {
        throw new Error("Invalid file name")
      }

      const s3Response = await fetch("/api/shared/s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      })

      if (!s3Response.ok) {
        const s3Error = await s3Response.json()
        throw new Error(s3Error.error || "Failed to upload document to S3")
      }

      const s3Data = await s3Response.json()
      const s3Url = s3Data.url

      // Step 3: Delete local file after successful S3 upload
      await fetch("/api/shared/local-document-upload", {
        method: "DELETE",
      })

      return s3Url
    } catch (error: any) {
      console.error("File upload error:", error)
      toast({
        title: "Document Upload Error",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleFileUpload = async (sectionId: string, itemId: number) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Upload file to S3
      const docUrl = await uploadFileToS3(selectedFiles[0])

      if (sectionId === "refresher") {
        const item: any = data.refresher.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const updateData = {
          name: item.name,
          refresher_type: item.refresher_type || item.courseTypeId,
          startdate: item.startdate || item.startDate,
          enddate: item.enddate || item.endDate || null,
          university: item.university || item.organizingUniversity,
          institute: item.institute || item.organizingInstitute,
          department: item.department || item.organizingDepartment,
          centre: item.centre && item.centre.trim() !== "" ? item.centre.trim() : null,
          supporting_doc: docUrl,
        }

        // Use mutation to update
        await refresherMutations.updateMutation.mutateAsync({ id: itemId, data: updateData })
        setSelectedFiles(null)
      } else if (sectionId === "academic-programs") {
        const item: any = data["academic-programs"].find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const updateData = {
          name: item.name,
          programme: item.programmeId || item.programme,
          place: item.place,
          date: item.date,
          participated_as: item.participated_as || item.participatedAs,
          supporting_doc: docUrl,
          year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        }

        await academicProgramMutations.updateMutation.mutateAsync({ id: itemId, data: updateData })
        setSelectedFiles(null)
      } else if (sectionId === "academic-bodies") {
        const item: any = data["academic-bodies"].find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const updateData = {
          name: item.name,
          acad_body: item.acad_body || item.academicBody,
          place: item.place,
          participated_as: item.participated_as || item.participatedAs,
          submit_date: item.submit_date || item.date,
          supporting_doc: docUrl,
          year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        }

        await academicBodiesMutations.updateMutation.mutateAsync({ id: itemId, data: updateData })
        setSelectedFiles(null)
      } else if (sectionId === "committees") {
        const item: any = data.committees.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const updateData = {
          name: item.name,
          committee_name: item.committee_name || item.committeeName,
          level: item.levelId || item.level,
          participated_as: item.participated_as || item.participatedAs,
          submit_date: item.submit_date || item.date,
          supporting_doc: docUrl,
          BOS: item.BOS || false,
          FB: item.FB || false,
          CDC: item.CDC || false,
          year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        }

        await committeeMutations.updateMutation.mutateAsync({ id: itemId, data: updateData })
        setSelectedFiles(null)
      } else if (sectionId === "talks") {
        const item: any = data.talks.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const updateData = {
          name: item.name,
          programme: item.programmeId || item.programme,
          place: item.place,
          date: item.date || item.talkDate,
          title: item.title || item.titleOfEvent,
          participated_as: item.participated_as || item.participatedAs,
          Image: docUrl,
        }

        await talksMutations.updateMutation.mutateAsync({ id: itemId, data: updateData })
        setSelectedFiles(null)
      }
    } catch (error: any) {
      // Error toast is handled by mutation and uploadFileToS3
      console.error("Error updating document:", error)
    }
  }

  const handleExtractInfo = async () => {
    // Note: This function is for legacy manual extraction
    // DocumentUpload component handles extraction internally via "Extract Data Fields" button
    // So we don't need to check selectedFiles here - DocumentUpload manages its own file state
    // This function is kept for backward compatibility but may not be used
    
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
          formData.setValue(key, value)
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

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "refresher":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.courseType}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.startDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.endDate}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.organizingUniversity}>
                {item.organizingUniversity}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.organizingInstitute}>
                {item.organizingInstitute}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.organizingDepartment}>
                {item.organizingDepartment}
              </div>
            </TableCell>
            <TableCell>{item.centre}</TableCell>
          </>
        )
      case "academic-programs":
        const programmeName = academicProgrammeOptions.find(p => p.id === item.programmeId || p.id === item.programme)?.name || item.programme || "N/A"
        const participantName = participantTypeOptions.find(p => p.id === item.participated_as || p.id === item.participatedAs)?.name || item.participatedAs || "N/A"
        const yearName = reportYearsOptions.find(y => y.id === item.year_name || y.id === parseInt(item.year))?.name || item.year || item.year_name || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{programmeName}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
            <TableCell>{yearName}</TableCell>
            <TableCell>
              <Badge variant="secondary">{participantName}</Badge>
            </TableCell>
          </>
        )
      case "academic-bodies":
        const academicBodiesYearName = reportYearsOptions.find(y => y.id === item.year_name || y.id === parseInt(item.year))?.name || item.year || item.year_name || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name || item.courseTitle}</TableCell>
            <TableCell>{item.acad_body || item.academicBody}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.participated_as || item.participatedAs}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.submit_date || item.date}</span>
              </div>
            </TableCell>
            <TableCell>{academicBodiesYearName}</TableCell>
          </>
        )
      case "committees":
        const levelName = committeeLevelOptions.find(l => l.id === item.levelId || l.id === item.level)?.name || item.level || "N/A"
        const committeeYearName = reportYearsOptions.find(y => y.id === item.year_name || y.id === parseInt(item.year))?.name || item.year || item.year_name || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.committee_name || item.committeeName}</TableCell>
            <TableCell>
              <Badge variant="outline">{levelName}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.participated_as || item.participatedAs}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.submit_date || item.date}</span>
              </div>
            </TableCell>
            <TableCell>{committeeYearName}</TableCell>
          </>
        )
      case "talks":
        const talksProgrammeName = talksProgrammeTypeOptions.find(p => p.id === item.programmeId || p.id === item.programme)?.name || item.programme || "N/A"
        const talksParticipantName = talksParticipantTypeOptions.find(p => p.id === item.participated_as || p.id === item.participatedAs)?.name || item.participatedAs || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{talksProgrammeName}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date || item.talkDate}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.title || item.titleOfEvent}>
                {item.title || item.titleOfEvent}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{talksParticipantName}</Badge>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  // Clear fields handler for DocumentUpload
  const handleClearFields = () => {
    form.reset()
    // Also clear document URL from form state
    const formValues = form.getValues()
    if (formValues.supporting_doc) {
      form.setValue("supporting_doc", "")
    }
    if (formValues.Image) {
      form.setValue("Image", "")
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "refresher":
        return (
          <RefresherOrientationForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            refresherTypeOptions={refresherTypeOptions}
            onClearFields={handleClearFields}
          />
        )
      case "academic-programs":
        return (
          <AcademicProgramForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            academicProgrammeOptions={academicProgrammeOptions}
            participantTypeOptions={participantTypeOptions}
            reportYearsOptions={reportYearsOptions}
            onClearFields={handleClearFields}
          />
        )
      case "academic-bodies":
        return (
          <AcademicBodiesForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            reportYearsOptions={reportYearsOptions}
            onClearFields={handleClearFields}
          />
        )
      case "committees":
        return (
          <UniversityCommitteeParticipationForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            committeeLevelOptions={committeeLevelOptions}
            reportYearsOptions={reportYearsOptions}
            onClearFields={handleClearFields}
          />
        )
      case "talks":
        return (
          <AcademicTalkForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            talksProgrammeTypeOptions={talksProgrammeTypeOptions}
            talksParticipantTypeOptions={talksParticipantTypeOptions}
            onClearFields={handleClearFields}
            />
          )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      <>
        {ConfirmDialog && <ConfirmDialog />}
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Talks & Events</h1>
          <p className="text-muted-foreground">
            Manage your academic talks, events, and professional development activities
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="flex flex-wrap min-w-max w-full sm:w-auto">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">{section.title}</span>
                    <span className="xs:hidden">{section.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    {section.title}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      router.push(`/teacher/talks-events/add?tab=${section.id}`)
                    }}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add {section.title}</span>
                    <span className="sm:hidden">Add</span>
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
                        {loadingStates[section.id as keyof typeof loadingStates ] ? (
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
                                              documentUrl={Array.isArray(item.supportingDocument) ? item.supportingDocument[0] : item.supportingDocument}
                                              documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Badge variant="outline" className="text-xs">
                                      file
                                    </Badge>
                                  </>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" title="Upload Document">
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteClick(section.id, item.id, item.name || "this record")}
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
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh] pr-2 -mr-2 sm:mr-0">
              {editingItem && renderForm(editingItem.sectionId, true)}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleModalCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the record
                <strong className="block mt-2 text-base">
                  "{deleteConfirm?.itemName}"
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </>
  )
}
