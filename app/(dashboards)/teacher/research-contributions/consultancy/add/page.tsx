"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ConsultancyForm } from "@/components/forms/ConsultancyForm"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"

export default function AddConsultancyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const form = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

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
        body: JSON.stringify({ type: "consultancy" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "consultancy" }),
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

      const consultancyData = {
        name: data.title,
        collaborating_inst: data.collaboratingInstitute,
        address: data.address,
        duration: data.duration ? Number(data.duration) : null,
        amount: data.amount ? data.amount.toString() : null,
        submit_date: new Date().toISOString().split('T')[0], // Current date
        Start_Date: data.startDate,
        outcome: data.detailsOutcome || null,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/consultancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          consultancy: consultancyData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add consultancy")
      }

      toast({
        title: "Success",
        description: "Consultancy added successfully!",
        duration: 3000,
      })
      
      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=consultancy")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add consultancy. Please try again.",
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
            router.push("/teacher/research-contributions?tab=consultancy")
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
            <span className="hidden sm:inline">Back to </span>Consultancy Undertaken
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Consultancy</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about consultancy projects undertaken with industry or institutions
          </p>
        </div>

       
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Consultancy Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
          <ConsultancyForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isExtracting={isExtracting}
              selectedFiles={selectedFiles}
              handleFileSelect={handleDocumentUpload}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
           />
          </CardContent>
        </Card>
      </div>
  )
}
