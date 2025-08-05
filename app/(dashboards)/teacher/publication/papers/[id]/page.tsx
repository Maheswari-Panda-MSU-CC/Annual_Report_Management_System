"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Download, Calendar, MapPin, Building, User, FileText, Presentation } from "lucide-react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DocumentViewer } from "@/components/document-viewer"
import { useState as useSidebarState } from "react"

interface PaperPublication {
  id: string
  authors: string
  presentationLevel: string
  themeOfConference: string
  modeOfParticipation: string
  titleOfPaper: string
  organizingBody: string
  place: string
  dateOfPresentation: string
  supportingDocument?: string
}

export default function PaperDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [paper, setPaper] = useState<PaperPublication | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useSidebarState(false)

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const mockPaper: PaperPublication = {
          id: params.id as string,
          authors: "Dr. John Smith, Dr. Jane Doe, Dr. Mike Johnson",
          presentationLevel: "International",
          themeOfConference: "Artificial Intelligence and Machine Learning",
          modeOfParticipation: "Oral Presentation",
          titleOfPaper: "Deep Learning Approaches for Natural Language Processing",
          organizingBody: "IEEE Computer Society",
          place: "San Francisco, USA",
          dateOfPresentation: "2024-03-20",
          // Using Mozilla's PDF.js test file - reliable and won't be blocked
          supportingDocument: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        }

        setPaper(mockPaper)
      } catch (error) {
        console.error("Error fetching paper:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaper()
  }, [params.id])

  const handleDownloadDocument = () => {
    if (paper?.supportingDocument) {
      const link = document.createElement("a")
      link.href = paper.supportingDocument
      link.download = `${paper.titleOfPaper}.pdf`
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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

  if (!paper) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="pt-16">
            <div className="container mx-auto p-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Paper Not Found</h2>
                  <p className="text-gray-600 mb-4">The requested paper could not be found.</p>
                  <Button onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </CardContent>
              </Card>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => router.push("/teacher/publication?tab=papers")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Publications
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Paper Presentation Details</h1>
                  <p className="text-gray-600">Publication ID: {paper.id}</p>
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap">
                <Link href={`/teacher/publication/papers/${paper.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                {paper.supportingDocument && (
                  <Button variant="outline" onClick={handleDownloadDocument}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Presentation className="w-5 h-5 mr-2" />
                      Presentation Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{paper.titleOfPaper}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{paper.presentationLevel}</Badge>
                        <Badge variant="outline">{paper.modeOfParticipation}</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Authors</p>
                            <p className="text-sm">{paper.authors}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Conference Theme</p>
                            <p className="text-sm">{paper.themeOfConference}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Building className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Organizing Body</p>
                            <p className="text-sm">{paper.organizingBody}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Presentation Date</p>
                            <p className="text-sm">{new Date(paper.dateOfPresentation).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Venue</p>
                            <p className="text-sm">{paper.place}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Presentation className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Mode of Participation</p>
                            <p className="text-sm">{paper.modeOfParticipation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Presentation Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Presentation Level</p>
                      <Badge variant="outline">{paper.presentationLevel}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Mode of Participation</p>
                      <Badge variant="secondary">{paper.modeOfParticipation}</Badge>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Conference Information</p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Theme:</span> {paper.themeOfConference}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Organizer:</span> {paper.organizingBody}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {paper.supportingDocument && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Supporting Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Certificate/Invitation</p>
                            <p className="text-xs text-gray-500">PDF Document</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={handleDownloadDocument}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Document Viewer - Positioned Below Details */}
            {paper.supportingDocument && (
              <div className="mt-8">
                <DocumentViewer
                  documentUrl={paper.supportingDocument}
                  documentName={`${paper.titleOfPaper}.pdf`}
                  documentType="pdf"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
