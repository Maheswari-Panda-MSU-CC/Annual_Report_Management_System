
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, FileText, Loader2 } from "lucide-react"
import { CollaborationForm } from "@/components/forms/CollaborationForm"
import { useForm } from "react-hook-form"

export default function AddCollaborationsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form =useForm();

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  }


  const handleExtractInfo = async () => {
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
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Collaboration added successfully!",
        duration: 3000,
      })

      setIsLoading(true)
      router.push("/teacher/research-contributions?tab=collaborations")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add collaboration. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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
          />
          </CardContent>
        </Card>
      </div>
  )
}
