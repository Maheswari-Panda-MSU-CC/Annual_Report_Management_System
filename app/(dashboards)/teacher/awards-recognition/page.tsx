"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { ColumnDef } from "@tanstack/react-table"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Upload, BarChart3, Users, Save, Calendar, Trophy, FileText, Loader2, MapPin } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherAwardsRecognition, teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useQueryClient } from "@tanstack/react-query"
import { usePerformanceMutations, useAwardsMutations, useExtensionMutations } from "@/hooks/use-teacher-awards-recognition-mutations"
import { PerformanceTeacherForm } from "@/components/forms/PerformanceTeacherForm"
import { AwardsFellowshipForm } from "@/components/forms/AwardsFellowshipForm"
import { ExtensionActivityForm } from "@/components/forms/ExtensionActivityForm"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"

// Helper hook to invalidate section queries
function useInvalidateSection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const teacherId = user?.role_id ? parseInt(user.role_id.toString()) : 0

  return (sectionId: string) => {
    if (!teacherId || teacherId <= 0) return
    
    const queryKey = 
      sectionId === "performance" ? teacherQueryKeys.awards.performance(teacherId) :
      sectionId === "awards" ? teacherQueryKeys.awards.awards(teacherId) :
      sectionId === "extension" ? teacherQueryKeys.awards.extension(teacherId) :
      null
    
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey })
    }
  }
}

const sections = [
  {
    id: "performance",
    title: "Performance by Individual/Group",
    icon: BarChart3,
    columns: [
      "Sr No.",
      "Title of Performance",
      "Place",
      "Performance Date",
      "Nature of Performance",
      "Document",
      "Actions",
    ],
  },
  {
    id: "awards",
    title: "Awards/Fellowship/Recognition",
    icon: Trophy,
    columns: [
      "Sr No.",
      "Name of Award / Fellowship",
      "Details",
      "Name of Awarding Agency",
      "Address of Awarding Agency",
      "Date of Award",
      "Level",
      "Document",
      "Actions",
    ],
  },
  {
    id: "extension",
    title: "Extension",
    icon: Users,
    columns: [
      "Sr No.",
      "Name of Activity",
      "Nature of Activity",
      "Level",
      "Sponsored By",
      "Place",
      "Date",
      "Document",
      "Actions",
    ],
  },
]

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png,.bmp", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, JPEG, PNG, BMP up to 10MB each</span>
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

