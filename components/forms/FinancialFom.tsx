"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"

interface FinancialFormProps {
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

export function FinancialForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: FinancialFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form
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
        <Label className="text-lg font-semibold mb-3 block">
          Step 1: Upload Document for Auto-Fill
        </Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && selectedFiles.length > 0 && (
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
        <Label className="text-lg font-semibold mb-4 block">
          Step 2: Fill Financial Support Details
        </Label>

        <div>
          <Label htmlFor="nameOfSupport">Name of Support *</Label>
          <Input
            id="nameOfSupport"
            placeholder="Enter support name"
            {...register("nameOfSupport", {
              required: "Support name is required",
            })}
          />
          {errors.nameOfSupport && (
            <p className="text-sm text-red-600 mt-1">
              {errors.nameOfSupport.message?.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Research Grant">Research Grant</SelectItem>
                <SelectItem value="Travel Grant">Travel Grant</SelectItem>
                <SelectItem value="Equipment Grant">Equipment Grant</SelectItem>
                <SelectItem value="Fellowship">Fellowship</SelectItem>
                <SelectItem value="Conference Grant">Conference Grant</SelectItem>
                <SelectItem value="Publication Grant">Publication Grant</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="supportingAgency">Supporting Agency *</Label>
            <Input
              id="supportingAgency"
              placeholder="Enter agency name"
              {...register("supportingAgency", {
                required: "Supporting agency is required",
              })}
            />
            {errors.supportingAgency && (
              <p className="text-sm text-red-600 mt-1">
                {errors.supportingAgency.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="grantReceived">Grant Received (₹) *</Label>
            <Input
              id="grantReceived"
              type="number"
              placeholder="Enter amount"
              {...register("grantReceived", {
                required: "Grant amount is required",
              })}
            />
            {errors.grantReceived && (
              <p className="text-sm text-red-600 mt-1">
                {errors.grantReceived.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">
                {errors.date.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="detailsOfEvent">Details of Event</Label>
          <Textarea
            id="detailsOfEvent"
            rows={3}
            placeholder="Enter event or project details"
            {...register("detailsOfEvent")}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="purposeOfGrant">Purpose of Grant</Label>
          <Textarea
            id="purposeOfGrant"
            rows={3}
            placeholder="Enter purpose of grant"
            {...register("purposeOfGrant")}
          />
        </div>

        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-4">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={
                formData.supportingDocument[0].split(".").pop()?.toLowerCase() ||
                ""
              }
            />
          </div>
        )}

        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/teacher/research-contributions?tab=financial")
              }
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Financial Support
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
