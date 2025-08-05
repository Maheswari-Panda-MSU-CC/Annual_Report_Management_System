"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface JournalData {
  authors: string
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
  inScopus: string
  inUgcCare: string
  inClarivate: string
  inOldUgcList: string
  chargesPaid: string
}

export default function AddJournalArticlePage() {
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
  } = useForm<JournalData>()

  const initialJournalData: JournalData = {
    authors: "",
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
    peerReviewed: "",
    hIndex: "",
    impactFactor: "",
    doi: "",
    inScopus: "",
    inUgcCare: "",
    inClarivate: "",
    inOldUgcList: "",
    chargesPaid: "",
  }

  const [journalData, setJournalData] = useState<JournalData>(initialJournalData)

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
        const updatedJournalData = { ...journalData }

        Object.keys(data).forEach((key) => {
          if (key in updatedJournalData) {
            updatedJournalData[key as keyof JournalData] = data[key]
            setValue(key, data[key])
          }
        })

        setJournalData(updatedJournalData)

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
  }, [selectedFile, setValue, toast, journalData])

  const handleJournalSubmit = (data: JournalData) => {
    console.log("Journal Data:", data)
    toast({
      title: "Success",
      description: "Journal article added successfully!",
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
            <h1 className="text-3xl font-bold">Add Published Article/Paper</h1>
            <p className="text-muted-foreground">Add your published article or paper in journal/edited volume</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Published Article/Paper Details
            </CardTitle>
            <CardDescription>Upload document first to auto-extract information, then complete the form</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Document Upload Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <Label className="text-lg font-semibold mb-3 block">
                Step 1: Upload Article/Paper Document (Required for extraction)
              </Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="mb-3"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <p className="text-sm text-gray-500 mb-3">Upload article/paper document to auto-extract details</p>
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
              <Label className="text-lg font-semibold mb-4 block">Step 2: Complete Article/Paper Information</Label>
              <form onSubmit={handleSubmit(handleJournalSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="authors">Author(s) *</Label>
                    <Input
                      id="authors"
                      value={journalData.authors}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, authors: e.target.value }))}
                      {...register("authors", { required: "Authors are required" })}
                      placeholder="Enter all authors"
                    />
                    {errors.authors && <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="noOfAuthors">No. of Authors</Label>
                    <Input
                      id="noOfAuthors"
                      type="number"
                      value={journalData.noOfAuthors}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, noOfAuthors: e.target.value }))}
                      {...register("noOfAuthors")}
                      placeholder="Number of authors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorType">Author Type</Label>
                    <Select
                      value={journalData.authorType}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, authorType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select author type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Principal Author">Principal Author</SelectItem>
                        <SelectItem value="Co-Author">Co-Author</SelectItem>
                        <SelectItem value="Corresponding Author">Corresponding Author</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={journalData.type}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Journal Article">Journal Article</SelectItem>
                        <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                        <SelectItem value="Review Article">Review Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={journalData.title}
                    onChange={(e) => setJournalData((prev) => ({ ...prev, title: e.target.value }))}
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter article/paper title"
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issn">ISSN (Without -)</Label>
                    <Input
                      id="issn"
                      value={journalData.issn}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, issn: e.target.value }))}
                      {...register("issn")}
                      placeholder="Enter ISSN without dashes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="isbn">ISBN (Without -)</Label>
                    <Input
                      id="isbn"
                      value={journalData.isbn}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, isbn: e.target.value }))}
                      {...register("isbn")}
                      placeholder="Enter ISBN without dashes"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="journalBookName">Journal/Book Name *</Label>
                  <Input
                    id="journalBookName"
                    value={journalData.journalBookName}
                    onChange={(e) => setJournalData((prev) => ({ ...prev, journalBookName: e.target.value }))}
                    {...register("journalBookName", { required: "Journal/Book Name is required" })}
                    placeholder="Enter journal or book name"
                  />
                  {errors.journalBookName && (
                    <p className="text-sm text-red-500 mt-1">{errors.journalBookName.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="volumeNo">Volume No.</Label>
                    <Input
                      id="volumeNo"
                      value={journalData.volumeNo}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, volumeNo: e.target.value }))}
                      {...register("volumeNo")}
                      placeholder="Volume number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pageNo">Page No. (Range)</Label>
                    <Input
                      id="pageNo"
                      value={journalData.pageNo}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, pageNo: e.target.value }))}
                      {...register("pageNo")}
                      placeholder="e.g., 123-135"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={journalData.date}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, date: e.target.value }))}
                      {...register("date")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={journalData.level}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, level: value }))}
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
                    <Label htmlFor="peerReviewed">Peer Reviewed?</Label>
                    <Select
                      value={journalData.peerReviewed}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, peerReviewed: value }))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hIndex">H Index</Label>
                    <Input
                      id="hIndex"
                      value={journalData.hIndex}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, hIndex: e.target.value }))}
                      {...register("hIndex")}
                      placeholder="H Index value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="impactFactor">Impact Factor</Label>
                    <Input
                      id="impactFactor"
                      value={journalData.impactFactor}
                      onChange={(e) => setJournalData((prev) => ({ ...prev, impactFactor: e.target.value }))}
                      {...register("impactFactor")}
                      placeholder="Impact Factor value"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="doi">DOI</Label>
                  <Input
                    id="doi"
                    value={journalData.doi}
                    onChange={(e) => setJournalData((prev) => ({ ...prev, doi: e.target.value }))}
                    {...register("doi")}
                    placeholder="Enter DOI"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inScopus">In Scopus?</Label>
                    <Select
                      value={journalData.inScopus}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, inScopus: value }))}
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
                    <Label htmlFor="inUgcCare">In UGC CARE?</Label>
                    <Select
                      value={journalData.inUgcCare}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, inUgcCare: value }))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inClarivate">In CLARIVATE?</Label>
                    <Select
                      value={journalData.inClarivate}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, inClarivate: value }))}
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
                    <Label htmlFor="inOldUgcList">In Old UGC List?</Label>
                    <Select
                      value={journalData.inOldUgcList}
                      onValueChange={(value) => setJournalData((prev) => ({ ...prev, inOldUgcList: value }))}
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
                <div>
                  <Label htmlFor="chargesPaid">Charges Paid?</Label>
                  <Select
                    value={journalData.chargesPaid}
                    onValueChange={(value) => setJournalData((prev) => ({ ...prev, chargesPaid: value }))}
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

                <div className="flex gap-4">
                  <Button type="submit">Save Article/Paper</Button>
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
