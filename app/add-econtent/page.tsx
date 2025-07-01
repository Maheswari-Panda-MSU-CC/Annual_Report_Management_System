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
import { ArrowLeft, Upload, Save, FileText, Loader2 } from "lucide-react"

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

export default function AddEContentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    typeOfEContentPlatform: "",
    briefDetails: "",
    quadrant: "",
    publishingDate: "",
    publishingAuthorities: "",
    link: "",
    typeOfEContent: "",
  })

  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleFileSelect = (files: FileList | null) => {}

  const extractEContentInfo = async (file: File) => {
    // Simulate LLM extraction process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated extracted data - in real implementation, this would come from LLM
    return {
      title: "Introduction to Machine Learning",
      typeOfEContentPlatform: "NPTEL",
      briefDetails:
        "Comprehensive course covering fundamental concepts of machine learning including supervised and unsupervised learning algorithms.",
      quadrant: "Q1",
      publishingDate: "2023-08-20",
      publishingAuthorities: "IIT Madras",
      link: "https://nptel.ac.in/courses/106/106/106106139/",
      typeOfEContent: "Video Lectures",
    }
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedDocument(files[0])
    }
  }

  const handleExtractInfo = async () => {
    if (!uploadedDocument) return

    setIsExtracting(true)
    try {
      const extractedData = await extractEContentInfo(uploadedDocument)
      setFormData((prev) => ({
        ...prev,
        ...extractedData,
      }))

      toast({
        title: "Success",
        description: "Information extracted and form pre-filled successfully!",
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
        description: "E-Content added successfully!",
        duration: 3000,
      })

      setIsLoading(true)
      router.push("/research-contributions?tab=econtent")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add e-content. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setIsLoading(true)
    router.push("/research-contributions?tab=econtent")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
            Back to E-Content Development
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New E-Content</h1>
          <p className="text-muted-foreground">
            Add details about your e-learning content, online courses, or digital educational materials
          </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <Label className="text-base font-medium">Auto-fill from Document</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Upload an e-content document to automatically extract and pre-fill form information
          </p>

          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="document-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Upload document</span>
                  <span className="block text-xs text-gray-500">PDF, DOCX up to 10MB</span>
                </label>
                <input
                  id="document-upload"
                  name="document-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleDocumentUpload(e.target.files)}
                  disabled={isExtracting}
                />
              </div>
            </div>

            {uploadedDocument && (
              <div className="flex items-center justify-between p-3 bg-white border rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{uploadedDocument.name}</span>
                </div>
                <Button type="button" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Information"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>E-Content Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">E-Content Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter e-content title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="typeOfEContentPlatform">Type of E-Content Platform *</Label>
                  <Select
                    value={formData.typeOfEContentPlatform}
                    onValueChange={(value) => setFormData({ ...formData, typeOfEContentPlatform: value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SWAYAM">SWAYAM</SelectItem>
                      <SelectItem value="NPTEL">NPTEL</SelectItem>
                      <SelectItem value="Coursera">Coursera</SelectItem>
                      <SelectItem value="edX">edX</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Udemy">Udemy</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quadrant">Quadrant</Label>
                  <Select
                    value={formData.quadrant}
                    onValueChange={(value) => setFormData({ ...formData, quadrant: value })}
                    disabled={isSubmitting || isExtracting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quadrant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="briefDetails">Brief Details</Label>
                <Textarea
                  id="briefDetails"
                  placeholder="Enter brief details about the e-content"
                  value={formData.briefDetails}
                  onChange={(e) => setFormData({ ...formData, briefDetails: e.target.value })}
                  rows={4}
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="publishingDate">Publishing Date</Label>
                  <Input
                    id="publishingDate"
                    type="date"
                    value={formData.publishingDate}
                    onChange={(e) => setFormData({ ...formData, publishingDate: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="publishingAuthorities">Publishing Authorities</Label>
                  <Input
                    id="publishingAuthorities"
                    placeholder="Enter publishing authorities"
                    value={formData.publishingAuthorities}
                    onChange={(e) => setFormData({ ...formData, publishingAuthorities: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="Enter content link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="typeOfEContent">Type of E-Content</Label>
                  <Select
                    value={formData.typeOfEContent}
                    onValueChange={(value) => setFormData({ ...formData, typeOfEContent: value })}
                    disabled={isSubmitting || isExtracting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video Lectures">Video Lectures</SelectItem>
                      <SelectItem value="Interactive Content">Interactive Content</SelectItem>
                      <SelectItem value="Simulation">Simulation</SelectItem>
                      <SelectItem value="E-Book">E-Book</SelectItem>
                      <SelectItem value="Quiz/Assessment">Quiz/Assessment</SelectItem>
                      <SelectItem value="Virtual Lab">Virtual Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting || isExtracting || isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isExtracting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add E-Content
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
