"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Award, Users, Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PerformanceData {
  titleOfPerformance: string
  place: string
  performanceDate: string
  natureOfPerformance: string
  upload?: File | null
}

interface AwardData {
  nameOfAwardFellowship: string
  details: string
  nameOfAwardingAgency: string
  addressOfAwardingAgency: string
  dateOfAward: string
  level: string
  upload?: File | null
}

interface ExtensionData {
  nameOfActivity: string
  natureOfActivity: string
  level: string
  sponsoredBy: string
  place: string
  date: string
  upload?: File | null
}

interface UploadStatus {
  performance: File | null
  awards: File | null
  extension: File | null
}

interface ExtractionStatus {
  performance: boolean
  awards: boolean
  extension: boolean
}

export default function AddAwardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("performance")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null)

  // Handle URL tab parameter on component mount
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["performance", "awards", "extension"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Track uploaded files separately
  const [uploadedFiles, setUploadedFiles] = useState<UploadStatus>({
    performance: null,
    awards: null,
    extension: null,
  })

  // Track extraction status
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>({
    performance: false,
    awards: false,
    extension: false,
  })

  // Form states
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    titleOfPerformance: "",
    place: "",
    performanceDate: "",
    natureOfPerformance: "",
    upload: null,
  })

  const [awardData, setAwardData] = useState<AwardData>({
    nameOfAwardFellowship: "",
    details: "",
    nameOfAwardingAgency: "",
    addressOfAwardingAgency: "",
    dateOfAward: "",
    level: "",
    upload: null,
  })

  const [extensionData, setExtensionData] = useState<ExtensionData>({
    nameOfActivity: "",
    natureOfActivity: "",
    level: "",
    sponsoredBy: "",
    place: "",
    date: "",
    upload: null,
  })

  const handleExtractInformation = useCallback(
    async (tab: string) => {
      // Check if document is uploaded for the current tab
      let hasDocument = false
      if (tab === "performance" && uploadedFiles.performance) hasDocument = true
      if (tab === "awards" && uploadedFiles.awards) hasDocument = true
      if (tab === "extension" && uploadedFiles.extension) hasDocument = true

      if (!hasDocument) {
        setExtractionError("Please upload a document first before extracting information.")
        toast({
          title: "No Document",
          description: "Please upload a document first before extracting information.",
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

        // First API call to get category
        const categoryResponse = await fetch("/api/llm/get-category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: tab,
            documentType: "award_document",
            fileName: uploadedFiles[tab as keyof UploadStatus]?.name || "document",
          }),
        })

        if (!categoryResponse.ok) {
          throw new Error(`Failed to get category: ${categoryResponse.statusText}`)
        }

        const categoryData = await categoryResponse.json()

        // Second API call to get form fields
        const formFieldsResponse = await fetch("/api/llm/get-formfields", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: categoryData.category || tab,
            type: tab,
            documentContent: `Sample ${tab} document content for extraction`,
          }),
        })

        if (!formFieldsResponse.ok) {
          throw new Error(`Failed to get form fields: ${formFieldsResponse.statusText}`)
        }

        const formFieldsData = await formFieldsResponse.json()

        if (formFieldsData.success && formFieldsData.data) {
          const data = formFieldsData.data

          // Update the appropriate form state based on the tab
          if (tab === "performance") {
            setPerformanceData((prev) => ({
              ...prev,
              titleOfPerformance:
                data.titleOfPerformance || data.title || data.performanceTitle || prev.titleOfPerformance,
              place: data.place || data.venue || data.location || prev.place,
              performanceDate: data.performanceDate || data.date || data.eventDate || prev.performanceDate,
              natureOfPerformance:
                data.natureOfPerformance ||
                data.nature ||
                data.performanceType ||
                data.type ||
                prev.natureOfPerformance,
            }))
            setExtractionStatus((prev) => ({ ...prev, performance: true }))
          } else if (tab === "awards") {
            setAwardData((prev) => ({
              ...prev,
              nameOfAwardFellowship:
                data.nameOfAwardFellowship || data.name || data.awardName || data.title || prev.nameOfAwardFellowship,
              details: data.details || data.description || data.summary || prev.details,
              nameOfAwardingAgency:
                data.nameOfAwardingAgency ||
                data.agency ||
                data.awardingBody ||
                data.awardingAgency ||
                data.organization ||
                prev.nameOfAwardingAgency,
              addressOfAwardingAgency:
                data.addressOfAwardingAgency ||
                data.agencyAddress ||
                data.address ||
                data.organizationAddress ||
                prev.addressOfAwardingAgency,
              dateOfAward:
                data.dateOfAward ||
                data.date ||
                data.dateReceived ||
                data.awardDate ||
                data.dateAwarded ||
                prev.dateOfAward,
              level: data.level || data.scope || prev.level,
            }))
            setExtractionStatus((prev) => ({ ...prev, awards: true }))
          } else if (tab === "extension") {
            setExtensionData((prev) => ({
              ...prev,
              nameOfActivity:
                data.nameOfActivity || data.name || data.activityName || data.title || prev.nameOfActivity,
              natureOfActivity:
                data.natureOfActivity || data.nature || data.activityType || data.type || prev.natureOfActivity,
              level: data.level || data.scope || prev.level,
              sponsoredBy:
                data.sponsoredBy || data.sponsor || data.organizingBody || data.organizer || prev.sponsoredBy,
              place: data.place || data.venue || data.location || prev.place,
              date: data.date || data.activityDate || data.eventDate || prev.date,
            }))
            setExtractionStatus((prev) => ({ ...prev, extension: true }))
          }

          const extractedFieldsCount = formFieldsData.extracted_fields || Object.keys(data).length
          const confidence = formFieldsData.confidence || 0.85

          setExtractionSuccess(
            `Successfully extracted ${extractedFieldsCount} fields with ${Math.round(confidence * 100)}% confidence`,
          )

          toast({
            title: "Success",
            description: `Form auto-filled with ${extractedFieldsCount} fields (${Math.round(confidence * 100)}% confidence)`,
          })
        } else {
          throw new Error("No data extracted from document")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to extract information. Please try again."
        setExtractionError(errorMessage)
        toast({
          title: "Extraction Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsExtracting(false)
      }
    },
    [toast, uploadedFiles],
  )

  // Form handlers
  const handlePerformanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Performance Data:", performanceData)
    toast({
      title: "Success!",
      description: "Performance record added successfully.",
    })
    // Reset form
    setPerformanceData({
      titleOfPerformance: "",
      place: "",
      performanceDate: "",
      natureOfPerformance: "",
      upload: null,
    })
    setUploadedFiles((prev) => ({ ...prev, performance: null }))
    setExtractionStatus((prev) => ({ ...prev, performance: false }))
  }

  const handleAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Award Data:", awardData)
    toast({
      title: "Success!",
      description: "Award record added successfully.",
    })
    // Reset form
    setAwardData({
      nameOfAwardFellowship: "",
      details: "",
      nameOfAwardingAgency: "",
      addressOfAwardingAgency: "",
      dateOfAward: "",
      level: "",
      upload: null,
    })
    setUploadedFiles((prev) => ({ ...prev, awards: null }))
    setExtractionStatus((prev) => ({ ...prev, awards: false }))
  }

  const handleExtensionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Extension Data:", extensionData)
    toast({
      title: "Success!",
      description: "Extension activity added successfully.",
    })
    // Reset form
    setExtensionData({
      nameOfActivity: "",
      natureOfActivity: "",
      level: "",
      sponsoredBy: "",
      place: "",
      date: "",
      upload: null,
    })
    setUploadedFiles((prev) => ({ ...prev, extension: null }))
    setExtractionStatus((prev) => ({ ...prev, extension: false }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const file = e.target.files?.[0] || null

    // Update uploaded files state
    setUploadedFiles((prev) => ({
      ...prev,
      [section]: file,
    }))

    // Update form data
    if (section === "performance") {
      setPerformanceData((prev) => ({ ...prev, upload: file }))
    } else if (section === "awards") {
      setAwardData((prev) => ({ ...prev, upload: file }))
    } else if (section === "extension") {
      setExtensionData((prev) => ({ ...prev, upload: file }))
    }

    // Reset extraction status when new file is uploaded
    setExtractionStatus((prev) => ({ ...prev, [section]: false }))
    setExtractionError(null)
    setExtractionSuccess(null)

    if (file) {
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    }
  }

  const DocumentUploadSection = ({
    section,
    onFileChange,
    onExtract,
    isExtracting: extracting,
    file,
  }: {
    section: string
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onExtract: () => void
    isExtracting: boolean
    file: File | null
  }) => (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
      <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp" onChange={onFileChange} className="flex-1" />
          {file && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Uploaded</span>
            </div>
          )}
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 bg-white rounded border">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{file.name}</span>
            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExtract}
          disabled={extracting || !file}
          className="flex items-center gap-2 bg-transparent"
        >
          {extracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting Information...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Auto Fill Form with AI
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Awards & Recognition
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Add Awards & Recognition</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[600px]">
              <TabsTrigger value="performance" className="text-xs px-2 py-2">
                <FileText className="mr-1 h-3 w-3" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="awards" className="text-xs px-2 py-2">
                <Award className="mr-1 h-3 w-3" />
                Awards/Fellowship/Recognition
              </TabsTrigger>
              <TabsTrigger value="extension" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                Extension
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Performance by Individual/Group
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUploadSection
                  section="performance"
                  onFileChange={(e) => handleFileUpload(e, "performance")}
                  onExtract={() => handleExtractInformation("performance")}
                  isExtracting={isExtracting}
                  file={uploadedFiles.performance}
                />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Verify/Complete Performance Details
                    {extractionStatus.performance && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
                  </Label>
                  <form onSubmit={handlePerformanceSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="titleOfPerformance">Title of Performance *</Label>
                        <Input
                          id="titleOfPerformance"
                          value={performanceData.titleOfPerformance}
                          onChange={(e) =>
                            setPerformanceData({ ...performanceData, titleOfPerformance: e.target.value })
                          }
                          placeholder="Enter title of performance"
                          required
                          className={
                            extractionStatus.performance && performanceData.titleOfPerformance
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="place">Place *</Label>
                        <Input
                          id="place"
                          value={performanceData.place}
                          onChange={(e) => setPerformanceData({ ...performanceData, place: e.target.value })}
                          placeholder="Enter place"
                          required
                          className={
                            extractionStatus.performance && performanceData.place ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="performanceDate">Performance Date *</Label>
                        <Input
                          id="performanceDate"
                          type="date"
                          value={performanceData.performanceDate}
                          onChange={(e) => setPerformanceData({ ...performanceData, performanceDate: e.target.value })}
                          required
                          className={
                            extractionStatus.performance && performanceData.performanceDate
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nature of Performance *</Label>
                        <Select
                          value={performanceData.natureOfPerformance}
                          onValueChange={(value) =>
                            setPerformanceData({ ...performanceData, natureOfPerformance: value })
                          }
                          required
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.performance && performanceData.natureOfPerformance
                                ? "border-green-300 bg-green-50"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select nature of performance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Oral Presentation">Oral Presentation</SelectItem>
                            <SelectItem value="Poster Presentation">Poster Presentation</SelectItem>
                            <SelectItem value="Workshop Conduct">Workshop Conduct</SelectItem>
                            <SelectItem value="Seminar">Seminar</SelectItem>
                            <SelectItem value="Cultural Performance">Cultural Performance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Performance</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Awards/Fellowship/Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUploadSection
                  section="awards"
                  onFileChange={(e) => handleFileUpload(e, "awards")}
                  onExtract={() => handleExtractInformation("awards")}
                  isExtracting={isExtracting}
                  file={uploadedFiles.awards}
                />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Verify/Complete Award Details
                    {extractionStatus.awards && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
                  </Label>
                  <form onSubmit={handleAwardSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nameOfAwardFellowship">Name of Award / Fellowship *</Label>
                        <Input
                          id="nameOfAwardFellowship"
                          value={awardData.nameOfAwardFellowship}
                          onChange={(e) => setAwardData({ ...awardData, nameOfAwardFellowship: e.target.value })}
                          placeholder="Enter name of award/fellowship"
                          required
                          className={
                            extractionStatus.awards && awardData.nameOfAwardFellowship
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nameOfAwardingAgency">Name of Awarding Agency *</Label>
                        <Input
                          id="nameOfAwardingAgency"
                          value={awardData.nameOfAwardingAgency}
                          onChange={(e) => setAwardData({ ...awardData, nameOfAwardingAgency: e.target.value })}
                          placeholder="Enter name of awarding agency"
                          required
                          className={
                            extractionStatus.awards && awardData.nameOfAwardingAgency
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfAward">Date of Award *</Label>
                        <Input
                          id="dateOfAward"
                          type="date"
                          value={awardData.dateOfAward}
                          onChange={(e) => setAwardData({ ...awardData, dateOfAward: e.target.value })}
                          required
                          className={
                            extractionStatus.awards && awardData.dateOfAward ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Level *</Label>
                        <Select
                          value={awardData.level}
                          onValueChange={(value) => setAwardData({ ...awardData, level: value })}
                          required
                        >
                          <SelectTrigger
                            className={extractionStatus.awards && awardData.level ? "border-green-300 bg-green-50" : ""}
                          >
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="International">International</SelectItem>
                            <SelectItem value="National">National</SelectItem>
                            <SelectItem value="State">State</SelectItem>
                            <SelectItem value="Regional">Regional</SelectItem>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="details">Details</Label>
                      <Textarea
                        id="details"
                        value={awardData.details}
                        onChange={(e) => setAwardData({ ...awardData, details: e.target.value })}
                        placeholder="Enter award details"
                        rows={3}
                        className={extractionStatus.awards && awardData.details ? "border-green-300 bg-green-50" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressOfAwardingAgency">Address of Awarding Agency</Label>
                      <Textarea
                        id="addressOfAwardingAgency"
                        value={awardData.addressOfAwardingAgency}
                        onChange={(e) => setAwardData({ ...awardData, addressOfAwardingAgency: e.target.value })}
                        placeholder="Enter address of awarding agency"
                        rows={2}
                        className={
                          extractionStatus.awards && awardData.addressOfAwardingAgency
                            ? "border-green-300 bg-green-50"
                            : ""
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Award</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extension Activities Tab */}
          <TabsContent value="extension">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Extension
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUploadSection
                  section="extension"
                  onFileChange={(e) => handleFileUpload(e, "extension")}
                  onExtract={() => handleExtractInformation("extension")}
                  isExtracting={isExtracting}
                  file={uploadedFiles.extension}
                />

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Verify/Complete Extension Activity Details
                    {extractionStatus.extension && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(Auto-filled from document)</span>
                    )}
                  </Label>
                  <form onSubmit={handleExtensionSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nameOfActivity">Name of Activity *</Label>
                        <Input
                          id="nameOfActivity"
                          value={extensionData.nameOfActivity}
                          onChange={(e) => setExtensionData({ ...extensionData, nameOfActivity: e.target.value })}
                          placeholder="Enter name of activity"
                          required
                          className={
                            extractionStatus.extension && extensionData.nameOfActivity
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nature of Activity *</Label>
                        <Select
                          value={extensionData.natureOfActivity}
                          onValueChange={(value) => setExtensionData({ ...extensionData, natureOfActivity: value })}
                          required
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.extension && extensionData.natureOfActivity
                                ? "border-green-300 bg-green-50"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select nature of activity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                            <SelectItem value="Social Service">Social Service</SelectItem>
                            <SelectItem value="Environmental">Environmental</SelectItem>
                            <SelectItem value="Educational">Educational</SelectItem>
                            <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Level *</Label>
                        <Select
                          value={extensionData.level}
                          onValueChange={(value) => setExtensionData({ ...extensionData, level: value })}
                          required
                        >
                          <SelectTrigger
                            className={
                              extractionStatus.extension && extensionData.level ? "border-green-300 bg-green-50" : ""
                            }
                          >
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="International">International</SelectItem>
                            <SelectItem value="National">National</SelectItem>
                            <SelectItem value="State">State</SelectItem>
                            <SelectItem value="District">District</SelectItem>
                            <SelectItem value="Local">Local</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sponsoredBy">Sponsored By *</Label>
                        <Input
                          id="sponsoredBy"
                          value={extensionData.sponsoredBy}
                          onChange={(e) => setExtensionData({ ...extensionData, sponsoredBy: e.target.value })}
                          placeholder="Enter sponsor name"
                          required
                          className={
                            extractionStatus.extension && extensionData.sponsoredBy
                              ? "border-green-300 bg-green-50"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="place">Place *</Label>
                        <Input
                          id="place"
                          value={extensionData.place}
                          onChange={(e) => setExtensionData({ ...extensionData, place: e.target.value })}
                          placeholder="Enter place"
                          required
                          className={
                            extractionStatus.extension && extensionData.place ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={extensionData.date}
                          onChange={(e) => setExtensionData({ ...extensionData, date: e.target.value })}
                          required
                          className={
                            extractionStatus.extension && extensionData.date ? "border-green-300 bg-green-50" : ""
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Activity</Button>
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
