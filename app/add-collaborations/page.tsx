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

export default function AddCollaborationsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    collaboratingInstitute: "",
    nameOfCollaborator: "",
    qsTheRanking: "",
    address: "",
    details: "",
    collaborationOutcome: "",
    status: "",
    startingDate: "",
    duration: "",
    level: "",
    noOfBeneficiary: "",
    mouSigned: "",
    signingDate: "",
  })

  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedDocument(files[0])
    }
  }

  const extractCollaborationInfo = async (file: File) => {
    // Simulate LLM extraction process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated extracted data - in real implementation, this would come from LLM
    return {
      category: "Research Collaboration",
      collaboratingInstitute: "Massachusetts Institute of Technology",
      nameOfCollaborator: "Dr. John Smith",
      qsTheRanking: "1",
      address: "Cambridge, MA, USA",
      details:
        "Joint research collaboration on artificial intelligence and machine learning applications in healthcare.",
      collaborationOutcome: "Published 3 joint research papers and developed AI-based diagnostic tool prototype.",
      status: "Active",
      startingDate: "2023-01-15",
      duration: "24",
      level: "International",
      noOfBeneficiary: "50",
      mouSigned: "Yes",
      signingDate: "2023-01-10",
    }
  }

  const handleExtractInfo = async () => {
    if (!uploadedDocument) return

    setIsExtracting(true)
    try {
      const extractedData = await extractCollaborationInfo(uploadedDocument)
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
        description: "Collaboration added successfully!",
        duration: 3000,
      })

      setIsLoading(true)
      router.push("/research-contributions?tab=collaborations")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add collaboration. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setIsLoading(true)
    router.push("/research-contributions?tab=collaborations")
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
            Back to Collaborations / MoUs / Linkages
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Collaboration</h1>
          <p className="text-muted-foreground">
            Add details about collaborations, MoUs, or linkages with other institutions
          </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <Label className="text-base font-medium">Auto-fill from Document</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a collaboration document to automatically extract and pre-fill form information
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
            <CardTitle>Collaboration Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  >
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
                  <Label htmlFor="collaboratingInstitute">Collaborating Institute *</Label>
                  <Input
                    id="collaboratingInstitute"
                    placeholder="Enter institute name"
                    value={formData.collaboratingInstitute}
                    onChange={(e) => setFormData({ ...formData, collaboratingInstitute: e.target.value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nameOfCollaborator">Name of Collaborator (At other institute)</Label>
                  <Input
                    id="nameOfCollaborator"
                    placeholder="Enter collaborator name"
                    value={formData.nameOfCollaborator}
                    onChange={(e) => setFormData({ ...formData, nameOfCollaborator: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="qsTheRanking">QS/THE World University Ranking of Institute</Label>
                  <Input
                    id="qsTheRanking"
                    placeholder="Enter ranking (if applicable)"
                    value={formData.qsTheRanking}
                    onChange={(e) => setFormData({ ...formData, qsTheRanking: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter institute address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div>
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  placeholder="Enter collaboration details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={3}
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div>
                <Label htmlFor="collaborationOutcome">Collaboration Outcome</Label>
                <Textarea
                  id="collaborationOutcome"
                  placeholder="Enter collaboration outcome"
                  value={formData.collaborationOutcome}
                  onChange={(e) => setFormData({ ...formData, collaborationOutcome: e.target.value })}
                  rows={3}
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={isSubmitting || isExtracting}
                  >
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
                  <Label htmlFor="startingDate">Starting Date</Label>
                  <Input
                    id="startingDate"
                    type="date"
                    value={formData.startingDate}
                    onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                    disabled={isSubmitting || isExtracting}
                  >
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
                  <Label htmlFor="noOfBeneficiary">No. of Beneficiary</Label>
                  <Input
                    id="noOfBeneficiary"
                    type="number"
                    placeholder="Enter number"
                    value={formData.noOfBeneficiary}
                    onChange={(e) => setFormData({ ...formData, noOfBeneficiary: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="mouSigned">MOU Signed?</Label>
                  <Select
                    value={formData.mouSigned}
                    onValueChange={(value) => setFormData({ ...formData, mouSigned: value })}
                    disabled={isSubmitting || isExtracting}
                  >
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

              <div>
                <Label htmlFor="signingDate">Signing Date</Label>
                <Input
                  id="signingDate"
                  type="date"
                  value={formData.signingDate}
                  onChange={(e) => setFormData({ ...formData, signingDate: e.target.value })}
                  disabled={isSubmitting || isExtracting}
                />
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
                      Add Collaboration
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
