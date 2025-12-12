"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"

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
  
  // Initialize activeTab from URL parameter, default to "performance"
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab")
    return (tab && ["performance", "awards", "extension"].includes(tab)) ? tab : "performance"
  })
  
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null)
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())
  const form = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const { watch, setValue } = form
  const prevActiveTabRef = useRef<string>(activeTab)

  // Helper functions for auto-fill highlighting
  const isAutoFilled = useCallback((fieldName: string): boolean => {
    return autoFilledFields.has(fieldName)
  }, [autoFilledFields])

  const clearAutoFillHighlight = useCallback((fieldName: string) => {
    setAutoFilledFields((prev) => {
      const newSet = new Set(prev)
      newSet.delete(fieldName)
      return newSet
    })
  }, [])

  // Mutation hooks
  const performanceMutations = usePerformanceMutations()
  const awardsMutations = useAwardsMutations()
  const extensionMutations = useExtensionMutations()

  // Derive submitting state from mutations
  const isSubmitting = performanceMutations.createMutation.isPending || 
                       awardsMutations.createMutation.isPending || 
                       extensionMutations.createMutation.isPending
  
  // Fetch dropdowns
  const { 
    awardFellowLevelOptions,
    sponserNameOptions
  } = useDropDowns()

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

  // Get document data from context
  const { documentData, clearDocumentData, hasDocumentData } = useDocumentAnalysis()

  // Use auto-fill hook - formType is same as activeTab
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: activeTab, // formType = activeTab (performance/awards/extension)
    dropdownOptions: getDropdownOptionsForTab(activeTab),
    onlyFillEmpty: true,
    getFormValues: () => watch(),
    onAutoFill: (fields) => {
      setAutoFilledFields(new Set()) // Clear previous highlighting
      const filledFieldNames: string[] = []
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
      Object.entries(fields).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return

        let isValid = false
        let actualFieldName = key

        switch (activeTab) {
          case "performance":
            // All fields are text inputs
            setValue(key, String(value))
            isValid = true
            break

          case "awards":
            if (key === "level" && dropdownOptions.level) {
              isValid = validateAndSetDropdown("level", value, dropdownOptions.level)
            } else {
              // Text fields
              setValue(key, String(value))
              isValid = true
            }
            break

          case "extension":
            if (key === "level" && dropdownOptions.level) {
              isValid = validateAndSetDropdown("level", value, dropdownOptions.level)
            } else if (key === "sponsered" && dropdownOptions.sponsered) {
              isValid = validateAndSetDropdown("sponsered", value, dropdownOptions.sponsered)
            } else {
              // Text fields
              setValue(key, String(value))
              isValid = true
            }
            break

          default:
            setValue(key, String(value))
            isValid = true
            break
        }

        if (isValid) {
          filledFieldNames.push(actualFieldName)
        }
      })

      // Update auto-filled fields set
      if (filledFieldNames.length > 0) {
        setAutoFilledFields(new Set(filledFieldNames))
        toast({
          title: "Form Updated",
          description: `${filledFieldNames.length} field(s) replaced with new extracted data`,
        })
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
    redirectPath: "/teacher/awards-recognition",
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
    // Also clear document URL from form state
    setValue("Image", "")
    setAutoFilledFields(new Set())
  }

  // Get section title for current tab
  const getSectionTitle = (tab: string): string => {
    switch (tab) {
      case "performance":
        return "Performance by Individual/Group"
      case "awards":
        return "Awards/Fellowship/Recognition"
      case "extension":
        return "Extension"
      default:
        return "Awards & Recognition"
    }
  }

  // Get section icon for current tab
  const getSectionIcon = (tab: string) => {
    switch (tab) {
      case "performance":
        return <FileText className="h-5 w-5" />
      case "awards":
        return <Award className="h-5 w-5" />
      case "extension":
        return <Users className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  // Handle URL tab parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["performance", "awards", "extension"].includes(tab) && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams, activeTab])

  // Handle document URL - set when document matches current tab
  useEffect(() => {
    const previousTab = prevActiveTabRef.current
    prevActiveTabRef.current = activeTab

    // Clear document URL when switching tabs
    if (previousTab && previousTab !== activeTab) {
      setValue("Image", "")
    }

    // Set document URL if available and matches current tab
    if (autoFillDocumentUrl && hasAutoFillData) {
      setValue("Image", autoFillDocumentUrl)
    }
  }, [activeTab, autoFillDocumentUrl, hasAutoFillData, setValue])

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
      // DocumentUpload component handles file presence check internally
      // No need to check here - it will show error if no file

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
      setAutoFilledFields(new Set())

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
      setAutoFilledFields(new Set())

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
      setAutoFilledFields(new Set())

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
      <>
        {NavigationDialog && <NavigationDialog />}
        {CancelDialog && <CancelDialog />}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Button variant="outline" onClick={handleCancel} className="text-xs sm:text-sm w-full sm:w-auto">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Awards & Recognition</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Add Awards & Recognition</h1>
            </div>
          </div>

        <Tabs value={activeTab} className="space-y-4 sm:space-y-6">

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
                  onClearFields={handleClearFields}
                  onCancel={handleCancel}
                  isAutoFilled={isAutoFilled}
                  onFieldChange={clearAutoFillHighlight}
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
                  onClearFields={handleClearFields}
                  onCancel={handleCancel}
                  isAutoFilled={isAutoFilled}
                  onFieldChange={clearAutoFillHighlight}
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
