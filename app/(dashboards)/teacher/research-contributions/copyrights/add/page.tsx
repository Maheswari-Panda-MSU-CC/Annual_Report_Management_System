"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, FileText, Copyright } from "lucide-react"
import { useForm } from "react-hook-form"
import { CopyrightForm } from "@/components/forms/CopyrightForm"

export default function AddCopyrightsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm();

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  // Auto-populate form from sessionStorage if dataFields are available
  useEffect(() => {
    try {
      const storedDataFields = sessionStorage.getItem("arms_dataFields")
      const storedAnalysis = sessionStorage.getItem("arms_last_analysis")
      
      if (storedDataFields && storedAnalysis) {
        const dataFields = JSON.parse(storedDataFields)
        const analysis = JSON.parse(storedAnalysis)
        
        // Map extracted fields to form fields
        const fieldMapping: Record<string, string> = {
          "Reference No.": "referenceNo",
          "Reference No": "referenceNo",
          "Reference Number": "referenceNo",
          "ReferenceNumber": "referenceNo",
          "Title": "title",
          "Publication Date": "publicationDate",
          "PublicationDate": "publicationDate",
          "Date": "publicationDate",
          "Link": "link",
        }
        
        let fieldsPopulated = 0
        
        Object.entries(dataFields).forEach(([key, value]) => {
          const mappedKey = fieldMapping[key] || key.toLowerCase().replace(/\s+/g, "")
          if (mappedKey === "referenceNo" || mappedKey === "title" || mappedKey === "publicationDate" || mappedKey === "link") {
            form.setValue(mappedKey, value)
            fieldsPopulated++
          }
        })
        
        if (fieldsPopulated > 0) {
          toast({
            title: "Form Auto-filled",
            description: `Populated ${fieldsPopulated} field(s) from document analysis.`,
          })
          
          // Clear sessionStorage after use
          sessionStorage.removeItem("arms_dataFields")
          sessionStorage.removeItem("arms_last_analysis")
          sessionStorage.removeItem("arms_category")
          sessionStorage.removeItem("arms_subcategory")
        }
      }
    } catch (error) {
      console.error("Error auto-populating form:", error)
    }
  }, [form])

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
        body: JSON.stringify({ type: "copyright" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "copyright" }),
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
        description: "Copyright added successfully!",
        duration: 3000,
      })

      router.push("/teacher/research-contributions?tab=copyrights")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add copyright. Please try again.",
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
            onClick={() => router.push("/teacher/research-contributions?tab=copyrights")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Copyrights
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Copyright</h1>
          <p className="text-muted-foreground">
            Add details about copyrights you have obtained for your creative works
          </p>
        </div>

       
        <Card>
          <CardHeader>
            <CardTitle>Copyright Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CopyrightForm
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
