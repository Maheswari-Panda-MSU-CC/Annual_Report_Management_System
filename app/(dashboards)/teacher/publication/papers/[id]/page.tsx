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
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface PaperPublication {
  papid: number
  tid: number
  theme: string | null
  organising_body: string | null
  place: string | null
  date: string | null
  title_of_paper: string
  level: number
  authors: string
  Image: string | null
  mode: string | null
  Res_Pub_Level_Name: string
  DocVisible: number
}

export default function PaperDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [paper, setPaper] = useState<PaperPublication | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const {
    resPubLevelOptions,
    fetchResPubLevels,
  } = useDropDowns()

  useEffect(() => {
    fetchResPubLevels()
  }, [])

  useEffect(() => {
    if (params.id && user?.role_id) {
      fetchPaper()
    }
  }, [params.id, user?.role_id])

  const fetchPaper = async () => {
    if (!params.id || !user?.role_id) return

    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/publication/papers?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch paper")
      }

      const foundPaper = data.papers.find((p: any) => p.papid === parseInt(params.id as string))

      if (!foundPaper) {
        throw new Error("Paper not found")
      }

      setPaper(foundPaper)
    } catch (error) {
      console.error("Error fetching paper:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDocument = () => {
    if (paper?.Image) {
      const documentUrl = paper.Image.startsWith('http') 
        ? paper.Image 
        : `/api/s3/download?path=${encodeURIComponent(paper.Image)}&userId=${user?.role_id || 0}`
      
      const link = document.createElement("a")
      link.href = documentUrl
      link.download = `${paper.title_of_paper}.pdf`
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

  const documentUrl = paper.Image 
    ? (paper.Image.startsWith('http') 
        ? paper.Image 
        : `/api/s3/download?path=${encodeURIComponent(paper.Image)}&userId=${user?.role_id || 0}`)
    : null

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
                  <p className="text-gray-600">Publication ID: {paper.papid}</p>
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap">
                <Link href={`/teacher/publication/papers/${paper.papid}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                {documentUrl && (
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
                      <h3 className="text-lg font-semibold mb-2">{paper.title_of_paper}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{paper.Res_Pub_Level_Name}</Badge>
                        {paper.mode && <Badge variant="outline">{paper.mode}</Badge>}
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

                        {paper.theme && (
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Conference Theme</p>
                              <p className="text-sm">{paper.theme}</p>
                            </div>
                          </div>
                        )}

                        {paper.organising_body && (
                          <div className="flex items-start space-x-2">
                            <Building className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Organizing Body</p>
                              <p className="text-sm">{paper.organising_body}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {paper.date && (
                          <div className="flex items-start space-x-2">
                            <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Presentation Date</p>
                              <p className="text-sm">{new Date(paper.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}

                        {paper.place && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Venue</p>
                              <p className="text-sm">{paper.place}</p>
                            </div>
                          </div>
                        )}

                        {paper.mode && (
                          <div className="flex items-start space-x-2">
                            <Presentation className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Mode of Participation</p>
                              <p className="text-sm">{paper.mode}</p>
                            </div>
                          </div>
                        )}
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
                      <Badge variant="outline">{paper.Res_Pub_Level_Name}</Badge>
                    </div>

                    {paper.mode && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Mode of Participation</p>
                        <Badge variant="secondary">{paper.mode}</Badge>
                      </div>
                    )}

                    <Separator />

                    {(paper.theme || paper.organising_body) && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Conference Information</p>
                        <div className="space-y-2">
                          {paper.theme && (
                            <p className="text-sm">
                              <span className="font-medium">Theme:</span> {paper.theme}
                            </p>
                          )}
                          {paper.organising_body && (
                            <p className="text-sm">
                              <span className="font-medium">Organizer:</span> {paper.organising_body}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {documentUrl && (
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
            {documentUrl && (
              <div className="mt-8">
                <DocumentViewer
                  documentUrl={documentUrl}
                  documentName={`${paper.title_of_paper}.pdf`}
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
