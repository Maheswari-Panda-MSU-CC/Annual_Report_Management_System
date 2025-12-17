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
      
      // Authors - replace if exists in extraction
      if (fields.authors !== undefined) {
        const authorsValue = fields.authors ? String(fields.authors) : ""
        setValue("authors", authorsValue)
        if (authorsValue) filledFieldNames.push("authors")
      }
      
      // Theme - replace if exists in extraction
      if (fields.theme !== undefined) {
        const themeValue = fields.theme ? String(fields.theme) : ""
        setValue("theme", themeValue)
        if (themeValue) filledFieldNames.push("theme")
      }
      
      // Organising Body - replace if exists in extraction
      if (fields.organising_body !== undefined) {
        const organisingBodyValue = fields.organising_body ? String(fields.organising_body) : ""
        setValue("organising_body", organisingBodyValue)
        if (organisingBodyValue) filledFieldNames.push("organising_body")
      }
      
      // Place - replace if exists in extraction
      if (fields.place !== undefined) {
        const placeValue = fields.place ? String(fields.place) : ""
        setValue("place", placeValue)
        if (placeValue) filledFieldNames.push("place")
      }
      
      // Date - replace if exists in extraction
      if (fields.date !== undefined) {
        const dateValue = fields.date ? String(fields.date) : ""
        setValue("date", dateValue)
        if (dateValue) filledFieldNames.push("date")
      }
      
      // Title of Paper - replace if exists in extraction
      if (fields.title_of_paper !== undefined) {
        const titleOfPaperValue = fields.title_of_paper ? String(fields.title_of_paper) : ""
        setValue("title_of_paper", titleOfPaperValue)
        if (titleOfPaperValue) filledFieldNames.push("title_of_paper")
      }
      
      // Mode - replace if exists in extraction
      if (fields.mode !== undefined) {
        const modeValue = fields.mode ? String(fields.mode) : ""
        setValue("mode", modeValue)
        if (modeValue) filledFieldNames.push("mode")
      }
      
      // Level - replace if exists in extraction
      if (fields.level !== undefined) {
        if (fields.level !== null && fields.level !== undefined) {
          const matchingLevel = resPubLevelOptions.find(
            (l) => l.id === Number(fields.level)
          )
          if (matchingLevel) {
            setValue("level", matchingLevel.id)
            filledFieldNames.push("level")
          } else {
            setValue("level", null)
          }
        } else {
          setValue("level", null)
        }
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
    
    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        // For edit pages, use the actual record ID from the database
        const recordId = parseInt(id as string, 10)
        
        pdfPath = await uploadDocumentToS3(
          documentUrl,
          user.role_id,
          recordId,
          "Paper_Presented"
        )
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document. Please try again.",
          variant: "destructive",
        })
        return
      }
    } else if (documentUrl && !documentUrl.startsWith("/uploaded-document/")) {
      // Keep existing document URL if it's not a new upload
      pdfPath = documentUrl
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
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex items-center gap-2">
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
              allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
              maxFileSize={1 * 1024 * 1024}
              isEditMode={true}
              onClearFields={() => {
                reset()
                setAutoFilledFields(new Set())
              }}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload new document to replace existing (PDF, JPG, PNG - max 1MB)</p>
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
                      className={cn(
                        isAutoFilled("level") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      )}
                    />
                  )}
                />
                {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level.message}</p>}
              </div>
              <div>
                <Label htmlFor="mode">Mode of Participation</Label>
                <Controller
                  name="mode"
                  control={control}
                  rules={{
                    validate: (v) => !v || ["Physical", "Virtual", "Hybrid"].includes(v) || "Mode must be Physical, Virtual, or Hybrid"
                  }}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={(val) => {
                        field.onChange(val)
                        clearAutoFillHighlight("mode")
                      }}
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
              <Label htmlFor="theme">Theme Of Conference/Seminar/Symposia</Label>
              <Input 
                id="theme" 
                {...register("theme", {
                  maxLength: { value: 500, message: "Theme must not exceed 500 characters" }
                })} 
                placeholder="Enter conference theme"
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
                <Label htmlFor="organising_body">Organizing Body</Label>
                <Input 
                  id="organising_body" 
                  {...register("organising_body", {
                    maxLength: { value: 300, message: "Organizing body must not exceed 300 characters" },
                    pattern: {
                      value: /^[a-zA-Z0-9\s,\.&'-]*$/,
                      message: "Organizing body contains invalid characters"
                    }
                  })} 
                  placeholder="Enter organizing body"
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
                <Label htmlFor="place">Place</Label>
                <Input 
                  id="place" 
                  {...register("place", {
                    maxLength: { value: 200, message: "Place must not exceed 200 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s,\.-]*$/,
                      message: "Place contains invalid characters"
                    }
                  })} 
                  placeholder="Enter place"
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
              <Label htmlFor="date">Date of Presentation/Seminar</Label>
              <Input 
                id="date" 
                type="date" 
                {...register("date", {
                  validate: (v) => !v || new Date(v) <= new Date() || "Date cannot be in the future"
                })}
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
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
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
