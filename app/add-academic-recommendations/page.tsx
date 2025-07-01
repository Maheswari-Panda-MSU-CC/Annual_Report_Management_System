"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Book, FileText, Newspaper, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/dashboard-layout"

// Type definitions
interface ArticleData {
  journalName: string
  issn: string
  eIssn: string
  volumeNo: string
  publisherName: string
  type: string
  level: string
  peerReviewed: string
  hIndex: string
  impactFactor: string
  doi: string
  inScopus: boolean
  inUgcCare: boolean
  inClarivate: boolean
  inOldUgcList: boolean
  approxPrice: string
  currency: string
  additionalInfo: string
}

interface BookData {
  title: string
  authors: string
  isbn: string
  publisherName: string
  publishingLevel: string
  bookType: string
  edition: string
  volumeNo: string
  publicationDate: string
  isEbook: string
  digitalMedia: string
  approxPrice: string
  currency: string
}

interface MagazineData {
  title: string
  mode: string
  publishingAgency: string
  volumeNo: string
  publicationDate: string
  issuesPerYear: string
  additionalAttachment: string
  attachmentNotes: string
  approxPrice: string
  currency: string
}

interface TechnicalReportData {
  title: string
  subject: string
  publisherName: string
  publicationDate: string
  issuesPerYear: string
  approxPrice: string
  currency: string
}

