"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { toast, useToast } from "@/hooks/use-toast"
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

export default function EditBookPage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast: showToast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
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
    reset,
    formState: { errors },
  } = useForm<BookFormData>()

  useEffect(() => {
    fetchJournalAuthorTypes()
    fetchResPubLevels()
    fetchBookTypes()
  }, [])

  useEffect(() => {
    if (id && user?.role_id) {
      fetchBook()
    }
  }, [id, user?.role_id])

  const fetchBook = async () => {
    if (!id || !user?.role_id) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/teacher/publication/books?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch book")
      }

      const book = data.books.find((b: any) => b.bid === parseInt(id as string))

      if (!book) {
        throw new Error("Book not found")
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
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to load book",
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

  const onSubmit = async (data: BookFormData) => {
    if (!user?.role_id || !id) {
      showToast({
        title: "Error",
        description: "User not authenticated or book ID missing",
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
        bookId: parseInt(id as string),
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update book")
      }

      showToast({
        title: "Success",
        description: "Book/Book chapter updated successfully!",
      })

      setTimeout(() => {
        router.push("/teacher/publication")
      }, 1000)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to update book. Please try again.",
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
          <p className="text-muted-foreground">Loading book...</p>
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
          <h1 className="text-3xl font-bold">Edit Book/Book Chapter</h1>
          <p className="text-muted-foreground">Edit your published book or book chapter</p>
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
                  "Update Book/Book Chapter"
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
