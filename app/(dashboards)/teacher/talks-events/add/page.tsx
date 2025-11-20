"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, Users, Building, Presentation, Brain, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DocumentUpload } from "@/components/ui/document-upload"
import { RefresherOrientationForm } from "@/components/forms/RefresherOrientationForm"
import { useForm } from "react-hook-form"
import { AcademicProgramForm } from "@/components/forms/AcademicProgramForm"
import { AcademicBodiesForm } from "@/components/forms/AcademicBodiesForm"
import { UniversityCommitteeParticipationForm } from "@/components/forms/UniversityComitteeParticipationForm"
import { AcademicTalkForm } from "@/components/forms/AcademicTalkForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import {
  useRefresherMutations,
  useAcademicProgramMutations,
  useAcademicBodiesMutations,
  useCommitteeMutations,
  useTalksMutations,
} from "@/hooks/use-teacher-talks-events-mutations"

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
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("refresher")
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form = useForm()

  // Mutations for each section
  const refresherMutations = useRefresherMutations()
  const academicProgramMutations = useAcademicProgramMutations()
  const academicBodiesMutations = useAcademicBodiesMutations()
  const committeeMutations = useCommitteeMutations()
  const talksMutations = useTalksMutations()

  // Get isSubmitting state from mutations
  const isSubmitting = 
    refresherMutations.createMutation.isPending ||
    academicProgramMutations.createMutation.isPending ||
    academicBodiesMutations.createMutation.isPending ||
    committeeMutations.createMutation.isPending ||
    talksMutations.createMutation.isPending

  // Fetch dropdowns
  const { 
    refresherTypeOptions,
    fetchRefresherTypes,
    academicProgrammeOptions,
    participantTypeOptions,
    fetchAcademicProgrammes,
    fetchParticipantTypes,
    reportYearsOptions,
    fetchReportYears,
    committeeLevelOptions,
    fetchCommitteeLevels,
    talksProgrammeTypeOptions,
    talksParticipantTypeOptions,
    fetchTalksProgrammeTypes,
    fetchTalksParticipantTypes
  } = useDropDowns()

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["refresher", "academic-programs", "academic-bodies", "committees", "talks"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

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
  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleExtractInfo = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: activeTab }),
      })
      const { data, success, extracted_fields, confidence } = await res2.json()

      if (success) {
        Object.entries(data).forEach(([key, value]) => {
          form.setValue(key, value)
        })

        toast({
          title: "Success",
          description: `Form auto-filled with ${extracted_fields} fields (${Math.round(
            confidence * 100
          )}% confidence)`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  // Helper function to upload document to S3
  const uploadDocumentToS3 = async (documentUrl: string | undefined): Promise<string> => {
    if (!documentUrl) {
      return "http://localhost:3000/assets/demo_document.pdf"
    }

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl.startsWith("/uploaded-document/")) {
      try {
        const fileName = documentUrl.split("/").pop()
        if (!fileName) {
          throw new Error("Invalid file name")
        }

        const s3Response = await fetch("/api/shared/s3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        })

        if (!s3Response.ok) {
          const s3Error = await s3Response.json()
          throw new Error(s3Error.error || "Failed to upload document to S3")
        }

        const s3Data = await s3Response.json()
        const s3Url = s3Data.url

        // Delete local file after successful S3 upload
        await fetch("/api/shared/local-document-upload", {
          method: "DELETE",
        })

        return s3Url
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document. Using default.",
          variant: "destructive",
        })
        return "http://localhost:3000/assets/demo_document.pdf"
      }
    }

    // If it's already an S3 URL or external URL, return as is
    return documentUrl
  }

  // Submit handlers using mutations
  const handleRefresherSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3
      const docUrl = await uploadDocumentToS3(data.supporting_doc)

      const payload = {
        name: data.name,
        refresher_type: data.refresher_type,
        startdate: data.startdate,
        enddate: data.enddate || null,
        university: data.university,
        institute: data.institute,
        department: data.department,
        centre: data.centre && data.centre.trim() !== "" ? data.centre.trim() : null,
        supporting_doc: docUrl,
      }

      // Use mutation (toast and UI update handled by mutation)
      await refresherMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=refresher")
      }, 1000)
    } catch (error: any) {
      // Error toast is handled by mutation
      console.error("Error adding refresher detail:", error)
    }
  }

  const handleContributionSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3
      const docUrl = await uploadDocumentToS3(data.supporting_doc)

      const payload = {
        name: data.name,
        programme: data.programme,
        place: data.place,
        date: data.date,
        participated_as: data.participated_as,
        supporting_doc: docUrl,
        year_name: data.year_name || new Date().getFullYear(),
      }

      // Use mutation (toast and UI update handled by mutation)
      await academicProgramMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=academic-programs")
      }, 1000)
    } catch (error: any) {
      // Error toast is handled by mutation
      console.error("Error adding academic contribution:", error)
    }
  }

  const handleAcademicBodySubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3
      const docUrl = await uploadDocumentToS3(data.supporting_doc)

      const payload = {
        name: data.name,
        acad_body: data.acad_body,
        place: data.place,
        participated_as: data.participated_as,
        submit_date: data.submit_date,
        supporting_doc: docUrl,
        year_name: data.year_name || new Date().getFullYear(),
      }

      // Use mutation (toast and UI update handled by mutation)
      await academicBodiesMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=academic-bodies")
      }, 1000)
    } catch (error: any) {
      // Error toast is handled by mutation
      console.error("Error adding academic bodies participation:", error)
    }
  }

  const handleCommitteeSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3
      const docUrl = await uploadDocumentToS3(data.supporting_doc)

      const payload = {
        name: data.name,
        committee_name: data.committee_name,
        level: data.level,
        participated_as: data.participated_as,
        submit_date: data.submit_date,
        supporting_doc: docUrl,
        BOS: data.BOS || false,
        FB: data.FB || false,
        CDC: data.CDC || false,
        year_name: data.year_name || new Date().getFullYear(),
      }

      // Use mutation (toast and UI update handled by mutation)
      await committeeMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=committees")
      }, 1000)
    } catch (error: any) {
      // Error toast is handled by mutation
      console.error("Error adding university committee participation:", error)
    }
  }

  const handleTalksSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3 (talks uses Image field)
      const docUrl = await uploadDocumentToS3(data.supporting_doc || data.Image)

      const payload = {
        name: data.name,
        programme: data.programme,
        place: data.place,
        date: data.date,
        title: data.title,
        participated_as: data.participated_as,
        Image: docUrl,
      }

      // Use mutation (toast and UI update handled by mutation)
      await talksMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=talks")
      }, 1000)
    } catch (error: any) {
      // Error toast is handled by mutation
      console.error("Error adding teacher talk:", error)
    }
  }

  const handleTalksSubmitOld = (e: React.FormEvent) => {
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
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events & Activities
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add Event & Activities</h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[800px] grid-cols-5 h-auto p-1">
              <TabsTrigger value="refresher" className="text-xs px-2 py-2">
                <FileText className="mr-1 h-3 w-3" />
                Refresher/Orientation
              </TabsTrigger>
              <TabsTrigger value="academic-programs" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                Academic Programs
              </TabsTrigger>
              <TabsTrigger value="academic-bodies" className="text-xs px-2 py-2">
                <Building className="mr-1 h-3 w-3" />
                Academic Bodies
              </TabsTrigger>
              <TabsTrigger value="committees" className="text-xs px-2 py-2">
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
              <RefresherOrientationForm
                form={form}
                onSubmit={handleRefresherSubmit}
                isSubmitting={isSubmitting}
                isExtracting={isExtracting}
                selectedFiles={selectedFiles}
                handleFileSelect={setSelectedFiles}
                handleExtractInfo={handleExtractInfo}
                isEdit={false}
                refresherTypeOptions={refresherTypeOptions}
              />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Programs Tab */}
          <TabsContent value="academic-programs" className="space-y-4">
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
              <AcademicProgramForm
                form={form}
                onSubmit={handleContributionSubmit}
                isSubmitting={isSubmitting}
                isExtracting={isExtracting}
                selectedFiles={selectedFiles}
                handleFileSelect={setSelectedFiles}
                handleExtractInfo={handleExtractInfo}
                isEdit={false}
                academicProgrammeOptions={academicProgrammeOptions}
                participantTypeOptions={participantTypeOptions}
                reportYearsOptions={reportYearsOptions}
              />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Bodies Tab */}
          <TabsContent value="academic-bodies" className="space-y-4">
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
              <AcademicBodiesForm
                form={form}
                onSubmit={handleAcademicBodySubmit}
                isSubmitting={isSubmitting}
                isExtracting={isExtracting}
                selectedFiles={selectedFiles}
                handleFileSelect={setSelectedFiles}
                handleExtractInfo={handleExtractInfo}
                isEdit={false}
                reportYearsOptions={reportYearsOptions}
              />
              </CardContent>
            </Card>
          </TabsContent>

          {/* University Committees Tab */}
          <TabsContent value="committees" className="space-y-4">
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
              <UniversityCommitteeParticipationForm
                form={form}
                onSubmit={handleCommitteeSubmit}
                isSubmitting={isSubmitting}
                isExtracting={isExtracting}
                selectedFiles={selectedFiles}
                handleFileSelect={setSelectedFiles}
                handleExtractInfo={handleExtractInfo}
                isEdit={false}
                committeeLevelOptions={committeeLevelOptions}
                reportYearsOptions={reportYearsOptions}
              />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Talks Tab */}
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
              <AcademicTalkForm
                form={form}
                onSubmit={handleTalksSubmit}
                isSubmitting={isSubmitting}
                isExtracting={isExtracting}
                selectedFiles={selectedFiles}
                handleFileSelect={setSelectedFiles}
                handleExtractInfo={handleExtractInfo}
                isEdit={false}
                talksProgrammeTypeOptions={talksProgrammeTypeOptions}
                talksParticipantTypeOptions={talksParticipantTypeOptions}
              />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
