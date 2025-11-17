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
import { ArrowLeft, Presentation, Brain, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"
import { useInvalidateTeacherData, teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useQueryClient } from "@tanstack/react-query"

interface PaperFormData {
  authors: string
  theme: string
  organising_body: string
  place: string
  date: string
  title_of_paper: string
  level: number | null
  mode: string
}

export default function AddConferencePaperPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { invalidatePublications } = useInvalidateTeacherData()
  const queryClient = useQueryClient()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string>("")

  const { resPubLevelOptions, fetchResPubLevels } = useDropDowns()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PaperFormData>({
    defaultValues: {
      authors: "",
      theme: "",
      organising_body: "",
      place: "",
      date: "",
      title_of_paper: "",
      level: null,
      mode: "",
    },
  })

  useEffect(() => {
    fetchResPubLevels()
  }, [])

  const handleDocumentChange = (url: string) => {
    setDocumentUrl(url)
  }

  const handleExtractFields = useCallback((extractedData: Record<string, any>) => {
    // Map extracted data to form fields
    if (extractedData.authors) setValue("authors", extractedData.authors)
    if (extractedData.theme || extractedData.themeOfConference) setValue("theme", extractedData.theme || extractedData.themeOfConference)
    if (extractedData.organising_body || extractedData.organizingBody) setValue("organising_body", extractedData.organising_body || extractedData.organizingBody)
    if (extractedData.place) setValue("place", extractedData.place)
    if (extractedData.date || extractedData.dateOfPresentation) setValue("date", extractedData.date || extractedData.dateOfPresentation)
    if (extractedData.title_of_paper || extractedData.titleOfPaper) setValue("title_of_paper", extractedData.title_of_paper || extractedData.titleOfPaper)
    if (extractedData.mode || extractedData.modeOfParticipation) setValue("mode", extractedData.mode || extractedData.modeOfParticipation)
  }, [setValue])

  const onSubmit = async (data: PaperFormData) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!data.title_of_paper || !data.authors || !data.level) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validate document upload is required
      if (!documentUrl || !documentUrl.startsWith("/uploaded-document/")) {
        toast({
          title: "Validation Error",
          description: "Please upload a supporting document",
          variant: "destructive",
        })
        setIsSubmitting(false)
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
          setIsSubmitting(false)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          return
        }
      }

      const payload = {
        teacherId: user.role_id,
        paper: {
          theme: data.theme || null,
          organising_body: data.organising_body || null,
          place: data.place || null,
          date: data.date || null,
          title_of_paper: data.title_of_paper,
          level: data.level,
          authors: data.authors,
          Image: pdfPath,
          mode: data.mode || null,
        },
      }

      const res = await fetch("/api/teacher/publication/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add paper")
      }

      toast({
        title: "Success",
        description: "Paper presentation added successfully!",
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
        description: error.message || "Failed to add paper. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Add Paper Presented</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Add your presented paper at conference/seminar/symposia</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Paper Presentation Details
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
              documentUrl={documentUrl}
              category="papers"
              subCategory="papers"
              onChange={handleDocumentChange}
              onExtract={handleExtractFields}
              allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
              maxFileSize={1 * 1024 * 1024}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload invitation letter/email/certificate (PDF, JPG, PNG - max 1MB)</p>
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <Label className="text-base sm:text-lg font-semibold mb-4 block">Step 2: Complete Paper Presentation Information</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                        placeholder="Select presentation level"
                        emptyMessage="No level found"
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
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
                />
                {errors.title_of_paper && <p className="text-sm text-red-500 mt-1">{errors.title_of_paper.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Paper Presentation"
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
