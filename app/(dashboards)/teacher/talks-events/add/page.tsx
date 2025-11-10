"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm()
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())

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

  // Fetch dropdowns for tabs
  useEffect(() => {
    if (activeTab === "refresher") {
      if (!fetchedDropdownsRef.current.has("refresherTypeOptions") && 
          !fetchingDropdownsRef.current.has("refresherTypeOptions") &&
          refresherTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("refresherTypeOptions")
        fetchRefresherTypes()
          .then(() => {
            fetchedDropdownsRef.current.add("refresherTypeOptions")
          })
          .catch(error => {
            console.error("Error fetching refresher types:", error)
          })
          .finally(() => {
            fetchingDropdownsRef.current.delete("refresherTypeOptions")
          })
      }
    } else if (activeTab === "academic-programs") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("academicProgrammeOptions") && 
          !fetchingDropdownsRef.current.has("academicProgrammeOptions") &&
          academicProgrammeOptions.length === 0) {
        fetchingDropdownsRef.current.add("academicProgrammeOptions")
        dropdownsToFetch.push(
          fetchAcademicProgrammes()
            .then(() => {
              fetchedDropdownsRef.current.add("academicProgrammeOptions")
            })
            .catch(error => {
              console.error("Error fetching academic programmes:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("academicProgrammeOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("participantTypeOptions") && 
          !fetchingDropdownsRef.current.has("participantTypeOptions") &&
          participantTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("participantTypeOptions")
        dropdownsToFetch.push(
          fetchParticipantTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("participantTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching participant types:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("participantTypeOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("reportYearsOptions") && 
          !fetchingDropdownsRef.current.has("reportYearsOptions") &&
          reportYearsOptions.length === 0) {
        fetchingDropdownsRef.current.add("reportYearsOptions")
        dropdownsToFetch.push(
          fetchReportYears()
            .then(() => {
              fetchedDropdownsRef.current.add("reportYearsOptions")
            })
            .catch(error => {
              console.error("Error fetching report years:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("reportYearsOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for academic-programs:", error)
        })
      }
    } else if (activeTab === "academic-bodies") {
      if (!fetchedDropdownsRef.current.has("reportYearsOptions") && 
          !fetchingDropdownsRef.current.has("reportYearsOptions") &&
          reportYearsOptions.length === 0) {
        fetchingDropdownsRef.current.add("reportYearsOptions")
        fetchReportYears()
          .then(() => {
            fetchedDropdownsRef.current.add("reportYearsOptions")
          })
          .catch(error => {
            console.error("Error fetching report years:", error)
          })
          .finally(() => {
            fetchingDropdownsRef.current.delete("reportYearsOptions")
          })
      }
    } else if (activeTab === "committees") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("reportYearsOptions") && 
          !fetchingDropdownsRef.current.has("reportYearsOptions") &&
          reportYearsOptions.length === 0) {
        fetchingDropdownsRef.current.add("reportYearsOptions")
        dropdownsToFetch.push(
          fetchReportYears()
            .then(() => {
              fetchedDropdownsRef.current.add("reportYearsOptions")
            })
            .catch(error => {
              console.error("Error fetching report years:", error)
            })
            .finally(() => {
              fetchedDropdownsRef.current.delete("reportYearsOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("committeeLevelOptions") && 
          !fetchingDropdownsRef.current.has("committeeLevelOptions") &&
          committeeLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("committeeLevelOptions")
        dropdownsToFetch.push(
          fetchCommitteeLevels()
            .then(() => {
              fetchedDropdownsRef.current.add("committeeLevelOptions")
            })
            .catch(error => {
              console.error("Error fetching committee levels:", error)
            })
            .finally(() => {
              fetchedDropdownsRef.current.delete("committeeLevelOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for committees:", error)
        })
      }
    } else if (activeTab === "talks") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("talksProgrammeTypeOptions") && 
          !fetchingDropdownsRef.current.has("talksProgrammeTypeOptions") &&
          talksProgrammeTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("talksProgrammeTypeOptions")
        dropdownsToFetch.push(
          fetchTalksProgrammeTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("talksProgrammeTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching talks programme types:", error)
            })
            .finally(() => {
              fetchedDropdownsRef.current.delete("talksProgrammeTypeOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("talksParticipantTypeOptions") && 
          !fetchingDropdownsRef.current.has("talksParticipantTypeOptions") &&
          talksParticipantTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("talksParticipantTypeOptions")
        dropdownsToFetch.push(
          fetchTalksParticipantTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("talksParticipantTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching talks participant types:", error)
            })
            .finally(() => {
              fetchedDropdownsRef.current.delete("talksParticipantTypeOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for talks:", error)
        })
      }
    }
  }, [activeTab, refresherTypeOptions.length, academicProgrammeOptions.length, participantTypeOptions.length, reportYearsOptions.length, committeeLevelOptions.length, talksProgrammeTypeOptions.length, talksParticipantTypeOptions.length, fetchRefresherTypes, fetchAcademicProgrammes, fetchParticipantTypes, fetchReportYears, fetchCommitteeLevels, fetchTalksProgrammeTypes, fetchTalksParticipantTypes])

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

  // Submit handlers
  const handleRefresherSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        refresherDetail: {
          name: data.name,
          refresher_type: data.refresher_type,
          startdate: data.startdate,
          enddate: data.enddate || null,
          university: data.university,
          institute: data.institute,
          department: data.department,
          centre: data.centre || null,
          supporting_doc: "http://localhost:3000/assets/demo_document.pdf",
        },
      }

      const res = await fetch("/api/teacher/talks-events/refresher-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add refresher detail")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=refresher")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding refresher detail:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add refresher detail",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        academicContri: {
          name: data.name,
          programme: data.programme,
          place: data.place,
          date: data.date,
          participated_as: data.participated_as,
          supporting_doc: "http://localhost:3000/assets/demo_document.pdf",
          year_name: data.year_name || new Date().getFullYear(),
        },
      }

      const res = await fetch("/api/teacher/talks-events/academic-contri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add academic contribution")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=academic-programs")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding academic contribution:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add academic contribution",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        partiAcads: {
          name: data.name,
          acad_body: data.acad_body,
          place: data.place,
          participated_as: data.participated_as,
          submit_date: data.submit_date,
          supporting_doc: "http://localhost:3000/assets/demo_document.pdf",
          year_name: data.year_name || new Date().getFullYear(),
        },
      }

      const res = await fetch("/api/teacher/talks-events/acad-bodies-parti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add academic bodies participation")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=academic-bodies")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding academic bodies participation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add academic bodies participation",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        partiCommi: {
          name: data.name,
          committee_name: data.committee_name,
          level: data.level,
          participated_as: data.participated_as,
          submit_date: data.submit_date,
          supporting_doc: "http://localhost:3000/assets/demo_document.pdf",
          BOS: data.BOS || false,
          FB: data.FB || false,
          CDC: data.CDC || false,
          year_name: data.year_name || new Date().getFullYear(),
        },
      }

      const res = await fetch("/api/teacher/talks-events/parti-university-committes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add university committee participation")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=committees")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding university committee participation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add university committee participation",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        teacherTalk: {
          name: data.name,
          programme: data.programme,
          place: data.place,
          date: data.date,
          title: data.title,
          participated_as: data.participated_as,
          Image: "http://localhost:3000/assets/demo_document.pdf",
        },
      }

      const res = await fetch("/api/teacher/talks-events/teacher-talks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add teacher talk")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/talks-events?tab=talks")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding teacher talk:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher talk",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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
