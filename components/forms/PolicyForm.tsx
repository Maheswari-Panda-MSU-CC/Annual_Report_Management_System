"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { Save } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useRouter } from "next/navigation"

interface PolicyFormProps {
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

export default function PolicyForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {}
}: PolicyFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form
  const formData = watch()

  console.log("Policy Form opened for editing");

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
              <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Policy Document</Label>
                    <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.doc,.docx" />
                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
                            <Button type="button" variant="outline" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
                                {isExtracting ? "Extracting..." : "Extract Information"}
                            </Button>
                            </div>
                        )}
            </div>
      

      <div className="bg-gray-50 p-4 rounded-lg space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="Enter policy title" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="level">Level *</Label>
            <Select value={formData.level} onValueChange={(value) => setValue("level", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Institutional">Institutional</SelectItem>
                <SelectItem value="State">State</SelectItem>
                <SelectItem value="National">National</SelectItem>
                <SelectItem value="International">International</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="organisation">Organisation *</Label>
            <Input id="organisation" placeholder="Enter organisation" {...register("organisation", { required: "Organisation is required" })} />
            {errors.organisation && <p className="text-sm text-red-600 mt-1">{errors.organisation.message?.toString()}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" {...register("date", { required: "Date is required" })} />
          {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
        </div>

        {/* Optional: Show document viewer in edit mode */}
        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div>
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
            />
          </div>
        )}

       {
        !isEdit && 
        <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teacher/research-contributions?tab=policy")}
          disabled={isSubmitting || isExtracting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? "Update Policy" : "Add Policy Document"}
        </Button>
      </div>
       }
      </div>
    </form>
  )
}
