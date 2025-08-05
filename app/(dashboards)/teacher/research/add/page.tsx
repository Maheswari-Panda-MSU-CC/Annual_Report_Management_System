"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, FileText, Loader2, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface ResearchProjectForm {
  title: string
  fundingAgency: string
  totalGrantSanctioned: string
  totalGrantReceived: string
  projectNature: string
  level: string
  duration: string
  status: string
  startDate: string
  supportingDocument: File | null
  seedGrant: string
  seedGrantYear: string
}

export default function AddResearchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResearchProjectForm>()

  const [formData, setFormData] = useState<ResearchProjectForm>({
    title: "",
    fundingAgency: "",
    totalGrantSanctioned: "",
    totalGrantReceived: "",
    projectNature: "",
    level: "",
    duration: "",
    status: "",
    startDate: "",
    supportingDocument: null,
    seedGrant: "",
    seedGrantYear: "",
  })

  const handleInputChange = (field: keyof ResearchProjectForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or image files (JPEG, PNG, JPG)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      supportingDocument: file,
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleAutoFill = useCallback(async () => {
    if (!formData.supportingDocument) {
      toast({
        title: "No document uploaded",
        description: "Please upload a document first to extract information.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const categoryResponse = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "research_project" }),
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
          type: "research_project",
        }),
      })

      if (!formFieldsResponse.ok) {
        throw new Error("Failed to get form fields")
      }

      const formFieldsData = await formFieldsResponse.json()

      if (formFieldsData.success && formFieldsData.data) {
        const data = formFieldsData.data
        let fieldsPopulated = 0

        // Map all available fields from the API response to form fields
        const fieldMappings = {
          title: "title",
          fundingAgency: "fundingAgency",
          totalGrantSanctioned: "totalGrantSanctioned",
          totalGrantReceived: "totalGrantReceived",
          projectNature: "projectNature",
          level: "level",
          duration: "duration",
          status: "status",
          startDate: "startDate",
          seedGrant: "seedGrant",
          seedGrantYear: "seedGrantYear",
        }

        Object.entries(fieldMappings).forEach(([formField, dataField]) => {
          if (data[dataField]) {
            setValue(formField as keyof ResearchProjectForm, data[dataField])
            fieldsPopulated++
          }
        })

        toast({
          title: "Information Extracted Successfully",
          description: `${fieldsPopulated} fields populated from document analysis (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
        })
      }
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract information from document. Please try again or fill the form manually.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [setValue, toast, formData.supportingDocument])

  const onSubmit = async (data: ResearchProjectForm) => {
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = ["title", "fundingAgency", "projectNature", "level", "status", "startDate"]
      const missingFields = requiredFields.filter((field) => !data[field as keyof ResearchProjectForm])

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
        description: "Research project has been added successfully.",
      })

      // Redirect back to research page
      router.push("/teacher/research")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add research project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add Research Project</h1>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Research Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Document Upload Section - Now at top */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drag and drop your file here, or{" "}
                    <label
                      htmlFor="file-upload"
                      className="text-primary hover:text-primary/80 cursor-pointer font-medium"
                    >
                      browse
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPEG, PNG, JPG up to 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0])
                      }
                    }}
                  />
                </div>
              </div>

              {formData.supportingDocument && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>{formData.supportingDocument.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFill}
                    disabled={!formData.supportingDocument || isExtracting}
                  >
                    {isExtracting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isExtracting ? "Extracting..." : "Extract Information"}
                  </Button>
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Project Details</Label>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">
                      Project Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      {...register("title", { required: "Project title is required" })}
                      placeholder="Enter project title"
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  {/* Funding Agency */}
                  <div className="space-y-2">
                    <Label htmlFor="fundingAgency">
                      Funding Agency <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fundingAgency"
                      {...register("fundingAgency", { required: "Funding agency is required" })}
                      placeholder="Enter funding agency name"
                    />
                    {errors.fundingAgency && (
                      <p className="text-sm text-red-500 mt-1">{errors.fundingAgency.message}</p>
                    )}
                  </div>

                  {/* Total Grant Sanctioned */}
                  <div className="space-y-2">
                    <Label htmlFor="totalGrantSanctioned">Total Grant Sanctioned (₹)</Label>
                    <Input
                      id="totalGrantSanctioned"
                      type="number"
                      {...register("totalGrantSanctioned")}
                      placeholder="Enter sanctioned amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Total Grant Received */}
                  <div className="space-y-2">
                    <Label htmlFor="totalGrantReceived">Total Grant Received (₹)</Label>
                    <Input
                      id="totalGrantReceived"
                      type="number"
                      {...register("totalGrantReceived")}
                      placeholder="Enter received amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Project Nature */}
                  <div className="space-y-2">
                    <Label htmlFor="projectNature">
                      Project Nature <span className="text-red-500">*</span>
                    </Label>
                    <Select {...register("projectNature", { required: "Project nature is required" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project nature" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic-research">Basic Research</SelectItem>
                        <SelectItem value="applied-research">Applied Research</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="consultancy">Consultancy</SelectItem>
                        <SelectItem value="collaborative">Collaborative</SelectItem>
                        <SelectItem value="interdisciplinary">Interdisciplinary</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.projectNature && (
                      <p className="text-sm text-red-500 mt-1">{errors.projectNature.message}</p>
                    )}
                  </div>

                  {/* Level */}
                  <div className="space-y-2">
                    <Label htmlFor="level">
                      Level <span className="text-red-500">*</span>
                    </Label>
                    <Select {...register("level", { required: "Level is required" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="institutional">Institutional</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level.message}</p>}
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" {...register("duration")} placeholder="e.g., 2 years, 18 months" />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select {...register("status", { required: "Status is required" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="sanctioned">Sanctioned</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate", { required: "Start date is required" })}
                    />
                    {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>}
                  </div>

                  {/* Seed Grant */}
                  <div className="space-y-2">
                    <Label htmlFor="seedGrant">Seed Grant (₹)</Label>
                    <Input
                      id="seedGrant"
                      type="number"
                      {...register("seedGrant")}
                      placeholder="Enter seed grant amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Seed Grant Year */}
                  <div className="space-y-2">
                    <Label htmlFor="seedGrantYear">Seed Grant Year</Label>
                    <Input
                      id="seedGrantYear"
                      type="number"
                      {...register("seedGrantYear")}
                      placeholder="Enter year"
                      min="2000"
                      max="2030"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Project...
                      </>
                    ) : (
                      "Add Research Project"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
