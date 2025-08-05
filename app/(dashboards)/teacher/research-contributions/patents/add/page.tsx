"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { PatentForm } from "@/components/forms/PatentForm"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AddPatentsPage() {
  const router = useRouter()
  const form = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await new Promise((res) => setTimeout(res, 1000))
      toast({
        title: "Success",
        description: "Patent added successfully!",
      })
      router.push("/teacher/research-contributions?tab=patents")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patent.",
        variant: "destructive",
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
    />
    </div>
  );
}
