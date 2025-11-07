"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { FinancialForm } from "@/components/forms/FinancialFom"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"


export default function AddFinancialPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()

  // Fetch dropdowns at page level
  const { 
    financialSupportTypeOptions,
    fetchFinancialSupportTypes
  } = useDropDowns()
  
  useEffect(() => {
    // Fetch dropdowns once when page loads
    if (financialSupportTypeOptions.length === 0) {
      fetchFinancialSupportTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        body: JSON.stringify({ type: "financial" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "financial" }),
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

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
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
      const financialSupportData = {
        name: data.nameOfSupport,
        type: data.type ? Number(data.type) : null,
        support: data.supportingAgency,
        grant_received: data.grantReceived ? Number(data.grantReceived) : null,
        details: data.detailsOfEvent || null,
        purpose: data.purposeOfGrant || null,
        date: data.date || null,
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/financial-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          financialSupport: financialSupportData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add financial support record")
      }

      toast({
        title: "Success",
        description: "Financial support record added successfully!",
        duration: 3000,
      })

      // Smooth transition
      setTimeout(() => {
        router.push("/teacher/research-contributions?tab=financial")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add financial support record. Please try again.",
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
            onClick={() => router.push("/teacher/research-contributions?tab=financial")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Financial Support
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Financial Support</h1>
          <p className="text-muted-foreground">
            Add details about financial support received for academic or research activities
          </p>
        </div>

  
        <Card>
          <CardHeader>
            <CardTitle>Financial Support Information</CardTitle>
          </CardHeader>
          <CardContent>
          <FinancialForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            financialSupportTypeOptions={financialSupportTypeOptions}
          />
          </CardContent>
        </Card>
      </div>
  )
}
