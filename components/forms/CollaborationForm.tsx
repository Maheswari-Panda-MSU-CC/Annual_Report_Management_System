"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"

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
}: CollaborationFormProps) {
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
            <Select value={formData.category} onValueChange={(val) => setValue("category", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Research Collaboration">Research Collaboration</SelectItem>
                <SelectItem value="Academic Exchange">Academic Exchange</SelectItem>
                <SelectItem value="Joint Program">Joint Program</SelectItem>
                <SelectItem value="MoU">MoU</SelectItem>
                <SelectItem value="Linkage">Linkage</SelectItem>
                <SelectItem value="Student Exchange">Student Exchange</SelectItem>
              </SelectContent>
            </Select>
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
            <Label>Name of Collaborator</Label>
            <Input {...register("nameOfCollaborator")} />
          </div>
          <div>
            <Label>QS/THE Ranking</Label>
            <Input {...register("qsTheRanking")} />
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
          <Textarea rows={3} {...register("collaborationOutcome")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(val) => setValue("status", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
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
            <Input type="number" {...register("duration")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <Label>Level</Label>
            <Select value={formData.level} onValueChange={(val) => setValue("level", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="International">International</SelectItem>
                <SelectItem value="National">National</SelectItem>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>No. of Beneficiary</Label>
            <Input type="number" {...register("noOfBeneficiary")} />
          </div>
          <div>
            <Label>MOU Signed?</Label>
            <Select value={formData.mouSigned} onValueChange={(val) => setValue("mouSigned", val)}>
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
        </div>

        <div className="mt-4">
          <Label>Signing Date</Label>
          <Input type="date" {...register("signingDate")} />
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
