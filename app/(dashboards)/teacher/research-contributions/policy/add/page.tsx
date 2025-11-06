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

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
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
        body: JSON.stringify({ type: "policy" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "policy" }),
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
      setSelectedFiles(null)
      form.reset()
    }
  }

  const handleBack = () => {
    setIsLoading(true)
    router.push("/teacher/research-contributions?tab=policy")
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
          Back to Policy Documents
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Policy Document</h1>
        <p className="text-muted-foreground">Add details about policy documents you've contributed to or authored</p>
      </div>


      {/* Render Form Component */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PolicyForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleDocumentUpload}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            resPubLevelOptions={resPubLevelOptions}
          />
        </CardContent>
      </Card>
    </div>
  )
}
