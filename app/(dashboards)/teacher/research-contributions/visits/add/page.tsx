"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { AcademicVisitForm } from "@/components/forms/AcademicVisitForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"



export default function AddVisitsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)
  const form = useForm()

  // Fetch dropdowns at page level
  const { 
    academicVisitRoleOptions,
    fetchAcademicVisitRoles
  } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (academicVisitRoleOptions.length === 0) {
      fetchAcademicVisitRoles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFile(files)
  }

  const handleExtractInfo = async () => {
    if (!selectedFile || selectedFile.length === 0) {
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
        body: JSON.stringify({ type: "academicVisit" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "academicVisit" }),
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
      if (selectedFile && selectedFile.length > 0) {
        docUrl = `https://dummy-document-url-${Date.now()}.pdf`
      }

      // Map form data to API format
      const visitData = {
        Institute_visited: data.instituteVisited,
        duration: data.durationOfVisit ? Number(data.durationOfVisit) : null,
        role: data.role ? Number(data.role) : null,
        Sponsored_by: data.sponsoredBy || null,
        remarks: data.remarks || null,
        date: data.date || null,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          visit: visitData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add academic research visit")
      }

      toast({
        title: "Success",
        description: "Academic research visit added successfully!",
        duration: 3000,
      })

      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=visits")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add academic research visit. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      setSelectedFile(null)
      form.reset()
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=visits")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Academic / Research Visits
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Academic/Research Visit</h1>
          <p className="text-muted-foreground">
            Add details about your academic or research visits to other institutions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
          </CardHeader>
          <CardContent>
          <AcademicVisitForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFile}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            academicVisitRoleOptions={academicVisitRoleOptions}
          />
          </CardContent>
        </Card>
      </div>
  )
}
