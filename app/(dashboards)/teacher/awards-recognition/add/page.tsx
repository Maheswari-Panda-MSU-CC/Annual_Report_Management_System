"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Award, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
  const getDropdownOptionsForTab = (tab: string): { [fieldName: string]: Array<{ id: number; name: string }> } => {
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


  // Helper function to upload document to S3 (matches research module pattern)
  const handleDocumentUpload = async (documentUrl: string | undefined): Promise<string> => {
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

      const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
      
      const tempRecordId = Date.now()
      
      const s3Url = await uploadDocumentToS3(
        documentUrl,
        user?.role_id || 0,
        tempRecordId,
        "award"
      )

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
      // Validate document upload is required
      if (!data.Image) {
        toast({
          title: "Validation Error",
          description: "Please upload a supporting document",
          variant: "destructive",
        })
        return
      }

      // Handle document upload to S3 - only upload if it's a new document
      let docUrl = data.Image
      
      // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
      if (data.Image && data.Image.startsWith("/uploaded-document/")) {
        try {
          const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
          
          // For new records, use a temporary record ID (will be replaced with actual ID after DB insert)
          const tempRecordId = Date.now()
          
          // Upload new document to S3 with folder name "Performance"
          docUrl = await uploadDocumentToS3(
            data.Image,
            user?.role_id || 0,
            tempRecordId,
            "Performance"
          )
          
          // CRITICAL: Verify we got a valid S3 virtual path (not dummy URL)
          if (!docUrl || !docUrl.startsWith("upload/")) {
            throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
          }
          
          // Additional validation: Ensure it's not a dummy URL
          if (docUrl.includes("dummy_document") || docUrl.includes("localhost") || docUrl.includes("http://") || docUrl.includes("https://")) {
            throw new Error("S3 upload failed: Document was not uploaded successfully. Please try again.")
          }
          
          toast({
            title: "Document Uploaded",
            description: "Document uploaded to S3 successfully",
            duration: 3000,
          })
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document to S3. Record will not be saved.",
            variant: "destructive",
          })
          return // CRITICAL: Prevent record from being created
        }
      } else if (data.Image && !data.Image.startsWith("upload/") && !data.Image.startsWith("/uploaded-document/")) {
        // Invalid path format
        toast({
          title: "Invalid Document Path",
          description: "Document path format is invalid. Please upload the document again.",
          variant: "destructive",
        })
        return // Prevent record from being created
      }

      // CRITICAL: Final validation before saving - ensure we have a valid S3 path
      if (!docUrl || !docUrl.startsWith("upload/")) {
        toast({
          title: "Validation Error",
          description: "Document validation failed. Record will not be saved.",
          variant: "destructive",
        })
        return // Prevent record from being created
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
      // Validate document upload is required
      if (!data.Image) {
        toast({
          title: "Validation Error",
          description: "Please upload a supporting document",
          variant: "destructive",
        })
        return
      }

      // Handle document upload to S3 - only upload if it's a new document
      let docUrl = data.Image
      
      // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
      if (data.Image && data.Image.startsWith("/uploaded-document/")) {
        try {
          const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
          
          // For new records, use a temporary record ID (will be replaced with actual ID after DB insert)
          const tempRecordId = Date.now()
          
          // Upload new document to S3 with folder name "award"
          docUrl = await uploadDocumentToS3(
            data.Image,
            user?.role_id || 0,
            tempRecordId,
            "award"
          )
          
          // CRITICAL: Verify we got a valid S3 virtual path (not dummy URL)
          if (!docUrl || !docUrl.startsWith("upload/")) {
            throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
          }
          
          // Additional validation: Ensure it's not a dummy URL
          if (docUrl.includes("dummy_document") || docUrl.includes("localhost") || docUrl.includes("http://") || docUrl.includes("https://")) {
            throw new Error("S3 upload failed: Document was not uploaded successfully. Please try again.")
          }
          
          toast({
            title: "Document Uploaded",
            description: "Document uploaded to S3 successfully",
            duration: 3000,
          })
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document to S3. Record will not be saved.",
            variant: "destructive",
          })
          return // CRITICAL: Prevent record from being created
        }
      } else if (data.Image && !data.Image.startsWith("upload/") && !data.Image.startsWith("/uploaded-document/")) {
        // Invalid path format
        toast({
          title: "Invalid Document Path",
          description: "Document path format is invalid. Please upload the document again.",
          variant: "destructive",
        })
        return // Prevent record from being created
      }

      // CRITICAL: Final validation before saving - ensure we have a valid S3 path
      if (!docUrl || !docUrl.startsWith("upload/")) {
        toast({
          title: "Validation Error",
          description: "Document validation failed. Record will not be saved.",
          variant: "destructive",
        })
        return // Prevent record from being created
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
      // Validate document upload is required
      if (!data.Image) {
        toast({
          title: "Validation Error",
          description: "Please upload a supporting document",
          variant: "destructive",
        })
        return
      }

      // Handle document upload to S3 - only upload if it's a new document
      let docUrl = data.Image
      
      // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
      if (data.Image && data.Image.startsWith("/uploaded-document/")) {
        try {
          const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
          
          // For new records, use a temporary record ID (will be replaced with actual ID after DB insert)
          const tempRecordId = Date.now()
          
          // Upload new document to S3 with folder name "extension"
          docUrl = await uploadDocumentToS3(
            data.Image,
            user?.role_id || 0,
            tempRecordId,
            "extension"
          )
          
          // CRITICAL: Verify we got a valid S3 virtual path (not dummy URL)
          if (!docUrl || !docUrl.startsWith("upload/")) {
            throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
          }
          
          // Additional validation: Ensure it's not a dummy URL
          if (docUrl.includes("dummy_document") || docUrl.includes("localhost") || docUrl.includes("http://") || docUrl.includes("https://")) {
            throw new Error("S3 upload failed: Document was not uploaded successfully. Please try again.")
          }
          
          toast({
            title: "Document Uploaded",
            description: "Document uploaded to S3 successfully",
            duration: 3000,
          })
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document to S3. Record will not be saved.",
            variant: "destructive",
          })
          return // CRITICAL: Prevent record from being created
        }
      } else if (data.Image && !data.Image.startsWith("upload/") && !data.Image.startsWith("/uploaded-document/")) {
        // Invalid path format
        toast({
          title: "Invalid Document Path",
          description: "Document path format is invalid. Please upload the document again.",
          variant: "destructive",
        })
        return // Prevent record from being created
      }

      // CRITICAL: Final validation before saving - ensure we have a valid S3 path
      if (!docUrl || !docUrl.startsWith("upload/")) {
        toast({
          title: "Validation Error",
          description: "Document validation failed. Record will not be saved.",
          variant: "destructive",
        })
        return // Prevent record from being created
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
      setAutoFilledFields(new Set())

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=extension")
      }, 1000)
    } catch (error) {
      // Error handling is done in the mutation hook
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
