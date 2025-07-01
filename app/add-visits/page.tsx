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
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload document to auto-fill form</span>
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

// Simulated extraction function
const extractVisitInfo = async (file: File) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return simulated extracted data
  return {
    instituteVisited: "Stanford University",
    durationOfVisit: "7",
    role: "Visiting Researcher",
    sponsoredBy: "University Research Grant",
    remarks: "Collaborated on AI research projects and delivered guest lectures on machine learning applications.",
    date: "2023-07-15",
  }
}

export default function AddVisitsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    instituteVisited: "",
    durationOfVisit: "",
    role: "",
    sponsoredBy: "",
    remarks: "",
    date: "",
  })

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0] || null
    setSelectedFile(file)
  }

  const handleExtractInfo = async () => {
    if (!selectedFile) return

    setIsExtracting(true)
    try {
      const extractedData = await extractVisitInfo(selectedFile)

      // Auto-fill form fields
      setFormData({
        instituteVisited: extractedData.instituteVisited,
        durationOfVisit: extractedData.durationOfVisit,
        role: extractedData.role,
        sponsoredBy: extractedData.sponsoredBy,
        remarks: extractedData.remarks,
        date: extractedData.date,
      })

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
        description: "Academic/Research visit added successfully!",
        duration: 3000,
      })

      router.push("/research-contributions?tab=visits")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add visit. Please try again.",
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
            onClick={() => router.push("/research-contributions?tab=visits")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Academic / Research Visits
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Academic/Research Visit</h1>
          <p className="text-muted-foreground">
            Add details about your academic or research visits to other institutions
          </p>
        </div>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-fill from Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.docx" />
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <Button onClick={handleExtractInfo} disabled={isExtracting} size="sm">
                    {isExtracting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Extract Information
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="instituteVisited">Institute/Industry Visited *</Label>
                <Input
                  id="instituteVisited"
                  placeholder="Enter institute/industry name"
                  value={formData.instituteVisited}
                  onChange={(e) => setFormData({ ...formData, instituteVisited: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="durationOfVisit">Duration of Visit (days) *</Label>
                  <Input
                    id="durationOfVisit"
                    type="number"
                    placeholder="Enter duration in days"
                    value={formData.durationOfVisit}
                    onChange={(e) => setFormData({ ...formData, durationOfVisit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    placeholder="Enter your role (e.g., Visiting Researcher, Guest Lecturer)"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sponsoredBy">Sponsored By</Label>
                  <Input
                    id="sponsoredBy"
                    placeholder="Enter sponsor name (e.g., University, Government, Self-funded)"
                    value={formData.sponsoredBy}
                    onChange={(e) => setFormData({ ...formData, sponsoredBy: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Visit Date *</Label>
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
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter remarks about the visit, outcomes, collaborations established, etc."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/research-contributions?tab=visits")}
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
                      Add Visit
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
