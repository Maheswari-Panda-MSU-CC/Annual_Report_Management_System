"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"
import { Controller } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface CollaborationFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  collaborationsLevelOptions?: Array<{ id: number; name: string }>
  collaborationsOutcomeOptions?: Array<{ id: number; name: string }>
  collaborationsTypeOptions?: Array<{ id: number; name: string }>
}

export function CollaborationForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  collaborationsLevelOptions: propCollaborationsLevelOptions,
  collaborationsOutcomeOptions: propCollaborationsOutcomeOptions,
  collaborationsTypeOptions: propCollaborationsTypeOptions,
}: CollaborationFormProps) {
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
      if (editData.supportingDocument) setValue("supportingDocument", editData.supportingDocument)
    }
  }, [isEdit, editData, setValue, collaborationsTypeOptions])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Collaboration Document</Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
            <Button type="button" variant="outline" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Extracting...
                </>
              ) : (
                "Extract Information"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Collaboration Information</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Category *</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={collaborationsTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select category"
                  emptyMessage="No category found"
                />
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label>Collaborating Institute *</Label>
            <Input {...register("collaboratingInstitute", { required: "Institute is required" })} />
            {errors.collaboratingInstitute && (
              <p className="text-sm text-red-600">{errors.collaboratingInstitute.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label>Name of Collaboration</Label>
            <Input {...register("collabName")} />
          </div>
          <div>
            <Label>QS/THE Ranking</Label>
            <Input {...register("collabRank")} />
          </div>
        </div>

        <div className="mt-4">
          <Label>Address</Label>
          <Input {...register("address")} />
        </div>

        <div className="mt-4">
          <Label>Details</Label>
          <Textarea rows={3} {...register("details")} />
        </div>

        <div className="mt-4">
          <Label>Collaboration Outcome</Label>
          <Controller
            name="collabOutcome"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                options={collaborationsOutcomeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select collaboration outcome"
                emptyMessage="No outcome found"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <Label>Status</Label>
            <Select value={formData.status || ""} onValueChange={(val) => {
              setValue("status", val)
              // Clear duration if status is not Completed
              if (val !== "Completed") {
                setValue("duration", null)
              }
            }}>
              <SelectTrigger>
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
          </div>
          <div>
            <Label>Starting Date</Label>
            <Input type="date" {...register("startingDate")} />
          </div>
          <div>
            <Label>Duration (months)</Label>
            <Input 
              type="number" 
              {...register("duration", { min: 0 })} 
              disabled={isDurationDisabled}
              className={isDurationDisabled ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            {isDurationDisabled && (
              <p className="text-xs text-gray-500 mt-1">Duration can only be set when status is Completed</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label>Level</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={collaborationsLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select level"
                  emptyMessage="No level found"
                />
              )}
            />
          </div>
          <div>
            <Label>No. of Beneficiary</Label>
            <Input type="number" {...register("noOfBeneficiary", { min: 0 })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label>MOU Signed?</Label>
            <Select 
              value={formData.mouSigned !== undefined ? String(formData.mouSigned) : ""} 
              onValueChange={(val) => {
                setValue("mouSigned", val === "true")
                // Clear signing date if MOU is not signed
                if (val === "false") {
                  setValue("signingDate", null)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Signing Date</Label>
            <Input 
              type="date" 
              {...register("signingDate")} 
              disabled={!isSigningDateEnabled}
              className={!isSigningDateEnabled ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            {!isSigningDateEnabled && (
              <p className="text-xs text-gray-500 mt-1">Signing date is only available when MOU is signed</p>
            )}
          </div>
        </div>


        {isEdit && formData?.supportingDocument?.[0] && (
          <div className="mt-4">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0].split(".").pop()?.toLowerCase() || ""}
            />
          </div>
        )}

        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=collaborations")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
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
