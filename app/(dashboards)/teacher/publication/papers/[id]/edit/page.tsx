"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ArrowLeft, Presentation, Loader2 } from "lucide-react"
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

export default function EditPaperPage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)

  const { resPubLevelOptions, fetchResPubLevels } = useDropDowns()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PaperFormData>()

  useEffect(() => {
    fetchResPubLevels()
  }, [])

  useEffect(() => {
    if (id && user?.role_id) {
      fetchPaper()
    }
  }, [id, user?.role_id])

  const fetchPaper = async () => {
    if (!id || !user?.role_id) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/teacher/publication/papers?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch paper")
      }

      const paper = data.papers.find((p: any) => p.papid === parseInt(id as string))

      if (!paper) {
        throw new Error("Paper not found")
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
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load paper",
        variant: "destructive",
      })
      router.push("/teacher/publication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFile(files)
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

    setIsSubmitting(true)
    try {
      // Generate dummy document URL if file selected, otherwise keep existing
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
        paperId: parseInt(id as string),
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update paper")
      }

      toast({
        title: "Success",
        description: "Paper presentation updated successfully!",
      })

      setTimeout(() => {
        router.push("/teacher/publication")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update paper. Please try again.",
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
          <p className="text-muted-foreground">Loading paper presentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/teacher/publication")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Paper Presented</h1>
          <p className="text-muted-foreground">Edit your presented paper at conference/seminar/symposia</p>
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

            <div>
              <Label>Supporting Document (Optional - upload new to replace existing)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Paper Presentation"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/teacher/publication")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
