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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useState as useSidebarState } from "react"

interface BookFormData {
  authors: string
  title: string
  isbn: string
  publisherName: string
  publishingDate: string
  publishingPlace: string
  chargesPaid: boolean
  edited: boolean
  chapterCount: number
  publishingLevel: string
  bookType: string
  authorType: string
  supportingDocument?: File | null
}

export default function EditBookPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<BookFormData>({
    authors: "",
    title: "",
    isbn: "",
    publisherName: "",
    publishingDate: "",
    publishingPlace: "",
    chargesPaid: false,
    edited: false,
    chapterCount: 0,
    publishingLevel: "",
    bookType: "",
    authorType: "",
    supportingDocument: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarState(false)

  useEffect(() => {
    // Simulate API call to fetch existing book data
    const fetchBook = async () => {
      try {
        // Mock data - replace with actual API call
        const mockBook = {
          authors: "Dr. John Smith, Dr. Jane Doe",
          title: "Advanced Research Methods in Computer Science",
          isbn: "9781234567890",
          publisherName: "Academic Press International",
          publishingDate: "2024-03-15",
          publishingPlace: "New York, USA",
          chargesPaid: false,
          edited: true,
          chapterCount: 12,
          publishingLevel: "International",
          bookType: "Edited Book",
          authorType: "Editor",
        }

        setFormData(mockBook)
      } catch (error) {
        console.error("Error fetching book:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [params.id])

  const handleInputChange = (field: keyof BookFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Simulate API call to update book
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to view page after successful update
      router.push(`/teacher/publication/books/${params.id}`)
    } catch (error) {
      console.error("Error updating book:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="pt-16">
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
                <Button variant="outline" onClick={() => router.push(`/teacher/publication/books/${params.id}`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Edit Book</h1>
                  <p className="text-gray-600">Publication ID: {params.id}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="authors">Authors *</Label>
                      <Textarea
                        id="authors"
                        value={formData.authors}
                        onChange={(e) => handleInputChange("authors", e.target.value)}
                        placeholder="Enter author names separated by commas"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Textarea
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter book title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN (Without -) *</Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => handleInputChange("isbn", e.target.value)}
                        placeholder="Enter ISBN without dashes"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publisherName">Publisher Name *</Label>
                      <Input
                        id="publisherName"
                        value={formData.publisherName}
                        onChange={(e) => handleInputChange("publisherName", e.target.value)}
                        placeholder="Enter publisher name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publishingDate">Publishing Date *</Label>
                      <Input
                        id="publishingDate"
                        type="date"
                        value={formData.publishingDate}
                        onChange={(e) => handleInputChange("publishingDate", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publishingPlace">Publishing Place *</Label>
                      <Input
                        id="publishingPlace"
                        value={formData.publishingPlace}
                        onChange={(e) => handleInputChange("publishingPlace", e.target.value)}
                        placeholder="Enter publishing place"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chapterCount">Chapter Count *</Label>
                      <Input
                        id="chapterCount"
                        type="number"
                        value={formData.chapterCount}
                        onChange={(e) => handleInputChange("chapterCount", Number.parseInt(e.target.value) || 0)}
                        placeholder="Enter number of chapters"
                        min="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publishingLevel">Publishing Level *</Label>
                      <Select
                        value={formData.publishingLevel}
                        onValueChange={(value) => handleInputChange("publishingLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select publishing level" />
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
                      <Label htmlFor="bookType">Book Type *</Label>
                      <Select value={formData.bookType} onValueChange={(value) => handleInputChange("bookType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select book type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Authored Book">Authored Book</SelectItem>
                          <SelectItem value="Edited Book">Edited Book</SelectItem>
                          <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                          <SelectItem value="Monograph">Monograph</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorType">Author Type *</Label>
                      <Select
                        value={formData.authorType}
                        onValueChange={(value) => handleInputChange("authorType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select author type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First Author">First Author</SelectItem>
                          <SelectItem value="Co-Author">Co-Author</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Co-Editor">Co-Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edited"
                        checked={formData.edited}
                        onCheckedChange={(checked) => handleInputChange("edited", checked)}
                      />
                      <Label htmlFor="edited">Edited</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="chargesPaid"
                        checked={formData.chargesPaid}
                        onCheckedChange={(checked) => handleInputChange("chargesPaid", checked)}
                      />
                      <Label htmlFor="chargesPaid">Charges Paid</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportingDocument">Supporting Document (Image/PDF Only)</Label>
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
                <Button type="button" variant="outline" onClick={() => router.push(`/publication/books/${params.id}`)}>
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
