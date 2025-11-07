"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useDropDowns } from "@/hooks/use-dropdowns"

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
  financialSupportTypeOptions?: Array<{ id: number; name: string }>
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
  financialSupportTypeOptions: propFinancialSupportTypeOptions,
}: FinancialFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form
  const formData = watch()

  // Use props if provided, otherwise fetch from hook
  const { 
    financialSupportTypeOptions: hookFinancialSupportTypeOptions,
    fetchFinancialSupportTypes
  } = useDropDowns()
  
  const financialSupportTypeOptions = propFinancialSupportTypeOptions || hookFinancialSupportTypeOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propFinancialSupportTypeOptions && hookFinancialSupportTypeOptions.length === 0) {
      fetchFinancialSupportTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial values when in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.name) setValue("nameOfSupport", editData.name)
      if (editData.type) setValue("type", editData.type)
      if (editData.Financial_Support_Type_Id) setValue("type", editData.Financial_Support_Type_Id)
      if (editData.support) setValue("supportingAgency", editData.support)
      if (editData.grant_received) setValue("grantReceived", editData.grant_received)
      if (editData.details) setValue("detailsOfEvent", editData.details)
      if (editData.purpose) setValue("purposeOfGrant", editData.purpose)
      if (editData.date) setValue("date", editData.date)
      if (editData.doc) setValue("doc", editData.doc)
      if (editData.supportingDocument) setValue("supportingDocument", editData.supportingDocument)
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
            <Controller
              name="type"
              control={control}
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={financialSupportTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select type"
                  emptyMessage="No type found"
                />
              )}
            />
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">{errors.type.message?.toString()}</p>
            )}
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
              min="0"
              step="0.01"
              {...register("grantReceived", {
                required: "Grant amount is required",
                min: { value: 0, message: "Grant amount must be positive" },
                validate: (value) => {
                  if (value && isNaN(Number(value))) {
                    return "Please enter a valid number"
                  }
                  return true
                }
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
              max={new Date().toISOString().split('T')[0]}
              {...register("date", { 
                required: "Date is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date cannot be in the future"
                  }
                  return true
                }
              })}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">
                {errors.date.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="detailsOfEvent">Details</Label>
          <Textarea
            id="detailsOfEvent"
            rows={3}
            placeholder="Enter details"
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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
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
