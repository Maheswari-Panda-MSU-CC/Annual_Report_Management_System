"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, FileText, Loader2, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ResearchProjectFormData } from "@/types/interfaces"

export default function AddResearchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const {
    projectStatusOptions,
    projectLevelOptions,
    fundingAgencyOptions,
    projectNatureOptions,
    fetchProjectStatuses,
    fetchProjectLevels,
    fetchFundingAgencies,
    fetchProjectNatures,
  } = useDropDowns()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResearchProjectFormData>({
    defaultValues: {
      title: "",
      funding_agency: null,
      grant_sanctioned: "",
      grant_received: "",
      proj_nature: null,
      duration: 0,
      status: null,
      start_date: "",
      proj_level: null,
      grant_year: "",
      grant_sealed: false,
      Pdf: "",
    },
  })

  // Fetch dropdown data
  useEffect(() => {
    fetchProjectStatuses()
    fetchProjectLevels()
    fetchFundingAgencies()
    fetchProjectNatures()
  }, [])

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

    setSelectedFile(file)
    toast({
      title: "File selected",
      description: `${file.name} is ready for upload`,
    })
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
    if (!selectedFile) {
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

        // Map extracted fields to form fields
        if (data.title) {
          setValue("title", data.title)
          fieldsPopulated++
        }
        if (data.fundingAgency) {
          // Try to find matching funding agency
          const matchingAgency = fundingAgencyOptions.find(
            (a) => a.name.toLowerCase().includes(data.fundingAgency.toLowerCase()) || 
                   data.fundingAgency.toLowerCase().includes(a.name.toLowerCase())
          )
          if (matchingAgency) {
            setValue("funding_agency", matchingAgency.id)
            fieldsPopulated++
          }
        }
        if (data.totalGrantSanctioned) {
          setValue("grant_sanctioned", data.totalGrantSanctioned.toString())
          fieldsPopulated++
        }
        if (data.totalGrantReceived) {
          setValue("grant_received", data.totalGrantReceived.toString())
          fieldsPopulated++
        }
        if (data.projectNature) {
          // Project nature is a number ID - try to match or use input
          setValue("proj_nature", typeof data.projectNature === 'number' ? data.projectNature : null)
          fieldsPopulated++
        }
        if (data.level) {
          const matchingLevel = projectLevelOptions.find(
            (l) => l.name.toLowerCase().includes(data.level.toLowerCase()) ||
                   data.level.toLowerCase().includes(l.name.toLowerCase())
          )
          if (matchingLevel) {
            setValue("proj_level", matchingLevel.id)
            fieldsPopulated++
          }
        }
        if (data.duration) {
          const durationValue = typeof data.duration === 'number' 
            ? data.duration 
            : parseInt(data.duration.toString()) || 0
          setValue("duration", durationValue)
          fieldsPopulated++
        }
        if (data.status) {
          const matchingStatus = projectStatusOptions.find(
            (s) => s.name.toLowerCase().includes(data.status.toLowerCase()) ||
                   data.status.toLowerCase().includes(s.name.toLowerCase())
          )
          if (matchingStatus) {
            setValue("status", matchingStatus.id)
            fieldsPopulated++
          }
        }
        if (data.startDate) {
          setValue("start_date", data.startDate)
          fieldsPopulated++
        }
        if (data.seedGrant) {
          setValue("grant_sanctioned", data.seedGrant.toString())
          fieldsPopulated++
        }
        if (data.seedGrantYear) {
          setValue("grant_year", data.seedGrantYear.toString())
          fieldsPopulated++
        }

        toast({
          title: "Information Extracted Successfully",
          description: `${fieldsPopulated} fields populated from document analysis (${Math.round(formFieldsData.confidence * 100)}% confidence)`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract information from document. Please try again or fill the form manually.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [setValue, toast, selectedFile, fundingAgencyOptions, projectLevelOptions, projectStatusOptions])

  const onSubmit = async (data: ResearchProjectFormData) => {
    setIsLoading(true)

    try {
      const teacherId = user?.role_id
      if (!teacherId) {
        setIsLoading(false)
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      // Validate required fields
      if (!data.title?.trim() || !data.funding_agency || !data.proj_nature || !data.status || !data.start_date) {
        setIsLoading(false)
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Title, Funding Agency, Project Nature, Status, Start Date)",
          variant: "destructive",
        })
        return
      }

      // Use PDF path from form data (upload handled separately if needed)
      const pdfPath = data.Pdf || null

      // Format and validate numeric fields
      const grantSanctioned = data.grant_sanctioned?.trim()
        ? parseFloat(data.grant_sanctioned.replace(/[,\s]/g, ''))
        : null
      
      const grantReceived = data.grant_received?.trim()
        ? parseFloat(data.grant_received.replace(/[,\s]/g, ''))
        : null

      // Validate grant amounts are valid numbers
      if (grantSanctioned !== null && (isNaN(grantSanctioned) || grantSanctioned < 0)) {
        setIsLoading(false)
        toast({
          title: "Validation Error",
          description: "Grant Sanctioned must be a valid positive number",
          variant: "destructive",
        })
        return
      }

      if (grantReceived !== null && (isNaN(grantReceived) || grantReceived < 0)) {
        setIsLoading(false)
        toast({
          title: "Validation Error",
          description: "Grant Received must be a valid positive number",
          variant: "destructive",
        })
        return
      }

      // Format duration - ensure it's a number or null
      const duration = data.duration && data.duration > 0 ? Math.floor(data.duration) : null

      // Format grant year
      const grantYear = data.grant_year?.trim()
        ? parseInt(data.grant_year)
        : null

      if (grantYear !== null && (isNaN(grantYear) || grantYear < 2000 || grantYear > 2100)) {
        setIsLoading(false)
        toast({
          title: "Validation Error",
          description: "Grant Year must be a valid year between 2000 and 2100",
          variant: "destructive",
        })
        return
      }

      // Prepare payload
      const payload = {
        teacherId,
        project: {
          title: data.title.trim(),
          funding_agency: data.funding_agency,
          grant_sanctioned: grantSanctioned,
          grant_received: grantReceived,
          proj_nature: data.proj_nature,
          duration: duration,
          status: data.status,
          start_date: data.start_date,
          proj_level: data.proj_level,
          grant_year: grantYear,
          grant_sealed: data.grant_sealed ?? false,
          Pdf: pdfPath,
        },
      }

      console.log("Submitting payload:", payload)

      const res = await fetch("/api/teacher/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      console.log("API Response:", result)

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to add research project")
      }

      toast({
        title: "Success!",
        description: "Research project has been added successfully.",
      })

      // Redirect back to research page
      setTimeout(() => {
        router.push("/teacher/research")
      }, 1000)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add research project. Please try again.",
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
          {/* Document Upload Section */}
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

            {selectedFile && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoFill}
                  disabled={!selectedFile || isExtracting}
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
                  <Controller
                    control={control}
                    name="title"
                    rules={{ required: "Project title is required" }}
                    render={({ field }) => (
                      <Input {...field} id="title" placeholder="Enter project title" />
                    )}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Funding Agency */}
                <div className="space-y-2">
                  <Label htmlFor="funding_agency">
                    Funding Agency <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="funding_agency"
                    rules={{ required: "Funding agency is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={fundingAgencyOptions.map((a) => ({
                          value: a.id,
                          label: a.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                        placeholder="Select funding agency"
                        emptyMessage="No funding agency found"
                      />
                    )}
                  />
                  {errors.funding_agency && (
                    <p className="text-sm text-red-500 mt-1">{errors.funding_agency.message}</p>
                  )}
                </div>

                {/* Project Nature */}
                <div className="space-y-2">
                  <Label htmlFor="proj_nature">
                    Project Nature <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="proj_nature"
                    rules={{ required: "Project nature is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectNatureOptions.map((n) => ({
                          value: n.id,
                          label: n.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                        placeholder="Select project nature"
                        emptyMessage="No project nature found"
                      />
                    )}
                  />
                  {errors.proj_nature && (
                    <p className="text-sm text-red-500 mt-1">{errors.proj_nature.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectStatusOptions.map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                        placeholder="Select status"
                        emptyMessage="No status found"
                      />
                    )}
                  />
                  {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                </div>

                {/* Project Level */}
                <div className="space-y-2">
                  <Label htmlFor="proj_level">Project Level</Label>
                  <Controller
                    control={control}
                    name="proj_level"
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectLevelOptions.map((l) => ({
                          value: l.id,
                          label: l.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                        placeholder="Select project level"
                        emptyMessage="No level found"
                      />
                    )}
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="start_date"
                    rules={{ required: "Start date is required" }}
                    render={({ field }) => (
                      <Input {...field} id="start_date" type="date" />
                    )}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field }) => {
                      const { value, onChange, ...restField } = field
                      return (
                        <Input
                          {...restField}
                          id="duration"
                          type="number"
                          placeholder="Enter duration in months"
                          value={value ?? ""}
                          onChange={(e) => {
                            const numValue = e.target.value === "" ? 0 : Number(e.target.value)
                            onChange(numValue)
                          }}
                        />
                      )
                    }}
                  />
                </div>

                {/* Grant Sanctioned */}
                <div className="space-y-2">
                  <Label htmlFor="grant_sanctioned">Grant Sanctioned (₹)</Label>
                  <Controller
                    control={control}
                    name="grant_sanctioned"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_sanctioned"
                        type="number"
                        placeholder="Enter sanctioned amount"
                        min="0"
                        step="0.01"
                      />
                    )}
                  />
                </div>

                {/* Grant Received */}
                <div className="space-y-2">
                  <Label htmlFor="grant_received">Grant Received (₹)</Label>
                  <Controller
                    control={control}
                    name="grant_received"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_received"
                        type="number"
                        placeholder="Enter received amount"
                        min="0"
                        step="0.01"
                      />
                    )}
                  />
                </div>

                {/* Grant Year */}
                <div className="space-y-2">
                  <Label htmlFor="grant_year">Grant Year</Label>
                  <Controller
                    control={control}
                    name="grant_year"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_year"
                        type="number"
                        placeholder="Enter grant year"
                        min="2000"
                        max="2030"
                      />
                    )}
                  />
                </div>

                {/* Grant Sealed */}
                <div className="md:col-span-2 flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="grant_sealed"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="grant_sealed"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    )}
                  />
                  <Label htmlFor="grant_sealed" className="cursor-pointer">
                    Grant Sealed
                  </Label>
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
