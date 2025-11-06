"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { EContentForm } from "@/components/forms/EcontentForm"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"



export default function AddEContentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const form = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  // Fetch dropdowns at page level
  const { eContentTypeOptions, typeEcontentValueOptions, fetchEContentTypes, fetchTypeEcontentValues } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (eContentTypeOptions.length === 0) {
      fetchEContentTypes()
    }
    if (typeEcontentValueOptions.length === 0) {
      fetchTypeEcontentValues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

 
  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "econtent" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "econtent" }),
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

      const eContentData = {
        title: data.title,
        Brief_Details: data.briefDetails,
        Quadrant: Number(data.quadrant),
        Publishing_date: data.publishingDate,
        Publishing_Authorities: data.publishingAuthorities,
        link: data.link || null,
        type_econtent: data.typeOfEContent ? Number(data.typeOfEContent) : null,
        e_content_type: data.typeOfEContentPlatform ? Number(data.typeOfEContentPlatform) : null,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/e-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          eContent: eContentData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add e-content")
      }

      toast({
        title: "Success",
        description: "E-Content added successfully!",
        duration: 3000,
      })
      
      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=econtent")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add e-content. Please try again.",
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
            router.push("/teacher/research-contributions?tab=econtent")
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
            Back to E-Content Development
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New E-Content</h1>
          <p className="text-muted-foreground">
            Add details about your e-learning content, online courses, or digital educational materials
          </p>
        </div>

      

        <Card>
          <CardHeader>
            <CardTitle>E-Content Information</CardTitle>
          </CardHeader>
          <CardContent>
           <EContentForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isExtracting={isExtracting}
              selectedFiles={selectedFiles}
              handleFileSelect={handleDocumentUpload}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
              eContentTypeOptions={eContentTypeOptions}
              typeEcontentValueOptions={typeEcontentValueOptions}
           />
          </CardContent>
        </Card>
      </div>
  )
}
