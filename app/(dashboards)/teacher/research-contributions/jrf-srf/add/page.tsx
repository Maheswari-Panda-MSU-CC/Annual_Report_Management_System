"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { JrfSrfForm } from "@/components/forms/JrfSrfForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"

export default function AddJrfSrfPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form = useForm()

  // Fetch dropdowns at page level
  const { 
    jrfSrfTypeOptions,
    fetchJrfSrfTypes
  } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (jrfSrfTypeOptions.length === 0) {
      fetchJrfSrfTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
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
        body: JSON.stringify({ type: "jrf_srf" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "jrf_srf" }),
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

      // Map form data to API format
      const jrfSrfData = {
        name: data.nameOfFellow,
        type: data.type ? Number(data.type) : null,
        title: data.projectTitle,
        duration: data.duration ? Number(data.duration) : null,
        stipend: data.monthlyStipend ? Number(data.monthlyStipend) : null,
        date: data.date || null,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/jrf-srf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          jrfSrf: jrfSrfData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add JRF/SRF record")
      }

      toast({
        title: "Success",
        description: "JRF/SRF record added successfully!",
        duration: 3000,
      })

      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=jrfSrf")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add JRF/SRF record. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      setSelectedFiles(null)
      form.reset()
    }
  }

  return (
    <>
    <div className="space-y-6">
         <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=jrfSrf")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jrf/Srf Details
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Jrf/Srf</h1>
          <p className="text-muted-foreground">
            Add details about your jrf/srf details here
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>JRF/SRF Fellowship Details</CardTitle>
          </CardHeader>
          <CardContent>
          <JrfSrfForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            jrfSrfTypeOptions={jrfSrfTypeOptions}
          />
          </CardContent>
        </Card>
      </div>
      </>
  )
}
