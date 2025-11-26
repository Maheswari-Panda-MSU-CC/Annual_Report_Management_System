"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
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
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"


export default function AddEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Initialize activeTab from URL parameter, default to "refresher"
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab")
    return (tab && ["refresher", "academic-programs", "academic-bodies", "committees", "talks"].includes(tab)) 
      ? tab 
      : "refresher"
  })
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form = useForm()
  const { watch, setValue } = form

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
    academicProgrammeOptions,
    participantTypeOptions,
    reportYearsOptions,
    committeeLevelOptions,
    talksProgrammeTypeOptions,
    talksParticipantTypeOptions,
  } = useDropDowns()

  // Determine form type based on active tab
  const getFormTypeForTab = (tab: string): string => {
    switch (tab) {
      case "refresher":
        return "refresher"
      case "academic-programs":
        return "academic-programs"
      case "academic-bodies":
        return "academic-bodies"
      case "committees":
        return "committees"
      case "talks":
        return "talks"
      default:
        return "refresher"
    }
  }

  // Get dropdown options for current tab
  const getDropdownOptionsForTab = (tab: string): Record<string, Array<{ id: number | string; name: string }>> => {
    switch (tab) {
      case "refresher":
        return {
          refresher_type: refresherTypeOptions,
        }
      case "academic-programs":
        return {
          programme: academicProgrammeOptions,
          participated_as: participantTypeOptions,
          year_name: reportYearsOptions,
        }
      case "academic-bodies":
        return {
          participated_as: participantTypeOptions,
          year_name: reportYearsOptions,
        }
      case "committees":
        return {
          level: committeeLevelOptions,
          participated_as: participantTypeOptions,
          year_name: reportYearsOptions,
        }
      case "talks":
        return {
          programme: talksProgrammeTypeOptions,
          participated_as: talksParticipantTypeOptions,
        }
      default:
        return {}
    }
  }

  // Get document data from context for tab matching
  const { documentData } = useDocumentAnalysis()

  // Track which tab the document belongs to
  const [documentTab, setDocumentTab] = useState<string | null>(null)

  // Helper function to check if document matches current tab - STRICTLY MUTUALLY EXCLUSIVE
  const doesDocumentMatchTab = (tab: string, category?: string, subCategory?: string): boolean => {
    if (!category && !subCategory) return false
    
    const normalizedCategory = (category || "").toLowerCase().trim()
    const normalizedSubCategory = (subCategory || "").toLowerCase().trim()
    
    switch (tab) {
      case "refresher":
        return normalizedCategory.includes("refresher") || 
               normalizedCategory.includes("orientation") ||
               normalizedSubCategory.includes("refresher") ||
               normalizedSubCategory.includes("orientation")
      case "academic-programs":
        // STRICT: Only match exact phrases for programs, exclude ANY mention of bodies
        return (
          normalizedSubCategory === "contribution in organising academic programs" ||
          normalizedSubCategory.includes("contribution in organising academic programs") ||
          (normalizedSubCategory.includes("academic program") && 
           !normalizedSubCategory.includes("body") &&
           !normalizedSubCategory.includes("participation") &&
           !normalizedSubCategory.includes("bodies"))
        )
      case "academic-bodies":
        // STRICT: Only match exact phrases for bodies, exclude ANY mention of programs
        // Handle exact match: "Participation in Academic Bodies of other Universities"
        return (
          normalizedSubCategory === "participation in academic bodies of other universities" ||
          normalizedSubCategory.includes("participation in academic bodies") ||
          (normalizedSubCategory.includes("academic body") && 
           normalizedSubCategory.includes("participation") &&
           !normalizedSubCategory.includes("program") &&
           !normalizedSubCategory.includes("contribution") &&
           !normalizedSubCategory.includes("organising")) ||
          // Also match if it contains "academic bodies" (plural) with participation
          (normalizedSubCategory.includes("academic bodies") &&
           normalizedSubCategory.includes("participation") &&
           !normalizedSubCategory.includes("program"))
        )
      case "committees":
        return normalizedCategory.includes("committee") ||
               normalizedSubCategory.includes("committee") ||
               (normalizedCategory.includes("university") && normalizedCategory.includes("committee"))
      case "talks":
        return normalizedCategory.includes("talk") ||
               normalizedSubCategory.includes("talk") ||
               (normalizedCategory.includes("academic") && normalizedCategory.includes("talk"))
      default:
        return false
    }
  }

  // Use auto-fill hook - formType is same as activeTab (like awards-recognition)
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
  } = useAutoFillData({
    formType: activeTab, // formType = activeTab (refresher/academic-programs/academic-bodies/committees/talks)
    dropdownOptions: getDropdownOptionsForTab(activeTab),
    onlyFillEmpty: true,
    getFormValues: () => watch(),
    onAutoFill: (fields) => {
      // Only auto-fill if document matches current tab
      if (!documentData) {
        console.warn("[AutoFill] No document data available")
        return
      }
      
      const category = documentData.category || documentData.analysis?.classification?.category || ""
      const subCategory = documentData.subCategory || documentData.analysis?.classification?.["sub-category"] || ""
      
      const matchesTab = doesDocumentMatchTab(activeTab, category, subCategory)
      
      if (!matchesTab) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[AutoFill] Skipped - Document doesn't match current tab", {
            activeTab,
            category,
            subCategory,
            fieldsCount: Object.keys(fields).length,
            fields: Object.keys(fields)
          })
        }
        return
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log("[AutoFill] Filling fields for tab:", activeTab, {
          fieldsCount: Object.keys(fields).length,
          fields: Object.keys(fields),
          sampleValues: Object.fromEntries(Object.entries(fields).slice(0, 3))
        })
      }
      // Map fields based on active tab
      if (activeTab === "refresher") {
        if (fields.name) setValue("name", String(fields.name))
        if (fields.refresher_type || fields.course_type) {
          setValue("refresher_type", String(fields.refresher_type || fields.course_type))
        }
        // Check mapped field names first (start_date, end_date), then form field names
        if (fields.start_date || fields.startdate) {
          setValue("startdate", String(fields.start_date || fields.startdate))
        }
        if (fields.end_date || fields.enddate) {
          setValue("enddate", String(fields.end_date || fields.enddate))
        }
        if (fields.organizing_university || fields.university) {
          setValue("university", String(fields.organizing_university || fields.university))
        }
        if (fields.organizing_institute || fields.institute) {
          setValue("institute", String(fields.organizing_institute || fields.institute))
        }
        if (fields.organizing_department || fields.department) {
          setValue("department", String(fields.organizing_department || fields.department))
        }
        if (fields.centre) setValue("centre", String(fields.centre))
        if (fields.supporting_doc) setValue("supporting_doc", String(fields.supporting_doc))
      } else if (activeTab === "academic-programs") {
        if (fields.name) setValue("name", String(fields.name))
        if (fields.programme) setValue("programme", String(fields.programme))
        if (fields.place) setValue("place", String(fields.place))
        if (fields.date) setValue("date", String(fields.date))
        if (fields.year || fields.year_name) setValue("year_name", String(fields.year || fields.year_name))
        if (fields.participated_as) setValue("participated_as", String(fields.participated_as))
        if (fields.supporting_doc) setValue("supporting_doc", String(fields.supporting_doc))
      } else if (activeTab === "academic-bodies") {
        // Hook maps: "Course Title" → "name", "Academic Body" → "acad_body", "Year" → "year_name"
        // So we use the mapped field names directly
        if (fields.name) setValue("name", String(fields.name))
        if (fields.acad_body) setValue("acad_body", String(fields.acad_body))
        if (fields.place) setValue("place", String(fields.place))
        if (fields.participated_as) setValue("participated_as", String(fields.participated_as))
        // year_name is already mapped and processed by hook (dropdown matching)
        if (fields.year_name) setValue("year_name", String(fields.year_name))
        // Also handle legacy "year" field name for backward compatibility
        if (fields.year && !fields.year_name) {
          setValue("year_name", String(fields.year))
        }
        // submit_date is a date field - try to set from year if available
        if (fields.submit_date) {
          setValue("submit_date", String(fields.submit_date))
        } else if (fields.year_name) {
          // If we have a year, try to set submit_date to first day of that year
          const yearValue = fields.year_name
          // Check if it's a valid year (4 digits)
          if (typeof yearValue === 'string' && /^\d{4}$/.test(yearValue)) {
            setValue("submit_date", `${yearValue}-01-01`)
          }
        }
        if (fields.supporting_doc) setValue("supporting_doc", String(fields.supporting_doc))
      } else if (activeTab === "committees") {
        if (fields.name) setValue("name", String(fields.name))
        if (fields.committee_name) setValue("committee_name", String(fields.committee_name))
        if (fields.level) setValue("level", String(fields.level))
        if (fields.participated_as) setValue("participated_as", String(fields.participated_as))
        if (fields.submit_date || fields.year) setValue("submit_date", String(fields.submit_date || fields.year))
        if (fields.year_name || fields.year) setValue("year_name", String(fields.year_name || fields.year))
        if (fields.supporting_doc) setValue("supporting_doc", String(fields.supporting_doc))
      } else if (activeTab === "talks") {
        if (fields.name) setValue("name", String(fields.name))
        if (fields.programme) setValue("programme", String(fields.programme))
        if (fields.place) setValue("place", String(fields.place))
        if (fields.date || fields.talk_date) setValue("date", String(fields.date || fields.talk_date))
        if (fields.title || fields.title_of_event) setValue("title", String(fields.title || fields.title_of_event))
        if (fields.participated_as) setValue("participated_as", String(fields.participated_as))
        if (fields.supporting_doc) {
          setValue("supporting_doc", String(fields.supporting_doc))
          setValue("Image", String(fields.supporting_doc)) // Talks also uses Image field
        }
        if (fields.Image) {
          setValue("supporting_doc", String(fields.Image))
          setValue("Image", String(fields.Image))
        }
      }
    },
    clearAfterUse: false,
  })

  // Debug: Log when auto-fill data is available (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && hasAutoFillData && documentData) {
      const category = documentData.category || documentData.analysis?.classification?.category || ""
      const subCategory = documentData.subCategory || documentData.analysis?.classification?.["sub-category"] || ""
      const matchesTab = doesDocumentMatchTab(activeTab, category, subCategory)
      
      console.log("[AutoFill Debug]", {
        activeTab,
        formType: activeTab,
        category,
        subCategory,
        matchesTab,
        hasData: hasAutoFillData,
        dataFieldsCount: Object.keys(autoFillDataFields || {}).length,
        documentUrl: autoFillDocumentUrl ? "present" : "missing"
      })
    }
  }, [hasAutoFillData, documentData, activeTab, autoFillDataFields, autoFillDocumentUrl])

  // Track previous tab to detect tab changes
  const prevActiveTabRef = useRef<string>(activeTab)

  // Handle document URL from auto-fill context - STRICTLY TAB BOUNDED
  // ALWAYS clear when switching tabs, then re-check and set only if matches
  useEffect(() => {
    const tabChanged = prevActiveTabRef.current !== activeTab
    prevActiveTabRef.current = activeTab

    // Step 1: ALWAYS clear document URL when switching tabs (prevents overlap)
    if (tabChanged && documentTab) {
      // Clear document URL from form state immediately
      if (activeTab === "talks") {
        setValue("supporting_doc", "")
        setValue("Image", "")
      } else {
        setValue("supporting_doc", "")
      }
      // Clear tracker when switching away
      setDocumentTab(null)
    }
    
    // Step 2: Check if we have document data and if it matches current tab
    if (autoFillDocumentUrl && hasAutoFillData && documentData) {
      const category = documentData.category || documentData.analysis?.classification?.category || ""
      const subCategory = documentData.subCategory || documentData.analysis?.classification?.["sub-category"] || ""
      
      // Check if document matches current tab using strict matching
      const matchesCurrentTab = doesDocumentMatchTab(activeTab, category, subCategory)
      
      if (matchesCurrentTab) {
        // Only set if we don't already have it set for this tab
        const currentDocUrl = watch("supporting_doc") || watch("Image")
        if (!currentDocUrl || currentDocUrl !== autoFillDocumentUrl) {
          // Set document tab tracker
          setDocumentTab(activeTab)
          
          // Set document URL for matching tab
          if (activeTab === "talks") {
            setValue("supporting_doc", autoFillDocumentUrl)
            setValue("Image", autoFillDocumentUrl)
          } else {
            setValue("supporting_doc", autoFillDocumentUrl)
          }
        }
      } else {
        // Document doesn't match current tab - ensure it's cleared
        const currentDocUrl = watch("supporting_doc") || watch("Image")
        if (currentDocUrl && currentDocUrl === autoFillDocumentUrl) {
          // Clear document URL for non-matching tab
          if (activeTab === "talks") {
            setValue("supporting_doc", "")
            setValue("Image", "")
          } else {
            setValue("supporting_doc", "")
          }
          setDocumentTab(null)
        }
      }
    }
  }, [activeTab, documentTab, autoFillDocumentUrl, hasAutoFillData, documentData, setValue, watch])

  // Handle URL tab parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["refresher", "academic-programs", "academic-bodies", "committees", "talks"].includes(tab) && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams, activeTab])
  
  // Auto-switch tab based on document data if no URL tab is specified
  const hasAutoSwitchedRef = useRef(false)
  useEffect(() => {
    // Only auto-switch if:
    // 1. No URL tab parameter is set
    // 2. Document data is available
    // 3. We haven't already auto-switched
    const urlTab = searchParams.get("tab")
    if (!urlTab && documentData?.category && documentData?.subCategory && !hasAutoSwitchedRef.current) {
      const category = documentData.category
      const subCategory = documentData.subCategory
      
      // Check in priority order (most specific first)
      if (doesDocumentMatchTab("academic-bodies", category, subCategory)) {
        setActiveTab("academic-bodies")
        hasAutoSwitchedRef.current = true
      } else if (doesDocumentMatchTab("academic-programs", category, subCategory)) {
        setActiveTab("academic-programs")
        hasAutoSwitchedRef.current = true
      } else if (doesDocumentMatchTab("talks", category, subCategory)) {
        setActiveTab("talks")
        hasAutoSwitchedRef.current = true
      } else if (doesDocumentMatchTab("committees", category, subCategory)) {
        setActiveTab("committees")
        hasAutoSwitchedRef.current = true
      } else if (doesDocumentMatchTab("refresher", category, subCategory)) {
        setActiveTab("refresher")
        hasAutoSwitchedRef.current = true
      }
    }
  }, [documentData, searchParams])

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
