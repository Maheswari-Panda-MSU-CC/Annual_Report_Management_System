"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import PolicyForm from "@/components/forms/PolicyForm"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"

export default function AddPolicyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const form = useForm()
  const { setValue } = form

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch dropdowns at page level
  const { resPubLevelOptions, fetchResPubLevels } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (resPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    // Extraction is handled by DocumentUpload component
    setIsExtracting(false)
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

      // Get level name from levelId
      let levelName = data.level
      if (data.level && typeof data.level === 'number') {
        const levelOption = resPubLevelOptions.find(l => l.id === data.level)
        levelName = levelOption ? levelOption.name : data.level
      }

      const policyData = {
        title: data.title,
        level: levelName,
        organisation: data.organisation,
        date: data.date,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          policy: policyData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add policy document")
      }

      toast({
        title: "Success",
        description: "Policy document added successfully!",
        duration: 3000,
      })
      
      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=policy")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add policy document. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      form.reset()
    }
  }

  const handleBack = () => {
    setIsLoading(true)
    router.push("/teacher/research-contributions?tab=policy")
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
          <span className="hidden sm:inline">Back to </span>Policy Documents
        </Button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Policy Document</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Add details about policy documents you've contributed to or authored</p>
      </div>


      {/* Render Form Component */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Policy Document Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <PolicyForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={null}
            handleFileSelect={() => {}}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            resPubLevelOptions={resPubLevelOptions}
          />
        </CardContent>
      </Card>
    </div>
  )
}
