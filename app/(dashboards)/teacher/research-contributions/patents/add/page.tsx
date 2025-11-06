"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { PatentForm } from "@/components/forms/PatentForm"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useEffect } from "react"

export default function AddPatentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const form = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  
  // Fetch dropdowns at page level
  const { resPubLevelOptions, patentStatusOptions, fetchResPubLevels, fetchPatentStatuses } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (resPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
    if (patentStatusOptions.length === 0) {
      fetchPatentStatuses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "patent" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "patent" }),
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

      const patentData = {
        title: data.title,
        level: data.level,
        status: data.status,
        date: data.date,
        Tech_Licence: data.Tech_Licence || "",
        Earnings_Generate: data.Earnings_Generate ? Number(data.Earnings_Generate) : null,
        PatentApplicationNo: data.PatentApplicationNo || "",
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/patents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          patent: patentData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add patent")
      }

      toast({
        title: "Success",
        description: "Patent added successfully!",
        duration: 3000,
      })
      
      // Smooth transition with slight delay
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=patents")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add patent. Please try again.",
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
    <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=patents")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patents
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Patent</h1>
          <p className="text-muted-foreground">
            Add details about your academic or research patents with details
          </p>
        </div>

    <PatentForm
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isExtracting={isExtracting}
      selectedFiles={selectedFiles}
      handleFileSelect={handleFileSelect}
      handleExtractInfo={handleExtractInfo}
      isEdit={false}
      resPubLevelOptions={resPubLevelOptions}
      patentStatusOptions={patentStatusOptions}
    />
    </div>
  );
}
