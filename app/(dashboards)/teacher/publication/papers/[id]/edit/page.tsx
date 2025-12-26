"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { ArrowLeft, Presentation, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"
import { usePaperMutations } from "@/hooks/use-teacher-mutations"
import { useQuery } from "@tanstack/react-query"
import { teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { cn } from "@/lib/utils"

interface PaperFormData {
  authors: string
  theme: string
  organising_body: string
  place: string
  date: string
  title_of_paper: string
  level: number | null
  mode: string
  Image?: string
}

export default function EditPaperPage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { updatePaper } = usePaperMutations()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string>("")
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()

  const { resPubLevelOptions } = useDropDowns()

  const form = useForm<PaperFormData>({
    defaultValues: {
      authors: "",
      theme: "",
      organising_body: "",
      place: "",
      date: "",
      title_of_paper: "",
      level: null,
      mode: "",
      Image: "",
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = form

  // Track auto-filled fields for highlighting
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  // Helper function to check if a field is auto-filled
  const isAutoFilled = useCallback((fieldName: string) => {
    return autoFilledFields.has(fieldName)
  }, [autoFilledFields])

  // Helper function to clear auto-fill highlight for a field
  const clearAutoFillHighlight = useCallback((fieldName: string) => {
    setAutoFilledFields(prev => {
      if (prev.has(fieldName)) {
        const next = new Set(prev)
        next.delete(fieldName)
        return next
      }
      return prev
    })
  }, [])

  // Helper function to validate and set dropdown field value - only highlights if value was successfully set
  const setDropdownValue = useCallback((
    fieldName: string,
    value: any,
    options: Array<{ id: number; name: string }>,
    filledFieldNames: string[]
  ): number | null => {
    if (value === null || value === undefined) {
      setValue(fieldName as any, null)
      return null
    }
    
    const numValue = Number(value)
    if (isNaN(numValue)) {
      setValue(fieldName as any, null)
      return null
    }
    
    // Verify the value exists in options
    const existsInOptions = options.some(opt => opt.id === numValue)
    if (existsInOptions) {
      setValue(fieldName as any, numValue)
      filledFieldNames.push(fieldName)
      return numValue
    }
    
    setValue(fieldName as any, null)
    return null
  }, [setValue])

  // Use auto-fill hook for document analysis data - watches context changes
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "papers", // Explicit form type
    dropdownOptions: {
      level: resPubLevelOptions,
    },
    onlyFillEmpty: false, // REPLACE existing data with new extracted data
    onAutoFill: (fields) => {
      console.log("EDIT PAGE: Auto-fill triggered with fields", fields)
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // REPLACE all form fields with extracted data (even if they already have values)
      // This ensures new extraction replaces existing data
      
      // Authors - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.authors !== undefined) {
        const authorsValue = fields.authors ? String(fields.authors).trim() : ""
        setValue("authors", authorsValue)
        if (authorsValue) filledFieldNames.push("authors")
      }
      
      // Theme - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.theme !== undefined) {
        const themeValue = fields.theme ? String(fields.theme).trim() : ""
        setValue("theme", themeValue)
        if (themeValue) filledFieldNames.push("theme")
      }
      
      // Organising Body - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.organising_body !== undefined) {
        const organisingBodyValue = fields.organising_body ? String(fields.organising_body).trim() : ""
        setValue("organising_body", organisingBodyValue)
        if (organisingBodyValue) filledFieldNames.push("organising_body")
      }
      
      // Place - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.place !== undefined) {
        const placeValue = fields.place ? String(fields.place).trim() : ""
        setValue("place", placeValue)
        if (placeValue) filledFieldNames.push("place")
      }
      
      // Date - replace if exists in extraction (only highlight if valid date)
      if (fields.date !== undefined) {
        const dateValue = fields.date ? String(fields.date).trim() : ""
        if (dateValue) {
          // Validate date format
          try {
            const parsedDate = new Date(dateValue)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (!isNaN(parsedDate.getTime()) && parsedDate <= today) {
              setValue("date", dateValue)
              filledFieldNames.push("date")
            } else {
              setValue("date", "")
            }
          } catch {
            setValue("date", "")
          }
        } else {
          setValue("date", "")
        }
      }
      
      // Title of Paper - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.title_of_paper !== undefined) {
        const titleOfPaperValue = fields.title_of_paper ? String(fields.title_of_paper).trim() : ""
        setValue("title_of_paper", titleOfPaperValue)
        if (titleOfPaperValue) filledFieldNames.push("title_of_paper")
      }
      
      // Mode - replace if exists in extraction (only highlight if valid mode)
      if (fields.mode !== undefined) {
        const modeValue = fields.mode ? String(fields.mode).trim() : ""
        if (modeValue && ["Physical", "Virtual", "Hybrid"].includes(modeValue)) {
          setValue("mode", modeValue)
          filledFieldNames.push("mode")
        } else {
          setValue("mode", "")
        }
      }
      
      // Level - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.level !== undefined) {
        setDropdownValue("level", fields.level, resPubLevelOptions, filledFieldNames)
      }
      
      // Update the auto-filled fields set AFTER processing all fields
      setAutoFilledFields(new Set(filledFieldNames))
    },
    clearAfterUse: false, // Keep data for manual editing
  })

  // Unsaved changes guard
  const { DialogComponent: NavigationDialog } = useUnsavedChangesGuard({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    clearAutoFillData: clearAutoFillData,
    enabled: true,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cancel handler
  const { handleCancel, DialogComponent: CancelDialog } = useFormCancelHandler({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    redirectPath: "/teacher/publication",
    skipWarning: false,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear document data when leaving the page
      if (hasDocumentData) {
        clearDocumentData()
        clearAutoFillData()
      }
    }
  }, [hasDocumentData, clearDocumentData, clearAutoFillData])

  // Note: Dropdown data is already available from Context, no need to fetch

  // Use React Query to fetch papers list - always fetch fresh data for edit pages
  const { data: papersData, isLoading: isLoadingPaper } = useQuery({
    queryKey: teacherQueryKeys.publications.papers(teacherId),
    queryFn: async () => {
      const res = await fetch(`/api/teacher/publication/papers?teacherId=${teacherId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch paper")
      }
      return res.json()
    },
    enabled: !!id && !!teacherId && teacherId > 0,
    staleTime: 0, // Always fetch fresh data for edit pages
    gcTime: 0, // Don't cache for edit pages
    refetchOnMount: true, // Always refetch when component mounts
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (!papersData || !id) return

    const paper = papersData.papers?.find((p: any) => p.papid === parseInt(id as string))

    if (!paper) {
      toast({
        title: "Paper not found",
        description: "The paper you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/teacher/publication")
      return
    }

    // Format date for input
    const formatDateForInput = (dateStr: string | null) => {
      if (!dateStr) return ""
      try {
        return new Date(dateStr).toISOString().split("T")[0]
      } catch {
        return ""
      }
    }

    // Set existing document URL if available
    if (paper.Image) {
      setExistingDocumentUrl(paper.Image)
      setDocumentUrl(paper.Image)
      setValue("Image", paper.Image) // Update form field so cancel handler can detect document
    }

    // Populate form with fetched data
    reset({
      authors: paper.authors || "",
      theme: paper.theme || "",
      organising_body: paper.organising_body || "",
      place: paper.place || "",
      date: formatDateForInput(paper.date),
      title_of_paper: paper.title_of_paper || "",
      level: paper.level || null,
      mode: paper.mode || "",
      Image: paper.Image || "",
    })
  }, [papersData, id, reset, router, toast])

  const isLoading = isLoadingPaper || !papersData

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
    setValue("Image", url) // Update form field so cancel handler can detect document
  }

  const onSubmit = async (data: PaperFormData) => {
    if (!user?.role_id || !id) {
      toast({
        title: "Error",
        description: "User not authenticated or paper ID missing",
        variant: "destructive",
      })
      return
    }

    // Validate document upload is required (either existing or new)
    if (!documentUrl) {
      toast({
        title: "Validation Error",
        description: "Please upload a supporting document",
        variant: "destructive",
      })
      return
    }

    // Handle document upload to S3 if a new document was uploaded
    let pdfPath = existingDocumentUrl || null
    const oldImagePath = existingDocumentUrl // Store for deletion if new file is uploaded

    // Enhanced helper function to handle old file deletion with improved logging and error handling
    const handleOldFileDeletion = async (
      oldPath: string | null,
      newPath: string,
      recordId: number
    ) => {
      // Early return if no old path or paths are the same (updating same file)
      if (!oldPath || !oldPath.startsWith("upload/")) {
        return
      }

      // If old and new paths are the same, no deletion needed (same file being updated)
      if (oldPath === newPath) {
        console.log("Old and new file paths are identical - skipping deletion (same file update)")
        return
      }

      // Import helper functions
      const { deleteDocument, checkDocumentExists } = await import("@/lib/s3-upload-helper")

      try {
        // Optional: Check if file exists before attempting deletion (optimization)
        // This prevents unnecessary API calls if file was already deleted
        const existsCheck = await checkDocumentExists(oldPath)
        
        if (!existsCheck.exists) {
          console.log(`Old file does not exist in S3 (may have been already deleted): ${oldPath}`)
          return
        }

        // File exists, proceed with deletion
        console.log(`Attempting to delete old S3 file: ${oldPath}`)
        const deleteResult = await deleteDocument(oldPath)
        
        if (deleteResult.success) {
          console.log(`Successfully deleted old S3 file: ${oldPath}`)
        } else {
          console.warn(`Failed to delete old S3 file: ${oldPath}`, {
            error: deleteResult.message,
            recordId,
            oldPath,
            newPath
          })
          // Don't fail the update if old file deletion fails - this is a cleanup operation
        }
      } catch (deleteError: any) {
        console.warn("Error during old file deletion process:", {
          error: deleteError?.message || deleteError,
          oldPath,
          newPath,
          recordId
        })
        // Don't fail the update if old file deletion fails - this is a cleanup operation
      }
    }

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        // For edit pages, use the actual record ID from the database
        const recordId = parseInt(id as string, 10)
        
        // Upload new document to S3 with Pattern 1: upload/Paper_Presented/{userId}_{recordId}.pdf
        pdfPath = await uploadDocumentToS3(
          documentUrl,
          user.role_id,
          recordId,
          "Paper_Presented"
        )
        
        // Verify we got a valid S3 virtual path
        if (!pdfPath || !pdfPath.startsWith("upload/")) {
          throw new Error("Failed to get S3 virtual path from upload")
        }

        // Enhanced deletion logic: Delete old file if it exists and is different from new one
        await handleOldFileDeletion(oldImagePath, pdfPath, recordId)
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document. Please try again.",
          variant: "destructive",
        })
        return
      }
    } else if (documentUrl && documentUrl.startsWith("upload/")) {
      // Already an S3 path, use as-is
      pdfPath = documentUrl
      
      // If the document URL changed but is still an S3 path, check if we need to delete old file
      if (oldImagePath && oldImagePath !== pdfPath) {
        const recordId = parseInt(id as string, 10)
        await handleOldFileDeletion(oldImagePath, pdfPath, recordId)
      }
    } else if (documentUrl && !documentUrl.startsWith("/uploaded-document/") && !documentUrl.startsWith("upload/")) {
      // Invalid path format
      toast({
        title: "Invalid Document Path",
        description: "Document path format is invalid. Please upload the document again.",
        variant: "destructive",
      })
      return
    }

    const paperData = {
      theme: data.theme || null,
      organising_body: data.organising_body || null,
      place: data.place || null,
      date: data.date || null,
      title_of_paper: data.title_of_paper,
      level: data.level,
      authors: data.authors,
      Image: pdfPath,
      mode: data.mode || null,
    }

    // Use mutation instead of direct fetch
    updatePaper.mutate(
      { paperId: parseInt(id as string), paperData },
      {
        onSuccess: () => {
          clearDocumentData()
          clearAutoFillData()
          router.push("/teacher/publication")
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading paper presentation...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {NavigationDialog && <NavigationDialog />}
      {CancelDialog && <CancelDialog />}
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={updatePaper.isPending} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Edit Paper Presented</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Edit your presented paper at conference/seminar/symposia</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Edit Paper Presentation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Document Upload Section */}
          <div className="mb-6">
            <Label className="text-base sm:text-lg font-semibold mb-3 block">
              Supporting Document (Optional - upload new to replace existing)
            </Label>
            <DocumentUpload
              documentUrl={documentUrl}
              category="Books/Papers"
              subCategory="Papers Presented"
              onChange={handleDocumentChange}
              allowedFileTypes={["pdf", "jpg", "jpeg"]}
              maxFileSize={1 * 1024 * 1024}
              isEditMode={true}
              disabled={updatePaper.isPending}
              onClearFields={() => {
                reset()
                setAutoFilledFields(new Set())
              }}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload new document to replace existing (PDF, JPG, JPEG - max 1MB)</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="authors">Author(s) *</Label>
              <Input
                id="authors"
                {...register("authors", { 
                  required: "Author(s) is required",
                  minLength: { value: 2, message: "Author(s) must be at least 2 characters" },
                  maxLength: { value: 500, message: "Author(s) must not exceed 500 characters" },
                  pattern: {
                    value: /^[a-zA-Z\s,\.&'-]+$/,
                    message: "Author(s) can only contain letters, spaces, commas, periods, ampersands, apostrophes, and hyphens"
                  }
                })}
                placeholder="Enter all authors"
                disabled={updatePaper.isPending}
                className={cn(
                  isAutoFilled("authors") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                )}
                onBlur={(e) => {
                  register("authors").onBlur(e)
                  clearAutoFillHighlight("authors")
                }}
              />
              {errors.authors && <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="level">Presentation Level *</Label>
                <Controller
                  name="level"
                  control={control}
                  rules={{ 
                    required: "Presentation level is required",
                    validate: (v) => v !== null && v !== undefined || "Presentation level is required"
                  }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={resPubLevelOptions.map((l) => ({
                        value: l.id,
                        label: l.name,
                      }))}
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : null)
                        clearAutoFillHighlight("level")
                      }}
                      placeholder="Select presentation level"
                      emptyMessage="No level found"
                      disabled={updatePaper.isPending}
                      className={cn(
                        isAutoFilled("level") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      )}
                    />
                  )}
                />
                {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level.message}</p>}
              </div>
              <div>
                <Label htmlFor="mode">Mode of Participation *</Label>
                <Controller
                  name="mode"
                  control={control}
                  rules={{
                    required: "Mode of participation is required",
                    validate: (v) => {
                      if (!v || v.trim() === "") {
                        return "Mode of participation is required"
                      }
                      if (!["Physical", "Virtual", "Hybrid"].includes(v)) {
                        return "Mode must be Physical, Virtual, or Hybrid"
                      }
                      return true
                    }
                  }}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={(val) => {
                        field.onChange(val)
                        clearAutoFillHighlight("mode")
                      }}
                      disabled={updatePaper.isPending}
                    >
                      <SelectTrigger className={cn(
                        isAutoFilled("mode") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      )}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physical">Physical</SelectItem>
                        <SelectItem value="Virtual">Virtual</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mode && <p className="text-sm text-red-500 mt-1">{errors.mode.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="theme">Theme Of Conference/Seminar/Symposia *</Label>
              <Input 
                id="theme" 
                {...register("theme", {
                  required: "Theme is required",
                  minLength: { value: 3, message: "Theme must be at least 3 characters" },
                  maxLength: { value: 500, message: "Theme must not exceed 500 characters" }
                })} 
                placeholder="Enter conference theme"
                disabled={updatePaper.isPending}
                className={cn(
                  isAutoFilled("theme") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                )}
                onBlur={(e) => {
                  register("theme").onBlur(e)
                  clearAutoFillHighlight("theme")
                }}
              />
              {errors.theme && <p className="text-sm text-red-500 mt-1">{errors.theme.message}</p>}
            </div>

            <div>
              <Label htmlFor="title_of_paper">Title of Paper *</Label>
              <Input
                id="title_of_paper"
                {...register("title_of_paper", { 
                  required: "Title of paper is required",
                  minLength: { value: 5, message: "Title must be at least 5 characters" },
                  maxLength: { value: 1000, message: "Title must not exceed 1000 characters" }
                })}
                placeholder="Enter paper title"
                disabled={updatePaper.isPending}
                className={cn(
                  isAutoFilled("title_of_paper") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                )}
                onBlur={(e) => {
                  register("title_of_paper").onBlur(e)
                  clearAutoFillHighlight("title_of_paper")
                }}
              />
              {errors.title_of_paper && <p className="text-sm text-red-500 mt-1">{errors.title_of_paper.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="organising_body">Organizing Body *</Label>
                <Input 
                  id="organising_body" 
                  {...register("organising_body", {
                    required: "Organizing body is required",
                    minLength: { value: 2, message: "Organizing body must be at least 2 characters" },
                    maxLength: { value: 300, message: "Organizing body must not exceed 300 characters" },
                    pattern: {
                      value: /^[a-zA-Z0-9\s,\.&'-]+$/,
                      message: "Organizing body contains invalid characters"
                    }
                  })} 
                  placeholder="Enter organizing body"
                  disabled={updatePaper.isPending}
                  className={cn(
                    isAutoFilled("organising_body") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                  )}
                  onBlur={(e) => {
                    register("organising_body").onBlur(e)
                    clearAutoFillHighlight("organising_body")
                  }}
                />
                {errors.organising_body && <p className="text-sm text-red-500 mt-1">{errors.organising_body.message}</p>}
              </div>
              <div>
                <Label htmlFor="place">Place *</Label>
                <Input 
                  id="place" 
                  {...register("place", {
                    required: "Place is required",
                    minLength: { value: 2, message: "Place must be at least 2 characters" },
                    maxLength: { value: 200, message: "Place must not exceed 200 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s,\.-]+$/,
                      message: "Place contains invalid characters"
                    }
                  })} 
                  placeholder="Enter place"
                  disabled={updatePaper.isPending}
                  className={cn(
                    isAutoFilled("place") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                  )}
                  onBlur={(e) => {
                    register("place").onBlur(e)
                    clearAutoFillHighlight("place")
                  }}
                />
                {errors.place && <p className="text-sm text-red-500 mt-1">{errors.place.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="date">Date of Presentation/Seminar *</Label>
              <Input 
                id="date" 
                type="date" 
                max={new Date().toISOString().split('T')[0]}
                {...register("date", {
                  required: "Date is required",
                  validate: (v) => {
                    if (!v || v.trim() === "") {
                      return "Date is required"
                    }
                    const selectedDate = new Date(v)
                    const today = new Date()
                    today.setHours(23, 59, 59, 999) // Set to end of today to allow today's date
                    if (selectedDate > today) {
                      return "Date cannot be in the future"
                    }
                    // Check if date is valid
                    if (isNaN(selectedDate.getTime())) {
                      return "Please enter a valid date"
                    }
                    return true
                  }
                })}
                disabled={updatePaper.isPending}
                className={cn(
                  isAutoFilled("date") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                )}
                onBlur={(e) => {
                  register("date").onBlur(e)
                  clearAutoFillHighlight("date")
                }}
              />
              {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button type="submit" disabled={updatePaper.isPending} className="w-full sm:w-auto">
                {updatePaper.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Paper Presentation"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={updatePaper.isPending} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
