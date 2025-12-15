"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, Hash, User, FileText, Award } from "lucide-react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DocumentViewer } from "@/components/document-viewer"
import { useAuth } from "@/app/api/auth/auth-provider"

interface JournalArticle {
  id: number
  tid: number
  authors: string
  author_num: number | null
  author_type: number
  title: string
  type: number
  issn: string | null
  isbn: string | null
  journal_name: string | null
  volume_num: number | null
  page_num: string | null
  month_year: string | null
  level: number
  peer_reviewed: boolean
  h_index: number | null
  impact_factor: number | null
  in_scopus: boolean
  in_ugc: boolean
  in_clarivate: boolean
  in_oldUGCList: boolean
  chargesPaid: boolean
  paid: boolean
  Image: string | null
  Teacher_Journals_Author_Type_Name: string
  Res_Pub_Level_Name: string
  Teacher_Jour_Edited_Type_Name: string
  DocVisible: number
}

export default function JournalArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [article, setArticle] = useState<JournalArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (params.id && user?.role_id) {
      fetchArticle()
    }
  }, [params.id, user?.role_id])

  const fetchArticle = async () => {
    if (!params.id || !user?.role_id) return

    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/publication/journals?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch journal")
      }

      const journal = data.journals.find((j: any) => j.id === parseInt(params.id as string))

      if (!journal) {
        throw new Error("Journal not found")
      }

      setArticle(journal)
    } catch (error) {
      console.error("Error fetching article:", error)
    } finally {
      setLoading(false)
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

  if (!article) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:m-4">
          <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="pt-0">
            <div className="container mx-auto p-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Article Not Found</h2>
                  <p className="text-gray-600 mb-4">The requested article could not be found.</p>
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

  const documentUrl = article.Image 
    ? (article.Image.startsWith('http') 
        ? article.Image 
        : `/api/s3/download?path=${encodeURIComponent(article.Image)}&userId=${user?.role_id || 0}`)
    : null

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:m-0">
        <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="pt-0">
          <div className="container mx-auto p-0 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Published Article/Journal/Edited Volume Details</h1>
                  {/* <p className="text-gray-600">Publication ID: {article.id}</p> */}
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap">
                <Link href={`/teacher/publication/journal-articles/${article.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
               
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Published Article/Journal/Edited Volume Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{article.Teacher_Jour_Edited_Type_Name}</Badge>
                        <Badge variant="outline">{article.Res_Pub_Level_Name}</Badge>
                        {article.peer_reviewed && <Badge variant="default">Peer Reviewed</Badge>}
                        {article.paid && <Badge variant="destructive">Charges Paid</Badge>}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Authors {article.author_num ? `(${article.author_num})` : ""}
                            </p>
                            <p className="text-sm">{article.authors}</p>
                            <p className="text-xs text-gray-500">{article.Teacher_Journals_Author_Type_Name}</p>
                          </div>
                        </div>

                        {article.journal_name && (
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Journal Name</p>
                              <p className="text-sm">{article.journal_name}</p>
                            </div>
                          </div>
                        )}

                        {(article.issn || article.isbn) && (
                          <div className="flex items-start space-x-2">
                            <Hash className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">ISSN/ISBN</p>
                              <p className="text-sm font-mono">{article.issn || article.isbn}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {article.month_year && (
                          <div className="flex items-start space-x-2">
                            <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Publication Date</p>
                              <p className="text-sm">{new Date(article.month_year).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}

                        {(article.volume_num || article.page_num) && (
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Volume & Pages</p>
                              <p className="text-sm">
                                {article.volume_num && `Vol. ${article.volume_num}`}
                                {article.volume_num && article.page_num && ", "}
                                {article.page_num && `pp. ${article.page_num}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics */}
                {(article.h_index || article.impact_factor) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Research Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {article.h_index && (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{article.h_index}</p>
                            <p className="text-sm text-gray-600">H-Index</p>
                          </div>
                        )}
                        {article.impact_factor && (
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{article.impact_factor}</p>
                            <p className="text-sm text-gray-600">Impact Factor</p>
                          </div>
                        )}
                        {article.author_num && (
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{article.author_num}</p>
                            <p className="text-sm text-gray-600">Authors</p>
                          </div>
                        )}
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{article.Res_Pub_Level_Name}</p>
                          <p className="text-sm text-gray-600">Level</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Indexing & Recognition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {[
                        ["Scopus", article.in_scopus],
                        ["UGC CARE", article.in_ugc],
                        ["Clarivate", article.in_clarivate],
                        ["Old UGC List", article.in_oldUGCList],
                      ].map(([label, value]) => (
                        <div key={label.toString()} className="flex items-center justify-between">
                          <span className="text-sm">{label}</span>
                          <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Publication Status</p>
                      <div className="space-y-2">
                        <Badge variant={article.peer_reviewed ? "default" : "secondary"}>
                          {article.peer_reviewed ? "Peer Reviewed" : "Not Peer Reviewed"}
                        </Badge>
                        <br />
                        <Badge variant={article.paid ? "destructive" : "default"}>
                          {article.paid ? "Charges Paid" : "No Charges"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                
              </div>
            </div>

            {/* Document Viewer - Positioned Below Details */}
            {documentUrl && (
              <div className="mt-8">
                <DocumentViewer
                  documentUrl={documentUrl}
                  documentName={`${article.title}.pdf`}
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
