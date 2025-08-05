"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Presentation, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface PaperData {
  authors: string
  presentationLevel: string
  themeOfConference: string
  modeOfParticipation: string
  titleOfPaper: string
  organizingBody: string
  place: string
  dateOfPresentation: string
}

export default function AddConferencePaperPage() {
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
  } = useForm<PaperData>()

  const initialPaperData: PaperData = {
    authors: "",
    presentationLevel: "",
    themeOfConference: "",
    modeOfParticipation: "",
    titleOfPaper: "",
    organizingBody: "",
    place: "",
    dateOfPresentation: "",
  }

  const [paperData, setPaperData] = useState<PaperData>(initialPaperData)

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
        const updatedPaperData = { ...paperData }

        Object.keys(data).forEach((key) => {
          if (key in updatedPaperData) {
            updatedPaperData[key as keyof PaperData] = data[key]
            setValue(key, data[key])
          }
        })

        setPaperData(updatedPaperData)

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
  }, [selectedFile, setValue, toast, paperData])

  const handlePaperSubmit = (data: PaperData) => {
    console.log("Paper Data:", data)
    toast({
      title: "Success",
      description: "Paper presentation added successfully!",
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
                Step 1: Upload Supporting Document (Required for extraction)
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
              <Label className="text-lg font-semibold mb-4 block">
                Step 2: Complete Paper Presentation Information
              </Label>
              <form onSubmit={handleSubmit(handlePaperSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="authors">Author(s) *</Label>
                  <Input
                    id="authors"
                    value={paperData.authors}
                    onChange={(e) => setPaperData((prev) => ({ ...prev, authors: e.target.value }))}
                    {...register("authors", { required: "Authors are required" })}
                    placeholder="Enter all authors"
                  />
                  {errors.authors && <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="presentationLevel">Presentation Level</Label>
                    <Select
                      value={paperData.presentationLevel}
                      onValueChange={(value) => setPaperData((prev) => ({ ...prev, presentationLevel: value }))}
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
                    <Label htmlFor="modeOfParticipation">Mode of Participation</Label>
                    <Select
                      value={paperData.modeOfParticipation}
                      onValueChange={(value) => setPaperData((prev) => ({ ...prev, modeOfParticipation: value }))}
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
                    value={paperData.themeOfConference}
                    onChange={(e) => setPaperData((prev) => ({ ...prev, themeOfConference: e.target.value }))}
                    {...register("themeOfConference")}
                    placeholder="Enter conference/seminar/symposia theme"
                  />
                </div>
                <div>
                  <Label htmlFor="titleOfPaper">Title of Paper *</Label>
                  <Input
                    id="titleOfPaper"
                    value={paperData.titleOfPaper}
                    onChange={(e) => setPaperData((prev) => ({ ...prev, titleOfPaper: e.target.value }))}
                    {...register("titleOfPaper", { required: "Title of paper is required" })}
                    placeholder="Enter paper title"
                  />
                  {errors.titleOfPaper && <p className="text-sm text-red-500 mt-1">{errors.titleOfPaper.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizingBody">Organizing Body</Label>
                    <Input
                      id="organizingBody"
                      value={paperData.organizingBody}
                      onChange={(e) => setPaperData((prev) => ({ ...prev, organizingBody: e.target.value }))}
                      {...register("organizingBody")}
                      placeholder="Enter organizing body"
                    />
                  </div>
                  <div>
                    <Label htmlFor="place">Place</Label>
                    <Input
                      id="place"
                      value={paperData.place}
                      onChange={(e) => setPaperData((prev) => ({ ...prev, place: e.target.value }))}
                      {...register("place")}
                      placeholder="Enter place"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfPresentation">Date of Presentation/Seminar</Label>
                  <Input
                    id="dateOfPresentation"
                    type="date"
                    value={paperData.dateOfPresentation}
                    onChange={(e) => setPaperData((prev) => ({ ...prev, dateOfPresentation: e.target.value }))}
                    {...register("dateOfPresentation")}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Save Paper Presentation</Button>
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
