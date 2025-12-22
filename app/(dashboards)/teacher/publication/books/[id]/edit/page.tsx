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
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useBookMutations } from "@/hooks/use-teacher-mutations"
import { useQuery } from "@tanstack/react-query"
import { teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { cn } from "@/lib/utils"

interface BookFormData {
  authors: string
  title: string
  isbn: string
  cha: string
  publisher_name: string
  submit_date: string
  place: string
  paid: boolean
  edited: boolean
  chap_count: number | null
  publishing_level: number | null
  book_type: number | null
  author_type: number | null
  Image?: string
}

export default function EditBookPage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast: showToast } = useToast()
  const { user } = useAuth()
  const { updateBook } = useBookMutations()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string>("")
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()

  const {
    journalAuthorTypeOptions,
    resPubLevelOptions,
    bookTypeOptions
  } = useDropDowns()

  const form = useForm<BookFormData>({
    defaultValues: {
      authors: "",
      title: "",
      isbn: "",
      cha: "",
      publisher_name: "",
      submit_date: "",
      place: "",
      paid: false,
      edited: false,
      chap_count: null,
      publishing_level: null,
      book_type: null,
      author_type: null,
      Image: "",
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = form

  // Watch edited field for conditional validation
  const isEdited = watch("edited")

  // Clear chap_count when edited is set to false
  useEffect(() => {
    if (!isEdited) {
      setValue("chap_count", null, { shouldValidate: false })
    }
  }, [isEdited, setValue])

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
    formType: "books", // Explicit form type
    dropdownOptions: {
      publishing_level: resPubLevelOptions,
      book_type: bookTypeOptions,
      author_type: journalAuthorTypeOptions,
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
      
      // Publisher Name - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.publisher_name !== undefined) {
        const publisherNameValue = fields.publisher_name ? String(fields.publisher_name).trim() : ""
        setValue("publisher_name", publisherNameValue)
        if (publisherNameValue) filledFieldNames.push("publisher_name")
      }
      
      // Submit Date - replace if exists in extraction (only highlight if valid date)
      if (fields.submit_date !== undefined) {
        const submitDateValue = fields.submit_date ? String(fields.submit_date).trim() : ""
        if (submitDateValue) {
          // Validate date format
          try {
            const parsedDate = new Date(submitDateValue)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (!isNaN(parsedDate.getTime()) && parsedDate <= today) {
              setValue("submit_date", submitDateValue)
              filledFieldNames.push("submit_date")
            } else {
              setValue("submit_date", "")
            }
          } catch {
            setValue("submit_date", "")
          }
        } else {
          setValue("submit_date", "")
        }
      }
      
      // Place - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.place !== undefined) {
        const placeValue = fields.place ? String(fields.place).trim() : ""
        setValue("place", placeValue)
        if (placeValue) filledFieldNames.push("place")
      }
      
      // Paid - replace if exists in extraction
      if (fields.paid !== undefined) {
        setValue("paid", Boolean(fields.paid))
        filledFieldNames.push("paid")
      }
      
      // Edited - replace if exists in extraction
      if (fields.edited !== undefined) {
        setValue("edited", Boolean(fields.edited))
        filledFieldNames.push("edited")
      }
      
      // Chapter Count - replace if exists in extraction (only highlight if valid number)
      if (fields.chap_count !== undefined) {
        const chapCountValue = fields.chap_count !== null && fields.chap_count !== undefined ? Number(fields.chap_count) : null
        setValue("chap_count", chapCountValue)
        if (chapCountValue !== null && !isNaN(chapCountValue) && chapCountValue > 0) {
          filledFieldNames.push("chap_count")
        }
      }
      
      // Publishing Level - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.publishing_level !== undefined) {
        setDropdownValue("publishing_level", fields.publishing_level, resPubLevelOptions, filledFieldNames)
      }
      
      // Book Type - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.book_type !== undefined) {
        setDropdownValue("book_type", fields.book_type, bookTypeOptions, filledFieldNames)
      }
      
      // Author Type - replace if exists in extraction (only highlight if value matches dropdown option)
      if (fields.author_type !== undefined) {
        setDropdownValue("author_type", fields.author_type, journalAuthorTypeOptions, filledFieldNames)
      }
      
      // Chapter/Article Title - replace if exists in extraction (only highlight if non-empty after setting)
      if (fields.cha !== undefined) {
        const chaValue = fields.cha ? String(fields.cha).trim() : ""
        setValue("cha", chaValue)
        if (chaValue) filledFieldNames.push("cha")
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

  // Use React Query to fetch books list - always fetch fresh data for edit pages
  const { data: booksData, isLoading: isLoadingBook } = useQuery({
    queryKey: teacherQueryKeys.publications.books(teacherId),
    queryFn: async () => {
      const res = await fetch(`/api/teacher/publication/books?teacherId=${teacherId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch book")
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
    if (!booksData || !id) return

    const book = booksData.books?.find((b: any) => b.bid === parseInt(id as string))

    if (!book) {
      showToast({
        title: "Book not found",
        description: "The book you're looking for doesn't exist.",
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
    if (book.Image) {
      setExistingDocumentUrl(book.Image)
      setDocumentUrl(book.Image)
      setValue("Image", book.Image) // Update form field so cancel handler can detect document
    }

    // Populate form with fetched data
    reset({
      authors: book.authors || "",
      title: book.title || "",
      isbn: book.isbn || "",
      cha: book.cha || "",
      publisher_name: book.publisher_name || "",
      submit_date: formatDateForInput(book.submit_date),
      place: book.place || "",
      paid: book.paid ?? false,
      edited: book.edited ?? false,
      chap_count: book.chap_count || null,
      publishing_level: book.publishing_level || null,
      book_type: book.book_type || null,
      author_type: book.author_type || null,
      Image: book.Image || "",
    })
  }, [booksData, id, reset, router, showToast])

  const isLoading = isLoadingBook || !booksData

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
    setValue("Image", url) // Update form field so cancel handler can detect document
  }

  const onSubmit = async (data: BookFormData) => {
    if (!user?.role_id || !id) {
      showToast({
        title: "Error",
        description: "User not authenticated or book ID missing",
        variant: "destructive",
      })
      return
    }

    // Validate document upload is required (either existing or new)
    if (!documentUrl) {
      showToast({
        title: "Validation Error",
        description: "Please upload a supporting document",
        variant: "destructive",
      })
      return
    }

    // Validate conditional requirement: chapter count if edited
    if (data.edited && (!data.chap_count || data.chap_count <= 0)) {
      showToast({
        title: "Validation Error",
        description: "Chapter count is required when book is edited",
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
          user?.role_id || 0,
          recordId,
          "book"
        )
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        showToast({
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

    const bookData = {
      title: data.title,
      isbn: data.isbn || null,
      cha: data.cha || null,
      publisher_name: data.publisher_name || null,
      submit_date: data.submit_date || null,
      place: data.place || null,
      paid: data.paid ?? false,
      edited: data.edited ?? false,
      chap_count: data.chap_count || null,
      authors: data.authors,
      publishing_level: data.publishing_level,
      book_type: data.book_type,
      author_type: data.author_type,
      Image: pdfPath,
    }

    // Use mutation instead of direct fetch
    updateBook.mutate(
      { bookId: parseInt(id as string), bookData },
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
          <p className="text-muted-foreground">Loading book...</p>
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
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateBook.isPending} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Edit Book/Book Chapter</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Edit your published book or book chapter</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Edit Book/Book Chapter Details
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
              subCategory="Books/Books Chapter(s) Published"
              onChange={handleDocumentChange}
              allowedFileTypes={["pdf", "jpg", "jpeg"]}
              maxFileSize={1 * 1024 * 1024}
              isEditMode={true}
              disabled={updateBook.isPending}
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
                  required: "Authors are required",
                  minLength: { value: 2, message: "Authors must be at least 2 characters" },
                  maxLength: { value: 500, message: "Authors must not exceed 500 characters" },
                  pattern: {
                    value: /^[a-zA-Z\s,\.&'-]+$/,
                    message: "Authors can only contain letters, spaces, commas, periods, ampersands, apostrophes, and hyphens"
                  }
                })}
                placeholder="Enter all authors"
                disabled={updateBook.isPending}
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
                    disabled={updateBook.isPending}
                    className={cn(
                      isAutoFilled("author_type") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                  />
                )}
              />
              {errors.author_type && <p className="text-sm text-red-500 mt-1">{errors.author_type.message}</p>}
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
                placeholder="Enter book title"
                disabled={updateBook.isPending}
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
                  disabled={updateBook.isPending}
                />
                {errors.isbn && <p className="text-sm text-red-500 mt-1">{errors.isbn.message}</p>}
              </div>
              <div>
                <Label htmlFor="publisher_name">Publisher Name *</Label>
                <Input 
                  id="publisher_name" 
                  {...register("publisher_name", {
                    required: "Publisher name is required",
                    minLength: { value: 2, message: "Publisher name must be at least 2 characters" },
                    maxLength: { value: 300, message: "Publisher name must not exceed 300 characters" },
                    pattern: {
                      value: /^[a-zA-Z0-9\s,\.&'-]+$/,
                      message: "Publisher name contains invalid characters"
                    }
                  })} 
                  placeholder="Enter publisher name"
                  disabled={updateBook.isPending}
                />
                {errors.publisher_name && <p className="text-sm text-red-500 mt-1">{errors.publisher_name.message}</p>}
              </div>
            </div>

            <div hidden={true}>
              <Label htmlFor="cha">Chapter/Article Title</Label>
              <Input 
                id="cha" 
                {...register("cha", {
                  maxLength: { value: 500, message: "Chapter title must not exceed 500 characters" }
                })} 
                placeholder="Enter chapter/article title if applicable"
                disabled={updateBook.isPending}
              />
              {errors.cha && <p className="text-sm text-red-500 mt-1">{errors.cha.message}</p>}
            </div>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="submit_date">Publishing Date *</Label>
                <Input 
                  id="submit_date" 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  {...register("submit_date", {
                    required: "Publishing date is required",
                    validate: (v) => {
                      if (!v || v.trim() === "") {
                        return "Publishing date is required"
                      }
                      const selectedDate = new Date(v)
                      const today = new Date()
                      today.setHours(23, 59, 59, 999) // Set to end of today to allow today's date
                      if (selectedDate > today) {
                        return "Publishing date cannot be in the future"
                      }
                      // Check if date is valid
                      if (isNaN(selectedDate.getTime())) {
                        return "Please enter a valid date"
                      }
                      return true
                    }
                  })}
                  disabled={updateBook.isPending}
                />
                {errors.submit_date && <p className="text-sm text-red-500 mt-1">{errors.submit_date.message}</p>}
              </div>
              <div>
                <Label htmlFor="place">Publishing Place *</Label>
                <Input 
                  id="place" 
                  {...register("place", {
                    required: "Publishing place is required",
                    minLength: { value: 2, message: "Publishing place must be at least 2 characters" },
                    maxLength: { value: 200, message: "Place must not exceed 200 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s,\.-]+$/,
                      message: "Place contains invalid characters"
                    }
                  })} 
                  placeholder="Enter publishing place"
                  disabled={updateBook.isPending}
                />
                {errors.place && <p className="text-sm text-red-500 mt-1">{errors.place.message}</p>}
              </div>

              <div>
                <Label htmlFor="publishing_level">Publishing Level *</Label>
                <Controller
                  name="publishing_level"
                  control={control}
                  rules={{ 
                    required: "Publishing level is required",
                    validate: (v) => v !== null && v !== undefined || "Publishing level is required"
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
                        clearAutoFillHighlight("publishing_level")
                      }}
                      placeholder="Select publishing level"
                      emptyMessage="No level found"
                      disabled={updateBook.isPending}
                      className={cn(
                        isAutoFilled("publishing_level") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      )}
                    />
                  )}
                />
                {errors.publishing_level && (
                  <p className="text-sm text-red-500 mt-1">{errors.publishing_level.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="book_type">Book Type *</Label>
                <Controller
                  name="book_type"
                  control={control}
                  rules={{ 
                    required: "Book type is required",
                    validate: (v) => v !== null && v !== undefined || "Book type is required"
                  }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={bookTypeOptions.map((b) => ({
                        value: b.id,
                        label: b.name,
                      }))}
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : null)
                        clearAutoFillHighlight("book_type")
                      }}
                      placeholder="Select book type"
                      emptyMessage="No book type found"
                      disabled={updateBook.isPending}
                      className={cn(
                        isAutoFilled("book_type") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      )}
                    />
                  )}
                />
                {errors.book_type && <p className="text-sm text-red-500 mt-1">{errors.book_type.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paid">Charges Paid?</Label>
                <Controller
                  name="paid"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                      disabled={updateBook.isPending}
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
                <Label htmlFor="edited">Edited?</Label>
                <Controller
                  name="edited"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "Yes" : "No"}
                      onValueChange={(val) => field.onChange(val === "Yes")}
                      disabled={updateBook.isPending}
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

            {isEdited && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="chap_count">
                    Chapter Count *
                  </Label>
                  <Input
                    id="chap_count"
                    type="number"
                    {...register("chap_count", { 
                      valueAsNumber: true,
                      required: "Chapter count is required when book is edited",
                      min: { value: 1, message: "Chapter count must be at least 1" },
                      max: { value: 1000, message: "Chapter count cannot exceed 1000" },
                      validate: (v) => {
                        if (v === null || v === undefined) {
                          return "Chapter count is required when book is edited"
                        }
                        if (!Number.isInteger(v) || v <= 0) {
                          return "Must be a positive integer"
                        }
                        return true
                      }
                    })}
                    placeholder="Number of chapters"
                    disabled={updateBook.isPending}
                  />
                  {errors.chap_count && <p className="text-sm text-red-500 mt-1">{errors.chap_count.message}</p>}
                </div>
              </div>
            )}

          
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button type="submit" disabled={updateBook.isPending} className="w-full sm:w-auto">
                {updateBook.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Book/Book Chapter"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={updateBook.isPending} className="w-full sm:w-auto">
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
