"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect,useCallback } from "react"
import { useForm } from "react-hook-form"
import { PatentForm } from "@/components/forms/PatentForm"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { usePatentMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddPatentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const form = useForm()
  const { setValue, watch, reset } = form
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  
  // Document analysis context
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  
  // Dropdowns - already available from Context, no need to fetch
  const { resPubLevelOptions, patentStatusOptions } = useDropDowns()
  
  // Use mutation for creating patent
  const { create: createPatent } = usePatentMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "patents", // Explicit form type
    dropdownOptions: {
      level: resPubLevelOptions,
      status: patentStatusOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only fields that were successfully set)
      const filledFieldNames: string[] = []
      
      // Helper function to check if a dropdown value matches an option
      const isValidDropdownValue = (value: number | string, options: Array<{ id: number; name: string }>): boolean => {
        if (typeof value === 'number') {
          return options.some(opt => opt.id === value)
        }
        return false
      }
      
      // Auto-fill form fields from document analysis
      if (fields.title) {
        setValue("title", String(fields.title))
        filledFieldNames.push("title")
      }
      
      // Level - only highlight if a valid option was found and set
      if (fields.level !== undefined && fields.level !== null) {
        let levelValue: number | null = null
        
        if (typeof fields.level === 'number') {
          if (isValidDropdownValue(fields.level, resPubLevelOptions)) {
            levelValue = fields.level
          }
        } else {
          // Try to find matching option by name
          const levelOption = resPubLevelOptions.find(
            opt => opt.name.toLowerCase() === String(fields.level).toLowerCase()
          )
          if (levelOption) {
            levelValue = levelOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.level)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, resPubLevelOptions)) {
              levelValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (levelValue !== null && resPubLevelOptions.some(opt => opt.id === levelValue)) {
          setValue("level", levelValue, { shouldValidate: true })
          filledFieldNames.push("level")
        }
      }
      
      // Status - only highlight if a valid option was found and set
      if (fields.status !== undefined && fields.status !== null) {
        let statusValue: number | null = null
        
        if (typeof fields.status === 'number') {
          if (isValidDropdownValue(fields.status, patentStatusOptions)) {
            statusValue = fields.status
          }
        } else {
          // Try to find matching option by name
          const statusOption = patentStatusOptions.find(
            opt => opt.name.toLowerCase() === String(fields.status).toLowerCase()
          )
          if (statusOption) {
            statusValue = statusOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.status)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, patentStatusOptions)) {
              statusValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (statusValue !== null && patentStatusOptions.some(opt => opt.id === statusValue)) {
          setValue("status", statusValue, { shouldValidate: true })
          filledFieldNames.push("status")
        }
      }
      
      if (fields.date) {
        setValue("date", String(fields.date))
        filledFieldNames.push("date")
      }
      if (fields.transfer_of_technology) {
        setValue("Tech_Licence", String(fields.transfer_of_technology))
        filledFieldNames.push("Tech_Licence")
      }
      if (fields.earning_generated !== undefined && fields.earning_generated !== null) {
        const earningValue = Number(fields.earning_generated)
        if (!isNaN(earningValue) && earningValue >= 0) {
          setValue("Earnings_Generate", earningValue)
          filledFieldNames.push("Earnings_Generate")
        }
      }
      if (fields.PatentApplicationNo) {
        setValue("PatentApplicationNo", String(fields.PatentApplicationNo))
        filledFieldNames.push("PatentApplicationNo")
      }
      
      // Update auto-filled fields set (only fields that were actually set)
      if (filledFieldNames.length > 0) {
        setAutoFilledFields(new Set(filledFieldNames))
      }
      
      // Show toast notification with actual count of filled fields
      if (filledFieldNames.length > 0) {
        toast({
          title: "Form Auto-filled",
          description: `Populated ${filledFieldNames.length} field(s) from document analysis.`,
        })
      }
    },
    clearAfterUse: false, // Keep data for manual editing
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
    redirectPath: "/teacher/research-contributions?tab=patents",
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
    reset()
    setAutoFilledFields(new Set())
  }

  const handleSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User information not available. Please refresh the page.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Validate document upload is required
    const documentUrl = Array.isArray(data.supportingDocument) && data.supportingDocument.length > 0 
      ? data.supportingDocument[0] 
      : null

    if (!documentUrl) {
      toast({
        title: "Error",
        description: "Please upload a supporting document.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    
    // Note: Error handling is done in mutation's onError callback
    try {
      // Handle document upload to S3 if a new document was uploaded
      let docUrl = documentUrl

      // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
      if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
        try {
          // Extract fileName from local URL
          const fileName = documentUrl.split("/").pop()
          
          if (fileName) {
            const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
            
            const tempRecordId = Date.now()
            
            docUrl = await uploadDocumentToS3(
              documentUrl,
              user?.role_id||0,
              tempRecordId,
              "patents"
            )
          }
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      const patentData = {
        title: data.title,
        level: data.level,
        status: data.status,
        date: data.date,
        Tech_Licence: data.Tech_Licence || "",
        Earnings_Generate: data.Earnings_Generate ? Number(data.Earnings_Generate) : null,
        PatentApplicationNo: data.PatentApplicationNo || "",
        doc: docUrl,
      }

      // Use mutation to create patent
      createPatent.mutate(patentData, {
        onSuccess: () => {
          // Smooth transition with slight delay
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=patents")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createPatent.isPending) {
        setIsSubmitting(false)
        form.reset()
      }
    }
  }

  return (
    <>
      <NavigationDialog />
      <CancelDialog />
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to </span>Patents
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Patent</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about your academic or research patents with details
          </p>
        </div>

        <PatentForm
          form={form}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting || createPatent.isPending}
          isEdit={false}
          resPubLevelOptions={resPubLevelOptions}
          patentStatusOptions={patentStatusOptions}
          initialDocumentUrl={autoFillDocumentUrl}
          onClearFields={handleClearFields}
          onCancel={handleCancel}
          isAutoFilled={isAutoFilled}
          onFieldChange={clearAutoFillHighlight}
        />
      </div>
    </>
  );
}
