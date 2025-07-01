"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, Loader2, FileText, Sparkles, Wand2 } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

interface PatentFormData {
  title: string
  level: string
  status: string
  date: string
  transferOfTechnology: string
  earningGenerated: string
  patentApplicationNo: string
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

// Simulated LLM extraction function (keeping existing functionality)
const extractPatentInfo = async (file: File): Promise<any> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Dummy data extraction
  return {
    title: `Extracted Title from ${file.name}`,
    level: "National",
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
    transferOfTechnology: "No",
    earningGenerated: "0",
    patentApplicationNo: "EXT-2023-12345",
  }
}

export default function AddPatentsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatentFormData>({
    defaultValues: {
      title: "",
      level: "",
      status: "",
      date: "",
      transferOfTechnology: "",
      earningGenerated: "",
      patentApplicationNo: "",
    },
  })

  const formData = watch()

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  // Existing extract info function (unchanged)
  const handleExtractInfo = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const extraction = await extractPatentInfo(selectedFiles[0])

      // Use setValue to populate form fields
      Object.keys(extraction).forEach((key) => {
        if (key in formData) {
          setValue(key as keyof PatentFormData, extraction[key])
        }
      })

      toast({
        title: "Success",
        description: "Information extracted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [selectedFiles, setValue, formData])

  // New autofill functionality
  const handleAutoFill = useCallback(async () => {
    setIsAutoFilling(true)

    try {
      // Step 1: Get category
      const categoryResponse = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "patent" }),
      })

      if (!categoryResponse.ok) {
        throw new Error("Failed to get category")
      }

      const categoryData = await categoryResponse.json()
      console.log("Category:", categoryData)

      // Step 2: Get form fields
      const formFieldsResponse = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryData.category,
          type: "patent",
        }),
      })

      if (!formFieldsResponse.ok) {
        throw new Error("Failed to get form fields")
      }

      const formFieldsData = await formFieldsResponse.json()

      // Step 3: Populate form using setValue
      if (formFieldsData.success && formFieldsData.data) {
        const data = formFieldsData.data

        // Map API response to form fields
        setValue("title", data.title || "")
        setValue("level", data.level || "")
        setValue("status", data.status || "")
        setValue("date", data.date || "")
        setValue("transferOfTechnology", data.transferOfTechnology || "")
        setValue("earningGenerated", data.earningGenerated || "")
        setValue("patentApplicationNo", data.patentApplicationNo || "")

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
      setIsAutoFilling(false)
    }
  }, [setValue])

  const onSubmit = async (data: PatentFormData) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Patent added successfully!",
        duration: 3000,
      })

      router.push("/research-contributions?tab=patents")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patent. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/research-contributions?tab=patents")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patents
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Patent</h1>
          <p className="text-muted-foreground">Add details about your patent application, publication, or grant</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Patent Information
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="flex items-center gap-2"
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Auto-filling...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Auto-fill Form
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Document Upload Section - Now at top */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Patent Document</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-green-600 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {selectedFiles[0].name}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Extract Information
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Patent Information</Label>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Patent Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter patent title"
                      {...register("title", { required: "Patent title is required" })}
                    />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => setValue("level", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="Regional">Regional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => setValue("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Filed">Filed</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Granted">Granted</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" {...register("date", { required: "Date is required" })} />
                    {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="patentApplicationNo">Patent Application/Publication/Grant No.</Label>
                  <Input
                    id="patentApplicationNo"
                    placeholder="Enter patent number"
                    {...register("patentApplicationNo")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="transferOfTechnology">Transfer of Technology with Licence</Label>
                    <Select
                      value={formData.transferOfTechnology}
                      onValueChange={(value) => setValue("transferOfTechnology", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="earningGenerated">Earning Generated (₹)</Label>
                    <Input
                      id="earningGenerated"
                      type="number"
                      placeholder="Enter amount in rupees"
                      {...register("earningGenerated")}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/research-contributions?tab=patents")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Patent
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
