
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

export default function AddCollaborationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  // Fetch dropdowns at page level
  const { 
    collaborationsLevelOptions, 
    collaborationsOutcomeOptions, 
    collaborationsTypeOptions,
    fetchCollaborationsLevels,
    fetchCollaborationsOutcomes,
    fetchCollaborationsTypes
  } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (collaborationsLevelOptions.length === 0) {
      fetchCollaborationsLevels()
    }
    if (collaborationsOutcomeOptions.length === 0) {
      fetchCollaborationsOutcomes()
    }
    if (collaborationsTypeOptions.length === 0) {
      fetchCollaborationsTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const handleExtractInfo = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

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

    setIsSubmitting(true)
    try {
      // Handle dummy document upload
      let docUrl = null
      if (selectedFiles && selectedFiles.length > 0) {
        docUrl = `https://dummy-document-url-${Date.now()}.pdf`
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

      const res = await fetch("/api/teacher/research-contributions/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          collaboration: collaborationData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add collaboration")
      }

      toast({
        title: "Success",
        description: "Collaboration added successfully!",
        duration: 3000,
      })

      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=collaborations")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add collaboration. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      setSelectedFiles(null)
      form.reset()
    }
  }

  const handleBack = () => {
    setIsLoading(true)
            router.push("/teacher/research-contributions?tab=collaborations")
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
            Back to Collaborations / MoUs / Linkages
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Collaboration</h1>
          <p className="text-muted-foreground">
            Add details about collaborations, MoUs, or linkages with other institutions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration Information</CardTitle>
          </CardHeader>
          <CardContent>
          <CollaborationForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleDocumentUpload}
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
