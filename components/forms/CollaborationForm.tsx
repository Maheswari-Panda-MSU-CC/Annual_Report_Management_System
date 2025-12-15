"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"
import { Controller } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { DocumentViewer } from "../document-viewer"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { cn } from "@/lib/utils"

interface CollaborationFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isEdit?: boolean
  editData?: Record<string, any>
  collaborationsLevelOptions?: Array<{ id: number; name: string }>
  collaborationsOutcomeOptions?: Array<{ id: number; name: string }>
  collaborationsTypeOptions?: Array<{ id: number; name: string }>
  onClearFields?: () => void
  onCancel?: () => void
  isAutoFilled?: (fieldName: string) => boolean
  onFieldChange?: (fieldName: string) => void
}

export function CollaborationForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  collaborationsLevelOptions: propCollaborationsLevelOptions,
  collaborationsOutcomeOptions: propCollaborationsOutcomeOptions,
  collaborationsTypeOptions: propCollaborationsTypeOptions,
  initialDocumentUrl,
  onClearFields,
  onCancel,
  isAutoFilled,
  onFieldChange,
}: CollaborationFormProps & { initialDocumentUrl?: string }) {
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
  const status = formData.status || ""
  const mouSigned = formData.mouSigned
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
    collaborationsLevelOptions: hookCollaborationsLevelOptions, 
    collaborationsOutcomeOptions: hookCollaborationsOutcomeOptions,
    collaborationsTypeOptions: hookCollaborationsTypeOptions,
    fetchCollaborationsLevels,
    fetchCollaborationsOutcomes,
    fetchCollaborationsTypes
  } = useDropDowns()
  
  const collaborationsLevelOptions = propCollaborationsLevelOptions || hookCollaborationsLevelOptions
  const collaborationsOutcomeOptions = propCollaborationsOutcomeOptions || hookCollaborationsOutcomeOptions
  const collaborationsTypeOptions = propCollaborationsTypeOptions || hookCollaborationsTypeOptions

  // Check if duration should be disabled (when status is Active or Ongoing)
  const isDurationDisabled = status === "Active" || status === "Ongoing" || status === "Pending"
  
  // Check if signing date should be enabled (when MOU Signed is Yes)
  const isSigningDateEnabled = mouSigned === true || mouSigned === "true"

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propCollaborationsLevelOptions && hookCollaborationsLevelOptions.length === 0) {
      fetchCollaborationsLevels()
    }
    if (!propCollaborationsOutcomeOptions && hookCollaborationsOutcomeOptions.length === 0) {
      fetchCollaborationsOutcomes()
    }
    if (!propCollaborationsTypeOptions && hookCollaborationsTypeOptions.length === 0) {
      fetchCollaborationsTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial values when in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.collaborating_inst) setValue("collaboratingInstitute", editData.collaborating_inst)
      if (editData.collab_name) setValue("collabName", editData.collab_name)
      // Map category - use type ID (category dropdown now uses type options)
      if (editData.type) {
        setValue("category", editData.type)
      } else if (editData.category) {
        // Fallback: try to find type ID from category name
        const typeOption = collaborationsTypeOptions.find(opt => opt.name === editData.category)
        if (typeOption) {
          setValue("category", typeOption.id)
        }
      }
      if (editData.collab_rank) setValue("collabRank", editData.collab_rank)
      if (editData.address) setValue("address", editData.address)
      if (editData.details) setValue("details", editData.details)
      if (editData.collab_outcome) setValue("collabOutcome", editData.collab_outcome)
      if (editData.Collaborations_Outcome_Id) setValue("collabOutcome", editData.Collaborations_Outcome_Id)
      if (editData.collab_status) setValue("status", editData.collab_status)
      if (editData.starting_date) setValue("startingDate", editData.starting_date)
      if (editData.duration) setValue("duration", editData.duration)
      if (editData.level) setValue("level", editData.level)
      if (editData.Collaborations_Level_Id) setValue("level", editData.Collaborations_Level_Id)
      if (editData.beneficiary_num) setValue("noOfBeneficiary", editData.beneficiary_num)
      if (editData.MOU_signed !== undefined) setValue("mouSigned", editData.MOU_signed)
      if (editData.signing_date) setValue("signingDate", editData.signing_date)
      if (editData.doc) setValue("doc", editData.doc)
      if (editData.supportingDocument) {
        setValue("supportingDocument", editData.supportingDocument)
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
    }
  }, [isEdit, editData, setValue, collaborationsTypeOptions])

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (fields.category) setValue("category", fields.category)
    if (fields.collaboratingInstitute) setValue("collaboratingInstitute", fields.collaboratingInstitute)
    if (fields.collabName) setValue("collabName", fields.collabName)
    if (fields.address) setValue("address", fields.address)
    if (fields.details) setValue("details", fields.details)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Collaboration Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="Research & Consultancy"
          subCategory="Collaborations/MOUs/Linkages Signed"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supportingDocument", url ? [url] : [])
          }}
          onExtract={handleExtractedFields}
          onClearFields={onClearFields}
          isEditMode={isEdit}
          className="w-full"
        />
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Verify/Complete Collaboration Information</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label className="text-sm sm:text-base">Category *</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={collaborationsTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    onFieldChange?.("category")
                  }}
                  placeholder="Select category"
                  emptyMessage="No category found"
                  className={isAutoFilled?.("category") ? "bg-blue-50 border-blue-200" : undefined}
                />
              )}
            />
            {errors.category && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.category.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label className="text-sm sm:text-base">Collaborating Institute *</Label>
            <Input 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("collaboratingInstitute") && "bg-blue-50 border-blue-200"
              )}
              {...register("collaboratingInstitute", { 
                required: "Institute is required",
                onChange: () => onFieldChange?.("collaboratingInstitute")
              })} 
            />
            {errors.collaboratingInstitute && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.collaboratingInstitute.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label className="text-sm sm:text-base">Name of Collaboration *</Label>
            <Input 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("collabName") && "bg-blue-50 border-blue-200"
              )}
              {...register("collabName", {
                required: "Name of collaboration is required",
                onChange: () => onFieldChange?.("collabName")
              })} 
            />
            {errors.collabName && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.collabName.message?.toString()}</p>
            )}
          </div>
          <div>
            <Label className="text-sm sm:text-base">QS/THE Ranking *</Label>
            <Input 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("collabRank") && "bg-blue-50 border-blue-200"
              )}
              {...register("collabRank", {
                required: "QS/THE Ranking is required",
                onChange: () => onFieldChange?.("collabRank")
              })} 
            />
            {errors.collabRank && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.collabRank.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-sm sm:text-base">Address *</Label>
          <Input 
            className={cn(
              "text-sm sm:text-base h-9 sm:h-10 mt-1",
              isAutoFilled?.("address") && "bg-blue-50 border-blue-200"
            )}
            {...register("address", {
              required: "Address is required",
              onChange: () => onFieldChange?.("address")
            })} 
          />
          {errors.address && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.address.message?.toString()}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="text-sm sm:text-base">Details *</Label>
          <Textarea 
            rows={3} 
            className={cn(
              "text-sm sm:text-base mt-1",
              isAutoFilled?.("details") && "bg-blue-50 border-blue-200"
            )}
            {...register("details", {
              required: "Details are required",
              onChange: () => onFieldChange?.("details")
            })} 
          />
          {errors.details && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.details.message?.toString()}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="text-sm sm:text-base">Collaboration Outcome *</Label>
          <Controller
            name="collabOutcome"
            control={control}
            rules={{ required: "Collaboration outcome is required" }}
            render={({ field }) => (
              <SearchableSelect
                options={collaborationsOutcomeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  onFieldChange?.("collabOutcome")
                }}
                placeholder="Select collaboration outcome"
                emptyMessage="No outcome found"
                className={isAutoFilled?.("collabOutcome") ? "bg-blue-50 border-blue-200" : undefined}
              />
            )}
          />
          {errors.collabOutcome && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.collabOutcome.message?.toString()}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          <div>
            <Label className="text-sm sm:text-base">Status *</Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select 
                  value={field.value || ""} 
                  onValueChange={(val) => {
                    field.onChange(val)
                    onFieldChange?.("status")
                    // Clear duration if status is not Completed
                    if (val !== "Completed") {
                      setValue("duration", null)
                    }
                    // Trigger validation for duration field when status changes
                    setTimeout(() => {
                      form.trigger("duration")
                    }, 0)
                  }}
                >
                  <SelectTrigger className={cn(
                    "text-sm sm:text-base h-9 sm:h-10 mt-1",
                    isAutoFilled?.("status") && "bg-blue-50 border-blue-200"
                  )}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.status.message?.toString()}</p>
            )}
          </div>
          <div>
            <Label className="text-sm sm:text-base">Starting Date *</Label>
            <Input 
              type="date" 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("startingDate") && "bg-blue-50 border-blue-200"
              )}
              {...register("startingDate", {
                required: "Starting date is required",
                onChange: () => onFieldChange?.("startingDate")
              })} 
            />
            {errors.startingDate && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.startingDate.message?.toString()}</p>
            )}
          </div>
          <div>
            <Label className="text-sm sm:text-base">Duration (months)</Label>
            <Input 
              type="number" 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("duration") && "bg-blue-50 border-blue-200",
                isDurationDisabled && "bg-gray-100 cursor-not-allowed"
              )}
              {...register("duration", { 
                validate: (value) => {
                  const currentStatus = watch("status")
                  if (currentStatus === "Completed" && (value === null || value === undefined || value === "")) {
                    return "Duration is required when status is Completed"
                  }
                  if (value !== null && value !== undefined && value !== "" && Number(value) < 0) {
                    return "Duration must be 0 or greater"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("duration")
              })} 
              disabled={isDurationDisabled}
            />
            {errors.duration && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.duration.message?.toString()}</p>
            )}
            {isDurationDisabled && (
              <p className="text-xs text-gray-500 mt-1">Duration can only be set when status is Completed</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label className="text-sm sm:text-base">Level *</Label>
            <Controller
              name="level"
              control={control}
              rules={{ required: "Level is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={collaborationsLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    onFieldChange?.("level")
                  }}
                  placeholder="Select level"
                  emptyMessage="No level found"
                  className={isAutoFilled?.("level") ? "bg-blue-50 border-blue-200" : undefined}
                />
              )}
            />
            {errors.level && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>
            )}
          </div>
          <div>
            <Label className="text-sm sm:text-base">No. of Beneficiary *</Label>
            <Input 
              type="number" 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("noOfBeneficiary") && "bg-blue-50 border-blue-200"
              )}
              {...register("noOfBeneficiary", { 
                required: "Number of beneficiary is required",
                min: { value: 0, message: "Number of beneficiary must be 0 or greater" },
                onChange: () => onFieldChange?.("noOfBeneficiary")
              })} 
            />
            {errors.noOfBeneficiary && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.noOfBeneficiary.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label className="text-sm sm:text-base">MOU Signed? *</Label>
            <Controller
              name="mouSigned"
              control={control}
              rules={{ required: "MOU Signed status is required" }}
              render={({ field }) => (
                <Select 
                  value={field.value !== undefined ? String(field.value) : ""} 
                  onValueChange={(val) => {
                    field.onChange(val === "true")
                    onFieldChange?.("mouSigned")
                    // Clear signing date if MOU is not signed
                    if (val === "false") {
                      setValue("signingDate", null)
                    }
                  }}
                >
                  <SelectTrigger className={cn(
                    "text-sm sm:text-base h-9 sm:h-10 mt-1",
                    isAutoFilled?.("mouSigned") && "bg-blue-50 border-blue-200"
                  )}>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mouSigned && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.mouSigned.message?.toString()}</p>
            )}
          </div>
          <div>
            <Label className="text-sm sm:text-base">Signing Date</Label>
            <Input 
              type="date" 
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("signingDate") && "bg-blue-50 border-blue-200",
                !isSigningDateEnabled && "bg-gray-100 cursor-not-allowed"
              )}
              {...register("signingDate", {
                required: false,
                onChange: () => onFieldChange?.("signingDate")
              })} 
              disabled={!isSigningDateEnabled}
            />
            {errors.signingDate && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.signingDate.message?.toString()}</p>
            )}
            {!isSigningDateEnabled && (
              <p className="text-xs text-gray-500 mt-1">Signing date is only available when MOU is signed</p>
            )}
          </div>
        </div>



        {!isEdit && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=collaborations"))} className="w-full sm:w-auto text-xs sm:text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add Collaboration
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
