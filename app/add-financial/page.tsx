"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, FileText } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.docx", multiple = false }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload document for auto-fill</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, DOCX up to 10MB</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

const extractFinancialInfo = async (file: File) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return {
    nameOfSupport: "SERB Core Research Grant",
    type: "Research Grant",
    supportingAgency: "Department of Science and Technology",
    grantReceived: "1500000",
    detailsOfEvent: "Research project on advanced materials for renewable energy applications",
    purposeOfGrant: "Equipment procurement, research consumables, and travel for conferences",
    date: "2023-04-10",
  }
}

export default function AddFinancialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoFillFile, setAutoFillFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [formData, setFormData] = useState({
    nameOfSupport: "",
    type: "",
    supportingAgency: "",
    grantReceived: "",
    detailsOfEvent: "",
    purposeOfGrant: "",
    date: "",
  })

  const handleAutoFillFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setAutoFillFile(files[0])
    }
  }

  const handleExtractInfo = async () => {
    if (!autoFillFile) return

    setIsExtracting(true)
    try {
      const extractedData = await extractFinancialInfo(autoFillFile)
      setFormData({ ...formData, ...extractedData })
      toast({
        title: "Success",
        description: "Information extracted and form auto-filled successfully!",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract information from document.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Financial support added successfully!",
        duration: 3000,
      })

      router.push("/research-contributions?tab=financial")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add financial support. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/research-contributions?tab=financial")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Financial Support
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Financial Support</h1>
          <p className="text-muted-foreground">
            Add details about financial support received for academic or research activities
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Auto-fill from Document
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload a document to automatically extract and fill the form fields
            </p>
          </CardHeader>
          <CardContent>
            <FileUpload onFileSelect={handleAutoFillFileChange} acceptedTypes=".pdf,.docx" />
            {autoFillFile && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{autoFillFile.name}</span>
                <Button onClick={handleExtractInfo} disabled={isExtracting} size="sm" className="ml-auto">
                  {isExtracting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Information"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Support Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nameOfSupport">Name of Support *</Label>
                <Input
                  id="nameOfSupport"
                  placeholder="Enter support name (e.g., SERB Core Research Grant)"
                  value={formData.nameOfSupport}
                  onChange={(e) => setFormData({ ...formData, nameOfSupport: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
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
                    placeholder="Enter agency name (e.g., DST, UGC, CSIR)"
                    value={formData.supportingAgency}
                    onChange={(e) => setFormData({ ...formData, supportingAgency: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="grantReceived">Grant Received (₹) *</Label>
                  <Input
                    id="grantReceived"
                    type="number"
                    placeholder="Enter amount received"
                    value={formData.grantReceived}
                    onChange={(e) => setFormData({ ...formData, grantReceived: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="detailsOfEvent">Details of Event</Label>
                <Textarea
                  id="detailsOfEvent"
                  placeholder="Enter details about the event or project for which support was received"
                  value={formData.detailsOfEvent}
                  onChange={(e) => setFormData({ ...formData, detailsOfEvent: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="purposeOfGrant">Purpose of Grant</Label>
                <Textarea
                  id="purposeOfGrant"
                  placeholder="Enter the purpose for which the grant was utilized"
                  value={formData.purposeOfGrant}
                  onChange={(e) => setFormData({ ...formData, purposeOfGrant: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/research-contributions?tab=financial")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Financial Support
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
