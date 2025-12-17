"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Users, Building, Presentation } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"


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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form = useForm()
  const { watch, setValue } = form

  // Track auto-filled fields for highlighting
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  // Helper function to check if a field is auto-filled
  const isAutoFilled = useCallback((fieldName: string) => {
    return autoFilledFields.has(fieldName)
  }, [autoFilledFields])

  // Helper function to clear auto-fill highlight for a field
  const clearAutoFillHighlight = useCallback((fieldName: string) => {
    setAutoFilledFields(prev => {
      if (prev.has(fieldName)) {
        const next = new Set(prev)
        next.delete(fieldName)
        return next
      }
      return prev
    })
  }, [])

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


  // Get dropdown options for current tab
  const getDropdownOptionsForTab = (tab: string): Record<string, Array<{ id: number; name: string }>> => {
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
  const { documentData, clearDocumentData, hasDocumentData } = useDocumentAnalysis()

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
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: activeTab, // formType = activeTab (refresher/academic-programs/academic-bodies/committees/talks)
    dropdownOptions: getDropdownOptionsForTab(activeTab),
    onlyFillEmpty: true,
    getFormValues: () => watch(),
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only fields that were successfully set)
      const filledFieldNames: string[] = []
      
      // Get dropdown options for current tab
      const dropdownOptions = getDropdownOptionsForTab(activeTab)
      
      // Helper function to check if a dropdown value matches an option
      const isValidDropdownValue = (value: number | string, options: Array<{ id: number; name: string }>): boolean => {
        if (typeof value === 'number') {
          return options.some(opt => opt.id === value)
        }
        return false
      }
      
      // Helper function to validate and set dropdown field
      const validateAndSetDropdown = (fieldName: string, value: any, options: Array<{ id: number; name: string }>): boolean => {
        if (value === undefined || value === null) return false
        
        let fieldValue: number | null = null
        
        if (typeof value === 'number') {
          if (isValidDropdownValue(value, options)) {
            fieldValue = value
          }
        } else {
          // Try to find matching option by name
          const option = options.find(
            opt => opt.name.toLowerCase() === String(value).toLowerCase()
          )
          if (option) {
            fieldValue = option.id
          } else {
            // Try to convert to number and check
            const numValue = Number(value)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, options)) {
              fieldValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (fieldValue !== null && options.some(opt => opt.id === fieldValue)) {
          setValue(fieldName, fieldValue, { shouldValidate: true })
          return true
        }
        return false
      }
      
      // Process fields based on active tab
      if (activeTab === "refresher") {
        // Name
        if (fields.name) {
          setValue("name", String(fields.name))
          filledFieldNames.push("name")
        }
        
        // Refresher Type (dropdown)
        if (fields.refresher_type || fields.course_type) {
          const value = fields.refresher_type || fields.course_type
          if (dropdownOptions.refresher_type && validateAndSetDropdown("refresher_type", value, dropdownOptions.refresher_type)) {
            filledFieldNames.push("refresher_type")
          }
        }
        
        // Start Date
        if (fields.start_date || fields.startdate) {
          setValue("startdate", String(fields.start_date || fields.startdate))
          filledFieldNames.push("startdate")
        }
        
        // End Date
        if (fields.end_date || fields.enddate) {
          setValue("enddate", String(fields.end_date || fields.enddate))
          filledFieldNames.push("enddate")
        }
        
        // University
        if (fields.organizing_university || fields.university) {
          setValue("university", String(fields.organizing_university || fields.university))
          filledFieldNames.push("university")
        }
        
        // Institute
        if (fields.organizing_institute || fields.institute) {
          setValue("institute", String(fields.organizing_institute || fields.institute))
          filledFieldNames.push("institute")
        }
        
        // Department
        if (fields.organizing_department || fields.department) {
          setValue("department", String(fields.organizing_department || fields.department))
          filledFieldNames.push("department")
        }
        
        // Centre
        if (fields.centre) {
          setValue("centre", String(fields.centre))
          filledFieldNames.push("centre")
        }
        
      } else if (activeTab === "academic-programs") {
        // Name
        if (fields.name) {
          setValue("name", String(fields.name))
          filledFieldNames.push("name")
        }
        
        // Programme (dropdown)
        if (fields.programme && dropdownOptions.programme) {
          if (validateAndSetDropdown("programme", fields.programme, dropdownOptions.programme)) {
            filledFieldNames.push("programme")
          }
        }
        
        // Place
        if (fields.place) {
          setValue("place", String(fields.place))
          filledFieldNames.push("place")
        }
        
        // Date
        if (fields.date) {
          setValue("date", String(fields.date))
          filledFieldNames.push("date")
        }
        
        // Year Name (dropdown)
        if ((fields.year || fields.year_name) && dropdownOptions.year_name) {
          if (validateAndSetDropdown("year_name", fields.year || fields.year_name, dropdownOptions.year_name)) {
            filledFieldNames.push("year_name")
          }
        }
        
        // Participated As (dropdown)
        if (fields.participated_as && dropdownOptions.participated_as) {
          if (validateAndSetDropdown("participated_as", fields.participated_as, dropdownOptions.participated_as)) {
            filledFieldNames.push("participated_as")
          }
        }
        
      } else if (activeTab === "academic-bodies") {
        // Name
        if (fields.name) {
          setValue("name", String(fields.name))
          filledFieldNames.push("name")
        }
        
        // Academic Body
        if (fields.acad_body) {
          setValue("acad_body", String(fields.acad_body))
          filledFieldNames.push("acad_body")
        }
        
        // Place
        if (fields.place) {
          setValue("place", String(fields.place))
          filledFieldNames.push("place")
        }
        
        // Participated As
        if (fields.participated_as) {
          setValue("participated_as", String(fields.participated_as))
          filledFieldNames.push("participated_as")
        }
        
        // Year Name (dropdown)
        if (fields.year_name && dropdownOptions.year_name) {
          if (validateAndSetDropdown("year_name", fields.year_name, dropdownOptions.year_name)) {
            filledFieldNames.push("year_name")
          }
        } else if (fields.year && !fields.year_name && dropdownOptions.year_name) {
          if (validateAndSetDropdown("year_name", fields.year, dropdownOptions.year_name)) {
            filledFieldNames.push("year_name")
          }
        }
        
        // Submit Date
        if (fields.submit_date) {
          setValue("submit_date", String(fields.submit_date))
          filledFieldNames.push("submit_date")
        } else if (fields.year_name) {
          const yearValue = fields.year_name
          if (typeof yearValue === 'string' && /^\d{4}$/.test(yearValue)) {
            setValue("submit_date", `${yearValue}-01-01`)
            filledFieldNames.push("submit_date")
          }
        }
        
      } else if (activeTab === "committees") {
        // Name
        if (fields.name) {
          setValue("name", String(fields.name))
          filledFieldNames.push("name")
        }
        
        // Committee Name
        if (fields.committee_name) {
          setValue("committee_name", String(fields.committee_name))
          filledFieldNames.push("committee_name")
        }
        
        // Level (dropdown)
        if (fields.level && dropdownOptions.level) {
          if (validateAndSetDropdown("level", fields.level, dropdownOptions.level)) {
            filledFieldNames.push("level")
          }
        }
        
        // Participated As
        if (fields.participated_as) {
          setValue("participated_as", String(fields.participated_as))
          filledFieldNames.push("participated_as")
        }
        
        // Submit Date
        if (fields.submit_date) {
          setValue("submit_date", String(fields.submit_date))
          filledFieldNames.push("submit_date")
        }
        
        // Year Name (dropdown)
        if ((fields.year_name || fields.year) && dropdownOptions.year_name) {
          if (validateAndSetDropdown("year_name", fields.year_name || fields.year, dropdownOptions.year_name)) {
            filledFieldNames.push("year_name")
          }
        }
        
      } else if (activeTab === "talks") {
        // Name
        if (fields.name) {
          setValue("name", String(fields.name))
          filledFieldNames.push("name")
        }
        
        // Programme (dropdown)
        if (fields.programme && dropdownOptions.programme) {
          if (validateAndSetDropdown("programme", fields.programme, dropdownOptions.programme)) {
            filledFieldNames.push("programme")
          }
        }
        
        // Place
        if (fields.place) {
          setValue("place", String(fields.place))
          filledFieldNames.push("place")
        }
        
        // Date
        if (fields.date || fields.talk_date) {
          setValue("date", String(fields.date || fields.talk_date))
          filledFieldNames.push("date")
        }
        
        // Title
        if (fields.title || fields.title_of_event) {
          setValue("title", String(fields.title || fields.title_of_event))
          filledFieldNames.push("title")
        }
        
        // Participated As (dropdown)
        if (fields.participated_as && dropdownOptions.participated_as) {
          if (validateAndSetDropdown("participated_as", fields.participated_as, dropdownOptions.participated_as)) {
            filledFieldNames.push("participated_as")
          }
        }
      }
      
      // Update auto-filled fields set
      if (filledFieldNames.length > 0) {
        setAutoFilledFields(new Set(filledFieldNames))
      }
    },
    clearAfterUse: false,
  })

  // Navigation guard
  const { DialogComponent: NavigationDialog } = useUnsavedChangesGuard({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    clearAutoFillData: clearAutoFillData,
    enabled: true,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cancel handler
  const { handleCancel, DialogComponent: CancelDialog } = useFormCancelHandler({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    redirectPath: "/teacher/talks-events",
    skipWarning: false,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasDocumentData) {
        clearDocumentData()
        clearAutoFillData()
      }
    }
  }, [hasDocumentData, clearDocumentData, clearAutoFillData])

  // Clear fields handler
  const handleClearFields = () => {
    form.reset()
    setAutoFilledFields(new Set()) // Clear highlighting
    // Also clear document URL from form state
    setValue("supporting_doc", "")
    if (activeTab === "talks") {
      setValue("Image", "")
    }
  }

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


  // Helper function to upload document to S3 (wrapper for single-document uploads)
  const handleDocumentUpload = async (documentUrl: string | undefined): Promise<string> => {
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

        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        const tempRecordId = Date.now()
        
        const s3Url = await uploadDocumentToS3(
          documentUrl,
          user?.role_id||0,
          tempRecordId,
          "talks"
        )

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
      const docUrl = await handleDocumentUpload(data.supporting_doc)

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
      setAutoFilledFields(new Set()) // Clear highlighting
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
      const docUrl = await handleDocumentUpload(data.supporting_doc)

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
      setAutoFilledFields(new Set()) // Clear highlighting
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
      const docUrl = await handleDocumentUpload(data.supporting_doc)

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
      setAutoFilledFields(new Set()) // Clear highlighting
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
      const docUrl = await handleDocumentUpload(data.supporting_doc)

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
      setAutoFilledFields(new Set()) // Clear highlighting
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
      const docUrl = await handleDocumentUpload(data.supporting_doc || data.Image)

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
      setAutoFilledFields(new Set()) // Clear highlighting
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

  return (
      <>
        {NavigationDialog && <NavigationDialog />}
        {CancelDialog && <CancelDialog />}
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events & Activities
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Add Event & Activities</h1>
             
            </div>
          </div>

        <Tabs value={activeTab} className="w-full">

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
                isEdit={false}
                refresherTypeOptions={refresherTypeOptions}
                onClearFields={handleClearFields}
                onCancel={handleCancel}
                isAutoFilled={isAutoFilled}
                onFieldChange={clearAutoFillHighlight}
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
                isEdit={false}
                academicProgrammeOptions={academicProgrammeOptions}
                participantTypeOptions={participantTypeOptions}
                reportYearsOptions={reportYearsOptions}
                onClearFields={handleClearFields}
                onCancel={handleCancel}
                isAutoFilled={isAutoFilled}
                onFieldChange={clearAutoFillHighlight}
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
                isEdit={false}
                reportYearsOptions={reportYearsOptions}
                onClearFields={handleClearFields}
                onCancel={handleCancel}
                isAutoFilled={isAutoFilled}
                onFieldChange={clearAutoFillHighlight}
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
                isEdit={false}
                committeeLevelOptions={committeeLevelOptions}
                reportYearsOptions={reportYearsOptions}
                onClearFields={handleClearFields}
                onCancel={handleCancel}
                isAutoFilled={isAutoFilled}
                onFieldChange={clearAutoFillHighlight}
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
                isEdit={false}
                talksProgrammeTypeOptions={talksProgrammeTypeOptions}
                talksParticipantTypeOptions={talksParticipantTypeOptions}
                onClearFields={handleClearFields}
                onCancel={handleCancel}
                isAutoFilled={isAutoFilled}
                onFieldChange={clearAutoFillHighlight}
              />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </>
  )
}
