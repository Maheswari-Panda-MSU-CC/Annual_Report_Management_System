
"use client"

import type React from "react"

import { useState } from "react"
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

export default function AddCollaborationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()

  const [isExtracting, setIsExtracting] = useState(false)

  // Dropdowns - already available from Context, no need to fetch
  const { 
    collaborationsLevelOptions, 
    collaborationsOutcomeOptions, 
    collaborationsTypeOptions,
  } = useDropDowns()
  
  // Use mutation for creating collaboration
  const { create: createCollaboration } = useCollaborationMutations()

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

  const handleBack = () => {
    setIsLoading(true)
            router.push("/teacher/research-contributions?tab=collaborations")
  }

  return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
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
            collaborationsTypeOptions={collaborationsTypeOptions}
          />
          </CardContent>
        </Card>
      </div>
  )
}
