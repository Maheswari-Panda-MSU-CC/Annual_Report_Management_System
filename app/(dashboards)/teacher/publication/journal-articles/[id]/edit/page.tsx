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
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"
import { useInvalidateTeacherData, teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useQueryClient } from "@tanstack/react-query"

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
}

export default function EditJournalArticlePage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { invalidatePublications } = useInvalidateTeacherData()
  const queryClient = useQueryClient()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string>("")

  const {
    journalAuthorTypeOptions,
    journalEditedTypeOptions,
    resPubLevelOptions,
    fetchJournalAuthorTypes,
    fetchJournalEditedTypes,
    fetchResPubLevels,
  } = useDropDowns()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<JournalFormData>()

  useEffect(() => {
    fetchJournalAuthorTypes()
    fetchJournalEditedTypes()
    fetchResPubLevels()
  }, [])

  useEffect(() => {
    if (id && user?.role_id) {
      fetchJournal()
    }
  }, [id, user?.role_id])

  const fetchJournal = async () => {
    if (!id || !user?.role_id) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/teacher/publication/journals?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch journal")
      }

      const journal = data.journals.find((j: any) => j.id === parseInt(id as string))

      if (!journal) {
        throw new Error("Journal not found")
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
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load journal",
        variant: "destructive",
      })
      router.push("/teacher/publication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
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

    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!data.title || !data.authors || !data.author_type || !data.level || !data.type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
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
          setIsSubmitting(false)
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

      const payload = {
        journalId: parseInt(id as string),
        teacherId: user.role_id,
        journal: {
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
        },
      }

      const res = await fetch("/api/teacher/publication/journals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update journal")
      }

      toast({
        title: "Success",
        description: "Journal article updated successfully!",
      })

      // Invalidate and refetch data
      invalidatePublications()

      // Wait for refetch to complete before navigation
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: teacherQueryKeys.publications.journals(teacherId),
          exact: true 
        }),
        queryClient.refetchQueries({ 
          queryKey: teacherQueryKeys.publications.books(teacherId),
          exact: true 
        }),
        queryClient.refetchQueries({ 
          queryKey: teacherQueryKeys.publications.papers(teacherId),
          exact: true 
        }),
      ])

      router.push("/teacher/publication")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update journal article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/teacher/publication")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Edit Published Article/Paper</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Edit your published article or paper in journal/edited volume</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Article/Paper Details
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
              category="journal-articles"
              subCategory="journals"
              onChange={handleDocumentChange}
              allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
              maxFileSize={1 * 1024 * 1024}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload new document to replace existing (PDF, JPG, PNG - max 1MB)</p>
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
                      onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                      placeholder="Select author type"
                      emptyMessage="No author type found"
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
                      onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                      placeholder="Select type"
                      emptyMessage="No type found"
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
                      onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                      placeholder="Select level"
                      emptyMessage="No level found"
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
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Article/Paper"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/teacher/publication")} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
