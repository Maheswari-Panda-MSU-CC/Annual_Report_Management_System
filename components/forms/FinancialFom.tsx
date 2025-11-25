"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
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
  initialDocumentUrl,
}: FinancialFormProps & { initialDocumentUrl?: string }) {
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
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    initialDocumentUrl || // Use initial document URL from auto-fill first
    (isEdit && editData?.supportingDocument?.[0] ? editData.supportingDocument[0] : undefined)
  )

  // Update documentUrl when initialDocumentUrl changes
  // Always update if initialDocumentUrl is provided and different from current value
  // This handles cases where autoFillDocumentUrl becomes available after component mount
  // CRITICAL: Also update form field for validation
  useEffect(() => {
    if (initialDocumentUrl) {
      // Always update documentUrl if it's different
      if (documentUrl !== initialDocumentUrl) {
        setDocumentUrl(initialDocumentUrl)
      }
      // CRITICAL FIX: Check form field value, not just state comparison
      // On initial mount, documentUrl === initialDocumentUrl, so we need to check form field
      const currentFormValue = form.getValues("supportingDocument")
      const formValueIsEmpty = !currentFormValue || 
                             (Array.isArray(currentFormValue) && currentFormValue.length === 0) ||
                             (Array.isArray(currentFormValue) && !currentFormValue[0])
      
      if (formValueIsEmpty) {
        setValue("supportingDocument", [initialDocumentUrl], { shouldValidate: false, shouldDirty: false })
      }
    }
  }, [initialDocumentUrl, documentUrl, setValue, form])

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
      if (editData.supportingDocument) {
        setValue("supportingDocument", editData.supportingDocument)
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
    }
  }, [isEdit, editData, setValue])

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (handleExtractInfo) {
      handleExtractInfo()
    }
    if (fields.nameOfSupport) setValue("nameOfSupport", fields.nameOfSupport)
    if (fields.type) setValue("type", fields.type)
    if (fields.supportingAgency) setValue("supportingAgency", fields.supportingAgency)
    if (fields.grantReceived) setValue("grantReceived", fields.grantReceived)
    if (fields.date) setValue("date", fields.date)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">
          Step 1: Upload Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="research-contributions"
          subCategory="financial"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supportingDocument", url ? [url] : [])
          }}
          onExtract={handleExtractedFields}
          className="w-full"
        />
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">
          Step 2: Fill Financial Support Details
        </Label>

        <div>
          <Label htmlFor="nameOfSupport" className="text-sm sm:text-base">Name of Support *</Label>
          <Input
            id="nameOfSupport"
            placeholder="Enter support name"
            className="text-sm sm:text-base h-9 sm:h-10 mt-1"
            {...register("nameOfSupport", {
              required: "Support name is required",
            })}
          />
          {errors.nameOfSupport && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">
              {errors.nameOfSupport.message?.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="type" className="text-sm sm:text-base">Type *</Label>
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
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.type.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="supportingAgency" className="text-sm sm:text-base">Supporting Agency *</Label>
            <Input
              id="supportingAgency"
              placeholder="Enter agency name"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("supportingAgency", {
                required: "Supporting agency is required",
              })}
            />
            {errors.supportingAgency && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.supportingAgency.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="grantReceived" className="text-sm sm:text-base">Grant Received (₹) *</Label>
            <Input
              id="grantReceived"
              type="number"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
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
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.grantReceived.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date" className="text-sm sm:text-base">Date *</Label>
            <Input
              id="date"
              type="date"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
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
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.date.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="detailsOfEvent" className="text-sm sm:text-base">Details</Label>
          <Textarea
            id="detailsOfEvent"
            rows={3}
            placeholder="Enter details"
            className="text-sm sm:text-base mt-1"
            {...register("detailsOfEvent")}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="purposeOfGrant" className="text-sm sm:text-base">Purpose of Grant</Label>
          <Textarea
            id="purposeOfGrant"
            rows={3}
            placeholder="Enter purpose of grant"
            className="text-sm sm:text-base mt-1"
            {...register("purposeOfGrant")}
          />
        </div>


        {!isEdit && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/teacher/research-contributions?tab=financial")
              }
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
