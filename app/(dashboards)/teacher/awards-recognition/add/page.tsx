"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Award, Users, Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { usePerformanceMutations, useAwardsMutations, useExtensionMutations } from "@/hooks/use-teacher-awards-recognition-mutations"
import { PerformanceTeacherForm } from "@/components/forms/PerformanceTeacherForm"
import { AwardsFellowshipForm } from "@/components/forms/AwardsFellowshipForm"
import { ExtensionActivityForm } from "@/components/forms/ExtensionActivityForm"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

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
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("performance")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null)
  const [documentTab, setDocumentTab] = useState<string | null>(null)
  const form = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const { watch, setValue } = form
  const prevActiveTabRef = useRef<string>("performance")

  // Mutation hooks
  const performanceMutations = usePerformanceMutations()
  const awardsMutations = useAwardsMutations()
  const extensionMutations = useExtensionMutations()

  // Derive submitting state from mutations
  const isSubmitting = performanceMutations.createMutation.isPending || 
                       awardsMutations.createMutation.isPending || 
                       extensionMutations.createMutation.isPending
  // Fetch dropdowns (handled internally by useDropDowns hook)
  const { 
    awardFellowLevelOptions,
    sponserNameOptions
  } = useDropDowns()

  // Determine form type based on active tab
  const getFormTypeForTab = (tab: string): string => {
    switch (tab) {
      case "performance":
        return "performance"
      case "awards":
        return "awards"
      case "extension":
        return "extension"
      default:
        return "performance"
    }
  }

  // Get dropdown options for current tab
  const getDropdownOptionsForTab = (tab: string): { [fieldName: string]: Array<{ id: number | string; name: string }> } => {
    switch (tab) {
      case "performance":
        return {}
      case "awards":
        return {
          level: awardFellowLevelOptions,
        }
      case "extension":
        return {
          level: awardFellowLevelOptions,
          sponsered: sponserNameOptions,
        }
      default:
        return {}
    }
  }

  // Helper function to check if document matches current tab - STRICTLY MUTUALLY EXCLUSIVE
  // Must be defined before useMemo that uses it
  const doesDocumentMatchTab = (tab: string, category?: string, subCategory?: string): boolean => {
    if (!category && !subCategory) return false
    
    const normalizedCategory = (category || "").toLowerCase().trim()
    const normalizedSubCategory = (subCategory || "").toLowerCase().trim()
    
    switch (tab) {
      case "performance":
        return (
          normalizedCategory.includes("performance") ||
          normalizedSubCategory.includes("performance by individual") ||
          normalizedSubCategory.includes("performance by group") ||
          (normalizedCategory.includes("award") && normalizedCategory.includes("performance"))
        )
      case "awards":
        return (
          normalizedSubCategory.includes("award") ||
          normalizedSubCategory.includes("fellowship") ||
          normalizedSubCategory.includes("recognition") ||
          (normalizedSubCategory.includes("award") && !normalizedSubCategory.includes("performance"))
        )
      case "extension":
        return (
          normalizedCategory.includes("extension") ||
          normalizedSubCategory.includes("extension") ||
          (normalizedCategory.includes("activity") && !normalizedCategory.includes("performance"))
        )
      default:
        return false
    }
  }

  // Get document data from context for tab matching
  const { documentData } = useDocumentAnalysis()

  // Determine formType from document data first, then fallback to active tab
  const shouldProvideFormType = useMemo(() => {
    // Only provide formType if document data exists and we can determine it
    if (documentData?.category && documentData?.subCategory) {
      const category = documentData.category
      const subCategory = documentData.subCategory
      
      // Use doesDocumentMatchTab to determine which tab this belongs to
      // Check in priority order (most specific first)
      if (doesDocumentMatchTab("performance", category, subCategory)) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[FormType] Detected: performance", { category, subCategory })
        }
        return "performance"
      } else if (doesDocumentMatchTab("awards", category, subCategory)) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[FormType] Detected: awards", { category, subCategory })
        }
        return "awards"
      } else if (doesDocumentMatchTab("extension", category, subCategory)) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[FormType] Detected: extension", { category, subCategory })
        }
        return "extension"
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log("[FormType] Could not detect from document data, using active tab", {
          category,
          subCategory,
          activeTab,
          fallback: getFormTypeForTab(activeTab)
        })
      }
    }
    // If we can't determine from document data, use active tab
    return getFormTypeForTab(activeTab)
  }, [documentData, activeTab])

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
  } = useAutoFillData({
    formType: shouldProvideFormType,
    dropdownOptions: getDropdownOptionsForTab(activeTab),
    onlyFillEmpty: true,
    getFormValues: () => watch(),
    onAutoFill: (fields) => {
      console.log(autoFillDataFields)
      // Only auto-fill if document matches current tab
      if (!documentData) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("[AutoFill] No document data available")
        }
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
      if (activeTab === "performance") {
        if (fields.name || fields.title_of_performance) setValue("name", String(fields.name || fields.title_of_performance))
        if (fields.place) setValue("place", String(fields.place))
        if (fields.date || fields.performance_date) setValue("date", String(fields.date || fields.performance_date))
        if (fields.perf_nature || fields.nature_of_performance) setValue("perf_nature", String(fields.perf_nature || fields.nature_of_performance))
        if (fields.Image) setValue("Image", String(fields.Image))
      } else if (activeTab === "awards") {
        // Awards form field mapping
        if (fields.name) setValue("name", String(fields.name))
        if (fields.details) setValue("details", String(fields.details))
        if (fields.organization) setValue("organization", String(fields.organization))
        if (fields.address) setValue("address", String(fields.address))
        if (fields.date_of_award) setValue("date_of_award", String(fields.date_of_award))
        if (fields.level) setValue("level", String(fields.level))
        if (fields.Image) setValue("Image", String(fields.Image))
      } else if (activeTab === "extension") {
        // Extension form field mapping - note: mapping uses "nature" but form uses "names"
        // and mapping uses "sponsored_by" but form uses "sponsered"
        if (fields.name_of_activity) setValue("name_of_activity", String(fields.name_of_activity))
        if (fields.names || fields.nature) setValue("names", String(fields.names || fields.nature))
        if (fields.level) setValue("level", String(fields.level))
        if (fields.sponsered || fields.sponsored_by) setValue("sponsered", String(fields.sponsered || fields.sponsored_by))
        if (fields.place) setValue("place", String(fields.place))
        if (fields.date) setValue("date", String(fields.date))
        if (fields.Image) setValue("Image", String(fields.Image))
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
        formType: shouldProvideFormType,
        category,
        subCategory,
        matchesTab,
        hasData: hasAutoFillData,
        dataFieldsCount: Object.keys(autoFillDataFields || {}).length,
        documentUrl: autoFillDocumentUrl ? "present" : "missing"
      })
    }
  }, [hasAutoFillData, documentData, activeTab, shouldProvideFormType, autoFillDataFields, autoFillDocumentUrl])

  // Handle document URL from auto-fill context - TAB BOUNDED with CLEAR on mismatch
  // Consolidated logic: Always clear when switching tabs, then set only if matches
  useEffect(() => {
    const previousTab = prevActiveTabRef.current
    prevActiveTabRef.current = activeTab // Update ref for next render

    // Step 1: Always clear document URL when switching tabs (to prevent overlap)
    if (previousTab && previousTab !== activeTab) {
      setValue("Image", "")
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
        // Set document tab tracker
        setDocumentTab(activeTab)
        
        // Set document URL for matching tab
        setValue("Image", autoFillDocumentUrl)
      } else {
        // Document doesn't match current tab - ensure it's cleared
        if (documentTab === activeTab) {
          setDocumentTab(null)
        }
        // Make sure document URL is cleared for non-matching tabs
        const currentDocUrl = watch("Image")
        if (currentDocUrl && currentDocUrl === autoFillDocumentUrl) {
          setValue("Image", "")
        }
      }
    }
  }, [activeTab, documentTab, autoFillDocumentUrl, hasAutoFillData, documentData, setValue, watch])

  // Handle URL tab parameter on component mount
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["performance", "awards", "extension"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Reset form when tab changes (but preserve auto-filled data if document matches)
  useEffect(() => {
    // Check if we have auto-filled data for the new tab
    const hasAutoFillForTab = hasAutoFillData && documentData && (() => {
      const category = documentData.category || documentData.analysis?.classification?.category || ""
      const subCategory = documentData.subCategory || documentData.analysis?.classification?.["sub-category"] || ""
      return doesDocumentMatchTab(activeTab, category, subCategory)
    })()

    // Only reset if we don't have auto-fill data for this tab
    // This prevents clearing auto-filled data when switching to the matching tab
    if (!hasAutoFillForTab) {
      form.reset({
        name: "",
        place: "",
        date: "",
        perf_nature: "",
        details: "",
        organization: "",
        address: "",
        date_of_award: "",
        level: undefined,
        name_of_activity: "",
        names: "",
        sponsered: undefined,
        Image: "",
      })
      setExtractionError(null)
      setExtractionSuccess(null)
      // Clear form errors
      form.clearErrors()
    } else {
      // Just clear errors and extraction status, but keep form data
      setExtractionError(null)
      setExtractionSuccess(null)
      form.clearErrors()
    }
  }, [activeTab, hasAutoFillData, documentData])

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

          // Update the appropriate form state based on the tab using form.setValue
          if (tab === "performance") {
            const currentValues = form.getValues()
            form.setValue("name", data.titleOfPerformance || data.title || data.performanceTitle || currentValues.name || "")
            form.setValue("place", data.place || data.venue || data.location || currentValues.place || "")
            form.setValue("date", data.performanceDate || data.date || data.eventDate || currentValues.date || "")
            form.setValue("perf_nature", data.natureOfPerformance || data.nature || data.performanceType || data.type || currentValues.perf_nature || "")
            setExtractionStatus((prev) => ({ ...prev, performance: true }))
          } else if (tab === "awards") {
            const currentValues = form.getValues()
            form.setValue("name", data.nameOfAwardFellowship || data.name || data.awardName || data.title || currentValues.name || "")
            form.setValue("details", data.details || data.description || data.summary || currentValues.details || "")
            form.setValue("organization", data.nameOfAwardingAgency || data.agency || data.awardingBody || data.awardingAgency || data.organization || currentValues.organization || "")
            form.setValue("address", data.addressOfAwardingAgency || data.agencyAddress || data.address || data.organizationAddress || currentValues.address || "")
            form.setValue("date_of_award", data.dateOfAward || data.date || data.dateReceived || data.awardDate || data.dateAwarded || currentValues.date_of_award || "")
            // For level, we need to find the matching option ID from awardFellowLevelOptions
            if (data.level || data.scope) {
              const levelName = data.level || data.scope
              const levelOption = awardFellowLevelOptions.find(opt => 
                opt.name.toLowerCase().includes(levelName.toLowerCase()) || 
                levelName.toLowerCase().includes(opt.name.toLowerCase())
              )
              if (levelOption) {
                form.setValue("level", levelOption.id)
              }
            }
            setExtractionStatus((prev) => ({ ...prev, awards: true }))
          } else if (tab === "extension") {
            const currentValues = form.getValues()
            form.setValue("name_of_activity", data.nameOfActivity || data.name || data.activityName || data.title || currentValues.name_of_activity || "")
            form.setValue("names", data.natureOfActivity || data.nature || data.activityType || data.type || currentValues.names || "")
            form.setValue("place", data.place || data.venue || data.location || currentValues.place || "")
            form.setValue("date", data.date || data.activityDate || data.eventDate || currentValues.date || "")
            // For level, we need to find the matching option ID from awardFellowLevelOptions
            if (data.level || data.scope) {
              const levelName = data.level || data.scope
              const levelOption = awardFellowLevelOptions.find(opt => 
                opt.name.toLowerCase().includes(levelName.toLowerCase()) || 
                levelName.toLowerCase().includes(opt.name.toLowerCase())
              )
              if (levelOption) {
                form.setValue("level", levelOption.id)
              }
            }
            // For sponsered, we need to find the matching option ID from sponserNameOptions
            if (data.sponsoredBy || data.sponsor || data.organizingBody || data.organizer) {
              const sponsorName = data.sponsoredBy || data.sponsor || data.organizingBody || data.organizer
              const sponsorOption = sponserNameOptions.find(opt => 
                opt.name.toLowerCase().includes(sponsorName.toLowerCase()) || 
                sponsorName.toLowerCase().includes(opt.name.toLowerCase())
              )
              if (sponsorOption) {
                form.setValue("sponsered", sponsorOption.id)
              }
            }
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
    [toast, uploadedFiles, awardFellowLevelOptions, sponserNameOptions, form],
  )

  // Helper function to upload document to S3 (matches research module pattern)
  const uploadDocumentToS3 = async (documentUrl: string | undefined): Promise<string> => {
    if (!documentUrl) {
      return "http://localhost:3000/assets/demo_document.pdf"
    }

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl.startsWith("/uploaded-document/")) {
      // Extract fileName from local URL
      const fileName = documentUrl.split("/").pop()
      
      if (!fileName) {
        throw new Error("Invalid file name")
      }

      // Upload to S3 using the file in /public/uploaded-document/
      const s3Response = await fetch("/api/shared/s3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileName,
        }),
      })

      if (!s3Response.ok) {
        const s3Error = await s3Response.json()
        throw new Error(s3Error.error || "Failed to upload document to S3")
      }

      const s3Data = await s3Response.json()
      const s3Url = s3Data.url // Use S3 URL for database storage

      // Delete local file after successful S3 upload
      await fetch("/api/shared/local-document-upload", {
        method: "DELETE",
      })

      return s3Url
    }

    // If it's already an S3 URL or external URL, return as is
    return documentUrl
  }

  // Form handlers
  const handlePerformanceSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3 if a document exists (matches research module pattern)
      let docUrl = data.Image || null
      
      if (docUrl && docUrl.startsWith("/uploaded-document/")) {
        try {
          docUrl = await uploadDocumentToS3(docUrl)
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          return // Stop submission if S3 upload fails (matches research pattern)
        }
      }

      const payload = {
        name: data.name,
        place: data.place,
        date: data.date,
        perf_nature: data.perf_nature,
        Image: docUrl,
      }

      await performanceMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setUploadedFiles((prev) => ({ ...prev, performance: null }))
      setExtractionStatus((prev) => ({ ...prev, performance: false }))

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=performance")
      }, 1000)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleAwardSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3 if a document exists (matches research module pattern)
      let docUrl = data.Image || null
      
      if (docUrl && docUrl.startsWith("/uploaded-document/")) {
        try {
          docUrl = await uploadDocumentToS3(docUrl)
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          return // Stop submission if S3 upload fails (matches research pattern)
        }
      }

      const payload = {
        name: data.name,
        details: data.details || "",
        organization: data.organization,
        address: data.address || "",
        date_of_award: data.date_of_award,
        level: data.level,
        Image: docUrl,
      }

      await awardsMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setUploadedFiles((prev) => ({ ...prev, awards: null }))
      setExtractionStatus((prev) => ({ ...prev, awards: false }))

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=awards")
      }, 1000)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleExtensionSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle document upload to S3 if a document exists (matches research module pattern)
      let docUrl = data.Image || null
      
      if (docUrl && docUrl.startsWith("/uploaded-document/")) {
        try {
          docUrl = await uploadDocumentToS3(docUrl)
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          return // Stop submission if S3 upload fails (matches research pattern)
        }
      }

      const payload = {
        names: data.names,
        place: data.place,
        date: data.date,
        name_of_activity: data.name_of_activity,
        sponsered: data.sponsered,
        level: data.level,
        Image: docUrl,
      }

      await extensionMutations.createMutation.mutateAsync(payload)

      // Reset form
      form.reset()
      setUploadedFiles((prev) => ({ ...prev, extension: null }))
      setExtractionStatus((prev) => ({ ...prev, extension: false }))

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=extension")
      }, 1000)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const file = e.target.files?.[0] || null

    // Update uploaded files state
    setUploadedFiles((prev) => ({
      ...prev,
      [section]: file,
    }))

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

  return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" onClick={() => router.back()} className="text-xs sm:text-sm w-full sm:w-auto">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Awards & Recognition</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Add Awards & Recognition</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="border-b mb-4">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              <TabsList className="flex flex-wrap min-w-max w-full sm:w-auto">
                <TabsTrigger value="performance" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Performance</span>
                  <span className="sm:hidden">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="awards" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden lg:inline">Awards/Fellowship/Recognition</span>
                  <span className="hidden sm:inline lg:hidden">Awards/Fellowship/Recognition</span>
                  <span className="sm:hidden">Awards/Fellowship/Recognition</span>
                </TabsTrigger>
                <TabsTrigger value="extension" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Extension</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Performance by Individual/Group
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceTeacherForm
                  form={form}
                  onSubmit={handlePerformanceSubmit}
                  isSubmitting={isSubmitting}
                  isExtracting={isExtracting}
                  selectedFiles={uploadedFiles.performance ? (() => {
                    const dt = new DataTransfer()
                    dt.items.add(uploadedFiles.performance!)
                    return dt.files
                  })() : null}
                  handleFileSelect={(files) => {
                    if (files && files.length > 0) {
                      handleFileUpload({ target: { files } } as any, "performance")
                    }
                  }}
                  handleExtractInfo={() => handleExtractInformation("performance")}
                  isEdit={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Awards/Fellowship/Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AwardsFellowshipForm
                  form={form}
                  onSubmit={handleAwardSubmit}
                  isSubmitting={isSubmitting}
                  isExtracting={isExtracting}
                  selectedFiles={uploadedFiles.awards ? (() => {
                    const dt = new DataTransfer()
                    dt.items.add(uploadedFiles.awards!)
                    return dt.files
                  })() : null}
                  handleFileSelect={(files) => {
                    if (files && files.length > 0) {
                      handleFileUpload({ target: { files } } as any, "awards")
                    }
                  }}
                  handleExtractInfo={() => handleExtractInformation("awards")}
                  isEdit={false}
                  awardFellowLevelOptions={awardFellowLevelOptions}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extension Activities Tab */}
          <TabsContent value="extension">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Extension
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExtensionActivityForm
                  form={form}
                  onSubmit={handleExtensionSubmit}
                  isSubmitting={isSubmitting}
                  isExtracting={isExtracting}
                  selectedFiles={uploadedFiles.extension ? (() => {
                    const dt = new DataTransfer()
                    dt.items.add(uploadedFiles.extension!)
                    return dt.files
                  })() : null}
                  handleFileSelect={(files: FileList | null) => {
                    if (files && files.length > 0) {
                      handleFileUpload({ target: { files } } as any, "extension")
                    }
                  }}
                  handleExtractInfo={() => handleExtractInformation("extension")}
                  isEdit={false}
                  awardFellowLevelOptions={awardFellowLevelOptions}
                  sponserNameOptions={sponserNameOptions}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
