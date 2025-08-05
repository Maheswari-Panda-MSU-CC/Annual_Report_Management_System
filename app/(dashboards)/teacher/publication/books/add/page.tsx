"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface BookData {
  authors: string
  title: string
  isbn: string
  publisherName: string
  publishingDate: string
  publishingPlace: string
  chargesPaid: string
  edited: string
  chapterCount: string
  publishingLevel: string
  bookType: string
  authorType: string
}

export default function AddBookPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookData>()

  const initialBookData: BookData = {
    authors: "",
    title: "",
    isbn: "",
    publisherName: "",
    publishingDate: "",
    publishingPlace: "",
    chargesPaid: "",
    edited: "",
    chapterCount: "",
    publishingLevel: "",
    bookType: "",
    authorType: "",
  }

  const [bookData, setBookData] = useState<BookData>(initialBookData)

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
        const updatedBookData = { ...bookData }

        Object.keys(data).forEach((key) => {
          if (key in updatedBookData) {
            updatedBookData[key as keyof BookData] = data[key]
            setValue(key, data[key])
          }
        })

        setBookData(updatedBookData)

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
  }, [selectedFile, setValue, toast, bookData])

  const handleBookSubmit = (data: BookData) => {
    console.log("Book Data:", data)
    toast({
      title: "Success",
      description: "Book/Book chapter added successfully!",
    })
          router.push("/teacher/publication")
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
                Step 1: Upload Book/Chapter Document (Required for extraction)
              </Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="mb-3"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <p className="text-sm text-gray-500 mb-3">Upload title page showing your name and ISBN</p>
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
              <Label className="text-lg font-semibold mb-4 block">Step 2: Complete Book/Chapter Information</Label>
              <form onSubmit={handleSubmit(handleBookSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="authors">Authors *</Label>
                  <Input
                    id="authors"
                    value={bookData.authors}
                    onChange={(e) => setBookData((prev) => ({ ...prev, authors: e.target.value }))}
                    {...register("authors", { required: "Authors are required" })}
                    placeholder="Enter all authors"
                  />
                  {errors.authors && <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>}
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={bookData.title}
                    onChange={(e) => setBookData((prev) => ({ ...prev, title: e.target.value }))}
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter book/chapter title"
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isbn">ISBN (Without -)</Label>
                    <Input
                      id="isbn"
                      value={bookData.isbn}
                      onChange={(e) => setBookData((prev) => ({ ...prev, isbn: e.target.value }))}
                      {...register("isbn")}
                      placeholder="Enter ISBN without dashes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisherName">Publisher Name</Label>
                    <Input
                      id="publisherName"
                      value={bookData.publisherName}
                      onChange={(e) => setBookData((prev) => ({ ...prev, publisherName: e.target.value }))}
                      {...register("publisherName")}
                      placeholder="Enter publisher name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publishingDate">Publishing Date</Label>
                    <Input
                      id="publishingDate"
                      type="date"
                      value={bookData.publishingDate}
                      onChange={(e) => setBookData((prev) => ({ ...prev, publishingDate: e.target.value }))}
                      {...register("publishingDate")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishingPlace">Publishing Place</Label>
                    <Input
                      id="publishingPlace"
                      value={bookData.publishingPlace}
                      onChange={(e) => setBookData((prev) => ({ ...prev, publishingPlace: e.target.value }))}
                      {...register("publishingPlace")}
                      placeholder="Enter publishing place"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chargesPaid">Charges Paid</Label>
                    <Select
                      value={bookData.chargesPaid}
                      onValueChange={(value) => setBookData((prev) => ({ ...prev, chargesPaid: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edited">Edited</Label>
                    <Select
                      value={bookData.edited}
                      onValueChange={(value) => setBookData((prev) => ({ ...prev, edited: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="chapterCount">Chapter Count</Label>
                    <Input
                      id="chapterCount"
                      type="number"
                      value={bookData.chapterCount}
                      onChange={(e) => setBookData((prev) => ({ ...prev, chapterCount: e.target.value }))}
                      {...register("chapterCount")}
                      placeholder="Number of chapters"
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishingLevel">Publishing Level</Label>
                    <Select
                      value={bookData.publishingLevel}
                      onValueChange={(value) => setBookData((prev) => ({ ...prev, publishingLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="Regional">Regional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bookType">Book Type</Label>
                    <Select
                      value={bookData.bookType}
                      onValueChange={(value) => setBookData((prev) => ({ ...prev, bookType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Textbook">Textbook</SelectItem>
                        <SelectItem value="Reference Book">Reference Book</SelectItem>
                        <SelectItem value="Research Monograph">Research Monograph</SelectItem>
                        <SelectItem value="Edited Volume">Edited Volume</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="authorType">Author Type</Label>
                  <Select
                    value={bookData.authorType}
                    onValueChange={(value) => setBookData((prev) => ({ ...prev, authorType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principal Author">Principal Author</SelectItem>
                      <SelectItem value="Co-Author">Co-Author</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Save Book/Chapter</Button>
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
