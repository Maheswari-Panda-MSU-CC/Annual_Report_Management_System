"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, Users, Building, Presentation, Brain, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface RefresherForm {
  name: string
  courseType: string
  startDate: string
  endDate: string
  organizingUniversity: string
  organizingInstitute: string
  organizingDepartment: string
  centre: string
  supportingDocument: string
}

interface ContributionForm {
  name: string
  programme: string
  place: string
  date: string
  year: string
  participatedAs: string
  supportingDocument: string
}

interface AcademicBodyForm {
  courseTitle: string
  academicBody: string
  place: string
  participatedAs: string
  year: string
  supportingDocument: string
}

interface CommitteeForm {
  name: string
  committeeName: string
  level: string
  participatedAs: string
  year: string
  supportingDocument: string
}

interface TalksForm {
  name: string
  programme: string
  place: string
  talkDate: string
  titleOfEvent: string
  participatedAs: string
  supportingDocument: string
}

export default function AddEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("refresher")
  const [isExtracting, setIsExtracting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RefresherForm | ContributionForm | AcademicBodyForm | CommitteeForm | TalksForm>()

  // Form states
  const [refresherForm, setRefresherForm] = useState({
    name: "",
    courseType: "",
    startDate: "",
    endDate: "",
    organizingUniversity: "",
    organizingInstitute: "",
    organizingDepartment: "",
    centre: "",
    supportingDocument: "",
  })

  const [contributionForm, setContributionForm] = useState({
    name: "",
    programme: "",
    place: "",
    date: "",
    year: "",
    participatedAs: "",
    supportingDocument: "",
  })

  const [academicBodyForm, setAcademicBodyForm] = useState({
    courseTitle: "",
    academicBody: "",
    place: "",
    participatedAs: "",
    year: "",
    supportingDocument: "",
  })

  const [committeeForm, setCommitteeForm] = useState({
    name: "",
    committeeName: "",
    level: "",
    participatedAs: "",
    year: "",
    supportingDocument: "",
  })

  const [talksForm, setTalksForm] = useState({
    name: "",
    programme: "",
    place: "",
    talkDate: "",
    titleOfEvent: "",
    participatedAs: "",
    supportingDocument: "",
  })

  // Handle form changes
  const handleRefresherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRefresherForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContributionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContributionForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAcademicBodyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAcademicBodyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCommitteeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCommitteeForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTalksChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTalksForm((prev) => ({ ...prev, [name]: value }))
  }

  // File upload handlers
  const handleRefresherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRefresherForm((prev) => ({ ...prev, supportingDocument: e.target.files![0].name }))
    }
  }

  const handleContributionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContributionForm((prev) => ({ ...prev, supportingDocument: e.target.files![0].name }))
    }
  }

  const handleAcademicBodyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAcademicBodyForm((prev) => ({ ...prev, supportingDocument: e.target.files![0].name }))
    }
  }

  const handleCommitteeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCommitteeForm((prev) => ({ ...prev, supportingDocument: e.target.files![0].name }))
    }
  }

  const handleTalksFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTalksForm((prev) => ({ ...prev, supportingDocument: e.target.files![0].name }))
    }
  }

  const handleExtractInformation = useCallback(
    async (tab: string) => {
      // Check if document is uploaded for the current tab
      let hasDocument = false
      switch (tab) {
        case "refresher":
          hasDocument = !!refresherForm.supportingDocument
          break
        case "contribution":
          hasDocument = !!contributionForm.supportingDocument
          break
        case "academic-body":
          hasDocument = !!academicBodyForm.supportingDocument
          break
        case "committee":
          hasDocument = !!committeeForm.supportingDocument
          break
        case "talks":
          hasDocument = !!talksForm.supportingDocument
          break
      }

      if (!hasDocument) {
        toast({
          title: "Document Required",
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
          let populatedFields = 0

          // Update the appropriate form state based on the active tab
          switch (tab) {
            case "refresher":
              setRefresherForm((prev) => {
                const updated = { ...prev }
                Object.keys(data).forEach((key) => {
                  if (key in updated && key !== "supportingDocument") {
                    updated[key as keyof typeof updated] = data[key]
                    populatedFields++
                  }
                })
                return updated
              })
              break
            case "contribution":
              setContributionForm((prev) => {
                const updated = { ...prev }
                Object.keys(data).forEach((key) => {
                  if (key in updated && key !== "supportingDocument") {
                    updated[key as keyof typeof updated] = data[key]
                    populatedFields++
                  }
                })
                return updated
              })
              break
            case "academic-body":
              setAcademicBodyForm((prev) => {
                const updated = { ...prev }
                Object.keys(data).forEach((key) => {
                  if (key in updated && key !== "supportingDocument") {
                    updated[key as keyof typeof updated] = data[key]
                    populatedFields++
                  }
                })
                return updated
              })
              break
            case "committee":
              setCommitteeForm((prev) => {
                const updated = { ...prev }
                Object.keys(data).forEach((key) => {
                  if (key in updated && key !== "supportingDocument") {
                    updated[key as keyof typeof updated] = data[key]
                    populatedFields++
                  }
                })
                return updated
              })
              break
            case "talks":
              setTalksForm((prev) => {
                const updated = { ...prev }
                Object.keys(data).forEach((key) => {
                  if (key in updated && key !== "supportingDocument") {
                    updated[key as keyof typeof updated] = data[key]
                    populatedFields++
                  }
                })
                return updated
              })
              break
          }

          toast({
            title: "Extraction Successful",
            description: `Form auto-filled with ${populatedFields} fields (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
          })
        }
      } catch (error) {
        console.error("Extraction error:", error)
        toast({
          title: "Extraction Failed",
          description: "Failed to extract information from document. Please fill the form manually.",
          variant: "destructive",
        })
      } finally {
        setIsExtracting(false)
      }
    },
    [toast, refresherForm, contributionForm, academicBodyForm, committeeForm, talksForm],
  )

  // Submit handlers
  const handleRefresherSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Refresher Course Data:", refresherForm)
    toast({
      title: "Success",
      description: "Refresher/Orientation Course added successfully!",
    })
    // Reset form
    setRefresherForm({
      name: "",
      courseType: "",
      startDate: "",
      endDate: "",
      organizingUniversity: "",
      organizingInstitute: "",
      organizingDepartment: "",
      centre: "",
      supportingDocument: "",
    })
  }

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contribution Data:", contributionForm)
    toast({
      title: "Success",
      description: "Academic Program Contribution added successfully!",
    })
    // Reset form
    setContributionForm({
      name: "",
      programme: "",
      place: "",
      date: "",
      year: "",
      participatedAs: "",
      supportingDocument: "",
    })
  }

  const handleAcademicBodySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Academic Body Data:", academicBodyForm)
    toast({
      title: "Success",
      description: "Academic Body Participation added successfully!",
    })
    // Reset form
    setAcademicBodyForm({
      courseTitle: "",
      academicBody: "",
      place: "",
      participatedAs: "",
      year: "",
      supportingDocument: "",
    })
  }

  const handleCommitteeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Committee Data:", committeeForm)
    toast({
      title: "Success",
      description: "University Committee Participation added successfully!",
    })
    // Reset form
    setCommitteeForm({
      name: "",
      committeeName: "",
      level: "",
      participatedAs: "",
      year: "",
      supportingDocument: "",
    })
  }

  const handleTalksSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Talks Data:", talksForm)
    toast({
      title: "Success",
      description: "Academic/Research Talk added successfully!",
    })
    // Reset form
    setTalksForm({
      name: "",
      programme: "",
      place: "",
      talkDate: "",
      titleOfEvent: "",
      participatedAs: "",
      supportingDocument: "",
    })
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events & Activities
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add Event/Talk</h1>
        </div>

        <Tabs defaultValue="refresher" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[800px] grid-cols-5 h-auto p-1">
              <TabsTrigger value="refresher" className="text-xs px-2 py-2">
                <FileText className="mr-1 h-3 w-3" />
                Refresher/Orientation
              </TabsTrigger>
              <TabsTrigger value="contribution" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                Academic Programs
              </TabsTrigger>
              <TabsTrigger value="academic-body" className="text-xs px-2 py-2">
                <Building className="mr-1 h-3 w-3" />
                Academic Bodies
              </TabsTrigger>
              <TabsTrigger value="committee" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                University Committees
              </TabsTrigger>
              <TabsTrigger value="talks" className="text-xs px-2 py-2">
                <Presentation className="mr-1 h-3 w-3" />
                Academic Talks
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Refresher/Orientation Course Tab */}
          <TabsContent value="refresher" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Refresher/Orientation Course
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first to auto-extract information, then verify details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload First */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleRefresherFileChange}
                    className="mb-3"
                  />
                  {refresherForm.supportingDocument && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ {refresherForm.supportingDocument}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("refresher")}
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
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Course Details</Label>
                  <form onSubmit={handleRefresherSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={refresherForm.name}
                          onChange={handleRefresherChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseType">Course Type</Label>
                        <Select
                          name="courseType"
                          value={refresherForm.courseType}
                          onValueChange={(value) => setRefresherForm((prev) => ({ ...prev, courseType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Refresher Course">Refresher Course</SelectItem>
                            <SelectItem value="Orientation Course">Orientation Course</SelectItem>
                            <SelectItem value="Faculty Development Program">Faculty Development Program</SelectItem>
                            <SelectItem value="Short Term Course">Short Term Course</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={refresherForm.startDate}
                          onChange={handleRefresherChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={refresherForm.endDate}
                          onChange={handleRefresherChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizingUniversity">Organizing University</Label>
                        <Input
                          id="organizingUniversity"
                          name="organizingUniversity"
                          value={refresherForm.organizingUniversity}
                          onChange={handleRefresherChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizingInstitute">Organizing Institute</Label>
                        <Input
                          id="organizingInstitute"
                          name="organizingInstitute"
                          value={refresherForm.organizingInstitute}
                          onChange={handleRefresherChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizingDepartment">Organizing Department</Label>
                        <Input
                          id="organizingDepartment"
                          name="organizingDepartment"
                          value={refresherForm.organizingDepartment}
                          onChange={handleRefresherChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="centre">Centre</Label>
                        <Input
                          id="centre"
                          name="centre"
                          value={refresherForm.centre}
                          onChange={handleRefresherChange}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Refresher/Orientation Course</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contribution in Organizing Academic Programs Tab */}
          <TabsContent value="contribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contribution in Organizing Academic Programs
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first to auto-extract information, then verify details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload First */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleContributionFileChange}
                    className="mb-3"
                  />
                  {contributionForm.supportingDocument && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ {contributionForm.supportingDocument}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("contribution")}
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
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Course Details</Label>
                  <form onSubmit={handleContributionSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contributionName">Name</Label>
                        <Input
                          id="contributionName"
                          name="name"
                          value={contributionForm.name}
                          onChange={handleContributionChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="programme">Programme</Label>
                        <Select
                          name="programme"
                          value={contributionForm.programme}
                          onValueChange={(value) => setContributionForm((prev) => ({ ...prev, programme: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select programme type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conference">Conference</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Seminar">Seminar</SelectItem>
                            <SelectItem value="Symposium">Symposium</SelectItem>
                            <SelectItem value="Training Program">Training Program</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contributionPlace">Place</Label>
                        <Input
                          id="contributionPlace"
                          name="place"
                          value={contributionForm.place}
                          onChange={handleContributionChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contributionDate">Date</Label>
                        <Input
                          id="contributionDate"
                          name="date"
                          type="date"
                          value={contributionForm.date}
                          onChange={handleContributionChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contributionYear">Year</Label>
                        <Input
                          id="contributionYear"
                          name="year"
                          type="number"
                          min="1900"
                          max="2100"
                          value={contributionForm.year}
                          onChange={handleContributionChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contributionParticipatedAs">Participated As</Label>
                        <Select
                          name="participatedAs"
                          value={contributionForm.participatedAs}
                          onValueChange={(value) => setContributionForm((prev) => ({ ...prev, participatedAs: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Organizer">Organizer</SelectItem>
                            <SelectItem value="Co-organizer">Co-organizer</SelectItem>
                            <SelectItem value="Coordinator">Coordinator</SelectItem>
                            <SelectItem value="Convener">Convener</SelectItem>
                            <SelectItem value="Committee Member">Committee Member</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Academic Program Contribution</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participation in Academic Bodies Tab */}
          <TabsContent value="academic-body" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Participation in Academic Bodies of Other Universities
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first to auto-extract information, then verify details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload First */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAcademicBodyFileChange}
                    className="mb-3"
                  />
                  {academicBodyForm.supportingDocument && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ {academicBodyForm.supportingDocument}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("academic-body")}
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
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Course Details</Label>
                  <form onSubmit={handleAcademicBodySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseTitle">Course Title</Label>
                        <Input
                          id="courseTitle"
                          name="courseTitle"
                          value={academicBodyForm.courseTitle}
                          onChange={handleAcademicBodyChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="academicBody">Academic Body</Label>
                        <Input
                          id="academicBody"
                          name="academicBody"
                          value={academicBodyForm.academicBody}
                          onChange={handleAcademicBodyChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="academicPlace">Place</Label>
                        <Input
                          id="academicPlace"
                          name="place"
                          value={academicBodyForm.place}
                          onChange={handleAcademicBodyChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="academicParticipatedAs">Participated As</Label>
                        <Select
                          name="participatedAs"
                          value={academicBodyForm.participatedAs}
                          onValueChange={(value) => setAcademicBodyForm((prev) => ({ ...prev, participatedAs: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Chairman">Chairman</SelectItem>
                            <SelectItem value="Vice-Chairman">Vice-Chairman</SelectItem>
                            <SelectItem value="Secretary">Secretary</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                            <SelectItem value="Examiner">Examiner</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="academicYear">Year</Label>
                        <Input
                          id="academicYear"
                          name="year"
                          type="number"
                          min="1900"
                          max="2100"
                          value={academicBodyForm.year}
                          onChange={handleAcademicBodyChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Academic Body Participation</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participation in University Committees Tab */}
          <TabsContent value="committee" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participation in Committees of University
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first to auto-extract information, then verify details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload First */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCommitteeFileChange}
                    className="mb-3"
                  />
                  {committeeForm.supportingDocument && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ {committeeForm.supportingDocument}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("committee")}
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
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Course Details</Label>
                  <form onSubmit={handleCommitteeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="committeeName">Name</Label>
                        <Input
                          id="committeeName"
                          name="name"
                          value={committeeForm.name}
                          onChange={handleCommitteeChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="committeeNameField">Committee Name</Label>
                        <Input
                          id="committeeNameField"
                          name="committeeName"
                          value={committeeForm.committeeName}
                          onChange={handleCommitteeChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Select
                          name="level"
                          value={committeeForm.level}
                          onValueChange={(value) => setCommitteeForm((prev) => ({ ...prev, level: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="Faculty">Faculty</SelectItem>
                            <SelectItem value="Department">Department</SelectItem>
                            <SelectItem value="Institute">Institute</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="committeeParticipatedAs">Participated As</Label>
                        <Select
                          name="participatedAs"
                          value={committeeForm.participatedAs}
                          onValueChange={(value) => setCommitteeForm((prev) => ({ ...prev, participatedAs: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Chairman">Chairman</SelectItem>
                            <SelectItem value="Vice-Chairman">Vice-Chairman</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Secretary">Secretary</SelectItem>
                            <SelectItem value="Convener">Convener</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="committeeYear">Year</Label>
                        <Input
                          id="committeeYear"
                          name="year"
                          type="number"
                          min="1900"
                          max="2100"
                          value={committeeForm.year}
                          onChange={handleCommitteeChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Committee Participation</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic/Research Talks Tab */}
          <TabsContent value="talks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  Talks of Academic/Research Nature (Other than MSUB)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your document first to auto-extract information, then verify details
                </p>
              </CardHeader>
              <CardContent>
                {/* Document Upload First */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleTalksFileChange} className="mb-3" />
                  {talksForm.supportingDocument && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ {talksForm.supportingDocument}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractInformation("talks")}
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
                  <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Course Details</Label>
                  <form onSubmit={handleTalksSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="talksName">Name</Label>
                        <Input
                          id="talksName"
                          name="name"
                          value={talksForm.name}
                          onChange={handleTalksChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="talksProgramme">Programme</Label>
                        <Select
                          name="programme"
                          value={talksForm.programme}
                          onValueChange={(value) => setTalksForm((prev) => ({ ...prev, programme: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select programme type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Guest Lecture">Guest Lecture</SelectItem>
                            <SelectItem value="Keynote Speech">Keynote Speech</SelectItem>
                            <SelectItem value="Invited Talk">Invited Talk</SelectItem>
                            <SelectItem value="Panel Discussion">Panel Discussion</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Seminar">Seminar</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="talksPlace">Place</Label>
                        <Input
                          id="talksPlace"
                          name="place"
                          value={talksForm.place}
                          onChange={handleTalksChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="talkDate">Talk Date</Label>
                        <Input
                          id="talkDate"
                          name="talkDate"
                          type="date"
                          value={talksForm.talkDate}
                          onChange={handleTalksChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="titleOfEvent">Title of Event/Talk</Label>
                        <Input
                          id="titleOfEvent"
                          name="titleOfEvent"
                          value={talksForm.titleOfEvent}
                          onChange={handleTalksChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="talksParticipatedAs">Participated As</Label>
                        <Select
                          name="participatedAs"
                          value={talksForm.participatedAs}
                          onValueChange={(value) => setTalksForm((prev) => ({ ...prev, participatedAs: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Speaker">Speaker</SelectItem>
                            <SelectItem value="Keynote Speaker">Keynote Speaker</SelectItem>
                            <SelectItem value="Guest Speaker">Guest Speaker</SelectItem>
                            <SelectItem value="Invited Speaker">Invited Speaker</SelectItem>
                            <SelectItem value="Panelist">Panelist</SelectItem>
                            <SelectItem value="Moderator">Moderator</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Academic/Research Talk</Button>
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
