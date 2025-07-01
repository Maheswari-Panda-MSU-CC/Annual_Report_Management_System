"use client"

import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { FileText, Book, Presentation, Upload, Plus, X, Save, ArrowLeft, Loader2, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

interface ArticleData {
  authors: string[]
  noOfAuthors: string
  authorType: string
  title: string
  type: string
  issn: string
  isbn: string
  journalBookName: string
  volumeNo: string
  pageNo: string
  date: string
  level: string
  peerReviewed: string
  hIndex: string
  impactFactor: string
  doi: string
  inScopus: boolean
  inUgcCare: boolean
  inClarivate: boolean
  inOldUgcList: boolean
  chargesPaid: boolean
}

interface BookData {
  authors: string[]
  title: string
  isbn: string
  publisherName: string
  publishingDate: string
  publishingPlace: string
  chargesPaid: boolean
  edited: boolean
  chapterCount: string
  publishingLevel: string
  bookType: string
  authorType: string
}

interface PaperData {
  authors: string[]
  presentationLevel: string
  themeOfConference: string
  modeOfParticipation: string
  titleOfPaper: string
  organizingBody: string
  place: string
  dateOfPresentation: string
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = false }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

export default function AddPublicationPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("articles")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ArticleData | BookData | PaperData>()

  const [articleData, setArticleData] = useState({
    authors: [] as string[],
    noOfAuthors: "",
    authorType: "",
    title: "",
    type: "",
    issn: "",
    isbn: "",
    journalBookName: "",
    volumeNo: "",
    pageNo: "",
    date: "",
    level: "",
    peerReviewed: false,
    hIndex: "",
    impactFactor: "",
    doi: "",
    inScopus: false,
    inUgcCare: false,
    inClarivate: false,
    inOldUgcList: false,
    chargesPaid: false,
  })

  const [bookData, setBookData] = useState({
    authors: [] as string[],
    title: "",
    isbn: "",
    publisherName: "",
    publishingDate: "",
    publishingPlace: "",
    chargesPaid: false,
    edited: false,
    chapterCount: "",
    publishingLevel: "",
    bookType: "",
    authorType: "",
  })

  const [paperData, setPaperData] = useState({
    authors: [] as string[],
    presentationLevel: "",
    themeOfConference: "",
    modeOfParticipation: "",
    titleOfPaper: "",
    organizingBody: "",
    place: "",
    dateOfPresentation: "",
  })

  const [currentAuthor, setCurrentAuthor] = useState("")

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const addAuthor = (section: string) => {
    if (currentAuthor.trim()) {
      switch (section) {
        case "articles":
          if (!articleData.authors.includes(currentAuthor.trim())) {
            setArticleData({
              ...articleData,
              authors: [...articleData.authors, currentAuthor.trim()],
              noOfAuthors: (articleData.authors.length + 1).toString(),
            })
          }
          break
        case "books":
          if (!bookData.authors.includes(currentAuthor.trim())) {
            setBookData({
              ...bookData,
              authors: [...bookData.authors, currentAuthor.trim()],
            })
          }
          break
        case "papers":
          if (!paperData.authors.includes(currentAuthor.trim())) {
            setPaperData({
              ...paperData,
              authors: [...paperData.authors, currentAuthor.trim()],
            })
          }
          break
      }
      setCurrentAuthor("")
    }
  }

  const removeAuthor = (section: string, index: number) => {
    switch (section) {
      case "articles":
        const newArticleAuthors = [...articleData.authors]
        newArticleAuthors.splice(index, 1)
        setArticleData({
          ...articleData,
          authors: newArticleAuthors,
          noOfAuthors: newArticleAuthors.length.toString(),
        })
        break
      case "books":
        const newBookAuthors = [...bookData.authors]
        newBookAuthors.splice(index, 1)
        setBookData({
          ...bookData,
          authors: newBookAuthors,
        })
        break
      case "papers":
        const newPaperAuthors = [...paperData.authors]
        newPaperAuthors.splice(index, 1)
        setPaperData({
          ...paperData,
          authors: newPaperAuthors,
        })
        break
    }
  }

  const handleAutoFill = useCallback(
    async (section: string) => {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload a document first before extracting information.",
          variant: "destructive",
        })
        return
      }

      setIsAutoFilling(true)
      try {
        // Step 1: Get category
        const categoryResponse = await fetch("/api/llm/get-category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: section }),
        })

        if (!categoryResponse.ok) {
          throw new Error("Failed to get category")
        }

        const categoryData = await categoryResponse.json()

        // Step 2: Get form fields
        const formFieldsResponse = await fetch("/api/llm/get-formfields", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: categoryData.category,
            type: section,
          }),
        })

        if (!formFieldsResponse.ok) {
          throw new Error("Failed to get form fields")
        }

        const formFieldsData = await formFieldsResponse.json()

        if (formFieldsData.success && formFieldsData.data) {
          const data = formFieldsData.data
          let fieldsPopulated = 0

          // Update the appropriate section data based on active tab
          switch (section) {
            case "articles":
              const updatedArticleData = { ...articleData }

              // Map API response to article form fields
              if (data.title) {
                updatedArticleData.title = data.title
                fieldsPopulated++
              }
              if (data.authors) {
                const authorsArray = Array.isArray(data.authors) ? data.authors : data.authors.split(", ")
                updatedArticleData.authors = authorsArray
                updatedArticleData.noOfAuthors = authorsArray.length.toString()
                fieldsPopulated += 2
              }
              if (data.journal || data.journalBookName) {
                updatedArticleData.journalBookName = data.journal || data.journalBookName
                fieldsPopulated++
              }
              if (data.year || data.date) {
                updatedArticleData.date = data.year || data.date
                fieldsPopulated++
              }
              if (data.volume || data.volumeNo) {
                updatedArticleData.volumeNo = data.volume || data.volumeNo
                fieldsPopulated++
              }
              if (data.pages || data.pageNo) {
                updatedArticleData.pageNo = data.pages || data.pageNo
                fieldsPopulated++
              }
              if (data.doi) {
                updatedArticleData.doi = data.doi
                fieldsPopulated++
              }
              if (data.issn) {
                updatedArticleData.issn = data.issn
                fieldsPopulated++
              }
              if (data.isbn) {
                updatedArticleData.isbn = data.isbn
                fieldsPopulated++
              }
              if (data.impactFactor) {
                updatedArticleData.impactFactor = data.impactFactor
                fieldsPopulated++
              }
              if (data.level) {
                updatedArticleData.level = data.level
                fieldsPopulated++
              }
              if (data.type || data.publicationType) {
                updatedArticleData.type = data.type || data.publicationType
                fieldsPopulated++
              }
              if (data.authorType) {
                updatedArticleData.authorType = data.authorType
                fieldsPopulated++
              }

              setArticleData(updatedArticleData)
              break

            case "books":
              const updatedBookData = { ...bookData }

              if (data.title) {
                updatedBookData.title = data.title
                fieldsPopulated++
              }
              if (data.authors) {
                const authorsArray = Array.isArray(data.authors) ? data.authors : data.authors.split(", ")
                updatedBookData.authors = authorsArray
                fieldsPopulated++
              }
              if (data.isbn) {
                updatedBookData.isbn = data.isbn
                fieldsPopulated++
              }
              if (data.publisherName || data.publisher) {
                updatedBookData.publisherName = data.publisherName || data.publisher
                fieldsPopulated++
              }
              if (data.publishingDate || data.date) {
                updatedBookData.publishingDate = data.publishingDate || data.date
                fieldsPopulated++
              }
              if (data.publishingPlace || data.place) {
                updatedBookData.publishingPlace = data.publishingPlace || data.place
                fieldsPopulated++
              }
              if (data.chapterCount) {
                updatedBookData.chapterCount = data.chapterCount.toString()
                fieldsPopulated++
              }
              if (data.publishingLevel || data.level) {
                updatedBookData.publishingLevel = data.publishingLevel || data.level
                fieldsPopulated++
              }
              if (data.bookType || data.type) {
                updatedBookData.bookType = data.bookType || data.type
                fieldsPopulated++
              }
              if (data.authorType) {
                updatedBookData.authorType = data.authorType
                fieldsPopulated++
              }

              setBookData(updatedBookData)
              break

            case "papers":
              const updatedPaperData = { ...paperData }

              if (data.titleOfPaper || data.title) {
                updatedPaperData.titleOfPaper = data.titleOfPaper || data.title
                fieldsPopulated++
              }
              if (data.authors) {
                const authorsArray = Array.isArray(data.authors) ? data.authors : data.authors.split(", ")
                updatedPaperData.authors = authorsArray
                fieldsPopulated++
              }
              if (data.presentationLevel || data.level) {
                updatedPaperData.presentationLevel = data.presentationLevel || data.level
                fieldsPopulated++
              }
              if (data.themeOfConference || data.theme) {
                updatedPaperData.themeOfConference = data.themeOfConference || data.theme
                fieldsPopulated++
              }
              if (data.modeOfParticipation || data.mode) {
                updatedPaperData.modeOfParticipation = data.modeOfParticipation || data.mode
                fieldsPopulated++
              }
              if (data.organizingBody || data.organizer) {
                updatedPaperData.organizingBody = data.organizingBody || data.organizer
                fieldsPopulated++
              }
              if (data.place || data.venue) {
                updatedPaperData.place = data.place || data.venue
                fieldsPopulated++
              }
              if (data.dateOfPresentation || data.date) {
                updatedPaperData.dateOfPresentation = data.dateOfPresentation || data.date
                fieldsPopulated++
              }

              setPaperData(updatedPaperData)
              break
          }

          toast({
            title: "Success",
            description: `Form auto-filled successfully! ${fieldsPopulated} fields populated with ${Math.round(formFieldsData.confidence * 100)}% confidence.`,
          })
        } else {
          throw new Error("No data received from extraction service")
        }
      } catch (error) {
        console.error("Auto-fill error:", error)
        toast({
          title: "Error",
          description: "Failed to auto-fill form. Please try again or fill manually.",
          variant: "destructive",
        })
      } finally {
        setIsAutoFilling(false)
      }
    },
    [selectedFiles, articleData, bookData, paperData],
  )

  const handleSubmitForm = async (section: string) => {
    let dataToSubmit: any = {}

    switch (section) {
      case "articles":
        if (articleData.authors.length === 0) {
          toast({
            title: "Error",
            description: "At least one author is required.",
            variant: "destructive",
          })
          return
        }
        dataToSubmit = {
          ...articleData,
          supportingDocument: selectedFiles ? Array.from(selectedFiles).map((f) => f.name) : [],
        }
        break
      case "books":
        if (bookData.authors.length === 0) {
          toast({
            title: "Error",
            description: "At least one author is required.",
            variant: "destructive",
          })
          return
        }
        dataToSubmit = {
          ...bookData,
          supportingDocument: selectedFiles ? Array.from(selectedFiles).map((f) => f.name) : [],
        }
        break
      case "papers":
        if (paperData.authors.length === 0) {
          toast({
            title: "Error",
            description: "At least one author is required.",
            variant: "destructive",
          })
          return
        }
        dataToSubmit = {
          ...paperData,
          supportingDocument: selectedFiles ? Array.from(selectedFiles).map((f) => f.name) : [],
        }
        break
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(`${section} data:`, dataToSubmit)

      toast({
        title: "Success",
        description: `${section === "articles" ? "Article" : section === "books" ? "Book" : "Paper"} added successfully!`,
      })

      // Reset form
      setSelectedFiles(null)
      if (section === "articles") {
        setArticleData({
          authors: [],
          noOfAuthors: "",
          authorType: "",
          title: "",
          type: "",
          issn: "",
          isbn: "",
          journalBookName: "",
          volumeNo: "",
          pageNo: "",
          date: "",
          level: "",
          peerReviewed: false,
          hIndex: "",
          impactFactor: "",
          doi: "",
          inScopus: false,
          inUgcCare: false,
          inClarivate: false,
          inOldUgcList: false,
          chargesPaid: false,
        })
      } else if (section === "books") {
        setBookData({
          authors: [],
          title: "",
          isbn: "",
          publisherName: "",
          publishingDate: "",
          publishingPlace: "",
          chargesPaid: false,
          edited: false,
          chapterCount: "",
          publishingLevel: "",
          bookType: "",
          authorType: "",
        })
      } else {
        setPaperData({
          authors: [],
          presentationLevel: "",
          themeOfConference: "",
          modeOfParticipation: "",
          titleOfPaper: "",
          organizingBody: "",
          place: "",
          dateOfPresentation: "",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add publication. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Publication</h1>
            <p className="text-muted-foreground">Add your research publications, books, and conference papers</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Articles/Papers
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Books/Chapters
            </TabsTrigger>
            <TabsTrigger value="papers" className="flex items-center gap-2">
              <Presentation className="h-4 w-4" />
              Papers Presented
            </TabsTrigger>
          </TabsList>

          {/* Articles/Papers in Journals Tab */}
          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Published Articles/Papers in Journals/Edited Volumes
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first, then extract information automatically or fill manually
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Upload Section - Now at top */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFill("articles")}
                        disabled={isLoading || isAutoFilling}
                        className="flex items-center gap-2"
                      >
                        {isAutoFilling ? (
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
                  )}
                </div>

                {/* Form Fields Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Information</Label>

                  {/* Rest of the existing form fields go here */}
                  {/* Authors Section */}
                  <div className="space-y-2">
                    <Label>Author(s)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {articleData.authors.map((author, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                          {author}
                          <button
                            type="button"
                            onClick={() => removeAuthor("articles", index)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add author name"
                        value={currentAuthor}
                        onChange={(e) => setCurrentAuthor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addAuthor("articles")
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={() => addAuthor("articles")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="noOfAuthors">No. of Authors</Label>
                      <Input
                        id="noOfAuthors"
                        type="number"
                        value={articleData.noOfAuthors}
                        onChange={(e) => setArticleData({ ...articleData, noOfAuthors: e.target.value })}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="authorType">Author Type</Label>
                      <Select
                        value={articleData.authorType}
                        onValueChange={(value) => setArticleData({ ...articleData, authorType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select author type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First Author">First Author</SelectItem>
                          <SelectItem value="Co-Author">Co-Author</SelectItem>
                          <SelectItem value="Corresponding Author">Corresponding Author</SelectItem>
                          <SelectItem value="Last Author">Last Author</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={articleData.type}
                        onValueChange={(value) => setArticleData({ ...articleData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Journal Article">Journal Article</SelectItem>
                          <SelectItem value="Edited Volume">Edited Volume</SelectItem>
                          <SelectItem value="Review Article">Review Article</SelectItem>
                          <SelectItem value="Research Paper">Research Paper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter article/paper title"
                      value={articleData.title}
                      onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issn">ISSN (Without -)</Label>
                      <Input
                        id="issn"
                        placeholder="Enter ISSN without dashes"
                        value={articleData.issn}
                        onChange={(e) => setArticleData({ ...articleData, issn: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN (Without -)</Label>
                      <Input
                        id="isbn"
                        placeholder="Enter ISBN without dashes"
                        value={articleData.isbn}
                        onChange={(e) => setArticleData({ ...articleData, isbn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="journalBookName">Journal/Book Name</Label>
                    <Input
                      id="journalBookName"
                      placeholder="Enter journal or book name"
                      value={articleData.journalBookName}
                      onChange={(e) => setArticleData({ ...articleData, journalBookName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="volumeNo">Volume No.</Label>
                      <Input
                        id="volumeNo"
                        placeholder="Enter volume number"
                        value={articleData.volumeNo}
                        onChange={(e) => setArticleData({ ...articleData, volumeNo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pageNo">Page No. (Range)</Label>
                      <Input
                        id="pageNo"
                        placeholder="e.g., 123-145"
                        value={articleData.pageNo}
                        onChange={(e) => setArticleData({ ...articleData, pageNo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={articleData.date}
                        onChange={(e) => setArticleData({ ...articleData, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="level">Level</Label>
                      <Select
                        value={articleData.level}
                        onValueChange={(value) => setArticleData({ ...articleData, level: value })}
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
                      <Label htmlFor="hIndex">H Index</Label>
                      <Input
                        id="hIndex"
                        type="number"
                        step="0.01"
                        placeholder="Enter H Index"
                        value={articleData.hIndex}
                        onChange={(e) => setArticleData({ ...articleData, hIndex: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="impactFactor">Impact Factor</Label>
                      <Input
                        id="impactFactor"
                        type="number"
                        step="0.01"
                        placeholder="Enter Impact Factor"
                        value={articleData.impactFactor}
                        onChange={(e) => setArticleData({ ...articleData, impactFactor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="doi">DOI</Label>
                    <Input
                      id="doi"
                      placeholder="Enter DOI"
                      value={articleData.doi}
                      onChange={(e) => setArticleData({ ...articleData, doi: e.target.value })}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <Label>Indexing and Status</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="peerReviewed"
                          checked={articleData.peerReviewed}
                          onCheckedChange={(checked) => setArticleData({ ...articleData, peerReviewed: !!checked })}
                        />
                        <Label htmlFor="peerReviewed">Peer Reviewed?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inScopus"
                          checked={articleData.inScopus}
                          onCheckedChange={(checked) => setArticleData({ ...articleData, inScopus: !!checked })}
                        />
                        <Label htmlFor="inScopus">In Scopus?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inUgcCare"
                          checked={articleData.inUgcCare}
                          onCheckedChange={(checked) => setArticleData({ ...articleData, inUgcCare: !!checked })}
                        />
                        <Label htmlFor="inUgcCare">In UGC CARE?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inClarivate"
                          checked={articleData.inClarivate}
                          onCheckedChange={(checked) => setArticleData({ ...articleData, inClarivate: !!checked })}
                        />
                        <Label htmlFor="inClarivate">In CLARIVATE?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inOldUgcList"
                          checked={articleData.inOldUgcList}
                          onCheckedChange={(checked) => setArticleData({ ...articleData, inOldUgcList: !!checked })}
                        />
                        <Label htmlFor="inOldUgcList">In Old UGC List?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="chargesPaid"
                          checked={articleData.chargesPaid}
                          onCheckedChange={(checked) => setArticleData({ ...articleData, chargesPaid: !!checked })}
                        />
                        <Label htmlFor="chargesPaid">Charges Paid?</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSubmitForm("articles")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Article/Paper
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books/Book Chapters Tab */}
          <TabsContent value="books">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Books/Book Chapter(s) Published
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first, then extract information automatically or fill manually
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Upload Section - Now at top */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFill("books")}
                        disabled={isLoading || isAutoFilling}
                        className="flex items-center gap-2"
                      >
                        {isAutoFilling ? (
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
                  )}
                </div>

                {/* Form Fields Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Information</Label>

                  {/* Authors Section */}
                  <div className="space-y-2">
                    <Label>Authors</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {bookData.authors.map((author, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                          {author}
                          <button
                            type="button"
                            onClick={() => removeAuthor("books", index)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add author name"
                        value={currentAuthor}
                        onChange={(e) => setCurrentAuthor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addAuthor("books")
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={() => addAuthor("books")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bookTitle">Title</Label>
                    <Input
                      id="bookTitle"
                      placeholder="Enter book/chapter title"
                      value={bookData.title}
                      onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookIsbn">ISBN (Without -)</Label>
                      <Input
                        id="bookIsbn"
                        placeholder="Enter ISBN without dashes"
                        value={bookData.isbn}
                        onChange={(e) => setBookData({ ...bookData, isbn: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="publisherName">Publisher Name</Label>
                      <Input
                        id="publisherName"
                        placeholder="Enter publisher name"
                        value={bookData.publisherName}
                        onChange={(e) => setBookData({ ...bookData, publisherName: e.target.value })}
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
                        onChange={(e) => setBookData({ ...bookData, publishingDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="publishingPlace">Publishing Place</Label>
                      <Input
                        id="publishingPlace"
                        placeholder="Enter publishing place"
                        value={bookData.publishingPlace}
                        onChange={(e) => setBookData({ ...bookData, publishingPlace: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="chapterCount">Chapter Count</Label>
                      <Input
                        id="chapterCount"
                        type="number"
                        placeholder="Enter chapter count"
                        value={bookData.chapterCount}
                        onChange={(e) => setBookData({ ...bookData, chapterCount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="publishingLevel">Publishing Level</Label>
                      <Select
                        value={bookData.publishingLevel}
                        onValueChange={(value) => setBookData({ ...bookData, publishingLevel: value })}
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
                        onValueChange={(value) => setBookData({ ...bookData, bookType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select book type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Textbook">Textbook</SelectItem>
                          <SelectItem value="Reference Book">Reference Book</SelectItem>
                          <SelectItem value="Monograph">Monograph</SelectItem>
                          <SelectItem value="Edited Book">Edited Book</SelectItem>
                          <SelectItem value="Chapter">Chapter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bookAuthorType">Author Type</Label>
                    <Select
                      value={bookData.authorType}
                      onValueChange={(value) => setBookData({ ...bookData, authorType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select author type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Author">Author</SelectItem>
                        <SelectItem value="Co-Author">Co-Author</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Co-Editor">Co-Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <Label>Additional Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bookChargesPaid"
                          checked={bookData.chargesPaid}
                          onCheckedChange={(checked) => setBookData({ ...bookData, chargesPaid: !!checked })}
                        />
                        <Label htmlFor="bookChargesPaid">Charges Paid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edited"
                          checked={bookData.edited}
                          onCheckedChange={(checked) => setBookData({ ...bookData, edited: !!checked })}
                        />
                        <Label htmlFor="edited">Edited</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSubmitForm("books")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Book/Chapter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Papers Presented Tab */}
          <TabsContent value="papers">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  Papers Presented
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first, then extract information automatically or fill manually
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Upload Section - Now at top */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFill("papers")}
                        disabled={isLoading || isAutoFilling}
                        className="flex items-center gap-2"
                      >
                        {isAutoFilling ? (
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
                  )}
                </div>

                {/* Form Fields Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Information</Label>

                  {/* Authors Section */}
                  <div className="space-y-2">
                    <Label>Authors</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {paperData.authors.map((author, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                          {author}
                          <button
                            type="button"
                            onClick={() => removeAuthor("papers", index)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add author name"
                        value={currentAuthor}
                        onChange={(e) => setCurrentAuthor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addAuthor("papers")
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={() => addAuthor("papers")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="presentationLevel">Presentation Level</Label>
                      <Select
                        value={paperData.presentationLevel}
                        onValueChange={(value) => setPaperData({ ...paperData, presentationLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select presentation level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="International">International</SelectItem>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="Regional">Regional</SelectItem>
                          <SelectItem value="State">State</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="modeOfParticipation">Mode of Participation</Label>
                      <Select
                        value={paperData.modeOfParticipation}
                        onValueChange={(value) => setPaperData({ ...paperData, modeOfParticipation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physical">Physical</SelectItem>
                          <SelectItem value="Virtual">Virtual</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="themeOfConference">Theme Of Conference/Seminar/Symposia</Label>
                    <Input
                      id="themeOfConference"
                      placeholder="Enter conference/seminar theme"
                      value={paperData.themeOfConference}
                      onChange={(e) => setPaperData({ ...paperData, themeOfConference: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="titleOfPaper">Title of Paper</Label>
                    <Input
                      id="titleOfPaper"
                      placeholder="Enter paper title"
                      value={paperData.titleOfPaper}
                      onChange={(e) => setPaperData({ ...paperData, titleOfPaper: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organizingBody">Organizing Body</Label>
                      <Input
                        id="organizingBody"
                        placeholder="Enter organizing body"
                        value={paperData.organizingBody}
                        onChange={(e) => setPaperData({ ...paperData, organizingBody: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="place">Place</Label>
                      <Input
                        id="place"
                        placeholder="Enter place"
                        value={paperData.place}
                        onChange={(e) => setPaperData({ ...paperData, place: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOfPresentation">Date of Presentation/Seminar</Label>
                    <Input
                      id="dateOfPresentation"
                      type="date"
                      value={paperData.dateOfPresentation}
                      onChange={(e) => setPaperData({ ...paperData, dateOfPresentation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSubmitForm("papers")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Paper Presentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
