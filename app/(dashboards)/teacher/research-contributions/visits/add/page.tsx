"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { AcademicVisitForm } from "@/components/forms/AcademicVisitForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useVisitMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddVisitsPage() {
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
  const { academicVisitRoleOptions } = useDropDowns()
  
  // Use mutation for creating visit
  const { create: createVisit } = useVisitMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "visits", // Explicit form type
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: instituteVisited, durationOfVisit, role, sponsoredBy, remarks, date
      
      // Institute Visited - form field is "instituteVisited"
      if (fields.instituteVisited) {
        setValue("instituteVisited", String(fields.instituteVisited))
        filledFieldNames.push("instituteVisited")
      } else if (fields.institute) {
        // Fallback if mapping didn't work
        setValue("instituteVisited", String(fields.institute))
        filledFieldNames.push("instituteVisited")
      }
      
      // Duration of Visit - form field is "durationOfVisit"
      if (fields.durationOfVisit !== undefined && fields.durationOfVisit !== null) {
        const durationValue = typeof fields.durationOfVisit === 'number' 
          ? fields.durationOfVisit 
          : Number(String(fields.durationOfVisit).replace(/[^0-9.]/g, ''))
        if (!isNaN(durationValue)) {
          setValue("durationOfVisit", durationValue)
          filledFieldNames.push("durationOfVisit")
        }
      } else if (fields.duration !== undefined && fields.duration !== null) {
        // Fallback if mapping didn't work
        const durationValue = typeof fields.duration === 'number' 
          ? fields.duration 
          : Number(String(fields.duration).replace(/[^0-9.]/g, ''))
        if (!isNaN(durationValue)) {
          setValue("durationOfVisit", durationValue)
          filledFieldNames.push("durationOfVisit")
        }
      }
      
      // Role - only highlight if a valid option was found and set
      if (fields.role !== undefined && fields.role !== null) {
        let roleValue: number | null = null
        
        if (typeof fields.role === 'number') {
          // Check if the number matches an option ID
          if (academicVisitRoleOptions.some(opt => opt.id === fields.role)) {
            roleValue = fields.role
          }
        } else {
          // Try to find matching option by name
          const roleOption = academicVisitRoleOptions.find(
            opt => opt.name.toLowerCase() === String(fields.role).toLowerCase()
          )
          if (roleOption) {
            roleValue = roleOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.role)
            if (!isNaN(numValue) && academicVisitRoleOptions.some(opt => opt.id === numValue)) {
              roleValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (roleValue !== null && academicVisitRoleOptions.some(opt => opt.id === roleValue)) {
          setValue("role", roleValue, { shouldValidate: true })
          filledFieldNames.push("role")
        }
      }
      
      // Sponsored By - form field is "sponsoredBy"
      if (fields.sponsoredBy) {
        setValue("sponsoredBy", String(fields.sponsoredBy))
        filledFieldNames.push("sponsoredBy")
      } else if (fields.sponsored_by) {
        // Fallback if mapping didn't work
        setValue("sponsoredBy", String(fields.sponsored_by))
        filledFieldNames.push("sponsoredBy")
      }
      
      // Remarks
      if (fields.remarks) {
        setValue("remarks", String(fields.remarks))
        filledFieldNames.push("remarks")
      }
      
      // Date
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
    redirectPath: "/teacher/research-contributions?tab=visits",
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
              "Acad_ResearchVisit"
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
      const visitData = {
        Institute_visited: data.instituteVisited,
        duration: data.durationOfVisit ? Number(data.durationOfVisit) : null,
        role: data.role ? Number(data.role) : null,
        Sponsored_by: data.sponsoredBy || null,
        remarks: data.remarks || null,
        date: data.date || null,
        doc: docUrl,
      }

      // Use mutation to create visit
      createVisit.mutate(visitData, {
        onSuccess: () => {
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=visits")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createVisit.isPending) {
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
            <span className="hidden sm:inline">Back to </span>Academic / Research Visits
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Academic/Research Visit</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about your academic or research visits to other institutions
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Visit Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
          <AcademicVisitForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || createVisit.isPending}
            isEdit={false}
            academicVisitRoleOptions={academicVisitRoleOptions}
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
