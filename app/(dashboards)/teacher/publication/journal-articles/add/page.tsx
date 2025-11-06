"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ArrowLeft, FileText, Brain, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"

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

export default function AddJournalArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)

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
  } = useForm<JournalFormData>({
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
    },
  })

  useEffect(() => {
    fetchJournalAuthorTypes()
    fetchJournalEditedTypes()
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
        body: JSON.stringify({ type: "journals" }),
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
          type: "journals",
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
        if (data.author_num) setValue("author_num", parseInt(data.author_num) || null)
        if (data.title) setValue("title", data.title)
        if (data.isbn) setValue("isbn", data.isbn)
        if (data.journal_name || data.journalBookName) setValue("journal_name", data.journal_name || data.journalBookName)
        if (data.volume_num || data.volumeNo) setValue("volume_num", parseInt(data.volume_num || data.volumeNo) || null)
        if (data.page_num || data.pageNo) setValue("page_num", data.page_num || data.pageNo)
        if (data.month_year || data.date) setValue("month_year", data.month_year || data.date)
        if (data.h_index || data.hIndex) setValue("h_index", parseFloat(data.h_index || data.hIndex) || null)
        if (data.impact_factor || data.impactFactor) setValue("impact_factor", parseFloat(data.impact_factor || data.impactFactor) || null)
        if (data.DOI || data.doi) setValue("DOI", data.DOI || data.doi)
        if (data.issn) setValue("issn", data.issn)

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

  const onSubmit = async (data: JournalFormData) => {
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
      if (!data.title || !data.authors || !data.author_type || !data.level || !data.type) {
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
          Image: documentUrl,
          in_ugc: data.in_ugc ?? false,
          in_clarivate: data.in_clarivate ?? false,
          DOI: data.DOI || null,
          in_oldUGCList: data.in_oldUGCList ?? false,
        },
      }

      const res = await fetch("/api/teacher/publication/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add journal")
      }

      toast({
        title: "Success",
        description: "Journal article added successfully!",
      })

      setTimeout(() => {
        router.push("/teacher/publication")
      }, 1000)
    } catch (error: any) {
        toast({
        title: "Error",
        description: error.message || "Failed to add journal article. Please try again.",
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
          <h1 className="text-3xl font-bold">Add Published Article/Journal/Edited Volume</h1>
          <p className="text-muted-foreground">Add your published article or journal or volume in journal/edited volume</p>
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <Label className="text-lg font-semibold mb-3 block">
              Step 1: Upload Article/Journal/Volume Document (Optional for extraction)
            </Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="mb-3"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <p className="text-sm text-gray-500 mb-3">Upload article/journal/volume document to auto-extract details</p>
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
            <Label className="text-lg font-semibold mb-4 block">Step 2: Complete Article/Journal/Volume Information</Label>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authors">Author(s) *</Label>
                  <Input
                    id="authors"
                    {...register("authors", { required: "Authors are required" })}
                    placeholder="Enter all authors"
                  />
                  {errors.authors && <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>}
                </div>
                <div>
                  <Label htmlFor="author_num">No. of Authors</Label>
                  <Input
                    id="author_num"
                    type="number"
                    {...register("author_num", { valueAsNumber: true })}
                    placeholder="Number of authors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author_type">Author Type *</Label>
                  <Controller
                    name="author_type"
                    control={control}
                    rules={{ required: "Author type is required" }}
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
                    rules={{ required: "Type is required" }}
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
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter article/journal/volume title"
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issn">ISSN (Without -)</Label>
                  <Input id="issn" {...register("issn")} placeholder="Enter ISSN without dashes" />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN (Without -)</Label>
                  <Input id="isbn" {...register("isbn")} placeholder="Enter ISBN without dashes" />
                </div>
              </div>

              <div>
                <Label htmlFor="journal_name">Journal/Article/Edited Volume Name *</Label>
                <Input
                  id="journal_name"
                  {...register("journal_name", { required: "Journal/Book Name is required" })}
                  placeholder="Enter journal or article or edited volume name"
                />
                {errors.journal_name && <p className="text-sm text-red-500 mt-1">{errors.journal_name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="volume_num">Volume No.</Label>
                  <Input
                    id="volume_num"
                    type="number"
                    {...register("volume_num", { valueAsNumber: true })}
                    placeholder="Volume number"
                  />
                </div>
                <div>
                  <Label htmlFor="page_num">Page No. (Range)</Label>
                  <Input id="page_num" {...register("page_num")} placeholder="e.g., 123-135" />
                </div>
                <div>
                  <Label htmlFor="month_year">Date</Label>
                  <Input id="month_year" type="date" {...register("month_year")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Controller
                    name="level"
                    control={control}
                    rules={{ required: "Level is required" }}
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
                    {...register("h_index", { valueAsNumber: true })}
                    placeholder="H Index value"
                  />
                </div>
                <div>
                  <Label htmlFor="impact_factor">Impact Factor</Label>
                  <Input
                    id="impact_factor"
                    type="number"
                    step="0.0001"
                    {...register("impact_factor", { valueAsNumber: true })}
                    placeholder="Impact Factor value"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="DOI">DOI</Label>
                <Input id="DOI" {...register("DOI")} placeholder="Enter DOI" />
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

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
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
