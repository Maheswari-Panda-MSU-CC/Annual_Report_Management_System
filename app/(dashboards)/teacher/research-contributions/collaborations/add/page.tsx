
"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()
  const { setValue, watch, reset } = form

  const [isExtracting, setIsExtracting] = useState(false)

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
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: category, collaboratingInstitute, collabName, collabRank, address, details, collabOutcome, status, startingDate, duration, level, noOfBeneficiary, mouSigned, signingDate
      
      // Category
      if (fields.category) {
        setValue("category", String(fields.category))
      }
      
      // Collaborating Institute - form field is "collaboratingInstitute"
      if (fields.collaboratingInstitute) {
        setValue("collaboratingInstitute", String(fields.collaboratingInstitute))
      } else if (fields.collaborating_inst) {
        // Fallback if mapping didn't work
        setValue("collaboratingInstitute", String(fields.collaborating_inst))
      }
      
      // Collaborator Name - form field is "collabName"
      if (fields.collabName) {
        setValue("collabName", String(fields.collabName))
      } else if (fields.collab_name) {
        // Fallback if mapping didn't work
        setValue("collabName", String(fields.collab_name))
      }
      
      // Collaborator Rank - form field is "collabRank"
      if (fields.collabRank) {
        setValue("collabRank", String(fields.collabRank))
      } else if (fields.qs_ranking) {
        // Fallback if mapping didn't work
        setValue("collabRank", String(fields.qs_ranking))
      }
      
      // Address
      if (fields.address) {
        setValue("address", String(fields.address))
      }
      
      // Details
      if (fields.details) {
        setValue("details", String(fields.details))
      }
      
      // Collaboration Outcome - form field is "collabOutcome"
      if (fields.collabOutcome !== undefined && fields.collabOutcome !== null) {
        if (typeof fields.collabOutcome === 'number') {
          setValue("collabOutcome", fields.collabOutcome)
        } else {
          // If it's a string, try to find matching option
          const outcomeOption = collaborationsOutcomeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.collabOutcome).toLowerCase()
          )
          if (outcomeOption) {
            setValue("collabOutcome", outcomeOption.id)
          } else {
            const numValue = Number(fields.collabOutcome)
            if (!isNaN(numValue)) {
              setValue("collabOutcome", numValue)
            }
          }
        }
      } else if (fields.outcome !== undefined && fields.outcome !== null) {
        // Fallback if mapping didn't work
        if (typeof fields.outcome === 'number') {
          setValue("collabOutcome", fields.outcome)
        } else {
          const outcomeOption = collaborationsOutcomeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.outcome).toLowerCase()
          )
          if (outcomeOption) {
            setValue("collabOutcome", outcomeOption.id)
          } else {
            const numValue = Number(fields.outcome)
            if (!isNaN(numValue)) {
              setValue("collabOutcome", numValue)
            }
          }
        }
      }
      
      // Status
      if (fields.status !== undefined && fields.status !== null) {
        setValue("status", typeof fields.status === 'number' ? fields.status : Number(fields.status))
      }
      
      // Starting Date - form field is "startingDate"
      if (fields.startingDate) {
        setValue("startingDate", String(fields.startingDate))
      } else if (fields.starting_date) {
        // Fallback if mapping didn't work
        setValue("startingDate", String(fields.starting_date))
      }
      
      // Duration
      if (fields.duration !== undefined && fields.duration !== null) {
        setValue("duration", Number(fields.duration))
      }
      
      // Level
      if (fields.level !== undefined && fields.level !== null) {
        if (typeof fields.level === 'number') {
          setValue("level", fields.level)
        } else {
          const levelOption = collaborationsLevelOptions.find(
            opt => opt.name.toLowerCase() === String(fields.level).toLowerCase()
          )
          if (levelOption) {
            setValue("level", levelOption.id)
          } else {
            const numValue = Number(fields.level)
            if (!isNaN(numValue)) {
              setValue("level", numValue)
            }
          }
        }
      }
      
      // Number of Beneficiary - form field is "noOfBeneficiary"
      if (fields.noOfBeneficiary !== undefined && fields.noOfBeneficiary !== null) {
        setValue("noOfBeneficiary", Number(fields.noOfBeneficiary))
      } else if (fields.beneficiary_num !== undefined && fields.beneficiary_num !== null) {
        // Fallback if mapping didn't work
        setValue("noOfBeneficiary", Number(fields.beneficiary_num))
      } else if (fields.beneficiary_count !== undefined && fields.beneficiary_count !== null) {
        // Fallback if mapping didn't work
        setValue("noOfBeneficiary", Number(fields.beneficiary_count))
      }
      
      // MOU Signed - form field is "mouSigned"
      if (fields.mouSigned !== undefined) {
        setValue("mouSigned", Boolean(fields.mouSigned))
      } else if (fields.MOU_signed !== undefined) {
        // Fallback if mapping didn't work
        setValue("mouSigned", Boolean(fields.MOU_signed))
      }
      
      // Signing Date - form field is "signingDate"
      if (fields.signingDate) {
        setValue("signingDate", String(fields.signingDate))
      } else if (fields.signing_date) {
        // Fallback if mapping didn't work
        setValue("signingDate", String(fields.signing_date))
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
  }

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "collaborations" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "collaborations" }),
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
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
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
              isExtracting={isExtracting}
              selectedFiles={null}
              handleFileSelect={() => {}}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
              collaborationsLevelOptions={collaborationsLevelOptions}
              collaborationsOutcomeOptions={collaborationsOutcomeOptions}
              initialDocumentUrl={autoFillDocumentUrl || (undefined as unknown as string)}
              collaborationsTypeOptions={collaborationsTypeOptions}
              onClearFields={handleClearFields}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
