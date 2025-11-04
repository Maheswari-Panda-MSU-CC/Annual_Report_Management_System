"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ArrowLeft, Presentation, Brain, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"

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
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)

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

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFile(files)
  }

  const handleExtractInformation = useCallback(async () => {
    if (!selectedFile || selectedFile.length === 0) {
      toast({
        title: "No Document Uploaded",
        description: "Please upload a document before extracting information.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const categoryResponse = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "papers" }),
      })

      if (!categoryResponse.ok) {
        throw new Error("Failed to get category")
      }

      const categoryData = await categoryResponse.json()

      const formFieldsResponse = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryData.category,
          type: "papers",
        }),
      })

      if (!formFieldsResponse.ok) {
        throw new Error("Failed to get form fields")
      }

      const formFieldsData = await formFieldsResponse.json()

      if (formFieldsData.success && formFieldsData.data) {
        const data = formFieldsData.data

        // Map extracted data to form fields
        if (data.authors) setValue("authors", data.authors)
        if (data.theme || data.themeOfConference) setValue("theme", data.theme || data.themeOfConference)
        if (data.organising_body || data.organizingBody) setValue("organising_body", data.organising_body || data.organizingBody)
        if (data.place) setValue("place", data.place)
        if (data.date || data.dateOfPresentation) setValue("date", data.date || data.dateOfPresentation)
        if (data.title_of_paper || data.titleOfPaper) setValue("title_of_paper", data.title_of_paper || data.titleOfPaper)
        if (data.mode || data.modeOfParticipation) setValue("mode", data.mode || data.modeOfParticipation)

        toast({
          title: "Success",
          description: `Form auto-filled with ${formFieldsData.extracted_fields} fields (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [selectedFile, setValue, toast])

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
      // Generate dummy document URL if file selected
      let documentUrl: string | null = null
      if (selectedFile && selectedFile.length > 0) {
        const file = selectedFile[0]
        documentUrl = `publications/${user.role_id}/${Date.now()}_${file.name}`
      }

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
          Image: documentUrl,
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

      setTimeout(() => {
        router.push("/teacher/publication")
      }, 1000)
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Paper Presented</h1>
          <p className="text-muted-foreground">Add your presented paper at conference/seminar/symposia</p>
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <Label className="text-lg font-semibold mb-3 block">
              Step 1: Upload Supporting Document (Optional for extraction)
            </Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="mb-3"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <p className="text-sm text-gray-500 mb-3">Upload invitation letter/email/certificate showing your name</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={handleExtractInformation}
              disabled={!selectedFile || selectedFile.length === 0 || isExtracting}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Extract Information
                </>
              )}
            </Button>
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-lg font-semibold mb-4 block">Step 2: Complete Paper Presentation Information</Label>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="authors">Author(s) *</Label>
                <Input
                  id="authors"
                  {...register("authors", { required: "Authors are required" })}
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
                    rules={{ required: "Presentation level is required" }}
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
                </div>
              </div>

              <div>
                <Label htmlFor="theme">Theme Of Conference/Seminar/Symposia</Label>
                <Input id="theme" {...register("theme")} placeholder="Enter conference theme" />
              </div>

              <div>
                <Label htmlFor="title_of_paper">Title of Paper *</Label>
                <Input
                  id="title_of_paper"
                  {...register("title_of_paper", { required: "Title of paper is required" })}
                  placeholder="Enter paper title"
                />
                {errors.title_of_paper && <p className="text-sm text-red-500 mt-1">{errors.title_of_paper.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organising_body">Organizing Body</Label>
                  <Input id="organising_body" {...register("organising_body")} placeholder="Enter organizing body" />
                </div>
                <div>
                  <Label htmlFor="place">Place</Label>
                  <Input id="place" {...register("place")} placeholder="Enter place" />
                </div>
              </div>

              <div>
                <Label htmlFor="date">Date of Presentation/Seminar</Label>
                <Input id="date" type="date" {...register("date")} />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Paper Presentation"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
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
