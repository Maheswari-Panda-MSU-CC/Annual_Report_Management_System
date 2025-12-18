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
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"
import { useJournalMutations } from "@/hooks/use-teacher-mutations"
import { useQuery } from "@tanstack/react-query"
import { teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { cn } from "@/lib/utils"

interface JournalFormData {
  authors: string
  author_num: number | null
  title: string
  isbn: string
  journal_name: string
  volume_num: number | null
  page_num: string
  month_year: string
  author_type: number | null
  level: number | null
  peer_reviewed: boolean
  h_index: number | null
  impact_factor: number | null
  in_scopus: boolean
  in_ugc: boolean
  in_clarivate: boolean
  in_oldUGCList: boolean
  paid: boolean
  issn: string
  type: number | null
  DOI: string
  Image?: string
}

export default function EditJournalArticlePage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { updateJournal } = useJournalMutations()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string>("")
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()

  const {
    journalAuthorTypeOptions,
    journalEditedTypeOptions,
    resPubLevelOptions
  } = useDropDowns()

  const form = useForm<JournalFormData>({
    defaultValues: {
      authors: "",
      author_num: null,
      title: "",
      isbn: "",
      journal_name: "",
      volume_num: null,
      page_num: "",
      month_year: "",
      author_type: null,
      level: null,
      peer_reviewed: false,
      h_index: null,
      impact_factor: null,
      in_scopus: false,
      in_ugc: false,
      in_clarivate: false,
      in_oldUGCList: false,
      paid: false,
      issn: "",
      type: null,
      DOI: "",
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
    formType: "journal-articles", // Explicit form type
    dropdownOptions: {
      level: resPubLevelOptions,
      author_type: journalAuthorTypeOptions,
      type: journalEditedTypeOptions,
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
      
      // Author Num - replace if exists in extraction
      if (fields.author_num !== undefined) {
        const authorNumValue = fields.author_num !== null && fields.author_num !== undefined ? Number(fields.author_num) : null
        setValue("author_num", authorNumValue)
        if (authorNumValue !== null) filledFieldNames.push("author_num")
      }
      
      // Title - replace if exists in extraction
      if (fields.title !== undefined) {
        const titleValue = fields.title ? String(fields.title) : ""
        setValue("title", titleValue)
        if (titleValue) filledFieldNames.push("title")
      }
      
      // ISBN - replace if exists in extraction
      if (fields.isbn !== undefined) {
        const isbnValue = fields.isbn ? String(fields.isbn) : ""
        setValue("isbn", isbnValue)
        if (isbnValue) filledFieldNames.push("isbn")
      }
      
      // Journal Name - replace if exists in extraction
      if (fields.journal_name !== undefined) {
        const journalNameValue = fields.journal_name ? String(fields.journal_name) : ""
        setValue("journal_name", journalNameValue)
        if (journalNameValue) filledFieldNames.push("journal_name")
      }
      
      // Volume Num - replace if exists in extraction
      if (fields.volume_num !== undefined) {
        const volumeNumValue = fields.volume_num !== null && fields.volume_num !== undefined ? Number(fields.volume_num) : null
        setValue("volume_num", volumeNumValue)
        if (volumeNumValue !== null) filledFieldNames.push("volume_num")
      }
      
      // Page Num - replace if exists in extraction
      if (fields.page_num !== undefined) {
        const pageNumValue = fields.page_num ? String(fields.page_num) : ""
        setValue("page_num", pageNumValue)
        if (pageNumValue) filledFieldNames.push("page_num")
      }
      
      // Month Year - replace if exists in extraction
      if (fields.month_year !== undefined) {
        const monthYearValue = fields.month_year ? String(fields.month_year) : ""
        setValue("month_year", monthYearValue)
        if (monthYearValue) filledFieldNames.push("month_year")
      }
      
      // Author Type - replace if exists in extraction
      if (fields.author_type !== undefined) {
        if (fields.author_type !== null && fields.author_type !== undefined) {
          const matchingAuthorType = journalAuthorTypeOptions.find(
            (a) => a.id === Number(fields.author_type)
          )
          if (matchingAuthorType) {
            setValue("author_type", matchingAuthorType.id)
            filledFieldNames.push("author_type")
          } else {
            setValue("author_type", null)
          }
        } else {
          setValue("author_type", null)
        }
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
      
      // Peer Reviewed - replace if exists in extraction
      if (fields.peer_reviewed !== undefined) {
        setValue("peer_reviewed", Boolean(fields.peer_reviewed))
        filledFieldNames.push("peer_reviewed")
      }
      
      // H Index - replace if exists in extraction
      if (fields.h_index !== undefined) {
        const hIndexValue = fields.h_index !== null && fields.h_index !== undefined ? Number(fields.h_index) : null
        setValue("h_index", hIndexValue)
        if (hIndexValue !== null) filledFieldNames.push("h_index")
      }
      
      // Impact Factor - replace if exists in extraction
      if (fields.impact_factor !== undefined) {
        const impactFactorValue = fields.impact_factor !== null && fields.impact_factor !== undefined ? Number(fields.impact_factor) : null
        setValue("impact_factor", impactFactorValue)
        if (impactFactorValue !== null) filledFieldNames.push("impact_factor")
      }
      
      // In Scopus - replace if exists in extraction
      if (fields.in_scopus !== undefined) {
        setValue("in_scopus", Boolean(fields.in_scopus))
        filledFieldNames.push("in_scopus")
      }
      
      // In UGC - replace if exists in extraction
      if (fields.in_ugc !== undefined) {
        setValue("in_ugc", Boolean(fields.in_ugc))
        filledFieldNames.push("in_ugc")
      }
      
      // In Clarivate - replace if exists in extraction
      if (fields.in_clarivate !== undefined) {
        setValue("in_clarivate", Boolean(fields.in_clarivate))
        filledFieldNames.push("in_clarivate")
      }
      
      // In Old UGC List - replace if exists in extraction
      if (fields.in_oldUGCList !== undefined) {
        setValue("in_oldUGCList", Boolean(fields.in_oldUGCList))
        filledFieldNames.push("in_oldUGCList")
      }
      
      // Paid - replace if exists in extraction
      if (fields.paid !== undefined) {
        setValue("paid", Boolean(fields.paid))
        filledFieldNames.push("paid")
      }
      
      // ISSN - replace if exists in extraction
      if (fields.issn !== undefined) {
        const issnValue = fields.issn ? String(fields.issn) : ""
        setValue("issn", issnValue)
        if (issnValue) filledFieldNames.push("issn")
      }
      
      // Type - replace if exists in extraction
      if (fields.type !== undefined) {
        if (fields.type !== null && fields.type !== undefined) {
          const matchingType = journalEditedTypeOptions.find(
            (t) => t.id === Number(fields.type)
          )
          if (matchingType) {
            setValue("type", matchingType.id)
            filledFieldNames.push("type")
          } else {
            setValue("type", null)
          }
        } else {
          setValue("type", null)
        }
      }
      
      // DOI - replace if exists in extraction
      if (fields.DOI !== undefined) {
        const doiValue = fields.DOI ? String(fields.DOI) : ""
        setValue("DOI", doiValue)
        if (doiValue) filledFieldNames.push("DOI")
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

  // Use React Query to fetch journals list - always fetch fresh data for edit pages
  const { data: journalsData, isLoading: isLoadingJournal, refetch: refetchJournal } = useQuery({
    queryKey: teacherQueryKeys.publications.journals(teacherId),
    queryFn: async () => {
      const res = await fetch(`/api/teacher/publication/journals?teacherId=${teacherId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch journal")
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
    if (!journalsData || !id) return

    const journal = journalsData.journals?.find((j: any) => j.id === parseInt(id as string))

    if (!journal) {
      toast({
        title: "Journal not found",
        description: "The journal article you're looking for doesn't exist.",
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
    if (journal.Image) {
      setExistingDocumentUrl(journal.Image)
      setDocumentUrl(journal.Image)
      setValue("Image", journal.Image) // Update form field so cancel handler can detect document
    }

    // Populate form with fetched data
    reset({
      authors: journal.authors || "",
      author_num: journal.author_num || null,
      title: journal.title || "",
      isbn: journal.isbn || "",
      journal_name: journal.journal_name || "",
      volume_num: journal.volume_num || null,
      page_num: journal.page_num || "",
      month_year: formatDateForInput(journal.month_year),
      author_type: journal.author_type || null,
      level: journal.level || null,
      peer_reviewed: journal.peer_reviewed ?? false,
      h_index: journal.h_index || null,
      impact_factor: journal.impact_factor || null,
      in_scopus: journal.in_scopus ?? false,
      in_ugc: journal.in_ugc ?? false,
      in_clarivate: journal.in_clarivate ?? false,
      in_oldUGCList: journal.in_oldUGCList ?? false,
      paid: journal.paid ?? false,
      issn: journal.issn || "",
      type: journal.type || null,
      DOI: journal.DOI || "",
      Image: journal.Image || "",
    })
  }, [journalsData, id, reset, router, toast])

  const isLoading = isLoadingJournal || !journalsData

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
    setValue("Image", url) // Update form field so cancel handler can detect document
  }

  const onSubmit = async (data: JournalFormData) => {
    if (!user?.role_id || !id) {
      toast({
        title: "Error",
        description: "User not authenticated or journal ID missing",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!data.title || !data.authors || !data.author_type || !data.level || !data.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
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
        
        const recordId = parseInt(id as string, 10)
        
        pdfPath = await uploadDocumentToS3(
          documentUrl,
          user.role_id,
          recordId,
          "Journal_Paper"
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

    const journalData = {
      authors: data.authors,
      author_num: data.author_num || null,
      title: data.title,
      isbn: data.isbn || null,
      journal_name: data.journal_name || null,
      volume_num: data.volume_num || null,
      page_num: data.page_num || null,
      month_year: data.month_year || null,
      author_type: data.author_type,
      level: data.level,
      peer_reviewed: data.peer_reviewed ?? false,
      h_index: data.h_index || null,
      impact_factor: data.impact_factor || null,
      in_scopus: data.in_scopus ?? false,
      submit_date: new Date(),
      paid: data.paid ?? false,
      issn: data.issn || null,
      type: data.type,
      Image: pdfPath,
      in_ugc: data.in_ugc ?? false,
      in_clarivate: data.in_clarivate ?? false,
      DOI: data.DOI || null,
      in_oldUGCList: data.in_oldUGCList ?? false,
    }

    // Use mutation instead of direct fetch
    updateJournal.mutate(
      { journalId: parseInt(id as string), journalData },
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
          <p className="text-muted-foreground">Loading journal article...</p>
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Edit Published Article/Journal/Edited Volume</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Edit your published article or paper in journal/edited volume</p>
        </div>
      </div>

      <Card>
        <CardContent>
          {/* Document Upload Section */}
          <div className="mb-6 my-4">
           
            <DocumentUpload
              documentUrl={documentUrl}
              category="Books/Papers"
              subCategory="Published Articles/Papers in Journals/Edited Volumes"
              onChange={handleDocumentChange}
              allowedFileTypes={["pdf", "jpg", "jpeg"]}
              maxFileSize={1 * 1024 * 1024}
              isEditMode={true}
              onClearFields={() => {
                reset()
                setAutoFilledFields(new Set())
              }}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload new document to replace existing (PDF, JPG, JPEG - max 1MB)</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="authors">Author(s) *</Label>
                <Input
                  id="authors"
                  {...register("authors", { 
                    required: "Authors are required",
                    minLength: { value: 2, message: "Authors must be at least 2 characters" },
                    maxLength: { value: 500, message: "Authors must not exceed 500 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s,\.&'-]+$/,
                      message: "Authors can only contain letters, spaces, commas, periods, ampersands, apostrophes, and hyphens"
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
              <div>
                <Label htmlFor="author_num">No. of Authors</Label>
                <Input
                  id="author_num"
                  type="number"
                  {...register("author_num", { 
                    valueAsNumber: true,
                    min: { value: 1, message: "Number of authors must be at least 1" },
                    max: { value: 100, message: "Number of authors cannot exceed 100" },
                    validate: (v) => v === null || v === undefined || (v > 0 && Number.isInteger(v)) || "Must be a positive integer"
                  })}
                  placeholder="Number of authors"
                />
                {errors.author_num && <p className="text-sm text-red-500 mt-1">{errors.author_num.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_type">Author Type *</Label>
                <Controller
                  name="author_type"
                  control={control}
                  rules={{ 
                    required: "Author type is required",
                    validate: (v) => v !== null && v !== undefined || "Author type is required"
                  }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={journalAuthorTypeOptions.map((a) => ({
                          value: a.id,
                          label: a.name,
                        }))}
                        value={field.value?.toString() || ""}
                        onValueChange={(val) => {
                          field.onChange(val ? Number(val) : null)
                          clearAutoFillHighlight("author_type")
                        }}
                        placeholder="Select author type"
                        emptyMessage="No author type found"
                        className={cn(
                          isAutoFilled("author_type") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                      />
                    )}
                />
                {errors.author_type && <p className="text-sm text-red-500 mt-1">{errors.author_type.message}</p>}
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ 
                    required: "Type is required",
                    validate: (v) => v !== null && v !== undefined || "Type is required"
                  }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={journalEditedTypeOptions.map((t) => ({
                          value: t.id,
                          label: t.name,
                        }))}
                        value={field.value?.toString() || ""}
                        onValueChange={(val) => {
                          field.onChange(val ? Number(val) : null)
                          clearAutoFillHighlight("type")
                        }}
                        placeholder="Select type"
                        emptyMessage="No type found"
                        className={cn(
                          isAutoFilled("type") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                      />
                    )}
                />
                {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title", { 
                  required: "Title is required",
                  minLength: { value: 5, message: "Title must be at least 5 characters" },
                  maxLength: { value: 1000, message: "Title must not exceed 1000 characters" }
                })}
                placeholder="Enter article/paper title"
                className={cn(
                  isAutoFilled("title") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                )}
                onBlur={(e) => {
                  register("title").onBlur(e)
                  clearAutoFillHighlight("title")
                }}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issn">ISSN (Without -)</Label>
                <Input 
                  id="issn" 
                  {...register("issn", {
                    validate: (v) => !v || /^[0-9]{8}$/.test(v.replace(/-/g, '')) || "ISSN must be 8 digits"
                  })} 
                  placeholder="Enter ISSN without dashes (8 digits)"
                />
                {errors.issn && <p className="text-sm text-red-500 mt-1">{errors.issn.message}</p>}
              </div>
              <div>
                <Label htmlFor="isbn">ISBN (Without -)</Label>
                <Input 
                  id="isbn" 
                  {...register("isbn", {
                    validate: (v) => !v || /^[0-9]{10}$/.test(v.replace(/-/g, '')) || /^[0-9]{13}$/.test(v.replace(/-/g, '')) || "ISBN must be 10 or 13 digits"
                  })} 
                  placeholder="Enter ISBN without dashes (10 or 13 digits)"
                />
                {errors.isbn && <p className="text-sm text-red-500 mt-1">{errors.isbn.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="journal_name">Journal/Book Name</Label>
              <Input
                id="journal_name"
                {...register("journal_name", { 
                  minLength: { value: 3, message: "Journal name must be at least 3 characters" },
                  maxLength: { value: 500, message: "Journal name must not exceed 500 characters" }
                })}
                placeholder="Enter journal or book name"
              />
              {errors.journal_name && <p className="text-sm text-red-500 mt-1">{errors.journal_name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="volume_num">Volume No.</Label>
                <Input
                  id="volume_num"
                  type="number"
                  {...register("volume_num", { 
                    valueAsNumber: true,
                    min: { value: 1, message: "Volume number must be at least 1" },
                    max: { value: 10000, message: "Volume number cannot exceed 10000" },
                    validate: (v) => v === null || v === undefined || (v > 0 && Number.isInteger(v)) || "Must be a positive integer"
                  })}
                  placeholder="Volume number"
                />
                {errors.volume_num && <p className="text-sm text-red-500 mt-1">{errors.volume_num.message}</p>}
              </div>
              <div>
                <Label htmlFor="page_num">Page No. (Range)</Label>
                <Input 
                  id="page_num" 
                  {...register("page_num", {
                    validate: (v) => !v || /^[0-9]+(-[0-9]+)?$/.test(v) || "Page number must be a number or range (e.g., 123 or 123-135)"
                  })} 
                  placeholder="e.g., 123-135" 
                />
                {errors.page_num && <p className="text-sm text-red-500 mt-1">{errors.page_num.message}</p>}
              </div>
              <div>
                <Label htmlFor="month_year">Date</Label>
                <Input 
                  id="month_year" 
                  type="date" 
                  {...register("month_year", {
                    validate: (v) => !v || new Date(v) <= new Date() || "Date cannot be in the future"
                  })} 
                />
                {errors.month_year && <p className="text-sm text-red-500 mt-1">{errors.month_year.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level *</Label>
                <Controller
                  name="level"
                  control={control}
                  rules={{ 
                    required: "Level is required",
                    validate: (v) => v !== null && v !== undefined || "Level is required"
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
                        placeholder="Select level"
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
                <Label htmlFor="peer_reviewed">Peer Reviewed?</Label>
                <Controller
                  name="peer_reviewed"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="h_index">H Index</Label>
                <Input
                  id="h_index"
                  type="number"
                  step="0.0001"
                  {...register("h_index", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "H Index cannot be negative" },
                    max: { value: 1000, message: "H Index cannot exceed 1000" }
                  })}
                  placeholder="H Index value"
                />
                {errors.h_index && <p className="text-sm text-red-500 mt-1">{errors.h_index.message}</p>}
              </div>
              <div>
                <Label htmlFor="impact_factor">Impact Factor</Label>
                <Input
                  id="impact_factor"
                  type="number"
                  step="0.0001"
                  {...register("impact_factor", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "Impact Factor cannot be negative" },
                    max: { value: 1000, message: "Impact Factor cannot exceed 1000" }
                  })}
                  placeholder="Impact Factor value"
                />
                {errors.impact_factor && <p className="text-sm text-red-500 mt-1">{errors.impact_factor.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="DOI">DOI</Label>
              <Input 
                id="DOI" 
                {...register("DOI", {
                  validate: (v) => !v || /^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/.test(v) || "Invalid DOI format. Must start with 10.xxxx/"
                })} 
                placeholder="Enter DOI (e.g., 10.1000/xyz123)" 
              />
              {errors.DOI && <p className="text-sm text-red-500 mt-1">{errors.DOI.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="in_scopus">In Scopus?</Label>
                <Controller
                  name="in_scopus"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="in_ugc">In UGC CARE?</Label>
                <Controller
                  name="in_ugc"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="in_clarivate">In CLARIVATE?</Label>
                <Controller
                  name="in_clarivate"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="in_oldUGCList">In Old UGC List?</Label>
                <Controller
                  name="in_oldUGCList"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paid">Charges Paid?</Label>
              <Controller
                name="paid"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? "Yes" : "No"}
                    onValueChange={(val) => field.onChange(val === "Yes")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button type="submit" disabled={updateJournal.isPending} className="w-full sm:w-auto">
                {updateJournal.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Article/Paper"
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
