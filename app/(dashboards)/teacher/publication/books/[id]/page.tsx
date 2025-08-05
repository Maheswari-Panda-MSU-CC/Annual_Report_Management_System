"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Download, Calendar, MapPin, Building, User, BookOpen, Hash } from "lucide-react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DocumentViewer } from "@/components/document-viewer"
import { useState as useSidebarState } from "react"

interface BookPublication {
  id: string
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
  supportingDocument?: string
}

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [book, setBook] = useState<BookPublication | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useSidebarState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const mockBook: BookPublication = {
          id: params.id as string,
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
          // Using Mozilla's PDF.js test file - reliable and won't be blocked
          supportingDocument: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        }

        setBook(mockBook)
      } catch (error) {
        console.error("Error fetching book:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [params.id])

  const handleDownloadDocument = () => {
    if (book?.supportingDocument) {
      const link = document.createElement("a")
      link.href = book.supportingDocument
      link.download = `${book.title}.pdf`
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

  if (!book) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="pt-16">
            <div className="container mx-auto p-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
                  <p className="text-gray-600 mb-4">The requested book could not be found.</p>
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
                <Button variant="outline" onClick={() => router.push("/teacher/publication?tab=books")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Publications
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Book Details</h1>
                  <p className="text-gray-600">Publication ID: {book.id}</p>
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap">
                <Link href={`/teacher/publication/books/${book.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                {book.supportingDocument && (
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
                      <BookOpen className="w-5 h-5 mr-2" />
                      Publication Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{book.bookType}</Badge>
                        <Badge variant="outline">{book.publishingLevel}</Badge>
                        <Badge variant={book.edited ? "default" : "secondary"}>
                          {book.edited ? "Edited" : "Authored"}
                        </Badge>
                        {book.chargesPaid && <Badge variant="destructive">Charges Paid</Badge>}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Authors</p>
                            <p className="text-sm">{book.authors}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Hash className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">ISBN</p>
                            <p className="text-sm font-mono">{book.isbn}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Building className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Publisher</p>
                            <p className="text-sm">{book.publisherName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Publishing Date</p>
                            <p className="text-sm">{new Date(book.publishingDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Publishing Place</p>
                            <p className="text-sm">{book.publishingPlace}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <BookOpen className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Chapter Count</p>
                            <p className="text-sm">{book.chapterCount} chapters</p>
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
                    <CardTitle>Publication Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Author Type</p>
                      <Badge variant="outline">{book.authorType}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Publishing Level</p>
                      <Badge variant="secondary">{book.publishingLevel}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Book Type</p>
                      <Badge variant="outline">{book.bookType}</Badge>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Financial Information</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={book.chargesPaid ? "destructive" : "default"}>
                          {book.chargesPaid ? "Charges Paid" : "No Charges"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {book.supportingDocument && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Supporting Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Title Page</p>
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
            {book.supportingDocument && (
              <div className="mt-8">
                <DocumentViewer
                  documentUrl={book.supportingDocument}
                  documentName={`${book.title}.pdf`}
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
