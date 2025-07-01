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

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
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

// Simulated extraction function
const extractPhdInfo = async (file: File) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return simulated extracted data
  return {
    regNo: "PHD2023001",
    nameOfStudent: "Rahul Kumar",
    dateOfRegistration: "2023-01-15",
    topic: "Machine Learning Applications in Healthcare: Development of Predictive Models for Early Disease Detection",
    status: "Ongoing",
    yearOfCompletion: "2026",
  }
}

export default function AddPhdPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    regNo: "",
    nameOfStudent: "",
    dateOfRegistration: "",
    topic: "",
    status: "",
    yearOfCompletion: "",
  })

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleExtractInfo = async () => {
    if (!uploadedFile) return

    setIsExtracting(true)
    try {
      const extractedData = await extractPhdInfo(uploadedFile)
      setFormData(extractedData)

      toast({
        title: "Success",
        description: "PhD information extracted and form auto-filled!",
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
        description: "PhD guidance added successfully!",
        duration: 3000,
      })

      router.push("/research-contributions?tab=phd")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add PhD guidance. Please try again.",
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
            onClick={() => router.push("/research-contributions?tab=phd")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PhD Guidance
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New PhD Guidance</h1>
          <p className="text-muted-foreground">Add details about PhD students you are guiding or have guided</p>
        </div>

        {/* Document Upload for Auto-fill */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Auto-fill from Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.doc,.docx" multiple={false} />

            {uploadedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                  <span className="text-xs text-gray-500">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button onClick={handleExtractInfo} disabled={isExtracting} size="sm">
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
            <CardTitle>PhD Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="regNo">Registration Number *</Label>
                  <Input
                    id="regNo"
                    placeholder="Enter PhD registration number"
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameOfStudent">Name of Student *</Label>
                  <Input
                    id="nameOfStudent"
                    placeholder="Enter student's name"
                    value={formData.nameOfStudent}
                    onChange={(e) => setFormData({ ...formData, nameOfStudent: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dateOfRegistration">Date of Registration *</Label>
                  <Input
                    id="dateOfRegistration"
                    type="date"
                    value={formData.dateOfRegistration}
                    onChange={(e) => setFormData({ ...formData, dateOfRegistration: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="yearOfCompletion">Year of Completion</Label>
                  <Input
                    id="yearOfCompletion"
                    placeholder="Enter expected/actual completion year"
                    value={formData.yearOfCompletion}
                    onChange={(e) => setFormData({ ...formData, yearOfCompletion: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="topic">Research Topic *</Label>
                <Textarea
                  id="topic"
                  placeholder="Enter the PhD research topic/title"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Awarded">Awarded</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/research-contributions?tab=phd")}>
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
                      Add PhD Guidance
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
