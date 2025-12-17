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
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface BookPublication {
  bid: number
  tid: number
  title: string
  isbn: string | null
  cha: string | null
  publisher_name: string | null
  submit_date: string | null
  place: string | null
  paid: boolean
  edited: boolean
  chap_count: number | null
  authors: string
  publishing_level: number
  book_type: number
  author_type: number
  Image: string | null
}

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [book, setBook] = useState<BookPublication | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const {
    resPubLevelOptions,
    bookTypeOptions,
    journalAuthorTypeOptions,
    fetchResPubLevels,
    fetchBookTypes,
    fetchJournalAuthorTypes,
  } = useDropDowns()

  useEffect(() => {
    fetchResPubLevels()
    fetchBookTypes()
    fetchJournalAuthorTypes()
  }, [])

  useEffect(() => {
    if (params.id && user?.role_id) {
      fetchBook()
    }
  }, [params.id, user?.role_id])

  const fetchBook = async () => {
    if (!params.id || !user?.role_id) return

    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/publication/books?teacherId=${user.role_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch book")
      }

      const foundBook = data.books.find((b: any) => b.bid === parseInt(params.id as string))

      if (!foundBook) {
        throw new Error("Book not found")
      }

      setBook(foundBook)
    } catch (error) {
      console.error("Error fetching book:", error)
    } finally {
      setLoading(false)
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

  const publishingLevelName = resPubLevelOptions.find((l) => l.id === book.publishing_level)?.name || "Unknown"
  const bookTypeName = bookTypeOptions.find((t) => t.id === book.book_type)?.name || "Unknown"
  const authorTypeName = journalAuthorTypeOptions.find((a) => a.id === book.author_type)?.name || "Unknown"

  const documentUrl = book.Image || null

  return (
    <div className="flex h-full bg-gray-50">
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
                  {/* <p className="text-gray-600">Publication ID: {book.bid}</p> */}
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap">
                <Link href={`/teacher/publication/books/${book.bid}/edit`}>
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
                      <BookOpen className="w-5 h-5 mr-2" />
                      Publication Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{bookTypeName}</Badge>
                        <Badge variant="outline">{publishingLevelName}</Badge>
                        <Badge variant={book.edited ? "default" : "secondary"}>
                          {book.edited ? "Edited" : "Authored"}
                        </Badge>
                        {book.paid && <Badge variant="destructive">Charges Paid</Badge>}
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

                        {book.isbn && (
                          <div className="flex items-start space-x-2">
                            <Hash className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">ISBN</p>
                              <p className="text-sm font-mono">{book.isbn}</p>
                            </div>
                          </div>
                        )}

                        {book.publisher_name && (
                          <div className="flex items-start space-x-2">
                            <Building className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Publisher</p>
                              <p className="text-sm">{book.publisher_name}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {book.submit_date && (
                          <div className="flex items-start space-x-2">
                            <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Publishing Date</p>
                              <p className="text-sm">{new Date(book.submit_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}

                        {book.place && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Publishing Place</p>
                              <p className="text-sm">{book.place}</p>
                            </div>
                          </div>
                        )}

                        {book.chap_count && (
                          <div className="flex items-start space-x-2">
                            <BookOpen className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Chapter Count</p>
                              <p className="text-sm">{book.chap_count} chapters</p>
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
                    <CardTitle>Publication Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Author Type</p>
                      <Badge variant="outline">{authorTypeName}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Publishing Level</p>
                      <Badge variant="secondary">{publishingLevelName}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Book Type</p>
                      <Badge variant="outline">{bookTypeName}</Badge>
                    </div>

                    {book.cha && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Chapter</p>
                        <p className="text-sm">{book.cha}</p>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Financial Information</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={book.paid ? "destructive" : "default"}>
                          {book.paid ? "Charges Paid" : "No Charges"}
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
