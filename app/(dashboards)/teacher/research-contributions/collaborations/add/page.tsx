
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { CollaborationForm } from "@/components/forms/CollaborationForm"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useCollaborationMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddCollaborationsPage() {
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
  const { 
    collaborationsLevelOptions, 
    collaborationsOutcomeOptions, 
    collaborationsTypeOptions,
  } = useDropDowns()
  
  // Use mutation for creating collaboration
  const { create: createCollaboration } = useCollaborationMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "collaborations", // Explicit form type
    dropdownOptions: {
      level: collaborationsLevelOptions,
      outcome: collaborationsOutcomeOptions,
      type: collaborationsTypeOptions,
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
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: category, collaboratingInstitute, collabName, collabRank, address, details, collabOutcome, status, startingDate, duration, level, noOfBeneficiary, mouSigned, signingDate
      
      // Category - only highlight if a valid option was found and set
      if (fields.category !== undefined && fields.category !== null) {
        let categoryValue: number | null = null
        
        if (typeof fields.category === 'number') {
          // Check if the number matches an option ID
          if (isValidDropdownValue(fields.category, collaborationsTypeOptions)) {
            categoryValue = fields.category
          }
        } else {
          // Try to find matching option by name
          const categoryOption = collaborationsTypeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.category).toLowerCase()
          )
          if (categoryOption) {
            categoryValue = categoryOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.category)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, collaborationsTypeOptions)) {
              categoryValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (categoryValue !== null && collaborationsTypeOptions.some(opt => opt.id === categoryValue)) {
          setValue("category", categoryValue, { shouldValidate: true })
          filledFieldNames.push("category")
        }
      }
      
      // Collaborating Institute - form field is "collaboratingInstitute"
      if (fields.collaboratingInstitute) {
        setValue("collaboratingInstitute", String(fields.collaboratingInstitute))
        filledFieldNames.push("collaboratingInstitute")
      } else if (fields.collaborating_inst) {
        // Fallback if mapping didn't work
        setValue("collaboratingInstitute", String(fields.collaborating_inst))
        filledFieldNames.push("collaboratingInstitute")
      }
      
      // Collaborator Name - form field is "collabName"
      if (fields.collabName) {
        setValue("collabName", String(fields.collabName))
        filledFieldNames.push("collabName")
      } else if (fields.collab_name) {
        // Fallback if mapping didn't work
        setValue("collabName", String(fields.collab_name))
        filledFieldNames.push("collabName")
      }
      
      // Collaborator Rank - form field is "collabRank"
      if (fields.collabRank) {
        setValue("collabRank", String(fields.collabRank))
        filledFieldNames.push("collabRank")
      } else if (fields.qs_ranking) {
        // Fallback if mapping didn't work
        setValue("collabRank", String(fields.qs_ranking))
        filledFieldNames.push("collabRank")
      }
      
      // Address
      if (fields.address) {
        setValue("address", String(fields.address))
        filledFieldNames.push("address")
      }
      
      // Details
      if (fields.details) {
        setValue("details", String(fields.details))
        filledFieldNames.push("details")
      }
      
      // Collaboration Outcome - only highlight if a valid option was found and set
      let outcomeSet = false
      if (fields.collabOutcome !== undefined && fields.collabOutcome !== null) {
        let outcomeValue: number | null = null
        
        if (typeof fields.collabOutcome === 'number') {
          // Check if the number matches an option ID
          if (isValidDropdownValue(fields.collabOutcome, collaborationsOutcomeOptions)) {
            outcomeValue = fields.collabOutcome
          }
        } else {
          // Try to find matching option by name
          const outcomeOption = collaborationsOutcomeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.collabOutcome).toLowerCase()
          )
          if (outcomeOption) {
            outcomeValue = outcomeOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.collabOutcome)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, collaborationsOutcomeOptions)) {
              outcomeValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (outcomeValue !== null && collaborationsOutcomeOptions.some(opt => opt.id === outcomeValue)) {
          setValue("collabOutcome", outcomeValue, { shouldValidate: true })
          filledFieldNames.push("collabOutcome")
          outcomeSet = true
        }
      }
      
      // Fallback for outcome field
      if (!outcomeSet && fields.outcome !== undefined && fields.outcome !== null) {
        let outcomeValue: number | null = null
        
        if (typeof fields.outcome === 'number') {
          if (isValidDropdownValue(fields.outcome, collaborationsOutcomeOptions)) {
            outcomeValue = fields.outcome
          }
        } else {
          const outcomeOption = collaborationsOutcomeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.outcome).toLowerCase()
          )
          if (outcomeOption) {
            outcomeValue = outcomeOption.id
          } else {
            const numValue = Number(fields.outcome)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, collaborationsOutcomeOptions)) {
              outcomeValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (outcomeValue !== null && collaborationsOutcomeOptions.some(opt => opt.id === outcomeValue)) {
          setValue("collabOutcome", outcomeValue, { shouldValidate: true })
          filledFieldNames.push("collabOutcome")
          outcomeSet = true
        }
      }
      
      // Status - only highlight if a valid status value
      const validStatuses = ["Active", "Ongoing", "Completed", "Pending", "Cancelled"]
      if (fields.status !== undefined && fields.status !== null) {
        let statusValue: string | null = null
        
        if (typeof fields.status === 'string') {
          if (validStatuses.includes(fields.status)) {
            statusValue = fields.status
          }
        } else {
          // If it's a number, try to convert to string and check
          const statusStr = String(fields.status)
          if (validStatuses.includes(statusStr)) {
            statusValue = statusStr
          }
        }
        
        if (statusValue !== null) {
          setValue("status", statusValue)
          filledFieldNames.push("status")
        }
      }
      
      // Starting Date - form field is "startingDate"
      if (fields.startingDate) {
        setValue("startingDate", String(fields.startingDate))
        filledFieldNames.push("startingDate")
      } else if (fields.starting_date) {
        // Fallback if mapping didn't work
        setValue("startingDate", String(fields.starting_date))
        filledFieldNames.push("startingDate")
      }
      
      // Duration
      if (fields.duration !== undefined && fields.duration !== null) {
        setValue("duration", Number(fields.duration))
        filledFieldNames.push("duration")
      }
      
      // Level - only highlight if a valid option was found and set
      if (fields.level !== undefined && fields.level !== null) {
        let levelValue: number | null = null
        
        if (typeof fields.level === 'number') {
          if (isValidDropdownValue(fields.level, collaborationsLevelOptions)) {
            levelValue = fields.level
          }
        } else {
          // Try to find matching option by name
          const levelOption = collaborationsLevelOptions.find(
            opt => opt.name.toLowerCase() === String(fields.level).toLowerCase()
          )
          if (levelOption) {
            levelValue = levelOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.level)
            if (!isNaN(numValue) && isValidDropdownValue(numValue, collaborationsLevelOptions)) {
              levelValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (levelValue !== null && collaborationsLevelOptions.some(opt => opt.id === levelValue)) {
          setValue("level", levelValue, { shouldValidate: true })
          filledFieldNames.push("level")
        }
      }
      
      // Number of Beneficiary - form field is "noOfBeneficiary"
      if (fields.noOfBeneficiary !== undefined && fields.noOfBeneficiary !== null) {
        setValue("noOfBeneficiary", Number(fields.noOfBeneficiary))
        filledFieldNames.push("noOfBeneficiary")
      } else if (fields.beneficiary_num !== undefined && fields.beneficiary_num !== null) {
        // Fallback if mapping didn't work
        setValue("noOfBeneficiary", Number(fields.beneficiary_num))
        filledFieldNames.push("noOfBeneficiary")
      } else if (fields.beneficiary_count !== undefined && fields.beneficiary_count !== null) {
        // Fallback if mapping didn't work
        setValue("noOfBeneficiary", Number(fields.beneficiary_count))
        filledFieldNames.push("noOfBeneficiary")
      }
      
      // MOU Signed - form field is "mouSigned"
      if (fields.mouSigned !== undefined) {
        setValue("mouSigned", Boolean(fields.mouSigned))
        filledFieldNames.push("mouSigned")
      } else if (fields.MOU_signed !== undefined) {
        // Fallback if mapping didn't work
        setValue("mouSigned", Boolean(fields.MOU_signed))
        filledFieldNames.push("mouSigned")
      }
      
      // Signing Date - form field is "signingDate"
      if (fields.signingDate) {
        setValue("signingDate", String(fields.signingDate))
        filledFieldNames.push("signingDate")
      } else if (fields.signing_date) {
        // Fallback if mapping didn't work
        setValue("signingDate", String(fields.signing_date))
        filledFieldNames.push("signingDate")
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
    redirectPath: "/teacher/research-contributions?tab=collaborations",
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
    // Trigger validation for all fields before submission
    const isValid = await form.trigger()
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    
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
              "Collaborations"
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

      // Get category name from type ID
      const categoryTypeId = data.category
      const categoryName = categoryTypeId 
        ? (collaborationsTypeOptions.find(opt => opt.id === categoryTypeId)?.name || null)
        : null

      // Map form data to API format
      const collaborationData = {
        collaborating_inst: data.collaboratingInstitute,
        collab_name: data.collabName || null,
        category: categoryName,
        collab_rank: data.collabRank || null,
        address: data.address || null,
        details: data.details || null,
        collab_outcome: data.collabOutcome || null,
        collab_status: data.status || null,
        starting_date: data.startingDate || null,
        duration: (data.status === "Completed" && data.duration) ? Number(data.duration) : null,
        level: data.level || null,
        type: categoryTypeId ? Number(categoryTypeId) : null, // category is now the type ID
        beneficiary_num: data.noOfBeneficiary ? Number(data.noOfBeneficiary) : null,
        MOU_signed: data.mouSigned !== undefined ? data.mouSigned : null,
        signing_date: (data.mouSigned === true && data.signingDate) ? data.signingDate : null,
        doc: docUrl,
      }

      // Use mutation to create collaboration
      createCollaboration.mutate(collaborationData, {
        onSuccess: () => {
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=collaborations")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createCollaboration.isPending) {
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
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to </span>Collaborations / MoUs / Linkages
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Collaboration</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about collaborations, MoUs, or linkages with other institutions
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Collaboration Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <CollaborationForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting || createCollaboration.isPending}
              isEdit={false}
              collaborationsLevelOptions={collaborationsLevelOptions}
              collaborationsOutcomeOptions={collaborationsOutcomeOptions}
              initialDocumentUrl={autoFillDocumentUrl || (undefined as unknown as string)}
              collaborationsTypeOptions={collaborationsTypeOptions}
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
