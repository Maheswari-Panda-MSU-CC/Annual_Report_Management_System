"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { JrfSrfForm } from "@/components/forms/JrfSrfForm"

interface JrfSrfForm {
  nameOfFellow: string
  fellowshipType: string
  projectTitle: string
  duration: string
  monthlyStipend: string
  date: string
  supportingDocument: File | null
}

export default function AddJrfSrfPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form=useForm();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JrfSrfForm>()


  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleExtractInfo = useCallback(async () => {
    setIsExtracting(true)
    try {
      const categoryResponse = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "jrf_srf" }),
      })

      if (!categoryResponse.ok) {
        throw new Error("Failed to get category")
      }

      const categoryData = await categoryResponse.json()

      const formFieldsResponse = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryData.category,
          type: "jrf_srf",
        }),
      })

      if (!formFieldsResponse.ok) {
        throw new Error("Failed to get form fields")
      }

      const formFieldsData = await formFieldsResponse.json()

      if (formFieldsData.success && formFieldsData.data) {
        const data = formFieldsData.data

        Object.keys(data).forEach((key) => {
          if (key in form) {
            setValue(key as keyof JrfSrfForm, data[key])
          }
        })

        toast({
          title: "Success",
          description: `Form auto-filled with ${formFieldsData.extracted_fields} fields (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [setValue, toast])

  const onSubmit = async (data: JrfSrfForm) => {
    setIsSubmitting(true);
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = [
        "name",
        "rollNumber",
        "fellowshipType",
        "subject",
        "supervisorName",
        "department",
        "university",
        "startDate",
        "mobileNumber",
        "emailAddress",
      ]
      const missingFields = requiredFields.filter((field) => !data[field as keyof JrfSrfForm])

      if (missingFields.length > 0) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success!",
        description: "JRF/SRF record has been added successfully.",
      })

      // Redirect back to academic recommendations page
      router.push("/teacher/academic-recommendations")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add JRF/SRF record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <div className="space-y-6">
         <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=jrfSrf")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jrf/Srf Details
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Jrf/Srf</h1>
          <p className="text-muted-foreground">
            Add details about your jrf/srf details here
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>JRF/SRF Fellowship Details</CardTitle>
          </CardHeader>
          <CardContent>
          <JrfSrfForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isExtracting = {isExtracting}
            selectedFiles = {selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
          />
          </CardContent>
        </Card>
      </div>
      </>
  )
}
