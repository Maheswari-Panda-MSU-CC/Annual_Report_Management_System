"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { PhdGuidanceForm } from "@/components/forms/PhdGuidanceForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"




export default function AddPhdPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form = useForm()

  // Fetch dropdowns at page level
  const { 
    phdGuidanceStatusOptions,
    fetchPhdGuidanceStatuses
  } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (phdGuidanceStatusOptions.length === 0) {
      fetchPhdGuidanceStatuses()
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
        body: JSON.stringify({ type: "phd" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "phd" }),
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
      const phdStudentData = {
        regno: data.regNo,
        name: data.nameOfStudent,
        start_date: data.dateOfRegistration,
        topic: data.topic,
        status: data.status ? Number(data.status) : null,
        year_of_completion: data.yearOfCompletion ? Number(data.yearOfCompletion) : null,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/phd-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          phdStudent: phdStudentData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add PhD student record")
      }

      toast({
        title: "Success",
        description: "PhD student record added successfully!",
        duration: 3000,
      })

      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=phd")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add PhD student record. Please try again.",
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
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=phd")}
            className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to </span>PhD Guidance
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New PhD Guidance</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Add details about PhD students you are guiding or have guided</p>
        </div>


        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">PhD Student Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
              
            <PhdGuidanceForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isExtracting={isExtracting}
              selectedFiles={selectedFiles}
              handleFileSelect={handleFileSelect}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
              phdGuidanceStatusOptions={phdGuidanceStatusOptions}
            />
          </CardContent>
        </Card>
      </div>
  )
}