export default function AddAcademicRecommendations() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("articles")
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: FileList | null }>({
    articles: null,
    books: null,
    magazines: null,
    technical: null,
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ArticleData | BookData | MagazineData | TechnicalReportData>()

  // Initial state for each form section
  const initialArticleData: ArticleData = {
    journalName: "",
    issn: "",
    eIssn: "",
    volumeNo: "",
    publisherName: "",
    type: "",
    level: "",
    peerReviewed: "",
    hIndex: "",
    impactFactor: "",
    doi: "",
    inScopus: false,
    inUgcCare: false,
    inClarivate: false,
    inOldUgcList: false,
    approxPrice: "",
    currency: "USD",
    additionalInfo: "",
  }

  const initialBookData: BookData = {
    title: "",
    authors: "",
    isbn: "",
    publisherName: "",
    publishingLevel: "",
    bookType: "",
    edition: "",
    volumeNo: "",
    publicationDate: "",
    isEbook: "",
    digitalMedia: "",
    approxPrice: "",
    currency: "USD",
  }

  const initialMagazineData: MagazineData = {
    title: "",
    mode: "",
    publishingAgency: "",
    volumeNo: "",
    publicationDate: "",
    issuesPerYear: "",
    additionalAttachment: "",
    attachmentNotes: "",
    approxPrice: "",
    currency: "USD",
  }

  const initialTechnicalReportData: TechnicalReportData = {
    title: "",
    subject: "",
    publisherName: "",
    publicationDate: "",
    issuesPerYear: "",
    approxPrice: "",
    currency: "USD",
  }

  // State for each form section
  const [articleData, setArticleData] = useState<ArticleData>(initialArticleData)
  const [bookData, setBookData] = useState<BookData>(initialBookData)
  const [magazineData, setMagazineData] = useState<MagazineData>(initialMagazineData)
  const [technicalReportData, setTechnicalReportData] = useState<TechnicalReportData>(initialTechnicalReportData)

  // Handle file selection for specific tab
  const handleFileSelect = (files: FileList | null, tab: string) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [tab]: files,
    }))
  }

  // Clear form and file when switching tabs
  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      // Clear the file input for the current tab
      const fileInput = document.querySelector(`input[data-tab="${activeTab}"]`) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      // Clear selected files for current tab
      setSelectedFiles((prev) => ({
        ...prev,
        [activeTab]: null,
      }))

      // Reset form data based on current tab
      switch (activeTab) {
        case "articles":
          setArticleData(initialArticleData)
          break
        case "books":
          setBookData(initialBookData)
          break
        case "magazines":
          setMagazineData(initialMagazineData)
          break
        case "technical":
          setTechnicalReportData(initialTechnicalReportData)
          break
      }

      // Reset React Hook Form
      reset()

      setActiveTab(newTab)
    }
  }

  // Enhanced auto-fill function with proper form population
  const handleExtractInformation = useCallback(
    async (tab: string) => {
      // Check if file is uploaded
      if (!selectedFiles[tab] || selectedFiles[tab]!.length === 0) {
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
          body: JSON.stringify({ type: tab }),
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
            type: tab,
          }),
        })

        if (!formFieldsResponse.ok) {
          throw new Error("Failed to get form fields")
        }

        const formFieldsData = await formFieldsResponse.json()

        if (formFieldsData.success && formFieldsData.data) {
          const data = formFieldsData.data

          // Update both React Hook Form state and local state
          switch (tab) {
            case "articles":
              const updatedArticleData = { ...articleData }
              Object.keys(data).forEach((key) => {
                if (key in updatedArticleData) {
                  updatedArticleData[key as keyof ArticleData] = data[key]
                  setValue(key, data[key])
                }
              })
              setArticleData(updatedArticleData)
              break

            case "books":
              const updatedBookData = { ...bookData }
              Object.keys(data).forEach((key) => {
                if (key in updatedBookData) {
                  updatedBookData[key as keyof BookData] = data[key]
                  setValue(key, data[key])
                }
              })
              setBookData(updatedBookData)
              break

            case "magazines":
              const updatedMagazineData = { ...magazineData }
              Object.keys(data).forEach((key) => {
                if (key in updatedMagazineData) {
                  updatedMagazineData[key as keyof MagazineData] = data[key]
                  setValue(key, data[key])
                }
              })
              setMagazineData(updatedMagazineData)
              break

            case "technical":
              const updatedTechnicalData = { ...technicalReportData }
              Object.keys(data).forEach((key) => {
                if (key in updatedTechnicalData) {
                  updatedTechnicalData[key as keyof TechnicalReportData] = data[key]
                  setValue(key, data[key])
                }
              })
              setTechnicalReportData(updatedTechnicalData)
              break
          }

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
    },
    [selectedFiles, setValue, toast, articleData, bookData, magazineData, technicalReportData],
  )

  // Form submission handlers
  const handleArticleSubmit = (data: ArticleData) => {
    console.log("Article Data:", data)
    toast({
      title: "Success",
      description: "Article recommendation added successfully!",
    })
    setArticleData(initialArticleData)
    reset()
  }

  const handleBookSubmit = (data: BookData) => {
    console.log("Book Data:", data)
    toast({
      title: "Success",
      description: "Book recommendation added successfully!",
    })
    setBookData(initialBookData)
    reset()
  }

  const handleMagazineSubmit = (data: MagazineData) => {
    console.log("Magazine Data:", data)
    toast({
      title: "Success",
      description: "Magazine recommendation added successfully!",
    })
    setMagazineData(initialMagazineData)
    reset()
  }

  const handleTechnicalReportSubmit = (data: TechnicalReportData) => {
    console.log("Technical Report Data:", data)
    toast({
      title: "Success",
      description: "Technical report recommendation added successfully!",
    })
    setTechnicalReportData(initialTechnicalReportData)
    reset()
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add Academic Recommendations</h1>
            <p className="text-muted-foreground">Add recommendations for academic resources</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Articles/Journals
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Books
            </TabsTrigger>
            <TabsTrigger value="magazines" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Magazines
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Technical Reports
            </TabsTrigger>
          </TabsList>

          {/* Articles/Journals Tab */}
          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Articles/Journals/Edited Volumes
                </CardTitle>
                <CardDescription>
                  Upload document first to auto-extract information, then add recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">
                    Step 1: Upload Reference Document (Required for extraction)
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="mb-3"
                    data-tab="articles"
                    onChange={(e) => handleFileSelect(e.target.files, "articles")}
                  />
                  <p className="text-sm text-gray-500 mb-3">Upload article/journal document to auto-extract details</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExtractInformation("articles")}
                    disabled={!selectedFiles.articles || selectedFiles.articles.length === 0 || isExtracting}
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
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Complete Article/Journal Information
                  </Label>
                  <form onSubmit={handleSubmit(handleArticleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="journalName">Journal Name *</Label>
                        <Input
                          id="journalName"
                          value={articleData.journalName}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, journalName: e.target.value }))}
                          {...register("journalName", { required: "Journal Name is required" })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="issn">ISSN</Label>
                        <Input
                          id="issn"
                          value={articleData.issn}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, issn: e.target.value }))}
                          {...register("issn")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eIssn">E-ISSN</Label>
                        <Input
                          id="eIssn"
                          value={articleData.eIssn}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, eIssn: e.target.value }))}
                          {...register("eIssn")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="volumeNo">Volume No.</Label>
                        <Input
                          id="volumeNo"
                          value={articleData.volumeNo}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                          {...register("volumeNo")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publisherName">Publisher Name</Label>
                        <Input
                          id="publisherName"
                          value={articleData.publisherName}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, publisherName: e.target.value }))}
                          {...register("publisherName")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hIndex">H Index</Label>
                        <Input
                          id="hIndex"
                          type="number"
                          step="0.01"
                          value={articleData.hIndex}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, hIndex: e.target.value }))}
                          {...register("hIndex")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="impactFactor">Impact Factor</Label>
                        <Input
                          id="impactFactor"
                          type="number"
                          step="0.001"
                          value={articleData.impactFactor}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, impactFactor: e.target.value }))}
                          {...register("impactFactor")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doi">DOI</Label>
                        <Input
                          id="doi"
                          value={articleData.doi}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, doi: e.target.value }))}
                          {...register("doi")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="approxPrice">Approximate Price</Label>
                        <div className="flex gap-2">
                          <Input
                            id="approxPrice"
                            type="number"
                            step="0.01"
                            value={articleData.approxPrice}
                            onChange={(e) => setArticleData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                            {...register("approxPrice")}
                            className="flex-1"
                          />
                          <Select
                            value={articleData.currency}
                            onValueChange={(value) => setArticleData((prev) => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Peer Reviewed?</Label>
                      <RadioGroup
                        value={articleData.peerReviewed}
                        onValueChange={(value) => setArticleData((prev) => ({ ...prev, peerReviewed: value }))}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="peer-yes" />
                          <Label htmlFor="peer-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="peer-no" />
                          <Label htmlFor="peer-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="inScopus"
                          checked={articleData.inScopus}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, inScopus: e.target.checked }))}
                        />
                        <Label htmlFor="inScopus">In Scopus?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="inUgcCare"
                          checked={articleData.inUgcCare}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, inUgcCare: e.target.checked }))}
                        />
                        <Label htmlFor="inUgcCare">In UGC CARE?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="inClarivate"
                          checked={articleData.inClarivate}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, inClarivate: e.target.checked }))}
                        />
                        <Label htmlFor="inClarivate">In CLARIVATE?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="inOldUgcList"
                          checked={articleData.inOldUgcList}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, inOldUgcList: e.target.checked }))}
                        />
                        <Label htmlFor="inOldUgcList">In Old UGC List?</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={articleData.additionalInfo}
                        onChange={(e) => setArticleData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">Save Article Recommendation</Button>
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Books
                </CardTitle>
                <CardDescription>
                  Upload document first to auto-extract information, then add recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">
                    Step 1: Upload Reference Document (Required for extraction)
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="mb-3"
                    data-tab="books"
                    onChange={(e) => handleFileSelect(e.target.files, "books")}
                  />
                  <p className="text-sm text-gray-500 mb-3">Upload book document to auto-extract details</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExtractInformation("books")}
                    disabled={!selectedFiles.books || selectedFiles.books.length === 0 || isExtracting}
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
                  <form onSubmit={handleSubmit(handleBookSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={bookData.title}
                          onChange={(e) => setBookData((prev) => ({ ...prev, title: e.target.value }))}
                          {...register("title", { required: "Title is required" })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="authors">Author(s)</Label>
                        <Input
                          id="authors"
                          value={bookData.authors}
                          onChange={(e) => setBookData((prev) => ({ ...prev, authors: e.target.value }))}
                          {...register("authors")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={bookData.isbn}
                          onChange={(e) => setBookData((prev) => ({ ...prev, isbn: e.target.value }))}
                          {...register("isbn")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publisherName">Publisher Name</Label>
                        <Input
                          id="publisherName"
                          value={bookData.publisherName}
                          onChange={(e) => setBookData((prev) => ({ ...prev, publisherName: e.target.value }))}
                          {...register("publisherName")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edition">Edition</Label>
                        <Input
                          id="edition"
                          value={bookData.edition}
                          onChange={(e) => setBookData((prev) => ({ ...prev, edition: e.target.value }))}
                          {...register("edition")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="volumeNo">Volume No.</Label>
                        <Input
                          id="volumeNo"
                          value={bookData.volumeNo}
                          onChange={(e) => setBookData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                          {...register("volumeNo")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publicationDate">Publication Date</Label>
                        <Input
                          id="publicationDate"
                          type="date"
                          value={bookData.publicationDate}
                          onChange={(e) => setBookData((prev) => ({ ...prev, publicationDate: e.target.value }))}
                          {...register("publicationDate")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="approxPrice">Approximate Price</Label>
                        <div className="flex gap-2">
                          <Input
                            id="approxPrice"
                            type="number"
                            step="0.01"
                            value={bookData.approxPrice}
                            onChange={(e) => setBookData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                            {...register("approxPrice")}
                            className="flex-1"
                          />
                          <Select
                            value={bookData.currency}
                            onValueChange={(value) => setBookData((prev) => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Is E-book?</Label>
                      <RadioGroup
                        value={bookData.isEbook}
                        onValueChange={(value) => setBookData((prev) => ({ ...prev, isEbook: value }))}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ebook-yes" />
                          <Label htmlFor="ebook-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ebook-no" />
                          <Label htmlFor="ebook-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Digital Media?</Label>
                      <RadioGroup
                        value={bookData.digitalMedia}
                        onValueChange={(value) => setBookData((prev) => ({ ...prev, digitalMedia: value }))}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="digital-yes" />
                          <Label htmlFor="digital-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="digital-no" />
                          <Label htmlFor="digital-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">Save Book Recommendation</Button>
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Magazines Tab */}
          <TabsContent value="magazines">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Magazines
                </CardTitle>
                <CardDescription>
                  Upload document first to auto-extract information, then add recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">
                    Step 1: Upload Reference Document (Required for extraction)
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="mb-3"
                    data-tab="magazines"
                    onChange={(e) => handleFileSelect(e.target.files, "magazines")}
                  />
                  <p className="text-sm text-gray-500 mb-3">Upload magazine document to auto-extract details</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExtractInformation("magazines")}
                    disabled={!selectedFiles.magazines || selectedFiles.magazines.length === 0 || isExtracting}
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
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Complete Magazine Information</Label>
                  <form onSubmit={handleSubmit(handleMagazineSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={magazineData.title}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, title: e.target.value }))}
                          {...register("title", { required: "Title is required" })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publishingAgency">Publishing Agency</Label>
                        <Input
                          id="publishingAgency"
                          value={magazineData.publishingAgency}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, publishingAgency: e.target.value }))}
                          {...register("publishingAgency")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="volumeNo">Volume No.</Label>
                        <Input
                          id="volumeNo"
                          value={magazineData.volumeNo}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                          {...register("volumeNo")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publicationDate">Publication Date</Label>
                        <Input
                          id="publicationDate"
                          type="date"
                          value={magazineData.publicationDate}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, publicationDate: e.target.value }))}
                          {...register("publicationDate")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="issuesPerYear">Issues per Year</Label>
                        <Input
                          id="issuesPerYear"
                          type="number"
                          value={magazineData.issuesPerYear}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, issuesPerYear: e.target.value }))}
                          {...register("issuesPerYear")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="additionalAttachment">Additional Attachment</Label>
                        <Input
                          id="additionalAttachment"
                          value={magazineData.additionalAttachment}
                          onChange={(e) =>
                            setMagazineData((prev) => ({ ...prev, additionalAttachment: e.target.value }))
                          }
                          {...register("additionalAttachment")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="attachmentNotes">Attachment Notes</Label>
                        <Textarea
                          id="attachmentNotes"
                          value={magazineData.attachmentNotes}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, attachmentNotes: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="approxPrice">Approximate Price</Label>
                        <div className="flex gap-2">
                          <Input
                            id="approxPrice"
                            type="number"
                            step="0.01"
                            value={magazineData.approxPrice}
                            onChange={(e) => setMagazineData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                            {...register("approxPrice")}
                            className="flex-1"
                          />
                          <Select
                            value={magazineData.currency}
                            onValueChange={(value) => setMagazineData((prev) => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">Save Magazine Recommendation</Button>
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Reports Tab */}
          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Technical Reports & Others
                </CardTitle>
                <CardDescription>
                  Upload document first to auto-extract information, then add recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">
                    Step 1: Upload Reference Document (Required for extraction)
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="mb-3"
                    data-tab="technical"
                    onChange={(e) => handleFileSelect(e.target.files, "technical")}
                  />
                  <p className="text-sm text-gray-500 mb-3">Upload technical report document to auto-extract details</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExtractInformation("technical")}
                    disabled={!selectedFiles.technical || selectedFiles.technical.length === 0 || isExtracting}
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
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Complete Technical Report Information
                  </Label>
                  <form onSubmit={handleSubmit(handleTechnicalReportSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={technicalReportData.title}
                          onChange={(e) => setTechnicalReportData((prev) => ({ ...prev, title: e.target.value }))}
                          {...register("title", { required: "Title is required" })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={technicalReportData.subject}
                          onChange={(e) => setTechnicalReportData((prev) => ({ ...prev, subject: e.target.value }))}
                          {...register("subject")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publisherName">Publisher's Name</Label>
                        <Input
                          id="publisherName"
                          value={technicalReportData.publisherName}
                          onChange={(e) =>
                            setTechnicalReportData((prev) => ({ ...prev, publisherName: e.target.value }))
                          }
                          {...register("publisherName")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publicationDate">Publication Date</Label>
                        <Input
                          id="publicationDate"
                          type="date"
                          value={technicalReportData.publicationDate}
                          onChange={(e) =>
                            setTechnicalReportData((prev) => ({ ...prev, publicationDate: e.target.value }))
                          }
                          {...register("publicationDate")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="technicalIssuesPerYear">Issues per Year</Label>
                        <Input
                          id="technicalIssuesPerYear"
                          type="number"
                          value={technicalReportData.issuesPerYear}
                          onChange={(e) =>
                            setTechnicalReportData((prev) => ({ ...prev, issuesPerYear: e.target.value }))
                          }
                          {...register("issuesPerYear")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="technicalApproxPrice">Approximate Price</Label>
                        <div className="flex gap-2">
                          <Input
                            id="technicalApproxPrice"
                            type="number"
                            step="0.01"
                            value={technicalReportData.approxPrice}
                            onChange={(e) =>
                              setTechnicalReportData((prev) => ({ ...prev, approxPrice: e.target.value }))
                            }
                            {...register("approxPrice")}
                            className="flex-1"
                          />
                          <Select
                            value={technicalReportData.currency}
                            onValueChange={(value) => setTechnicalReportData((prev) => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">Save Technical Report Recommendation</Button>
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
