"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"

interface OnlineEngagementForm {
  faculty: string
  department: string
  format: string
  programme: string
  subject: string
  teacherName: string
  email: string
  mobile: string
  researchGroup: string
  externalExpert: string
  participantCount: string
  participantNames: string
  description: string
  certificateIssued: string
  activityName: string
  platform: string
  date: string
  attachment1: File | null
  attachment2: File | null
  document: File | null
}

const initialFormData = {
  faculty: "",
  department: "",
  format: "",
  programme: "",
  subject: "",
  teacherName: "",
  email: "",
  mobile: "",
  researchGroup: "",
  externalExpert: "",
  participantCount: "",
  participantNames: "",
  description: "",
  certificateIssued: "",
  activityName: "",
  platform: "",
  date: "",
  attachment1: null,
  attachment2: null,
  document: null,
}

export default function AddOnlineEngagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isEdit = searchParams.get("edit")
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnlineEngagementForm>()

  useEffect(() => {
    if (isEdit) {
      // In a real app, you would fetch the data based on the ID
      // For now, we'll just show the form in edit mode
    }
  }, [isEdit])

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleExtractInfo = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const categoryResponse = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "online_engagement" }),
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
          type: "online_engagement",
        }),
      })

      if (!formFieldsResponse.ok) {
        throw new Error("Failed to get form fields")
      }

      const formFieldsData = await formFieldsResponse.json()

      if (formFieldsData.success && formFieldsData.data) {
        const data = formFieldsData.data

        Object.keys(data).forEach((key) => {
          if (key in initialFormData) {
            setValue(key as keyof OnlineEngagementForm, data[key])
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
  }, [setValue, toast, selectedFiles])

  const onSubmit = (data: OnlineEngagementForm) => {
    // In a real app, you would submit the data to your backend
    console.log("Form submitted:", data)

    toast({
      title: "Success",
      description: `Online engagement ${isEdit ? "updated" : "added"} successfully`,
    })

    // Reset form and navigate back
    router.push("/teacher/online-engagement")
  }

  const handleCancel = () => {
    router.push("/teacher/online-engagement")
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Online Engagements
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit" : "Add"} Online Engagement</h1>
            <p className="text-muted-foreground">{isEdit ? "Update" : "Create"} online engagement information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Faculty Information */}
          <Card>
            <CardHeader>
              <CardTitle>Faculty Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="faculty">Faculty *</Label>
                  <Select {...register("faculty")} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. John Smith">Dr. John Smith</SelectItem>
                      <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="Dr. Robert Wilson">Dr. Robert Wilson</SelectItem>
                      <SelectItem value="Dr. Emily Davis">Dr. Emily Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select {...register("department")} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teacherName">Teacher Name *</Label>
                  <Input id="teacherName" {...register("teacherName", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" type="tel" {...register("mobile")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programme Details */}
          <Card>
            <CardHeader>
              <CardTitle>Programme Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Format *</Label>
                  <Select {...register("format")} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="programme">Programme *</Label>
                  <Select {...register("programme")} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Training Program">Training Program</SelectItem>
                      <SelectItem value="Webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" {...register("subject", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="activityName">Activity Name *</Label>
                  <Input id="activityName" {...register("activityName", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="platform">Platform Used *</Label>
                  <Select {...register("platform")} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="WebEx">WebEx</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" {...register("date", { required: true })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research & Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Research & Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="researchGroup">Name of Research Group (If any)</Label>
                  <Input id="researchGroup" {...register("researchGroup")} />
                </div>
                <div>
                  <Label htmlFor="participantCount">No. of Participants *</Label>
                  <Input id="participantCount" type="number" {...register("participantCount", { required: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="externalExpert">Name of External Expert with Affiliation</Label>
                <Textarea id="externalExpert" {...register("externalExpert")} rows={2} />
              </div>
              <div>
                <Label htmlFor="participantNames">Name of Participant(s) *</Label>
                <Textarea id="participantNames" {...register("participantNames", { required: true })} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Brief Description *</Label>
                <Textarea id="description" {...register("description", { required: true })} rows={4} />
              </div>
              <div>
                <Label>Certificate Issued? *</Label>
                <RadioGroup {...register("certificateIssued", { required: true })} className="flex gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="cert-yes" />
                    <Label htmlFor="cert-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cert-no" />
                    <Label htmlFor="cert-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="attachment1">Attachment-1</Label>
                  <div className="mt-1">
                    <Input
                      id="attachment1"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="attachment2">Attachment-2</Label>
                  <div className="mt-1">
                    <Input
                      id="attachment2"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="document">Document</Label>
                  <div className="mt-1">
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Save"} Online Engagement</Button>
          </div>
        </form>
      </div>
  )
}
