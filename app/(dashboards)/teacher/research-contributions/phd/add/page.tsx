"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { PhdGuidanceForm } from "@/components/forms/PhdGuidanceForm"




export default function AddPhdPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const form = useForm();

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }


  const handleExtractInfo = async () => {
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
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "PhD guidance added successfully!",
        duration: 3000,
      })

      router.push("/teacher/research-contributions?tab=phd")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add PhD guidance. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=phd")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PhD Guidance
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New PhD Guidance</h1>
          <p className="text-muted-foreground">Add details about PhD students you are guiding or have guided</p>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>PhD Student Information</CardTitle>
          </CardHeader>
          <CardContent>
              
            <PhdGuidanceForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isExtracting={isExtracting}
              selectedFiles={selectedFiles}
              handleFileSelect={handleFileSelect}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
            />
          </CardContent>
        </Card>
      </div>
  )
}
