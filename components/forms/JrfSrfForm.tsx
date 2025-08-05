"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useEffect } from "react"

interface JrfSrfFormProps {
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

export function JrfSrfForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: JrfSrfFormProps) {
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
      {/* Step 1: File Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">
          Step 1: Upload Supporting Document
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

      {/* Step 2: Fellowship Form */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-6">
        <Label className="text-lg font-semibold block">
          Step 2: Verify/Complete Fellowship Details
        </Label>

        {/* Personal Information */}
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup label="Full Name" id="name" register={register} required error={errors.name} />
          <InputGroup label="Roll Number" id="rollNumber" register={register} required error={errors.rollNumber} />
          <InputGroup label="Registration Number" id="registrationNumber" register={register} />
          <InputGroup label="Mobile Number" id="mobileNumber" register={register} required error={errors.mobileNumber} />
          <InputGroup label="Email Address" id="emailAddress" type="email" register={register} required error={errors.emailAddress} />
          <InputGroup label="Aadhar Number" id="aadharNumber" register={register} />
          <InputGroup label="PAN Number" id="panNumber" register={register} />
        </div>

        {/* Fellowship Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Fellowship Type *</Label>
            <Select value={formData.fellowshipType} onValueChange={(val) => setValue("fellowshipType", val)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="JRF">JRF</SelectItem>
                <SelectItem value="SRF">SRF</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.fellowshipType && <p className="text-sm text-red-500">{errors.fellowshipType.message?.toString()}</p>}
          </div>

          <div>
            <Label>Fellowship Category</Label>
            <Select value={formData.fellowshipCategory} onValueChange={(val) => setValue("fellowshipCategory", val)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UGC">UGC</SelectItem>
                <SelectItem value="CSIR">CSIR</SelectItem>
                <SelectItem value="DST">DST</SelectItem>
                <SelectItem value="ICMR">ICMR</SelectItem>
                <SelectItem value="DBT">DBT</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InputGroup label="Subject" id="subject" register={register} required error={errors.subject} />
          <InputGroup label="Research Area" id="researchArea" register={register} />
          <InputGroup label="Start Date" id="startDate" type="date" register={register} required error={errors.startDate} />
          <InputGroup label="End Date" id="endDate" type="date" register={register} />
        </div>

        {/* Academic Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup label="Supervisor Name" id="supervisorName" register={register} required error={errors.supervisorName} />
          <InputGroup label="Department" id="department" register={register} required error={errors.department} />
          <InputGroup label="University" id="university" register={register} required error={errors.university} />
        </div>

        {/* Financial Info */}
        <div className="grid md:grid-cols-4 gap-4">
          <InputGroup label="Stipend Amount" id="stipendAmount" type="number" register={register} />
          <InputGroup label="HRA Amount" id="hraAmount" type="number" register={register} />
          <InputGroup label="Contingency Amount" id="contingencyAmount" type="number" register={register} />
          <InputGroup label="Total Amount" id="totalAmount" type="number" register={register} />
        </div>

        {/* Bank Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup label="Bank Name" id="bankName" register={register} />
          <InputGroup label="Account Number" id="accountNumber" register={register} />
          <InputGroup label="IFSC Code" id="ifscCode" register={register} />
        </div>

        {/* Address Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Permanent Address</Label>
            <Textarea {...register("permanentAddress")} placeholder="Enter permanent address" rows={3} />
          </div>
          <div>
            <Label>Current Address</Label>
            <Textarea {...register("currentAddress")} placeholder="Enter current address" rows={3} />
          </div>
        </div>

        {/* Edit mode document viewer */}
        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <DocumentViewer
            documentUrl={formData.supportingDocument[0]}
            documentType={formData.supportingDocument[0].split(".").pop()?.toLowerCase() || ""}
          />
        )}

        {/* Submit/Cancel Buttons */}
        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add JRF/SRF Record
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}

function InputGroup({ label, id, type = "text", register, required = false, error }: any) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input id={id} type={type} {...register(id, required ? { required: `${label} is required` } : {})} />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
