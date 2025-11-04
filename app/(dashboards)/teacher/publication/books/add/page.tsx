"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ArrowLeft, BookOpen, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"

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
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)

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

  useEffect(() => {
    fetchJournalAuthorTypes()
    fetchResPubLevels()
    fetchBookTypes()
  }, [])

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFile(files)
  }

  const handleExtractInformation = useCallback(async () => {
    if (!selectedFile || selectedFile.length === 0) {
      showToast({
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
        body: JSON.stringify({ type: "books" }),
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
          type: "books",
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
        if (data.title) setValue("title", data.title)
        if (data.isbn) setValue("isbn", data.isbn)
        if (data.publisher_name || data.publisherName) setValue("publisher_name", data.publisher_name || data.publisherName)
        if (data.submit_date || data.publishingDate) setValue("submit_date", data.submit_date || data.publishingDate)
        if (data.place || data.publishingPlace) setValue("place", data.place || data.publishingPlace)
        if (data.chap_count || data.chapterCount) setValue("chap_count", parseInt(data.chap_count || data.chapterCount) || null)
        if (data.cha) setValue("cha", data.cha)

        showToast({
          title: "Success",
          description: `Form auto-filled with ${formFieldsData.extracted_fields} fields (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
        })
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to auto-fill form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [selectedFile, setValue, showToast])

  const onSubmit = async (data: BookFormData) => {
    if (!user?.role_id) {
      showToast({
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
      if (!data.title || !data.authors || !data.publishing_level || !data.book_type || !data.author_type) {
        showToast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const payload = {
        teacherId: user.role_id,
        book: {
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
          Image: documentUrl,
        },
      }

      const res = await fetch("/api/teacher/publication/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add book")
      }

      showToast({
        title: "Success",
        description: "Book/Book chapter added successfully!",
      })

      setTimeout(() => {
        router.push("/teacher/publication")
      }, 1000)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to add book. Please try again.",
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
          <h1 className="text-3xl font-bold">Add Book/Book Chapter</h1>
          <p className="text-muted-foreground">Add your published book or book chapter</p>
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <Label className="text-lg font-semibold mb-3 block">
              Step 1: Upload Book Document (Optional for extraction)
            </Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="mb-3"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <p className="text-sm text-gray-500 mb-3">Upload book document to auto-extract details</p>
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
            <Label className="text-lg font-semibold mb-4 block">Step 2: Complete Book Information</Label>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="authors">Authors *</Label>
                <Input
                  id="authors"
                  {...register("authors", { required: "Authors are required" })}
                  placeholder="Enter all authors"
                />
                {errors.authors && <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>}
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter book title"
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="isbn">ISBN (Without -)</Label>
                  <Input id="isbn" {...register("isbn")} placeholder="Enter ISBN without dashes" />
                </div>
                <div>
                  <Label htmlFor="publisher_name">Publisher Name</Label>
                  <Input id="publisher_name" {...register("publisher_name")} placeholder="Enter publisher name" />
                </div>
              </div>

              <div>
                <Label htmlFor="cha">Chapter/Article Title</Label>
                <Input id="cha" {...register("cha")} placeholder="Enter chapter/article title if applicable" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submit_date">Publishing Date</Label>
                  <Input id="submit_date" type="date" {...register("submit_date")} />
                </div>
                <div>
                  <Label htmlFor="place">Publishing Place</Label>
                  <Input id="place" {...register("place")} placeholder="Enter publishing place" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chap_count">Chapter Count</Label>
                  <Input
                    id="chap_count"
                    type="number"
                    {...register("chap_count", { valueAsNumber: true })}
                    placeholder="Number of chapters"
                  />
                </div>
                <div>
                  <Label htmlFor="publishing_level">Publishing Level *</Label>
                  <Controller
                    name="publishing_level"
                    control={control}
                    rules={{ required: "Publishing level is required" }}
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
                    rules={{ required: "Book type is required" }}
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

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Book/Book Chapter"
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
