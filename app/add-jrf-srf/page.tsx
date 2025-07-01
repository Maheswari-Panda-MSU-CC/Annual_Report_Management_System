"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, Wand2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface JrfSrfForm {
  name: string
  rollNumber: string
  registrationNumber: string
  fellowshipType: string
  fellowshipCategory: string
  subject: string
  researchArea: string
  supervisorName: string
  department: string
  university: string
  startDate: string
  endDate: string
  stipendAmount: string
  hraAmount: string
  contingencyAmount: string
  totalAmount: string
  bankName: string
  accountNumber: string
  ifscCode: string
  aadharNumber: string
  panNumber: string
  mobileNumber: string
  emailAddress: string
  permanentAddress: string
  currentAddress: string
  supportingDocument: File | null
}

export default function AddJrfSrfPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JrfSrfForm>()

  const [formData, setFormData] = useState<JrfSrfForm>({
    name: "",
    rollNumber: "",
    registrationNumber: "",
    fellowshipType: "",
    fellowshipCategory: "",
    subject: "",
    researchArea: "",
    supervisorName: "",
    department: "",
    university: "",
    startDate: "",
    endDate: "",
    stipendAmount: "",
    hraAmount: "",
    contingencyAmount: "",
    totalAmount: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    aadharNumber: "",
    panNumber: "",
    mobileNumber: "",
    emailAddress: "",
    permanentAddress: "",
    currentAddress: "",
    supportingDocument: null,
  })

  const handleInputChange = (field: keyof JrfSrfForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or image files (JPEG, PNG, JPG)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      supportingDocument: file,
    }))
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleAutoFill = useCallback(async () => {
    setIsExtracting(true)
    try {
      const categoryResponse = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "jrf_srf" }),
      })

      if (!categoryResponse.ok) {
        throw new Error("Failed to get category")
      }

      const categoryData = await categoryResponse.json()

      const formFieldsResponse = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryData.category,
          type: "jrf_srf",
        }),
      })

      if (!formFieldsResponse.ok) {
        throw new Error("Failed to get form fields")
      }

      const formFieldsData = await formFieldsResponse.json()

      if (formFieldsData.success && formFieldsData.data) {
        const data = formFieldsData.data

        Object.keys(data).forEach((key) => {
          if (key in formData) {
            setValue(key, data[key])
          }
        })

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
      setIsExtracting(false)
    }
  }, [setValue, toast])

  const onSubmit = async (data: JrfSrfForm) => {
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = [
        "name",
        "rollNumber",
        "fellowshipType",
        "subject",
        "supervisorName",
        "department",
        "university",
        "startDate",
        "mobileNumber",
        "emailAddress",
      ]
      const missingFields = requiredFields.filter((field) => !data[field as keyof JrfSrfForm])

      if (missingFields.length > 0) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success!",
        description: "JRF/SRF record has been added successfully.",
      })

      // Redirect back to academic recommendations page
      router.push("/academic-recommendations")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add JRF/SRF record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add JRF/SRF Record</h1>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>JRF/SRF Fellowship Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Document Upload Section - Now at top */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drag and drop your file here, or{" "}
                    <label
                      htmlFor="file-upload"
                      className="text-primary hover:text-primary/80 cursor-pointer font-medium"
                    >
                      browse
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPEG, PNG, JPG up to 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0])
                      }
                    }}
                  />
                </div>
              </div>

              {formData.supportingDocument && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>{formData.supportingDocument.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFill}
                    disabled={isExtracting}
                    className="flex items-center gap-2"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Extract Information
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Fellowship Details</Label>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        placeholder="Enter full name"
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">
                        Roll Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="rollNumber"
                        {...register("rollNumber", { required: "Roll number is required" })}
                        placeholder="Enter roll number"
                      />
                      {errors.rollNumber && <p className="text-sm text-red-500 mt-1">{errors.rollNumber.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        {...register("registrationNumber")}
                        placeholder="Enter registration number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">
                        Mobile Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="mobileNumber"
                        {...register("mobileNumber", { required: "Mobile number is required" })}
                        placeholder="Enter mobile number"
                      />
                      {errors.mobileNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.mobileNumber.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailAddress">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emailAddress"
                        type="email"
                        {...register("emailAddress", { required: "Email is required" })}
                        placeholder="Enter email address"
                      />
                      {errors.emailAddress && (
                        <p className="text-sm text-red-500 mt-1">{errors.emailAddress.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aadharNumber">Aadhar Number</Label>
                      <Input id="aadharNumber" {...register("aadharNumber")} placeholder="Enter Aadhar number" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input id="panNumber" {...register("panNumber")} placeholder="Enter PAN number" />
                    </div>
                  </div>
                </div>

                {/* Fellowship Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Fellowship Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fellowshipType">
                        Fellowship Type <span className="text-red-500">*</span>
                      </Label>
                      <Select {...register("fellowshipType", { required: "Fellowship type is required" })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fellowship type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JRF">JRF (Junior Research Fellowship)</SelectItem>
                          <SelectItem value="SRF">SRF (Senior Research Fellowship)</SelectItem>
                          <SelectItem value="PDF">PDF (Post Doctoral Fellowship)</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.fellowshipType && (
                        <p className="text-sm text-red-500 mt-1">{errors.fellowshipType.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fellowshipCategory">Fellowship Category</Label>
                      <Select {...register("fellowshipCategory")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
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

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        {...register("subject", { required: "Subject is required" })}
                        placeholder="Enter subject"
                      />
                      {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="researchArea">Research Area</Label>
                      <Input id="researchArea" {...register("researchArea")} placeholder="Enter research area" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register("startDate", { required: "Start date is required" })}
                      />
                      {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" {...register("endDate")} />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supervisorName">
                        Supervisor Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supervisorName"
                        {...register("supervisorName", { required: "Supervisor name is required" })}
                        placeholder="Enter supervisor name"
                      />
                      {errors.supervisorName && (
                        <p className="text-sm text-red-500 mt-1">{errors.supervisorName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="department"
                        {...register("department", { required: "Department is required" })}
                        placeholder="Enter department"
                      />
                      {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university">
                        University <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="university"
                        {...register("university", { required: "University is required" })}
                        placeholder="Enter university name"
                      />
                      {errors.university && <p className="text-sm text-red-500 mt-1">{errors.university.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stipendAmount">Stipend Amount (₹)</Label>
                      <Input
                        id="stipendAmount"
                        type="number"
                        {...register("stipendAmount")}
                        placeholder="Enter stipend amount"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hraAmount">HRA Amount (₹)</Label>
                      <Input
                        id="hraAmount"
                        type="number"
                        {...register("hraAmount")}
                        placeholder="Enter HRA amount"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contingencyAmount">Contingency Amount (₹)</Label>
                      <Input
                        id="contingencyAmount"
                        type="number"
                        {...register("contingencyAmount")}
                        placeholder="Enter contingency amount"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        {...register("totalAmount")}
                        placeholder="Enter total amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Bank Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" {...register("bankName")} placeholder="Enter bank name" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" {...register("accountNumber")} placeholder="Enter account number" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input id="ifscCode" {...register("ifscCode")} placeholder="Enter IFSC code" />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="permanentAddress">Permanent Address</Label>
                      <Textarea
                        id="permanentAddress"
                        {...register("permanentAddress")}
                        placeholder="Enter permanent address"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentAddress">Current Address</Label>
                      <Textarea
                        id="currentAddress"
                        {...register("currentAddress")}
                        placeholder="Enter current address"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Record...
                      </>
                    ) : (
                      "Add JRF/SRF Record"
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
