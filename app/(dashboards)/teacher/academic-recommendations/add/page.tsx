"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BookOpen, Book, FileText, Newspaper, Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Type definitions matching the exact form fields
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
  isAdditionalAttachment: boolean
  additionalAttachment: string
  issuesPerYear: string
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
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("articles")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null)

  // Handle URL tab parameter on component mount
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["articles", "books", "magazines", "technical"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: FileList | null }>({
    articles: null,
    books: null,
    magazines: null,
    technical: null,
  })

  const [extractionStatus, setExtractionStatus] = useState<{ [key: string]: boolean }>({
    articles: false,
    books: false,
    magazines: false,
    technical: false,
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
    isAdditionalAttachment: false,
    additionalAttachment: "",
    issuesPerYear: "",
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

    // Reset extraction status when new file is uploaded
    setExtractionStatus((prev) => ({ ...prev, [tab]: false }))
    setExtractionError(null)
    setExtractionSuccess(null)

    if (files && files.length > 0) {
      toast({
        title: "File Uploaded",
        description: `${files[0].name} has been uploaded successfully.`,
      })
    }
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
        setExtractionError("Please upload a document before extracting information.")
        toast({
          title: "No Document Uploaded",
          description: "Please upload a document before extracting information.",
          variant: "destructive",
        })
        return
      }

      setIsExtracting(true)
      setExtractionError(null)
      setExtractionSuccess(null)

      try {
        // Simulate document processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const categoryResponse = await fetch("/api/llm/get-category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: tab,
            documentType: "academic_recommendation",
            fileName: selectedFiles[tab]![0].name,
          }),
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
            documentContent: `Sample ${tab} document content for extraction`,
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
                  updatedArticleData [key as keyof ArticleData] = data[key]
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

          setExtractionStatus((prev) => ({ ...prev, [tab]: true }))

          const extractedFieldsCount = formFieldsData.extracted_fields || Object.keys(data).length
          const confidence = formFieldsData.confidence || 0.85

          setExtractionSuccess(
            `Successfully extracted ${extractedFieldsCount} fields with ${Math.round(confidence * 100)}% confidence`,
          )

          toast({
            title: "Success",
            description: `Form auto-filled with ${extractedFieldsCount} fields (${Math.round(confidence * 100)}% confidence)`,
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to auto-fill form. Please try again."
        setExtractionError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
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

  const DocumentUploadSection = ({
    tab,
    file,
  }: {
    tab: string
    file: FileList | null
  }) => (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
      <Label className="text-lg font-semibold mb-3 block">
        Step 1: Upload Reference Document (Required for extraction)
      </Label>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="flex-1"
            data-tab={tab}
            onChange={(e) => handleFileSelect(e.target.files, tab)}
          />
          {file && file.length > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Uploaded</span>
            </div>
          )}
        </div>

        {file && file.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-white rounded border">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{file[0].name}</span>
            <span className="text-xs text-gray-500">({(file[0].size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-3">Upload {tab} document to auto-extract details</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full bg-transparent"
          onClick={() => handleExtractInformation(tab)}
          disabled={!file || file.length === 0 || isExtracting}
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

        {/* Status Messages */}
        {extractionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{extractionError}</AlertDescription>
          </Alert>
        )}

        {extractionSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{extractionSuccess}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )

  return (
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Add Teacher's Recommendation(s) for Journals/Databases and other Learning Resources
            </h1>
            <p className="text-muted-foreground">Add recommendations for academic resources</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Articles/Journals/Edited Volumes
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
              Technical Report and Other(s)
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
                <DocumentUploadSection tab="articles" file={selectedFiles.articles} />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Complete Article/Journal Information
                    {extractionStatus.articles && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
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
                          className={
                            extractionStatus.articles && articleData.journalName ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="issn">ISSN (Without -)</Label>
                        <Input
                          id="issn"
                          placeholder="Enter ISSN without dashes"
                          value={articleData.issn}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, issn: e.target.value }))}
                          {...register("issn")}
                          className={
                            extractionStatus.articles && articleData.issn ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="eIssn">E-ISSN (Without -)</Label>
                        <Input
                          id="eIssn"
                          placeholder="Enter E-ISSN without dashes"
                          value={articleData.eIssn}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, eIssn: e.target.value }))}
                          {...register("eIssn")}
                          className={
                            extractionStatus.articles && articleData.eIssn ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="volumeNo">Volume No.</Label>
                        <Input
                          id="volumeNo"
                          value={articleData.volumeNo}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                          {...register("volumeNo")}
                          className={
                            extractionStatus.articles && articleData.volumeNo ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="publisherName">Publisher's Name</Label>
                        <Input
                          id="publisherName"
                          value={articleData.publisherName}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, publisherName: e.target.value }))}
                          {...register("publisherName")}
                          className={
                            extractionStatus.articles && articleData.publisherName ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Input
                          id="type"
                          value={articleData.type}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, type: e.target.value }))}
                          {...register("type")}
                          className={
                            extractionStatus.articles && articleData.type ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="level">Level</Label>
                        <Select
                          value={articleData.level}
                          onValueChange={(value) => setArticleData((prev) => ({ ...prev, level: value }))}
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.articles && articleData.level ? "border-green-300 bg-green-50" : ""
                            }
                          >
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
                        <Label htmlFor="peerReviewed">Peer Reviewed?</Label>
                        <Select
                          value={articleData.peerReviewed}
                          onValueChange={(value) => setArticleData((prev) => ({ ...prev, peerReviewed: value }))}
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.articles && articleData.peerReviewed
                                ? "border-green-300 bg-green-50"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hIndex">H Index</Label>
                        <Input
                          id="hIndex"
                          type="number"
                          value={articleData.hIndex}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, hIndex: e.target.value }))}
                          {...register("hIndex")}
                          className={
                            extractionStatus.articles && articleData.hIndex ? "border-green-300 bg-green-50" : ""
                          }
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
                          className={
                            extractionStatus.articles && articleData.impactFactor ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="doi">DOI</Label>
                        <Input
                          id="doi"
                          value={articleData.doi}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, doi: e.target.value }))}
                          {...register("doi")}
                          className={extractionStatus.articles && articleData.doi ? "border-green-300 bg-green-50" : ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inScopus"
                          checked={articleData.inScopus}
                          onCheckedChange={(checked) => setArticleData((prev) => ({ ...prev, inScopus: !!checked }))}
                        />
                        <Label htmlFor="inScopus">In Scopus?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inUgcCare"
                          checked={articleData.inUgcCare}
                          onCheckedChange={(checked) => setArticleData((prev) => ({ ...prev, inUgcCare: !!checked }))}
                        />
                        <Label htmlFor="inUgcCare">In UGC CARE?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inClarivate"
                          checked={articleData.inClarivate}
                          onCheckedChange={(checked) => setArticleData((prev) => ({ ...prev, inClarivate: !!checked }))}
                        />
                        <Label htmlFor="inClarivate">In CLARIVATE?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inOldUgcList"
                          checked={articleData.inOldUgcList}
                          onCheckedChange={(checked) =>
                            setArticleData((prev) => ({ ...prev, inOldUgcList: !!checked }))
                          }
                        />
                        <Label htmlFor="inOldUgcList">In Old UGC List?</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="approxPrice">Approx. Price</Label>
                        <Input
                          id="approxPrice"
                          type="number"
                          step="0.01"
                          value={articleData.approxPrice}
                          onChange={(e) => setArticleData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                          {...register("approxPrice")}
                          className={
                            extractionStatus.articles && articleData.approxPrice ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={articleData.currency}
                          onValueChange={(value) => setArticleData((prev) => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
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
                <DocumentUploadSection tab="books" file={selectedFiles.books} />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Complete Book Information
                    {extractionStatus.books && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
                  </Label>
                  <form onSubmit={handleSubmit(handleBookSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={bookData.title}
                          onChange={(e) => setBookData((prev) => ({ ...prev, title: e.target.value }))}
                          {...register("title", { required: "Title is required" })}
                          className={extractionStatus.books && bookData.title ? "border-green-300 bg-green-50" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="authors">Author(s)</Label>
                        <Input
                          id="authors"
                          value={bookData.authors}
                          onChange={(e) => setBookData((prev) => ({ ...prev, authors: e.target.value }))}
                          {...register("authors")}
                          className={extractionStatus.books && bookData.authors ? "border-green-300 bg-green-50" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="isbn">ISBN (Without -)</Label>
                        <Input
                          id="isbn"
                          placeholder="Enter ISBN without dashes"
                          value={bookData.isbn}
                          onChange={(e) => setBookData((prev) => ({ ...prev, isbn: e.target.value }))}
                          {...register("isbn")}
                          className={extractionStatus.books && bookData.isbn ? "border-green-300 bg-green-50" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publisherName">Publisher Name</Label>
                        <Input
                          id="publisherName"
                          value={bookData.publisherName}
                          onChange={(e) => setBookData((prev) => ({ ...prev, publisherName: e.target.value }))}
                          {...register("publisherName")}
                          className={
                            extractionStatus.books && bookData.publisherName ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="publishingLevel">Publishing Level</Label>
                        <Select
                          value={bookData.publishingLevel}
                          onValueChange={(value) => setBookData((prev) => ({ ...prev, publishingLevel: value }))}
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.books && bookData.publishingLevel ? "border-green-300 bg-green-50" : ""
                            }
                          >
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
                          <SelectTrigger
                            className={
                              extractionStatus.books && bookData.bookType ? "border-green-300 bg-green-50" : ""
                            }
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Textbook">Textbook</SelectItem>
                            <SelectItem value="Reference Book">Reference Book</SelectItem>
                            <SelectItem value="Research Monograph">Research Monograph</SelectItem>
                            <SelectItem value="Popular Science">Popular Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edition">Edition</Label>
                        <Input
                          id="edition"
                          value={bookData.edition}
                          onChange={(e) => setBookData((prev) => ({ ...prev, edition: e.target.value }))}
                          {...register("edition")}
                          className={extractionStatus.books && bookData.edition ? "border-green-300 bg-green-50" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="volumeNo">Volume No.</Label>
                        <Input
                          id="volumeNo"
                          value={bookData.volumeNo}
                          onChange={(e) => setBookData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                          {...register("volumeNo")}
                          className={extractionStatus.books && bookData.volumeNo ? "border-green-300 bg-green-50" : ""}
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
                          className={
                            extractionStatus.books && bookData.publicationDate ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="isEbook">EBook</Label>
                        <Select
                          value={bookData.isEbook}
                          onValueChange={(value) => setBookData((prev) => ({ ...prev, isEbook: value }))}
                        >
                          <SelectTrigger
                            className={extractionStatus.books && bookData.isEbook ? "border-green-300 bg-green-50" : ""}
                          >
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="digitalMedia">Digital Media (If any provided like Pendrive, CD/DVD)</Label>
                        <Input
                          id="digitalMedia"
                          value={bookData.digitalMedia}
                          onChange={(e) => setBookData((prev) => ({ ...prev, digitalMedia: e.target.value }))}
                          {...register("digitalMedia")}
                          className={
                            extractionStatus.books && bookData.digitalMedia ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="approxPrice">Approx. Price</Label>
                        <Input
                          id="approxPrice"
                          type="number"
                          step="0.01"
                          value={bookData.approxPrice}
                          onChange={(e) => setBookData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                          {...register("approxPrice")}
                          className={
                            extractionStatus.books && bookData.approxPrice ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={bookData.currency}
                          onValueChange={(value) => setBookData((prev) => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
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
                <DocumentUploadSection tab="magazines" file={selectedFiles.magazines} />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Complete Magazine Information
                    {extractionStatus.magazines && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
                  </Label>
                  <form onSubmit={handleSubmit(handleMagazineSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={magazineData.title}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, title: e.target.value }))}
                          {...register("title", { required: "Title is required" })}
                          className={
                            extractionStatus.magazines && magazineData.title ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="mode">Mode</Label>
                        <Select
                          value={magazineData.mode}
                          onValueChange={(value) => setMagazineData((prev) => ({ ...prev, mode: value }))}
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.magazines && magazineData.mode ? "border-green-300 bg-green-50" : ""
                            }
                          >
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Print">Print</SelectItem>
                            <SelectItem value="Digital">Digital</SelectItem>
                            <SelectItem value="Print + Digital">Print + Digital</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="publishingAgency">Publishing Agency</Label>
                        <Input
                          id="publishingAgency"
                          value={magazineData.publishingAgency}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, publishingAgency: e.target.value }))}
                          {...register("publishingAgency")}
                          className={
                            extractionStatus.magazines && magazineData.publishingAgency
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="volumeNo">Volume No.</Label>
                        <Input
                          id="volumeNo"
                          value={magazineData.volumeNo}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                          {...register("volumeNo")}
                          className={
                            extractionStatus.magazines && magazineData.volumeNo ? "border-green-300 bg-green-50" : ""
                          }
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
                          className={
                            extractionStatus.magazines && magazineData.publicationDate
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
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
                          className={
                            extractionStatus.magazines && magazineData.additionalAttachment
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="issuesPerYear">No. of Issues per Year</Label>
                        <Input
                          id="issuesPerYear"
                          type="number"
                          value={magazineData.issuesPerYear}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, issuesPerYear: e.target.value }))}
                          {...register("issuesPerYear")}
                          className={
                            extractionStatus.magazines && magazineData.issuesPerYear
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="approxPrice">Approx. Price</Label>
                        <Input
                          id="approxPrice"
                          type="number"
                          step="0.01"
                          value={magazineData.approxPrice}
                          onChange={(e) => setMagazineData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                          {...register("approxPrice")}
                          className={
                            extractionStatus.magazines && magazineData.approxPrice ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={magazineData.currency}
                          onValueChange={(value) => setMagazineData((prev) => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
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

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAdditionalAttachment"
                        checked={magazineData.isAdditionalAttachment}
                        onCheckedChange={(checked) =>
                          setMagazineData((prev) => ({ ...prev, isAdditionalAttachment: !!checked }))
                        }
                      />
                      <Label htmlFor="isAdditionalAttachment">Is Additional Attachment (USB/CD/DVD)?</Label>
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
                  Technical Report and Other(s)
                </CardTitle>
                <CardDescription>
                  Upload document first to auto-extract information, then add recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUploadSection tab="technical" file={selectedFiles.technical} />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Complete Technical Report Information
                    {extractionStatus.technical && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
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
                          className={
                            extractionStatus.technical && technicalReportData.title
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={technicalReportData.subject}
                          onChange={(e) => setTechnicalReportData((prev) => ({ ...prev, subject: e.target.value }))}
                          {...register("subject")}
                          className={
                            extractionStatus.technical && technicalReportData.subject
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
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
                          className={
                            extractionStatus.technical && technicalReportData.publisherName
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
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
                          className={
                            extractionStatus.technical && technicalReportData.publicationDate
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="issuesPerYear">No. of Issues per Year</Label>
                        <Input
                          id="issuesPerYear"
                          type="number"
                          value={technicalReportData.issuesPerYear}
                          onChange={(e) =>
                            setTechnicalReportData((prev) => ({ ...prev, issuesPerYear: e.target.value }))
                          }
                          {...register("issuesPerYear")}
                          className={
                            extractionStatus.technical && technicalReportData.issuesPerYear
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="approxPrice">Approx. Price</Label>
                        <Input
                          id="approxPrice"
                          type="number"
                          step="0.01"
                          value={technicalReportData.approxPrice}
                          onChange={(e) => setTechnicalReportData((prev) => ({ ...prev, approxPrice: e.target.value }))}
                          {...register("approxPrice")}
                          className={
                            extractionStatus.technical && technicalReportData.approxPrice
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={technicalReportData.currency}
                          onValueChange={(value) => setTechnicalReportData((prev) => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
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
  )
}
