"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { ArrowLeft, FileText, Brain, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"
import { useJournalMutations } from "@/hooks/use-teacher-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
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

export default function AddJournalArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { createJournal } = useJournalMutations()
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()

  const {
    journalAuthorTypeOptions,
    journalEditedTypeOptions,
    resPubLevelOptions,
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

  // Use auto-fill hook for document analysis data
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
      console.log("JOURNAL ARTICLES fields", fields)
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
      
      // Author Num - replace if exists in extraction (only highlight if valid number)
      if (fields.author_num !== undefined) {
        const authorNumValue = fields.author_num !== null && fields.author_num !== undefined ? Number(fields.author_num) : null
        setValue("author_num", authorNumValue)
        if (authorNumValue !== null && !isNaN(authorNumValue) && authorNumValue > 0) {
          filledFieldNames.push("author_num")
        }
      }
      
      // Title - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.title !== undefined) {
        const titleValue = fields.title ? String(fields.title).trim() : ""
        setValue("title", titleValue)
        if (titleValue) filledFieldNames.push("title")
      }
      
      // ISBN - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.isbn !== undefined) {
        const isbnValue = fields.isbn ? String(fields.isbn).trim() : ""
        setValue("isbn", isbnValue)
        if (isbnValue) filledFieldNames.push("isbn")
      }
      
      // Journal Name - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.journal_name !== undefined) {
        const journalNameValue = fields.journal_name ? String(fields.journal_name).trim() : ""
        setValue("journal_name", journalNameValue)
        if (journalNameValue) filledFieldNames.push("journal_name")
      }
      
      // Volume Num - replace if exists in extraction (only highlight if valid number)
      if (fields.volume_num !== undefined) {
        const volumeNumValue = fields.volume_num !== null && fields.volume_num !== undefined ? Number(fields.volume_num) : null
        setValue("volume_num", volumeNumValue)
        if (volumeNumValue !== null && !isNaN(volumeNumValue) && volumeNumValue > 0) {
          filledFieldNames.push("volume_num")
        }
      }
      
      // Page Num - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.page_num !== undefined) {
        const pageNumValue = fields.page_num ? String(fields.page_num).trim() : ""
        setValue("page_num", pageNumValue)
        if (pageNumValue) filledFieldNames.push("page_num")
      }
      
      // Month Year - replace if exists in extraction (only highlight if valid date)
      if (fields.month_year !== undefined) {
        const monthYearValue = fields.month_year ? String(fields.month_year).trim() : ""
        if (monthYearValue) {
          // Validate date format
          try {
            const parsedDate = new Date(monthYearValue)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (!isNaN(parsedDate.getTime()) && parsedDate <= today) {
              setValue("month_year", monthYearValue)
              filledFieldNames.push("month_year")
            } else {
              setValue("month_year", "")
            }
          } catch {
            setValue("month_year", "")
          }
        } else {
          setValue("month_year", "")
        }
      }
      
      // Author Type - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.author_type !== undefined) {
        setDropdownValue("author_type", fields.author_type, journalAuthorTypeOptions, filledFieldNames)
      }
      
      // Level - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.level !== undefined) {
        setDropdownValue("level", fields.level, resPubLevelOptions, filledFieldNames)
      }
      
      // Peer Reviewed - replace if exists in extraction
      if (fields.peer_reviewed !== undefined) {
        setValue("peer_reviewed", Boolean(fields.peer_reviewed))
        filledFieldNames.push("peer_reviewed")
      }
      
      // H Index - replace if exists in extraction (only highlight if valid number)
      if (fields.h_index !== undefined) {
        const hIndexValue = fields.h_index !== null && fields.h_index !== undefined ? Number(fields.h_index) : null
        setValue("h_index", hIndexValue)
        if (hIndexValue !== null && !isNaN(hIndexValue) && hIndexValue >= 0) {
          filledFieldNames.push("h_index")
        }
      }
      
      // Impact Factor - replace if exists in extraction (only highlight if valid number)
      if (fields.impact_factor !== undefined) {
        const impactFactorValue = fields.impact_factor !== null && fields.impact_factor !== undefined ? Number(fields.impact_factor) : null
        setValue("impact_factor", impactFactorValue)
        if (impactFactorValue !== null && !isNaN(impactFactorValue) && impactFactorValue >= 0) {
          filledFieldNames.push("impact_factor")
        }
      }
      
      // In Scopus - replace if exists in extraction (always track boolean fields)
      if (fields.in_scopus !== undefined) {
        setValue("in_scopus", Boolean(fields.in_scopus))
        filledFieldNames.push("in_scopus")
      }
      
      // In UGC - replace if exists in extraction (always track boolean fields)
      if (fields.in_ugc !== undefined) {
        setValue("in_ugc", Boolean(fields.in_ugc))
        filledFieldNames.push("in_ugc")
      }
      
      // In Clarivate - replace if exists in extraction (always track boolean fields)
      if (fields.in_clarivate !== undefined) {
        setValue("in_clarivate", Boolean(fields.in_clarivate))
        filledFieldNames.push("in_clarivate")
      }
      
      // In Old UGC List - replace if exists in extraction (always track boolean fields)
      if (fields.in_oldUGCList !== undefined) {
        setValue("in_oldUGCList", Boolean(fields.in_oldUGCList))
        filledFieldNames.push("in_oldUGCList")
      }
      
      // Paid - replace if exists in extraction (always track boolean fields)
      if (fields.paid !== undefined) {
        setValue("paid", Boolean(fields.paid))
        filledFieldNames.push("paid")
      }
      
      // ISSN - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.issn !== undefined) {
        const issnValue = fields.issn ? String(fields.issn).trim() : ""
        setValue("issn", issnValue)
        if (issnValue) filledFieldNames.push("issn")
      }
      
      // Type - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.type !== undefined) {
        setDropdownValue("type", fields.type, journalEditedTypeOptions, filledFieldNames)
      }
      
      // DOI - replace if exists in extraction (only highlight if non-empty and valid format)
      if (fields.DOI !== undefined) {
        const doiValue = fields.DOI ? String(fields.DOI).trim() : ""
        if (doiValue) {
          // Validate DOI format
          if (/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/.test(doiValue)) {
            setValue("DOI", doiValue)
            filledFieldNames.push("DOI")
          } else {
            setValue("DOI", "")
          }
        } else {
          setValue("DOI", "")
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

  // Update documentUrl when auto-fill data is available
  // Always update if autoFillDocumentUrl is provided and different from current value
  // This handles cases where autoFillDocumentUrl becomes available after component mount
  useEffect(() => {
    if (autoFillDocumentUrl && documentUrl !== autoFillDocumentUrl) {
      setDocumentUrl(autoFillDocumentUrl)
      setValue("Image", autoFillDocumentUrl) // Update form field so cancel handler can detect document
    }
  }, [autoFillDocumentUrl, documentUrl, setValue])

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
    setValue("Image", url) // Update form field so cancel handler can detect document
  }

  // Handle extracted fields from DocumentUpload - REPLACE existing data with new extracted data
  const handleExtractFields = useCallback((extractedData: Record<string, any>) => {
    let fieldsPopulated = 0

    // REPLACE all fields - set values even if they're empty/null in extracted data
    // This ensures existing data is replaced with new extracted data
    
    // Authors - replace if exists in extraction
    if (extractedData.authors !== undefined) {
      setValue("authors", extractedData.authors || "")
      if (extractedData.authors) fieldsPopulated++
    }
    
    // Author Num - replace if exists in extraction
    if (extractedData.author_num !== undefined) {
      setValue("author_num", extractedData.author_num ? parseInt(extractedData.author_num) || null : null)
      if (extractedData.author_num) fieldsPopulated++
    }
    
    // Title - replace if exists in extraction
    if (extractedData.title !== undefined) {
      setValue("title", extractedData.title || "")
      if (extractedData.title) fieldsPopulated++
    }
    
    // ISBN - replace if exists in extraction
    if (extractedData.isbn !== undefined) {
      setValue("isbn", extractedData.isbn || "")
      if (extractedData.isbn) fieldsPopulated++
    }
    
    // Journal Name - replace if exists in extraction
    if (extractedData.journal_name !== undefined || extractedData.journalBookName !== undefined) {
      const journalName = extractedData.journal_name || extractedData.journalBookName || ""
      setValue("journal_name", journalName)
      if (journalName) fieldsPopulated++
    }
    
    // Volume Num - replace if exists in extraction
    if (extractedData.volume_num !== undefined || extractedData.volumeNo !== undefined) {
      const volumeNum = extractedData.volume_num || extractedData.volumeNo
      setValue("volume_num", volumeNum ? parseInt(volumeNum) || null : null)
      if (volumeNum) fieldsPopulated++
    }
    
    // Page Num - replace if exists in extraction
    if (extractedData.page_num !== undefined || extractedData.pageNo !== undefined) {
      const pageNum = extractedData.page_num || extractedData.pageNo || ""
      setValue("page_num", pageNum)
      if (pageNum) fieldsPopulated++
    }
    
    // Month Year - replace if exists in extraction
    if (extractedData.month_year !== undefined || extractedData.date !== undefined) {
      const monthYear = extractedData.month_year || extractedData.date || ""
      setValue("month_year", monthYear)
      if (monthYear) fieldsPopulated++
    }
    
    // H Index - replace if exists in extraction
    if (extractedData.h_index !== undefined || extractedData.hIndex !== undefined) {
      const hIndex = extractedData.h_index || extractedData.hIndex
      setValue("h_index", hIndex ? parseFloat(hIndex) || null : null)
      if (hIndex) fieldsPopulated++
    }
    
    // Impact Factor - replace if exists in extraction
    if (extractedData.impact_factor !== undefined || extractedData.impactFactor !== undefined) {
      const impactFactor = extractedData.impact_factor || extractedData.impactFactor
      setValue("impact_factor", impactFactor ? parseFloat(impactFactor) || null : null)
      if (impactFactor) fieldsPopulated++
    }
    
    // DOI - replace if exists in extraction
    if (extractedData.DOI !== undefined || extractedData.doi !== undefined) {
      const doi = extractedData.DOI || extractedData.doi || ""
      setValue("DOI", doi)
      if (doi) fieldsPopulated++
    }
    
    // ISSN - replace if exists in extraction
    if (extractedData.issn !== undefined) {
      setValue("issn", extractedData.issn || "")
      if (extractedData.issn) fieldsPopulated++
    }

    if (fieldsPopulated > 0) {
      toast({
        title: "Information Extracted Successfully",
        description: `${fieldsPopulated} fields replaced with new extracted data`,
      })
    } else {
      toast({
        title: "Extraction Complete",
        description: "Data fields have been updated (some fields may be empty)",
      })
    }
  }, [setValue, toast])

  const onSubmit = async (data: JournalFormData) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
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

    // Validate document upload is required
    if (!documentUrl || !documentUrl.startsWith("/uploaded-document/")) {
      toast({
        title: "Validation Error",
        description: "Please upload a supporting document",
        variant: "destructive",
      })
      return
    }

    // Handle document upload to S3 if a document exists
    let pdfPath = documentUrl || null
    
    if (pdfPath && pdfPath.startsWith("/uploaded-document/")) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        // For new records, use timestamp as recordId since DB record doesn't exist yet
        // This maintains the upload/FolderName/userId_recordId.ext pattern
        const tempRecordId = Date.now()
        
        // Upload new document to S3 with Pattern 1: upload/Journal_Paper/{userId}_{recordId}.pdf
        pdfPath = await uploadDocumentToS3(
          pdfPath,
          user.role_id,
          tempRecordId,
          "Journal_Paper"
        )
        
        // Verify we got a valid S3 virtual path
        if (!pdfPath || !pdfPath.startsWith("upload/")) {
          throw new Error("Failed to get S3 virtual path from upload")
        }
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document to S3. Please try again.",
          variant: "destructive",
        })
        return
      }
    } else if (pdfPath && !pdfPath.startsWith("/uploaded-document/") && !pdfPath.startsWith("upload/")) {
      // Invalid path format
      toast({
        title: "Invalid Document Path",
        description: "Document path format is invalid. Please upload the document again.",
        variant: "destructive",
      })
      return
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
    createJournal.mutate(journalData, {
      onSuccess: () => {
        clearDocumentData()
        clearAutoFillData()
        router.push("/teacher/publication")
      },
    })
  }

  return (
    <>
      {NavigationDialog && <NavigationDialog />}
      {CancelDialog && <CancelDialog />}
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={createJournal.isPending} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Add Published Article/Journal/Edited Volume</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Add your published article or journal or volume in journal/edited volume</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Published Article/Journal/Volume Details
          </CardTitle>
          <CardDescription>Upload document first to auto-extract information, then complete the form</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Document Upload Section */}
          <div className="mb-6">
            <Label className="text-base sm:text-lg font-semibold mb-3 block">
              Step 1: Upload Supporting Document *
            </Label>
            <DocumentUpload
              documentUrl={documentUrl || autoFillDocumentUrl || undefined}
              category="Books/Papers"
              subCategory="Published Articles/Papers in Journals/Edited Volumes"
              onChange={handleDocumentChange}
              onExtract={handleExtractFields}
              allowedFileTypes={["pdf", "jpg", "jpeg"]}
              maxFileSize={1 * 1024 * 1024}
              disabled={createJournal.isPending}
              onClearFields={() => {
                reset()
                setAutoFilledFields(new Set())
              }}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload article/journal/volume document (PDF, JPG, JPEG - max 1MB)</p>
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <Label className="text-base sm:text-lg font-semibold mb-4 block">Step 2: Complete Article/Journal/Volume Information</Label>
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
                    disabled={createJournal.isPending}
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
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("author_num") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("author_num").onBlur(e)
                      clearAutoFillHighlight("author_num")
                    }}
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
                        disabled={createJournal.isPending}
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
                        disabled={createJournal.isPending}
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
                  placeholder="Enter article/journal/volume title"
                  disabled={createJournal.isPending}
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
                  <Label htmlFor="issn">ISSN (Without -) *</Label>
                  <Input 
                    id="issn" 
                    {...register("issn", {
                      required: "ISSN is required",
                      validate: (v) => {
                        if (!v || v.trim() === "") {
                          return "ISSN is required"
                        }
                        const cleaned = v.replace(/-/g, '')
                        if (!/^[0-9]{8}$/.test(cleaned)) {
                          return "ISSN must be 8 digits"
                        }
                        return true
                      }
                    })} 
                    placeholder="Enter ISSN without dashes (8 digits)"
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("issn") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("issn").onBlur(e)
                      clearAutoFillHighlight("issn")
                    }}
                  />
                  {errors.issn && <p className="text-sm text-red-500 mt-1">{errors.issn.message}</p>}
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN (Without -) *</Label>
                  <Input 
                    id="isbn" 
                    {...register("isbn", {
                      required: "ISBN is required",
                      validate: (v) => {
                        if (!v || v.trim() === "") {
                          return "ISBN is required"
                        }
                        const cleaned = v.replace(/-/g, '')
                        if (!/^[0-9]{10}$/.test(cleaned) && !/^[0-9]{13}$/.test(cleaned)) {
                          return "ISBN must be 10 or 13 digits"
                        }
                        return true
                      }
                    })} 
                    placeholder="Enter ISBN without dashes (10 or 13 digits)"
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("isbn") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("isbn").onBlur(e)
                      clearAutoFillHighlight("isbn")
                    }}
                  />
                  {errors.isbn && <p className="text-sm text-red-500 mt-1">{errors.isbn.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="journal_name">Journal/Article/Edited Volume Name *</Label>
                <Input
                  id="journal_name"
                  {...register("journal_name", { 
                    required: "Journal/Book Name is required",
                    minLength: { value: 3, message: "Journal name must be at least 3 characters" },
                    maxLength: { value: 500, message: "Journal name must not exceed 500 characters" }
                  })}
                  placeholder="Enter journal or article or edited volume name"
                  disabled={createJournal.isPending}
                  className={cn(
                    isAutoFilled("journal_name") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                  )}
                  onBlur={(e) => {
                    register("journal_name").onBlur(e)
                    clearAutoFillHighlight("journal_name")
                  }}
                />
                {errors.journal_name && <p className="text-sm text-red-500 mt-1">{errors.journal_name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="volume_num">Volume No. *</Label>
                  <Input
                    id="volume_num"
                    type="number"
                    {...register("volume_num", { 
                      valueAsNumber: true,
                      required: "Volume number is required",
                      min: { value: 1, message: "Volume number must be at least 1" },
                      max: { value: 10000, message: "Volume number cannot exceed 10000" },
                      validate: (v) => {
                        if (v === null || v === undefined) {
                          return "Volume number is required"
                        }
                        if (!(v > 0 && Number.isInteger(v))) {
                          return "Must be a positive integer"
                        }
                        return true
                      }
                    })}
                    placeholder="Volume number"
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("volume_num") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("volume_num").onBlur(e)
                      clearAutoFillHighlight("volume_num")
                    }}
                  />
                  {errors.volume_num && <p className="text-sm text-red-500 mt-1">{errors.volume_num.message}</p>}
                </div>
                <div>
                  <Label htmlFor="page_num">Page No. (Range) *</Label>
                  <Input 
                    id="page_num" 
                    {...register("page_num", {
                      required: "Page number is required",
                      validate: (v) => {
                        if (!v || v.trim() === "") {
                          return "Page number is required"
                        }
                        if (!/^[0-9]+(-[0-9]+)?$/.test(v)) {
                          return "Page number must be a number or range (e.g., 123 or 123-135)"
                        }
                        return true
                      }
                    })} 
                    placeholder="e.g., 123-135"
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("page_num") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("page_num").onBlur(e)
                      clearAutoFillHighlight("page_num")
                    }}
                  />
                  {errors.page_num && <p className="text-sm text-red-500 mt-1">{errors.page_num.message}</p>}
                </div>
                <div>
                  <Label htmlFor="month_year">Date *</Label>
                  <Input 
                    id="month_year" 
                    type="date" 
                    max={new Date().toISOString().split('T')[0]}
                    {...register("month_year", {
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
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("month_year") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("month_year").onBlur(e)
                      clearAutoFillHighlight("month_year")
                    }}
                  />
                  {errors.month_year && <p className="text-sm text-red-500 mt-1">{errors.month_year.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="level" className="text-sm sm:text-base">Level *</Label>
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
                        disabled={createJournal.isPending}
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
                        onValueChange={(val) => {
                          field.onChange(val === "Yes")
                          clearAutoFillHighlight("peer_reviewed")
                        }}
                        disabled={createJournal.isPending}
                      >
                        <SelectTrigger className={cn(
                          isAutoFilled("peer_reviewed") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}>
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
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("h_index") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("h_index").onBlur(e)
                      clearAutoFillHighlight("h_index")
                    }}
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
                    disabled={createJournal.isPending}
                    className={cn(
                      isAutoFilled("impact_factor") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                    onBlur={(e) => {
                      register("impact_factor").onBlur(e)
                      clearAutoFillHighlight("impact_factor")
                    }}
                  />
                  {errors.impact_factor && <p className="text-sm text-red-500 mt-1">{errors.impact_factor.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="DOI">DOI *</Label>
                <Input 
                  id="DOI" 
                  {...register("DOI", {
                    required: "DOI is required",
                    validate: (v) => {
                      if (!v || v.trim() === "") {
                        return "DOI is required"
                      }
                      if (!/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/.test(v)) {
                        return "Invalid DOI format. Must start with 10.xxxx/"
                      }
                      return true
                    }
                  })} 
                  placeholder="Enter DOI (e.g., 10.1000/xyz123)"
                  disabled={createJournal.isPending}
                  className={cn(
                    isAutoFilled("DOI") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                  )}
                  onBlur={(e) => {
                    register("DOI").onBlur(e)
                    clearAutoFillHighlight("DOI")
                  }}
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
                        onValueChange={(val) => {
                          field.onChange(val === "Yes")
                          clearAutoFillHighlight("in_scopus")
                        }}
                        disabled={createJournal.isPending}
                      >
                        <SelectTrigger className={cn(
                          isAutoFilled("in_scopus") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}>
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
                        onValueChange={(val) => {
                          field.onChange(val === "Yes")
                          clearAutoFillHighlight("in_ugc")
                        }}
                        disabled={createJournal.isPending}
                      >
                        <SelectTrigger className={cn(
                          isAutoFilled("in_ugc") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}>
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
                        onValueChange={(val) => {
                          field.onChange(val === "Yes")
                          clearAutoFillHighlight("in_clarivate")
                        }}
                        disabled={createJournal.isPending}
                      >
                        <SelectTrigger className={cn(
                          isAutoFilled("in_clarivate") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}>
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
                        onValueChange={(val) => {
                          field.onChange(val === "Yes")
                          clearAutoFillHighlight("in_oldUGCList")
                        }}
                        disabled={createJournal.isPending}
                      >
                        <SelectTrigger className={cn(
                          isAutoFilled("in_oldUGCList") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}>
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
                      onValueChange={(val) => {
                        field.onChange(val === "Yes")
                        clearAutoFillHighlight("paid")
                      }}
                      disabled={createJournal.isPending}
                    >
                      <SelectTrigger className={cn(
                        isAutoFilled("paid") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      )}>
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
                <Button type="submit" disabled={createJournal.isPending} className="w-full sm:w-auto">
                  {createJournal.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={createJournal.isPending} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
