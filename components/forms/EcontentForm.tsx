"use client"

import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"

interface EContentFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
}

export function EContentForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: EContentFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form
  const formData = watch()

  useEffect(() => {
    if (isEdit && editData) {
      Object.entries(editData).forEach(([key, value]) => {
        setValue(key, value)
      })
    }
  }, [isEdit, editData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Document</Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExtractInfo}
              disabled={isExtracting}
            >
              {isExtracting ? "Extracting..." : "Extract Information"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: Fill E-Content Info</Label>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter e-content title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="typeOfEContentPlatform">Platform *</Label>
            <Select
              value={formData.typeOfEContentPlatform}
              onValueChange={(value) => setValue("typeOfEContentPlatform", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SWAYAM">SWAYAM</SelectItem>
                <SelectItem value="NPTEL">NPTEL</SelectItem>
                <SelectItem value="Coursera">Coursera</SelectItem>
                <SelectItem value="edX">edX</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Udemy">Udemy</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quadrant">Quadrant</Label>
            <Select
              value={formData.quadrant}
              onValueChange={(value) => setValue("quadrant", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quadrant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="briefDetails">Brief Details</Label>
          <Textarea
            id="briefDetails"
            placeholder="Enter brief details"
            {...register("briefDetails")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="publishingDate">Publishing Date</Label>
            <Input
              id="publishingDate"
              type="date"
              {...register("publishingDate")}
            />
          </div>

          <div>
            <Label htmlFor="publishingAuthorities">Publishing Authorities</Label>
            <Input
              id="publishingAuthorities"
              placeholder="Enter publishing authorities"
              {...register("publishingAuthorities")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="Enter link"
              {...register("link")}
            />
          </div>

          <div>
            <Label htmlFor="typeOfEContent">Type of E-Content</Label>
            <Select
              value={formData.typeOfEContent}
              onValueChange={(value) => setValue("typeOfEContent", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Video Lectures">Video Lectures</SelectItem>
                <SelectItem value="Interactive Content">Interactive Content</SelectItem>
                <SelectItem value="Simulation">Simulation</SelectItem>
                <SelectItem value="E-Book">E-Book</SelectItem>
                <SelectItem value="Quiz/Assessment">Quiz/Assessment</SelectItem>
                <SelectItem value="Virtual Lab">Virtual Lab</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-medium">Uploaded Document Preview</Label>
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0]?.split(".").pop()?.toLowerCase() || ""}
            />
          </div>
        )}

       {!isEdit &&
         <div className="flex justify-end gap-4 mt-6">
         <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=econtent")}>
           Cancel
         </Button>
         <Button type="submit" disabled={isSubmitting}>
           {isSubmitting ? "Submitting..." : (
             <>
               <Save className="h-4 w-4 mr-2" />
               {isEdit ? "Update E-Content" : "Add E-Content"}
             </>
           )}
         </Button>
       </div>
       }
      </div>
    </form>
  )
}
