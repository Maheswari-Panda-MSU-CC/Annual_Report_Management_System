"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { toast, useToast } from "@/hooks/use-toast"
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
    bookTypeOptions,
    fetchJournalAuthorTypes,
    fetchResPubLevels,
    fetchBookTypes,
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
      // REPLACE all form fields with extracted data (even if they already have values)
      // This ensures new extraction replaces existing data
      
      // Authors - replace if exists in extraction
      if (fields.authors !== undefined) {
        setValue("authors", fields.authors ? String(fields.authors) : "")
      }
      
      // Title - replace if exists in extraction
      if (fields.title !== undefined) {
        setValue("title", fields.title ? String(fields.title) : "")
      }
      
      // ISBN - replace if exists in extraction
      if (fields.isbn !== undefined) {
        setValue("isbn", fields.isbn ? String(fields.isbn) : "")
      }
      
      // Publisher Name - replace if exists in extraction
      if (fields.publisher_name !== undefined) {
        setValue("publisher_name", fields.publisher_name ? String(fields.publisher_name) : "")
      }
      
      // Submit Date - replace if exists in extraction
      if (fields.submit_date !== undefined) {
        setValue("submit_date", fields.submit_date ? String(fields.submit_date) : "")
      }
      
      // Place - replace if exists in extraction
      if (fields.place !== undefined) {
        setValue("place", fields.place ? String(fields.place) : "")
      }
      
      // Paid - replace if exists in extraction
      if (fields.paid !== undefined) {
        setValue("paid", Boolean(fields.paid))
      }
      
      // Edited - replace if exists in extraction
      if (fields.edited !== undefined) {
        setValue("edited", Boolean(fields.edited))
      }
      
      // Chapter Count - replace if exists in extraction
      if (fields.chap_count !== undefined) {
        setValue("chap_count", fields.chap_count !== null && fields.chap_count !== undefined ? Number(fields.chap_count) : null)
      }
      
      // Publishing Level - replace if exists in extraction
      if (fields.publishing_level !== undefined) {
        if (fields.publishing_level !== null && fields.publishing_level !== undefined) {
          const matchingLevel = resPubLevelOptions.find(
            (l) => l.id === Number(fields.publishing_level)
          )
          if (matchingLevel) {
            setValue("publishing_level", matchingLevel.id)
          } else {
            setValue("publishing_level", null)
          }
        } else {
          setValue("publishing_level", null)
        }
      }
      
      // Book Type - replace if exists in extraction
      if (fields.book_type !== undefined) {
        if (fields.book_type !== null && fields.book_type !== undefined) {
          const matchingBookType = bookTypeOptions.find(
            (b) => b.id === Number(fields.book_type)
          )
          if (matchingBookType) {
            setValue("book_type", matchingBookType.id)
          } else {
            setValue("book_type", null)
          }
        } else {
          setValue("book_type", null)
        }
      }
      
      // Author Type - replace if exists in extraction
      if (fields.author_type !== undefined) {
        if (fields.author_type !== null && fields.author_type !== undefined) {
          const matchingAuthorType = journalAuthorTypeOptions.find(
            (a) => a.id === Number(fields.author_type)
          )
          if (matchingAuthorType) {
            setValue("author_type", matchingAuthorType.id)
          } else {
            setValue("author_type", null)
          }
        } else {
          setValue("author_type", null)
        }
      }
      
      // Chapter/Article Title - replace if exists in extraction
      if (fields.cha !== undefined) {
        setValue("cha", fields.cha ? String(fields.cha) : "")
      }
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
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex items-center gap-2">
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
              allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
              maxFileSize={1 * 1024 * 1024}
              isEditMode={true}
              onClearFields={() => {
                reset()
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
                  required: "Authors are required",
                  minLength: { value: 2, message: "Authors must be at least 2 characters" },
                  maxLength: { value: 500, message: "Authors must not exceed 500 characters" },
                  pattern: {
                    value: /^[a-zA-Z\s,\.&'-]+$/,
                    message: "Authors can only contain letters, spaces, commas, periods, ampersands, apostrophes, and hyphens"
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
