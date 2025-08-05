"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, FileText, Loader2 } from "lucide-react"
import { EContentForm } from "@/components/forms/EcontentForm"
import { useForm } from "react-hook-form"



export default function AddEContentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    typeOfEContentPlatform: "",
    briefDetails: "",
    quadrant: "",
    publishingDate: "",
    publishingAuthorities: "",
    link: "",
    typeOfEContent: "",
  })

  const [isExtracting, setIsExtracting] = useState(false)
  
  const form = useForm();

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

 
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
        description: "E-Content added successfully!",
        duration: 3000,
      })

      setIsLoading(true)
      router.push("/teacher/research-contributions?tab=econtent")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add e-content. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
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
           />
          </CardContent>
        </Card>
      </div>
  )
}