export default function AwardsRecognitionPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("performance")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState<any>({})
  const form = useForm({
    mode: "onSubmit", // Only validate on submit, not on change
    reValidateMode: "onChange", // Re-validate on change after first submit
  })

  // Helper functions for auto-fill highlighting
  const isAutoFilled = useCallback((fieldName: string): boolean => {
    return autoFilledFields.has(fieldName)
  }, [autoFilledFields])

  const clearAutoFillHighlight = useCallback((fieldName: string) => {
    setAutoFilledFields((prev) => {
      const newSet = new Set(prev)
      newSet.delete(fieldName)
      return newSet
    })
  }, [])

  // React Query hooks
  const { performance, awards, extension, isLoading, isFetching, data: queryData } = useTeacherAwardsRecognition()
  const invalidateSection = useInvalidateSection()

  // Mutation hooks
  const performanceMutations = usePerformanceMutations()
  const awardsMutations = useAwardsMutations()
  const extensionMutations = useExtensionMutations()

  
    
  // Derive submitting state from mutations
  const isSubmitting = performanceMutations.updateMutation.isPending || 
                       awardsMutations.updateMutation.isPending || 
                       extensionMutations.updateMutation.isPending
  
  // Derive deleting state from mutations
  const isDeleting = performanceMutations.deleteMutation.isPending || 
                     awardsMutations.deleteMutation.isPending || 
                     extensionMutations.deleteMutation.isPending
  // Fetch dropdowns
  const { 
    awardFellowLevelOptions,
    sponserNameOptions
  } = useDropDowns()

  // Document analysis context
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  const { confirm, DialogComponent: ConfirmDialog } = useConfirmationDialog()
  const cancelHandlerRef = useRef(false) // Track if cancel is being processed

  // Map API data to UI format
  const data = useMemo(() => {
    const performanceData = (queryData?.performanceTeacher || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      name: item.name || "",
      titleOfPerformance: item.name || "",
      place: item.place || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      performanceDate: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      perf_nature: item.perf_nature || "",
      natureOfPerformance: item.perf_nature || "",
      Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    const awardsData = (queryData?.awardsFellows || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      name: item.name || "",
      nameOfAwardFellowship: item.name || "",
      details: item.details || "",
      organization: item.organization || "",
      nameOfAwardingAgency: item.organization || "",
      address: item.address || "",
      addressOfAwardingAgency: item.address || "",
      date_of_award: item.date_of_award ? new Date(item.date_of_award).toISOString().split('T')[0] : "",
      dateOfAward: item.date_of_award ? new Date(item.date_of_award).toISOString().split('T')[0] : "",
      level: item.level || "",
      levelId: item.level,
      Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    const extensionData = (queryData?.extensionActivities || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      names: item.names || "",
      nameOfActivity: item.name_of_activity || "",
      natureOfActivity: item.names || "",
      place: item.place || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      sponsered: item.sponsered || "",
      sponseredId: item.sponsered,
      sponsoredBy: item.sponsered_name || "",
      level: item.level || "",
      levelId: item.level,
      levelName: item.Awards_Fellows_Level_name || "",
      Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    return {
      performance: performanceData,
      awards: awardsData,
      extension: extensionData,
    }
  }, [queryData])

  // Loading states derived from queries
  const loadingStates = useMemo(() => ({
    performance: performance.isLoading || performance.isFetching,
    awards: awards.isLoading || awards.isFetching,
    extension: extension.isLoading || extension.isFetching,
  }), [performance.isLoading, performance.isFetching, awards.isLoading, awards.isFetching, extension.isLoading, extension.isFetching])

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

  const handleFileSelect = useCallback((files: FileList | null) => {
    setSelectedFiles(files)
  }, [])

  const handleDeleteClick = useCallback((sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }, [])

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { sectionId, itemId } = deleteConfirm

    try {
      if (sectionId === "performance") {
        await performanceMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "awards") {
        await awardsMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "extension") {
        await extensionMutations.deleteMutation.mutateAsync(itemId)
      }
      setDeleteConfirm(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  // Get form type from section ID
  const getFormTypeFromSectionId = (sectionId: string): string => {
    switch (sectionId) {
      case "performance":
        return "performance"
      case "awards":
        return "awards"
      case "extension":
        return "extension"
      default:
        return "performance"
    }
  }

  // Get dropdown options for section
  const getDropdownOptions = (sectionId: string): { [fieldName: string]: Array<{ id: number | string; name: string }> } => {
    switch (sectionId) {
      case "performance":
        return {}
      case "awards":
        return {
          level: awardFellowLevelOptions,
        }
      case "extension":
        return {
          level: awardFellowLevelOptions,
          sponsered: sponserNameOptions,
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
      setAutoFilledFields(new Set()) // Clear previous highlighting
      const filledFieldNames: string[] = []

      if (!editingItem) return

      const sectionId = editingItem.sectionId
      const dropdownOptions = getDropdownOptions(sectionId)

      // Helper function to check if a dropdown value matches an option
      const isValidDropdownValue = (value: number | string, options: Array<{ id: number; name: string }>): boolean => {
        if (typeof value === 'number') {
          return options.some(opt => opt.id === value)
        }
        return false
      }

      // Helper function to validate and set dropdown field
      const validateAndSetDropdown = (fieldName: string, value: any, options: Array<{ id: number; name: string }>): boolean => {
        if (value === undefined || value === null) return false

        let fieldValue: number | null = null

        if (typeof value === 'number') {
          if (isValidDropdownValue(value, options)) {
            fieldValue = value
          }
        } else {
          // Try to find matching option by name
          const option = options.find(
            opt => opt.name.toLowerCase() === String(value).toLowerCase()
          )
          if (option) {
            fieldValue = option.id
          } else {
            // Try to convert to number and check
            const numValue = Number(value)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, options)) {
              fieldValue = numValue
            }
          }
        }

        // Only set and highlight if we found a valid value that exists in options
        if (fieldValue !== null && options.some(opt => opt.id === fieldValue)) {
          form.setValue(fieldName, fieldValue, { shouldValidate: true })
          return true
        }
        return false
      }

      // Process fields based on section type
      Object.entries(fields).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return

        let isValid = false

        switch (sectionId) {
          case "performance":
            // All fields are text inputs
            form.setValue(key, String(value))
            isValid = true
            break

          case "awards":
            if (key === "level" && dropdownOptions.level) {
              isValid = validateAndSetDropdown("level", value, dropdownOptions.level)
            } else {
              // Text fields
              form.setValue(key, String(value))
              isValid = true
            }
            break

          case "extension":
            if (key === "level" && dropdownOptions.level) {
              isValid = validateAndSetDropdown("level", value, dropdownOptions.level)
            } else if (key === "sponsered" && dropdownOptions.sponsered) {
              isValid = validateAndSetDropdown("sponsered", value, dropdownOptions.sponsered)
            } else {
              // Text fields
              form.setValue(key, String(value))
              isValid = true
            }
            break

          default:
            form.setValue(key, String(value))
            isValid = true
            break
        }

        if (isValid) {
          filledFieldNames.push(key)
        }
      })

      // Update auto-filled fields set
      if (filledFieldNames.length > 0) {
        setAutoFilledFields(new Set(filledFieldNames))
        toast({
          title: "Form Updated",
          description: `${filledFieldNames.length} field(s) replaced with new extracted data`,
        })
      }
    },
    clearAfterUse: false,
  })

  // Clear fields handler for DocumentUpload
  const handleClearFields = () => {
    form.reset()
    // Also clear document URL from form state
    const formValues = form.getValues()
    if (formValues.Image) {
      form.setValue("Image", "")
    }
    setAutoFilledFields(new Set())
  }

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
      // Check for document in Image field
      const hasDocument = formValues.Image || false
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
      setAutoFilledFields(new Set())
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

  const handleEdit = useCallback((sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    setAutoFilledFields(new Set()) // Clear highlighting when opening edit modal
    clearAutoFillData() // Clear auto-fill data
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "performance") {
      formItem = {
        name: item.name || item.titleOfPerformance,
        place: item.place,
        date: item.date || item.performanceDate,
        perf_nature: item.perf_nature || item.natureOfPerformance,
        Image: item.Image || null, // Include Image for DocumentUpload component
      }
    } else if (sectionId === "awards") {
      formItem = {
        name: item.name || item.nameOfAwardFellowship,
        details: item.details || "",
        organization: item.organization || item.nameOfAwardingAgency,
        address: item.address || item.addressOfAwardingAgency || "",
        date_of_award: item.date_of_award || item.dateOfAward,
        level: item.levelId || item.level,
        Image: item.Image || null, // Include Image for DocumentUpload component
      }
    } else if (sectionId === "extension") {
      formItem = {
        names: item.names || item.natureOfActivity,
        name_of_activity: item.nameOfActivity || item.name_of_activity,
        place: item.place,
        date: item.date,
        sponsered: item.sponseredId || item.sponsered,
        level: item.levelId || item.level,
        Image: item.Image || null, // Include Image for DocumentUpload component
      }
    } else {
      formItem = { ...item }
    }
    
    setFormData(formItem)
    form.reset(formItem)
    setIsEditDialogOpen(true)
  }, [form, clearAutoFillData])

  // Helper function to upload document to S3 (matches research module pattern)
  const uploadDocumentToS3 = async (documentUrl: string | undefined): Promise<string> => {
    if (!documentUrl) {
      return "http://localhost:3000/assets/demo_document.pdf"
    }

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl.startsWith("/uploaded-document/")) {
      // Extract fileName from local URL
      const fileName = documentUrl.split("/").pop()
      
      if (!fileName) {
        throw new Error("Invalid file name")
      }

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
      const s3Url = s3Data.url // Use S3 URL for database storage

      // Delete local file after successful S3 upload
      await fetch("/api/shared/local-document-upload", {
        method: "DELETE",
      })

      return s3Url
    }

    // If it's already an S3 URL or external URL, return as is
    return documentUrl
  }

  // Helper function to upload file to S3 (for direct file uploads from table)
  const uploadFileToS3 = async (file: File): Promise<string> => {
    try {
      // First upload to local storage
      const formData = new FormData()
      formData.append("file", file)

      const localResponse = await fetch("/api/shared/local-document-upload", {
        method: "POST",
        body: formData,
      })

      if (!localResponse.ok) {
        const error = await localResponse.json()
        throw new Error(error.error || "Failed to upload file to local storage")
      }

      const localData = await localResponse.json()
      const localUrl = localData.url

      // Then use uploadDocumentToS3 to handle S3 upload
      return await uploadDocumentToS3(localUrl)
    } catch (error: any) {
      console.error("File upload error:", error)
      toast({
        title: "File Upload Error",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !user?.role_id) return

    const formValues = form.getValues()
    let updateData: any = {}

    try {
      // Handle document upload to S3 if a document exists (matches research module pattern)
      let docUrl = formValues.Image || null

      if (docUrl && docUrl.startsWith("/uploaded-document/")) {
        try {
          docUrl = await uploadDocumentToS3(docUrl)
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          return // Stop update if S3 upload fails (matches research pattern)
        }
      }

      if (editingItem.sectionId === "performance") {
        updateData = {
          name: formValues.name,
          place: formValues.place,
          date: formValues.date,
          perf_nature: formValues.perf_nature,
          Image: docUrl,
        }
        await performanceMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      } else if (editingItem.sectionId === "awards") {
        updateData = {
          name: formValues.name,
          details: formValues.details || "",
          organization: formValues.organization,
          address: formValues.address || "",
          date_of_award: formValues.date_of_award,
          level: formValues.level,
          Image: docUrl,
        }
        await awardsMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      } else if (editingItem.sectionId === "extension") {
        updateData = {
          names: formValues.names,
          place: formValues.place,
          date: formValues.date,
          name_of_activity: formValues.name_of_activity,
          sponsered: formValues.sponsered,
          level: formValues.level,
          Image: docUrl,
        }
        await extensionMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      }
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setAutoFilledFields(new Set()) // Clear highlighting on successful update
      // Don't reset form in edit mode - preserve form state
      // form.reset() // Removed - keep form state after successful update
    } catch (error: any) {
      console.error("Error updating record:", error)
      // Toast handled by mutation hook
    }
  }

  const handleFileUpload = useCallback(async (sectionId: string, itemId: number) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive",
      })
      return
    }

    let updateData: any = {}
    let item: any = null

    try {
      // Upload file to S3
      const docUrl = await uploadFileToS3(selectedFiles[0])

      if (sectionId === "performance") {
        item = data.performance.find((r: any) => r.id === itemId)
        if (!item) {
          toast({
            title: "Error",
            description: "Item not found",
            variant: "destructive",
          })
          return
        }
        updateData = {
          name: item.name || item.titleOfPerformance,
          place: item.place,
          date: item.date || item.performanceDate,
          perf_nature: item.perf_nature || item.natureOfPerformance,
          Image: docUrl,
        }
        await performanceMutations.updateMutation.mutateAsync({
          id: itemId,
          data: updateData,
        })
        setSelectedFiles(null)
      } else if (sectionId === "awards") {
        item = data.awards.find((r: any) => r.id === itemId)
        if (!item) {
          toast({
            title: "Error",
            description: "Item not found",
            variant: "destructive",
          })
          return
        }
        updateData = {
          name: item.name || item.nameOfAwardFellowship,
          details: item.details || "",
          organization: item.organization || item.nameOfAwardingAgency,
          address: item.address || item.addressOfAwardingAgency || "",
          date_of_award: item.date_of_award || item.dateOfAward,
          level: item.levelId || item.level,
          Image: docUrl,
        }
        await awardsMutations.updateMutation.mutateAsync({
          id: itemId,
          data: updateData,
        })
        setSelectedFiles(null)
      } else if (sectionId === "extension") {
        item = data.extension.find((r: any) => r.id === itemId)
        if (!item) {
          toast({
            title: "Error",
            description: "Item not found",
            variant: "destructive",
          })
          return
        }
        updateData = {
          names: item.names || item.natureOfActivity,
          place: item.place,
          date: item.date,
          name_of_activity: item.nameOfActivity || item.name_of_activity,
          sponsered: item.sponseredId || item.sponsered,
          level: item.levelId || item.level,
          Image: docUrl,
        }
        await extensionMutations.updateMutation.mutateAsync({
          id: itemId,
          data: updateData,
        })
        setSelectedFiles(null)
      }
    } catch (error) {
      // Error handling is done in uploadFileToS3 and mutation hook
    }
  }, [selectedFiles, data, toast, performanceMutations, awardsMutations, extensionMutations])

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
  const createColumnsForSection = (
    section: any, 
    handleEdit: (sectionId: string, item: any) => void, 
    handleDelete: (sectionId: string, itemId: number, itemName: string) => void,
    handleFileSelect: (files: FileList | null) => void,
    handleFileUpload: (sectionId: string, itemId: number) => Promise<void>
  ): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = []

    // Performance columns
    if (section.id === "performance") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "titleOfPerformance", header: "Title of Performance", enableSorting: true, cell: ({ row }) => {
          const title = displayValue(row.original.titleOfPerformance)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={title}>{title}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "place", header: "Place", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.place)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "performanceDate", header: "Performance Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.performanceDate || row.original.date)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "natureOfPerformance", header: "Nature of Performance", enableSorting: true, cell: ({ row }) => {
          const nature = displayValue(row.original.natureOfPerformance || row.original.perf_nature)
          return <Badge variant="outline" className="text-[10px] sm:text-xs">{nature}</Badge>
        } },
      )
    }
    // Awards columns
    else if (section.id === "awards") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "nameOfAwardFellowship", header: "Name of Award / Fellowship", enableSorting: true, cell: ({ row }) => {
          const name = displayValue(row.original.nameOfAwardFellowship || row.original.name)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={name}>{name}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "details", header: "Details", enableSorting: true, cell: ({ row }) => {
          const details = displayValue(row.original.details)
          return <div className="max-w-[120px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={details}>{details}</div>
        }, meta: { className: "max-w-[120px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "nameOfAwardingAgency", header: "Name of Awarding Agency", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.nameOfAwardingAgency || row.original.organization)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "addressOfAwardingAgency", header: "Address of Awarding Agency", enableSorting: true, cell: ({ row }) => {
          const address = displayValue(row.original.addressOfAwardingAgency || row.original.address)
          return <div className="max-w-[120px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={address}>{address}</div>
        }, meta: { className: "max-w-[120px] sm:max-w-xs px-2 sm:px-4" } },
        { accessorKey: "dateOfAward", header: "Date of Award", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.dateOfAward || row.original.date_of_award)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "level", header: "Level", enableSorting: true, cell: ({ row }) => {
          const awardLevelName = awardFellowLevelOptions.find(l => l.id === row.original.levelId || l.id === row.original.level)?.name || row.original.level || "N/A"
          return <Badge variant="secondary" className="text-[10px] sm:text-xs">{displayValue(awardLevelName)}</Badge>
        } },
      )
    }
    // Extension columns
    else if (section.id === "extension") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "nameOfActivity", header: "Name of Activity", enableSorting: true, cell: ({ row }) => {
          const name = displayValue(row.original.nameOfActivity || row.original.name_of_activity)
          return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={name}>{name}</div>
        }, meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } },
        { accessorKey: "natureOfActivity", header: "Nature of Activity", enableSorting: true, cell: ({ row }) => {
          const nature = displayValue(row.original.natureOfActivity || row.original.names)
          return <Badge variant="outline" className="text-[10px] sm:text-xs">{nature}</Badge>
        } },
        { accessorKey: "level", header: "Level", enableSorting: true, cell: ({ row }) => {
          const extensionLevelName = awardFellowLevelOptions.find(l => l.id === row.original.levelId || l.id === row.original.level)?.name || row.original.levelName || row.original.level || "N/A"
          return <Badge variant="secondary" className="text-[10px] sm:text-xs">{displayValue(extensionLevelName)}</Badge>
        } },
        { accessorKey: "sponsoredBy", header: "Sponsored By", enableSorting: true, cell: ({ row }) => {
          const sponserName = sponserNameOptions.find(s => s.id === row.original.sponseredId || s.id === row.original.sponsered)?.name || row.original.sponsoredBy || "N/A"
          return <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(sponserName)}</span>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "place", header: "Place", enableSorting: true, cell: ({ row }) => {
          const place = displayValue(row.original.place)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><MapPin className="h-3 w-3 text-gray-400" /><span>{place}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
          const date = formatDate(row.original.date)
          return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4"><Calendar className="h-3 w-3 text-gray-400" /><span>{date}</span></div>
        }, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }

    // Add Supporting Document column (common for all sections)
    columns.push({
      id: "supportingDocument",
      header: "Document",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            {item.supportingDocument && item.supportingDocument.length > 0 ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="View Document" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" onClick={(e) => e.stopPropagation()}>
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="w-[95vw] sm:w-[90vw] max-w-4xl h-[85vh] sm:h-[80vh] p-0 overflow-hidden"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <DialogHeader className="p-4 border-b">
                      <DialogTitle>View Document</DialogTitle>
                    </DialogHeader>
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
                  file
                </Badge>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Upload Document" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" onClick={(e) => e.stopPropagation()}>
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-1">Upload</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Supporting Documents</DialogTitle>
                  </DialogHeader>
                  <FileUpload onFileSelect={handleFileSelect} />
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                    <Button onClick={() => handleFileUpload(section.id, item.id)} className="w-full sm:w-auto">
                      Upload Files
                    </Button>
                  </div>
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
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(section.id, item) }} className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { 
                e.stopPropagation()
                handleDeleteClick(section.id, item.id, item.name || item.nameOfAwardFellowship || item.nameOfActivity || "this record")
              }}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
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
        handleDeleteClick,
        handleFileSelect,
        handleFileUpload
      )
    })
    return columnsMap
  }, [sections, awardFellowLevelOptions, sponserNameOptions, handleEdit, handleDeleteClick, handleFileSelect, handleFileUpload])



  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "performance":
        return (
          <PerformanceTeacherForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            onClearFields={handleClearFields}
            isAutoFilled={isAutoFilled}
            onFieldChange={clearAutoFillHighlight}
          />
        )
      case "awards":
        return (
          <AwardsFellowshipForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            awardFellowLevelOptions={awardFellowLevelOptions}
            onClearFields={handleClearFields}
            isAutoFilled={isAutoFilled}
            onFieldChange={clearAutoFillHighlight}
          />
        )
      case "extension":
        return (
          <ExtensionActivityForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            awardFellowLevelOptions={awardFellowLevelOptions}
            sponserNameOptions={sponserNameOptions}
            onClearFields={handleClearFields}
            isAutoFilled={isAutoFilled}
            onFieldChange={clearAutoFillHighlight}
          />
        )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
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
          <h1 className="text-3xl font-bold tracking-tight">Awards & Recognition</h1>
          <p className="text-muted-foreground">Manage your awards, recognitions, and extension activities</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="flex flex-wrap min-w-max w-full sm:w-auto">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm"
                  >
                    <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{section.title}</span>
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
                      router.push(`/teacher/awards-recognition/add?tab=${section.id}`)
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {section.title}
                  </Button>
                </CardHeader>
                <CardContent>
                  <EnhancedDataTable
                    columns={columnsBySection[section.id] || []}
                    data={data[section.id as keyof typeof data] || []}
                    loading={loadingStates[section.id as keyof typeof loadingStates]}
                    pageSize={10}
                    exportable={true}
                    enableGlobalFilter={true}
                    emptyMessage={`No ${section.title.toLowerCase()} found. Click "Add ${section.title}" to get started.`}
                    wrapperClassName="rounded-md border overflow-x-auto"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog - Fully Responsive */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-3 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4">
            <DialogHeader className="pb-0 sm:pb-2 shrink-0">
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:mr-0 min-h-0">
              {editingItem && renderForm(editingItem.sectionId, true)}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-3 border-t shrink-0">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleModalCancel} 
                className="w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Trigger form submission
                  form.handleSubmit(handleSaveEdit)()
                }} 
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span>Save Changes</span>
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
              <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                This action cannot be undone. This will permanently delete the record
                <strong className="block mt-2 text-base">
                  "{deleteConfirm?.itemName}"
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
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

