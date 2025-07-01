"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, FileText, Award, Users, Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface PerformanceData {
  title: string
  place: string
  date: string
  nature: string
  upload?: File | null
}

interface AwardData {
  name: string
  details: string
  agency: string
  agencyAddress: string
  date: string
  level: string
  upload?: File | null
}

interface ExtensionData {
  name: string
  nature: string
  level: string
  sponsoredBy: string
  place: string
  date: string
  upload?: File | null
}

export default function AddAwardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isExtracting, setIsExtracting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PerformanceData | AwardData | ExtensionData>()

  // Form states
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    title: "",
    place: "",
    date: "",
    nature: "",
    upload: null,
  })

  const [awardData, setAwardData] = useState<AwardData>({
    name: "",
    details: "",
    agency: "",
    agencyAddress: "",
    date: "",
    level: "",
    upload: null,
  })

  const [extensionData, setExtensionData] = useState<ExtensionData>({
    name: "",
    nature: "",
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
      if (tab === "performance" && performanceData.upload) hasDocument = true
      if (tab === "awards" && awardData.upload) hasDocument = true
      if (tab === "extension" && extensionData.upload) hasDocument = true

      if (!hasDocument) {
        toast({
          title: "No Document",
          description: "Please upload a document first before extracting information.",
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

          // Update the appropriate form state based on the tab
          if (tab === "performance") {
            setPerformanceData((prev) => ({
              ...prev,
              title: data.title || prev.title,
              place: data.place || prev.place,
              date: data.date || prev.date,
              nature: data.nature || prev.nature,
            }))
          } else if (tab === "awards") {
            setAwardData((prev) => ({
              ...prev,
              name: data.name || data.awardName || prev.name,
              details: data.details || data.description || prev.details,
              agency: data.agency || data.awardingBody || data.awardingAgency || prev.agency,
              agencyAddress: data.agencyAddress || data.address || prev.agencyAddress,
              date: data.date || data.dateReceived || data.awardDate || prev.date,
              level: data.level || prev.level,
            }))
          } else if (tab === "extension") {
            setExtensionData((prev) => ({
              ...prev,
              name: data.name || data.activityName || prev.name,
              nature: data.nature || data.activityType || prev.nature,
              level: data.level || prev.level,
              sponsoredBy: data.sponsoredBy || data.sponsor || data.organizingBody || prev.sponsoredBy,
              place: data.place || data.venue || prev.place,
              date: data.date || data.activityDate || prev.date,
            }))
          }

          toast({
            title: "Success",
            description: `Form auto-filled with ${formFieldsData.extracted_fields} fields (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to extract information. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsExtracting(false)
      }
    },
    [toast, performanceData.upload, awardData.upload, extensionData.upload],
  )

  // Form handlers
  const handlePerformanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Performance Data:", performanceData)
    toast({
      title: "Success!",
      description: "Performance record added successfully.",
    })
    setPerformanceData({
      title: "",
      place: "",
      date: "",
      nature: "",
      upload: null,
    })
  }

  const handleAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Award Data:", awardData)
    toast({
      title: "Success!",
      description: "Award record added successfully.",
    })
    setAwardData({
      name: "",
      details: "",
      agency: "",
      agencyAddress: "",
      date: "",
      level: "",
      upload: null,
    })
  }

  const handleExtensionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Extension Data:", extensionData)
    toast({
      title: "Success!",
      description: "Extension activity added successfully.",
    })
    setExtensionData({
      name: "",
      nature: "",
      level: "",
      sponsoredBy: "",
      place: "",
      date: "",
      upload: null,
    })
  }

  const handleFileUpload = (file: File | null, section: string) => {
    if (section === "performance") {
      setPerformanceData({ ...performanceData, upload: file })
    } else if (section === "award") {
      setAwardData({ ...awardData, upload: file })
    } else if (section === "extension") {
      setExtensionData({ ...extensionData, upload: file })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Awards & Recognition
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Add Awards & Recognition</h1>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[600px]">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="awards" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Awards & Recognition
              </TabsTrigger>
              <TabsTrigger value="extension" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Extension Activities
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Add Performance Record
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload supporting document first to auto-extract details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section - Now first */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.bmp"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "performance")}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">PDF, JPG, JPEG, PNG, BMP files only</p>

                  {performanceData.upload && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("performance")}
                        disabled={isExtracting}
                        className="flex items-center gap-2"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Extract Information
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Verify/Complete Performance Details
                  </Label>
                  <form onSubmit={handlePerformanceSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="performanceTitle">Title of Performance *</Label>
                        <Input
                          id="performanceTitle"
                          value={performanceData.title}
                          onChange={(e) => setPerformanceData({ ...performanceData, title: e.target.value })}
                          placeholder="Enter performance title"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="performancePlace">Place *</Label>
                        <Input
                          id="performancePlace"
                          value={performanceData.place}
                          onChange={(e) => setPerformanceData({ ...performanceData, place: e.target.value })}
                          placeholder="Enter place"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="performanceDate">Performance Date *</Label>
                        <Input
                          id="performanceDate"
                          type="date"
                          value={performanceData.date}
                          onChange={(e) => setPerformanceData({ ...performanceData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nature of Performance *</Label>
                        <Select
                          value={performanceData.nature}
                          onValueChange={(value) => setPerformanceData({ ...performanceData, nature: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nature" />
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
                  Add Award/Fellowship/Recognition
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload supporting document first to auto-extract details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section - Now first */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.bmp"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "award")}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">PDF, JPG, JPEG, PNG, BMP files only</p>

                  {awardData.upload && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("awards")}
                        disabled={isExtracting}
                        className="flex items-center gap-2"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Extract Information
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Award Details</Label>
                  <form onSubmit={handleAwardSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="awardName">Name of Award/Fellowship *</Label>
                        <Input
                          id="awardName"
                          value={awardData.name}
                          onChange={(e) => setAwardData({ ...awardData, name: e.target.value })}
                          placeholder="Enter award name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="awardAgency">Name of Awarding Agency *</Label>
                        <Input
                          id="awardAgency"
                          value={awardData.agency}
                          onChange={(e) => setAwardData({ ...awardData, agency: e.target.value })}
                          placeholder="Enter awarding agency"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="awardDate">Date of Award *</Label>
                        <Input
                          id="awardDate"
                          type="date"
                          value={awardData.date}
                          onChange={(e) => setAwardData({ ...awardData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Level *</Label>
                        <Select
                          value={awardData.level}
                          onValueChange={(value) => setAwardData({ ...awardData, level: value })}
                          required
                        >
                          <SelectTrigger>
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
                      <Label htmlFor="awardDetails">Details</Label>
                      <Textarea
                        id="awardDetails"
                        value={awardData.details}
                        onChange={(e) => setAwardData({ ...awardData, details: e.target.value })}
                        placeholder="Enter award details"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agencyAddress">Address of Awarding Agency</Label>
                      <Textarea
                        id="agencyAddress"
                        value={awardData.agencyAddress}
                        onChange={(e) => setAwardData({ ...awardData, agencyAddress: e.target.value })}
                        placeholder="Enter agency address"
                        rows={2}
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
                  Add Extension Activity
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload supporting document first to auto-extract details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload Section - Now first */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.bmp"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "extension")}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">PDF, JPG, JPEG, PNG, BMP files only</p>

                  {extensionData.upload && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("extension")}
                        disabled={isExtracting}
                        className="flex items-center gap-2"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Extract Information
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Form Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">
                    Step 2: Verify/Complete Extension Activity Details
                  </Label>
                  <form onSubmit={handleExtensionSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="extensionName">Name of Activity *</Label>
                        <Input
                          id="extensionName"
                          value={extensionData.name}
                          onChange={(e) => setExtensionData({ ...extensionData, name: e.target.value })}
                          placeholder="Enter activity name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nature of Activity *</Label>
                        <Select
                          value={extensionData.nature}
                          onValueChange={(value) => setExtensionData({ ...extensionData, nature: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nature" />
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
                          <SelectTrigger>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="extensionPlace">Place *</Label>
                        <Input
                          id="extensionPlace"
                          value={extensionData.place}
                          onChange={(e) => setExtensionData({ ...extensionData, place: e.target.value })}
                          placeholder="Enter place"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="extensionDate">Date *</Label>
                        <Input
                          id="extensionDate"
                          type="date"
                          value={extensionData.date}
                          onChange={(e) => setExtensionData({ ...extensionData, date: e.target.value })}
                          required
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
    </DashboardLayout>
  )
}
