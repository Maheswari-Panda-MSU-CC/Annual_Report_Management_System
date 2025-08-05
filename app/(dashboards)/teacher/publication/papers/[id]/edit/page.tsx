"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useState as useSidebarState } from "react"

interface PaperFormData {
  authors: string
  presentationLevel: string
  themeOfConference: string
  modeOfParticipation: string
  titleOfPaper: string
  organizingBody: string
  place: string
  dateOfPresentation: string
  supportingDocument?: File | null
}

export default function EditPaperPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<PaperFormData>({
    authors: "",
    presentationLevel: "",
    themeOfConference: "",
    modeOfParticipation: "",
    titleOfPaper: "",
    organizingBody: "",
    place: "",
    dateOfPresentation: "",
    supportingDocument: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarState(false)

  useEffect(() => {
    // Simulate API call to fetch existing paper data
    const fetchPaper = async () => {
      try {
        // Mock data - replace with actual API call
        const mockPaper = {
          authors: "Dr. John Smith, Dr. Jane Doe, Dr. Mike Johnson",
          presentationLevel: "International",
          themeOfConference: "Artificial Intelligence and Machine Learning",
          modeOfParticipation: "Oral Presentation",
          titleOfPaper: "Deep Learning Approaches for Natural Language Processing",
          organizingBody: "IEEE Computer Society",
          place: "San Francisco, USA",
          dateOfPresentation: "2024-03-20",
        }

        setFormData(mockPaper)
      } catch (error) {
        console.error("Error fetching paper:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaper()
  }, [params.id])

  const handleInputChange = (field: keyof PaperFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Simulate API call to update paper
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to view page after successful update
      router.push(`/teacher/publication/papers/${params.id}`)
    } catch (error) {
      console.error("Error updating paper:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:m-4">
          <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="pt-0">
            <div className="container mx-auto p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:m-2">
        <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="pt-0">
          <div className="container mx-auto p-0 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => router.push(`/teacher/publication/papers/${params.id}`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Edit Paper Presentation</h1>
                  <p className="text-gray-600">Publication ID: {params.id}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paper Presentation Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="authors">Author(s) *</Label>
                      <Textarea
                        id="authors"
                        value={formData.authors}
                        onChange={(e) => handleInputChange("authors", e.target.value)}
                        placeholder="Enter author names separated by commas"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="titleOfPaper">Title of Paper *</Label>
                      <Textarea
                        id="titleOfPaper"
                        value={formData.titleOfPaper}
                        onChange={(e) => handleInputChange("titleOfPaper", e.target.value)}
                        placeholder="Enter paper title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="presentationLevel">Presentation Level *</Label>
                      <Select
                        value={formData.presentationLevel}
                        onValueChange={(value) => handleInputChange("presentationLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select presentation level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="International">International</SelectItem>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="Regional">Regional</SelectItem>
                          <SelectItem value="Local">Local</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="themeOfConference">Theme Of Conference/Seminar/Symposia *</Label>
                      <Input
                        id="themeOfConference"
                        value={formData.themeOfConference}
                        onChange={(e) => handleInputChange("themeOfConference", e.target.value)}
                        placeholder="Enter conference theme"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modeOfParticipation">Mode of Participation *</Label>
                      <Select
                        value={formData.modeOfParticipation}
                        onValueChange={(value) => handleInputChange("modeOfParticipation", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode of participation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oral Presentation">Oral Presentation</SelectItem>
                          <SelectItem value="Poster Presentation">Poster Presentation</SelectItem>
                          <SelectItem value="Keynote Speaker">Keynote Speaker</SelectItem>
                          <SelectItem value="Invited Speaker">Invited Speaker</SelectItem>
                          <SelectItem value="Panel Discussion">Panel Discussion</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizingBody">Organizing Body *</Label>
                      <Input
                        id="organizingBody"
                        value={formData.organizingBody}
                        onChange={(e) => handleInputChange("organizingBody", e.target.value)}
                        placeholder="Enter organizing body"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="place">Place *</Label>
                      <Input
                        id="place"
                        value={formData.place}
                        onChange={(e) => handleInputChange("place", e.target.value)}
                        placeholder="Enter venue/place"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfPresentation">Date of Presentation/Seminar *</Label>
                      <Input
                        id="dateOfPresentation"
                        type="date"
                        value={formData.dateOfPresentation}
                        onChange={(e) => handleInputChange("dateOfPresentation", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportingDocument">Supporting Document (pdf/Image only)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="supportingDocument"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleInputChange("supportingDocument", e.target.files?.[0] || null)}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/teacher/publication/papers/${params.id}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
