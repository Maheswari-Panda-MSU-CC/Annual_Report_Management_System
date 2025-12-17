"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { FinancialForm } from "@/components/forms/FinancialFom"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useFinancialMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddFinancialPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm()
  const { setValue, watch, reset } = form

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
  const { financialSupportTypeOptions } = useDropDowns()
  
  // Use mutation for creating financial support
  const { create: createFinancial } = useFinancialMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "financial", // Explicit form type
    dropdownOptions: {
      type: financialSupportTypeOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: nameOfSupport, type, supportingAgency, grantReceived, detailsOfEvent, purposeOfGrant, date
      
      // Name of Support - form field is "nameOfSupport"
      if (fields.nameOfSupport) {
        setValue("nameOfSupport", String(fields.nameOfSupport))
        filledFieldNames.push("nameOfSupport")
      } else if (fields.title) {
        // Fallback if mapping didn't work
        setValue("nameOfSupport", String(fields.title))
        filledFieldNames.push("nameOfSupport")
      }
      
      // Type - only highlight if a valid option was found and set
      if (fields.type !== undefined && fields.type !== null) {
        let typeValue: number | null = null
        
        if (typeof fields.type === 'number') {
          // Check if the number matches an option ID
          if (financialSupportTypeOptions.some(opt => opt.id === fields.type)) {
            typeValue = fields.type
          }
        } else {
          // Try to find matching option by name
          const typeOption = financialSupportTypeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.type).toLowerCase()
          )
          if (typeOption) {
            typeValue = typeOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.type)
            if (!isNaN(numValue) && financialSupportTypeOptions.some(opt => opt.id === numValue)) {
              typeValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (typeValue !== null && financialSupportTypeOptions.some(opt => opt.id === typeValue)) {
          setValue("type", typeValue, { shouldValidate: true })
          filledFieldNames.push("type")
        }
      }
      
      // Supporting Agency - form field is "supportingAgency"
      if (fields.supportingAgency) {
        setValue("supportingAgency", String(fields.supportingAgency))
        filledFieldNames.push("supportingAgency")
      } else if (fields.agency) {
        // Fallback if mapping didn't work
        setValue("supportingAgency", String(fields.agency))
        filledFieldNames.push("supportingAgency")
      }
      
      // Grant Received - validate it's a valid number
      if (fields.grantReceived !== undefined && fields.grantReceived !== null) {
        // Handle comma-separated numbers like "15,000"
        const grantValue = String(fields.grantReceived).replace(/,/g, '').trim()
        const numValue = Number(grantValue)
        if (!isNaN(numValue) && numValue >= 0) {
          setValue("grantReceived", numValue)
          filledFieldNames.push("grantReceived")
        }
      } else if (fields.amount !== undefined && fields.amount !== null) {
        // Fallback if mapping didn't work
        const grantValue = String(fields.amount).replace(/,/g, '').trim()
        const numValue = Number(grantValue)
        if (!isNaN(numValue) && numValue >= 0) {
          setValue("grantReceived", numValue)
          filledFieldNames.push("grantReceived")
        }
      }
      
      // Details of Event - form field is "detailsOfEvent"
      if (fields.detailsOfEvent) {
        setValue("detailsOfEvent", String(fields.detailsOfEvent))
        filledFieldNames.push("detailsOfEvent")
      } else if (fields.event_details) {
        // Fallback if mapping didn't work
        setValue("detailsOfEvent", String(fields.event_details))
        filledFieldNames.push("detailsOfEvent")
      }
      
      // Purpose of Grant - form field is "purposeOfGrant"
      if (fields.purposeOfGrant) {
        setValue("purposeOfGrant", String(fields.purposeOfGrant))
        filledFieldNames.push("purposeOfGrant")
      } else if (fields.purpose) {
        // Fallback if mapping didn't work
        setValue("purposeOfGrant", String(fields.purpose))
        filledFieldNames.push("purposeOfGrant")
      }
      
      // Date - form field is "date"
      if (fields.date) {
        setValue("date", String(fields.date))
        filledFieldNames.push("date")
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
    redirectPath: "/teacher/research-contributions?tab=financial",
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
              "Fin_Support"
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

      // Map form data to API format
      const financialSupportData = {
        name: data.nameOfSupport,
        type: data.type ? Number(data.type) : null,
        support: data.supportingAgency,
        grant_received: data.grantReceived ? Number(data.grantReceived) : null,
        details: data.detailsOfEvent || null,
        purpose: data.purposeOfGrant || null,
        date: data.date || null,
        doc: docUrl,
      }

      // Use mutation to create financial support
      createFinancial.mutate(financialSupportData, {
        onSuccess: () => {
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=financial")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createFinancial.isPending) {
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
            <span className="hidden sm:inline">Back to </span>Financial Support
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Financial Support</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about financial support received for academic or research activities
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Financial Support Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <FinancialForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting || createFinancial.isPending}
              isEdit={false}
              financialSupportTypeOptions={financialSupportTypeOptions}
              initialDocumentUrl={autoFillDocumentUrl}
              onClearFields={handleClearFields}
              onCancel={handleCancel}
              isAutoFilled={isAutoFilled}
              onFieldChange={clearAutoFillHighlight}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
