"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Download, Calendar, Hash, User, FileText, ExternalLink, Award } from "lucide-react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DocumentViewer } from "@/components/document-viewer"

interface JournalArticle {
  id: string
  authors: string
  noOfAuthors: number
  authorType: string
  title: string
  type: string
  issn: string
  isbn: string
  journalBookName: string
  volumeNo: string
  pageNo: string
  date: string
  level: string
  peerReviewed: boolean
  hIndex: number
  impactFactor: number
  inScopus: boolean
  inUgcCare: boolean
  inClarivate: boolean
  inOldUgcList: boolean
  chargesPaid: boolean
  supportingDocument?: string
}

export default function JournalArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<JournalArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const mockArticle: JournalArticle = {
          id: params.id as string,
          authors: "Dr. John Smith, Dr. Jane Doe",
          noOfAuthors: 2,
          authorType: "First Author",
          title: "Machine Learning Applications in Healthcare: A Comprehensive Review",
          type: "Research Article",
          issn: "12345678",
          isbn: "9781234567890",
          journalBookName: "Journal of Medical Informatics",
          volumeNo: "45",
          pageNo: "123-145",
          date: "2024-03-15",
          level: "International",
          peerReviewed: true,
          hIndex: 25,
          impactFactor: 3.45,
          inScopus: true,
          inUgcCare: true,
          inClarivate: true,
          inOldUgcList: false,
          chargesPaid: false,
          // Using Mozilla's PDF.js test file - reliable and won't be blocked
          // supportingDocument: "http://localhost:3000/assets/example_doc.doc", // not supported
          // supportingDocument: "http://localhost:3000/images/msu-logo.png",
          supportingDocument: "http://localhost:3000/assets/demo_document.pdf",
          // supportingDocument: "http://localhost:3000/api/document",
        }

        setArticle(mockArticle)
      } catch (error) {
        console.error("Error fetching article:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  const handleDownloadDocument = () => {
    if (article?.supportingDocument) {
      const link = document.createElement("a")
      link.href = article.supportingDocument
      link.download = `${article.title}.pdf`
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

  return (
    <div className="flex h-screen bg-gray-50">
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
                  <h1 className="text-2xl font-bold">Journal Article Details</h1>
                  <p className="text-gray-600">Publication ID: {article.id}</p>
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap">
                <Link href={`/teacher/publication/journal-articles/${article.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                {article.supportingDocument && (
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
                      <FileText className="w-5 h-5 mr-2" />
                      Article Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{article.type}</Badge>
                        <Badge variant="outline">{article.level}</Badge>
                        {article.peerReviewed && <Badge variant="default">Peer Reviewed</Badge>}
                        {article.chargesPaid && <Badge variant="destructive">Charges Paid</Badge>}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Authors ({article.noOfAuthors})</p>
                            <p className="text-sm">{article.authors}</p>
                            <p className="text-xs text-gray-500">{article.authorType}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Journal/Book Name</p>
                            <p className="text-sm">{article.journalBookName}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Hash className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">ISSN/ISBN</p>
                            <p className="text-sm font-mono">{article.issn || article.isbn}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Publication Date</p>
                            <p className="text-sm">{new Date(article.date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Volume & Pages</p>
                            <p className="text-sm">
                              Vol. {article.volumeNo}, pp. {article.pageNo}
                            </p>
                          </div>
                        </div>

                      
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Research Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{article.hIndex}</p>
                        <p className="text-sm text-gray-600">H-Index</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{article.impactFactor}</p>
                        <p className="text-sm text-gray-600">Impact Factor</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{article.noOfAuthors}</p>
                        <p className="text-sm text-gray-600">Authors</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{article.level}</p>
                        <p className="text-sm text-gray-600">Level</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                        ["Scopus", article.inScopus],
                        ["UGC CARE", article.inUgcCare],
                        ["Clarivate", article.inClarivate],
                        ["Old UGC List", article.inOldUgcList],
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
                        <Badge variant={article.peerReviewed ? "default" : "secondary"}>
                          {article.peerReviewed ? "Peer Reviewed" : "Not Peer Reviewed"}
                        </Badge>
                        <br />
                        <Badge variant={article.chargesPaid ? "destructive" : "default"}>
                          {article.chargesPaid ? "Charges Paid" : "No Charges"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {article.supportingDocument && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Supporting Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Article PDF</p>
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
            {article.supportingDocument && (
              <div className="mt-8">
                <DocumentViewer
                  documentUrl={article.supportingDocument}
                  documentName={`${article.title}.${article.supportingDocument.split('.').pop()?.toLowerCase()}`}
                  documentType={article.supportingDocument.split('.').pop()?.toLowerCase()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
