"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
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
  const [isExtracting, setIsExtracting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()
  const { setValue, watch, reset } = form

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
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: nameOfSupport, type, supportingAgency, grantReceived, detailsOfEvent, purposeOfGrant, date
      
      // Name of Support - form field is "nameOfSupport"
      if (fields.nameOfSupport) {
        setValue("nameOfSupport", String(fields.nameOfSupport))
      } else if (fields.title) {
        // Fallback if mapping didn't work
        setValue("nameOfSupport", String(fields.title))
      }
      
      // Type - this should already be matched to dropdown ID by the hook
      if (fields.type !== undefined && fields.type !== null) {
        if (typeof fields.type === 'number') {
          setValue("type", fields.type)
        } else {
          // If it's a string, try to find matching option
          const typeOption = financialSupportTypeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.type).toLowerCase()
          )
          if (typeOption) {
            setValue("type", typeOption.id)
          } else {
            const numValue = Number(fields.type)
            if (!isNaN(numValue)) {
              setValue("type", numValue)
            }
          }
        }
      }
      
      // Supporting Agency - form field is "supportingAgency"
      if (fields.supportingAgency) {
        setValue("supportingAgency", String(fields.supportingAgency))
      } else if (fields.agency) {
        // Fallback if mapping didn't work
        setValue("supportingAgency", String(fields.agency))
      }
      
      // Grant Received - form field is "grantReceived"
      // Handle comma-separated numbers like "15,000"
      if (fields.grantReceived !== undefined && fields.grantReceived !== null) {
        const grantValue = String(fields.grantReceived).replace(/,/g, '').trim()
        const numValue = Number(grantValue)
        if (!isNaN(numValue)) {
          setValue("grantReceived", numValue)
        } else if (grantValue) {
          setValue("grantReceived", grantValue)
        }
      } else if (fields.amount !== undefined && fields.amount !== null) {
        // Fallback if mapping didn't work
        const grantValue = String(fields.amount).replace(/,/g, '').trim()
        const numValue = Number(grantValue)
        if (!isNaN(numValue)) {
          setValue("grantReceived", numValue)
        }
      }
      
      // Details of Event - form field is "detailsOfEvent"
      if (fields.detailsOfEvent) {
        setValue("detailsOfEvent", String(fields.detailsOfEvent))
      } else if (fields.event_details) {
        // Fallback if mapping didn't work
        setValue("detailsOfEvent", String(fields.event_details))
      }
      
      // Purpose of Grant - form field is "purposeOfGrant"
      if (fields.purposeOfGrant) {
        setValue("purposeOfGrant", String(fields.purposeOfGrant))
      } else if (fields.purpose) {
        // Fallback if mapping didn't work
        setValue("purposeOfGrant", String(fields.purpose))
      }
      
      // Date - form field is "date"
      if (fields.date) {
        setValue("date", String(fields.date))
      }
      
      // Show toast notification
      const filledCount = Object.keys(fields).filter(
        k => fields[k] !== null && fields[k] !== undefined && fields[k] !== ""
      ).length
      if (filledCount > 0) {
        toast({
          title: "Form Auto-filled",
          description: `Populated ${filledCount} field(s) from document analysis.`,
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
  }

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "financial" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "financial" }),
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
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExtracting(false)
    }
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
            docUrl = s3Data.url // Use S3 URL for database storage

            // Delete local file after successful S3 upload
            await fetch("/api/shared/local-document-upload", {
              method: "DELETE",
            })
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
              isExtracting={isExtracting}
              selectedFiles={null}
              handleFileSelect={() => {}}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
              financialSupportTypeOptions={financialSupportTypeOptions}
              initialDocumentUrl={autoFillDocumentUrl}
              onClearFields={handleClearFields}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
