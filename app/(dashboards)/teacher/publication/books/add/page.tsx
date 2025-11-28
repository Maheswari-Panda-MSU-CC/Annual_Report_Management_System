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
import { ArrowLeft, BookOpen, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useBookMutations } from "@/hooks/use-teacher-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"

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
}

export default function AddBookPage() {
  const router = useRouter()
  const { toast: showToast } = useToast()
  const { user } = useAuth()
  const { createBook } = useBookMutations()
  const [isExtracting, setIsExtracting] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string>("")

  const {
    journalAuthorTypeOptions,
    resPubLevelOptions,
    bookTypeOptions,
    fetchJournalAuthorTypes,
    fetchResPubLevels,
    fetchBookTypes,
  } = useDropDowns()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
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
    },
  })

  // Watch edited field for conditional validation
  const isEdited = watch("edited")

  // Note: Dropdown data is already available from Context, no need to fetch

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
  } = useAutoFillData({
    formType: "books", // Explicit form type
    dropdownOptions: {
      publishing_level: resPubLevelOptions,
      book_type: bookTypeOptions,
      author_type: journalAuthorTypeOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Auto-fill form fields from document analysis
      if (fields.authors) setValue("authors", String(fields.authors))
      if (fields.title) setValue("title", String(fields.title))
      if (fields.isbn) setValue("isbn", String(fields.isbn))
      if (fields.publisher_name) setValue("publisher_name", String(fields.publisher_name))
      if (fields.submit_date) setValue("submit_date", String(fields.submit_date))
      if (fields.place) setValue("place", String(fields.place))
      if (fields.paid !== undefined) setValue("paid", Boolean(fields.paid))
      if (fields.edited !== undefined) setValue("edited", Boolean(fields.edited))
      if (fields.chap_count !== undefined && fields.chap_count !== null) setValue("chap_count", Number(fields.chap_count))
      if (fields.publishing_level !== undefined && fields.publishing_level !== null) setValue("publishing_level", Number(fields.publishing_level))
      if (fields.book_type !== undefined && fields.book_type !== null) setValue("book_type", Number(fields.book_type))
      if (fields.author_type !== undefined && fields.author_type !== null) setValue("author_type", Number(fields.author_type))
      if (fields.cha) setValue("cha", String(fields.cha))
      
      // Show toast notification
      const filledCount = Object.keys(fields).filter(
        k => fields[k] !== null && fields[k] !== undefined && fields[k] !== ""
      ).length
      if (filledCount > 0) {
        showToast({
          title: "Form Auto-filled",
          description: `Populated ${filledCount} field(s) from document analysis.`,
        })
      }
    },
    clearAfterUse: false, // Keep data for manual editing
  })

  // Update documentUrl when auto-fill data is available
  // Always update if autoFillDocumentUrl is provided and different from current value
  // This handles cases where autoFillDocumentUrl becomes available after component mount
  useEffect(() => {
    if (autoFillDocumentUrl && documentUrl !== autoFillDocumentUrl) {
      setDocumentUrl(autoFillDocumentUrl)
    }
  }, [autoFillDocumentUrl, documentUrl])

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
  }

  const handleExtractFields = useCallback((extractedData: Record<string, any>) => {
    // Map extracted data to form fields
    if (extractedData.authors) setValue("authors", extractedData.authors)
    if (extractedData.title) setValue("title", extractedData.title)
    if (extractedData.isbn) setValue("isbn", extractedData.isbn)
    if (extractedData.publisher_name || extractedData.publisherName) setValue("publisher_name", extractedData.publisher_name || extractedData.publisherName)
    if (extractedData.submit_date || extractedData.publishingDate) setValue("submit_date", extractedData.submit_date || extractedData.publishingDate)
    if (extractedData.place || extractedData.publishingPlace) setValue("place", extractedData.place || extractedData.publishingPlace)
    if (extractedData.chap_count || extractedData.chapterCount) setValue("chap_count", parseInt(extractedData.chap_count || extractedData.chapterCount) || null)
    if (extractedData.cha) setValue("cha", extractedData.cha)
  }, [setValue])

  const onSubmit = async (data: BookFormData) => {
    if (!user?.role_id) {
      showToast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    // Validate document upload is required
    if (!documentUrl || !documentUrl.startsWith("/uploaded-document/")) {
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

    // Handle document upload to S3 if a document exists
    let pdfPath = documentUrl || null
    
    if (pdfPath && pdfPath.startsWith("/uploaded-document/")) {
      try {
        // Extract fileName from local URL
        const fileName = pdfPath.split("/").pop()
        
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
          pdfPath = s3Data.url // Use S3 URL for database storage

          // Delete local file after successful S3 upload
          await fetch("/api/shared/local-document-upload", {
            method: "DELETE",
          })
        }
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        showToast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document. Please try again.",
          variant: "destructive",
        })
        return
      }
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
    createBook.mutate(bookData, {
      onSuccess: () => {
        router.push("/teacher/publication")
      },
    })
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Add Book/Book Chapter</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Add your published book or book chapter</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Book/Book Chapter Details
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
              subCategory="Books/Books Chapter(s) Published"
              onChange={handleDocumentChange}
              onExtract={handleExtractFields}
              allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
              maxFileSize={1 * 1024 * 1024}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload book document (PDF, JPG, PNG - max 1MB)</p>
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <Label className="text-base sm:text-lg font-semibold mb-4 block">Step 2: Complete Book Information</Label>
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
                      onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                      placeholder="Select author type"
                      emptyMessage="No author type found"
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
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="publisher_name">Publisher Name</Label>
                  <Input 
                    id="publisher_name" 
                    {...register("publisher_name", {
                      maxLength: { value: 300, message: "Publisher name must not exceed 300 characters" },
                      pattern: {
                        value: /^[a-zA-Z0-9\s,\.&'-]*$/,
                        message: "Publisher name contains invalid characters"
                      }
                    })} 
                    placeholder="Enter publisher name" 
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
                />
                {errors.cha && <p className="text-sm text-red-500 mt-1">{errors.cha.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submit_date">Publishing Date</Label>
                  <Input 
                    id="submit_date" 
                    type="date" 
                    {...register("submit_date", {
                      validate: (v) => !v || new Date(v) <= new Date() || "Date cannot be in the future"
                    })} 
                  />
                  {errors.submit_date && <p className="text-sm text-red-500 mt-1">{errors.submit_date.message}</p>}
                </div>
                <div>
                  <Label htmlFor="place">Publishing Place</Label>
                  <Input 
                    id="place" 
                    {...register("place", {
                      maxLength: { value: 200, message: "Place must not exceed 200 characters" },
                      pattern: {
                        value: /^[a-zA-Z\s,\.-]*$/,
                        message: "Place contains invalid characters"
                      }
                    })} 
                    placeholder="Enter publishing place" 
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
                        onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                        placeholder="Select publishing level"
                        emptyMessage="No level found"
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
                        onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                        placeholder="Select book type"
                        emptyMessage="No book type found"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="chap_count">
                    Chapter Count {isEdited ? "*" : ""}
                  </Label>
                  <Input
                    id="chap_count"
                    type="number"
                    {...register("chap_count", { 
                      valueAsNumber: true,
                      required: isEdited ? "Chapter count is required when book is edited" : false,
                      min: { value: 1, message: "Chapter count must be at least 1" },
                      max: { value: 1000, message: "Chapter count cannot exceed 1000" },
                      validate: (v) => {
                        if (isEdited) {
                          if (v === null || v === undefined) {
                            return "Chapter count is required when book is edited"
                          }
                          if (!Number.isInteger(v) || v <= 0) {
                            return "Must be a positive integer"
                          }
                        }
                        if (v !== null && v !== undefined) {
                          if (!Number.isInteger(v) || v <= 0) {
                            return "Must be a positive integer"
                          }
                        }
                        return true
                      }
                    })}
                    placeholder="Number of chapters"
                  />
                  {errors.chap_count && <p className="text-sm text-red-500 mt-1">{errors.chap_count.message}</p>}
                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" disabled={createBook.isPending} className="w-full sm:w-auto">
                  {createBook.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Book/Book Chapter"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
