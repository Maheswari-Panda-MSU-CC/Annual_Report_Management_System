"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Types for different sections
interface Article {
  id: number
  journalName: string
  issn: string
  eIssn: string
  volumeNo: string
  publisherName: string
  type: string
  level: string
  peerReviewed: string
  hIndex: string
  impactFactor: string
  doi: string
  inScopus: string
  inUgcCare: string
  inClarivate: string
  inOldUgcList: string
  price: string
  currency: string
}

interface Book {
  id: number
  title: string
  authors: string
  isbn: string
  publisherName: string
  publishingLevel: string
  bookType: string
  edition: string
  volumeNo: string
  publicationDate: Date | undefined
  eBook: string
  digitalMedia: string
  price: string
  currency: string
}

interface Magazine {
  id: number
  title: string
  mode: string
  publishingAgency: string
  volumeNo: string
  publicationDate: Date | undefined
  additionalAttachment: string
  attachmentNotes: string
  issuesPerYear: string
  price: string
  currency: string
}

interface TechnicalReport {
  id: number
  title: string
  subject: string
  publisherName: string
  publicationDate: Date | undefined
  issuesPerYear: string
  price: string
  currency: string
}

export default function AcademicRecommendationsPage() {
  const router = useRouter()
  // State for each section
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      journalName: "International Journal of Computer Science",
      issn: "12345678",
      eIssn: "87654321",
      volumeNo: "15",
      publisherName: "Tech Publications",
      type: "Research Article",
      level: "International",
      peerReviewed: "Yes",
      hIndex: "45",
      impactFactor: "2.5",
      doi: "10.1000/182",
      inScopus: "Yes",
      inUgcCare: "Yes",
      inClarivate: "No",
      inOldUgcList: "Yes",
      price: "150",
      currency: "USD",
    },
  ])

  const [books, setBooks] = useState<Book[]>([
    {
      id: 1,
      title: "Advanced Computer Networks",
      authors: "Dr. John Smith, Dr. Jane Doe",
      isbn: "9781234567890",
      publisherName: "Academic Press",
      publishingLevel: "International",
      bookType: "Textbook",
      edition: "3rd",
      volumeNo: "1",
      publicationDate: new Date("2023-01-15"),
      eBook: "Yes",
      digitalMedia: "USB",
      price: "89.99",
      currency: "USD",
    },
  ])

  const [magazines, setMagazines] = useState<Magazine[]>([
    {
      id: 1,
      title: "Tech Today",
      mode: "Print",
      publishingAgency: "Tech Media Group",
      volumeNo: "12",
      publicationDate: new Date("2023-06-01"),
      additionalAttachment: "CD",
      attachmentNotes: "Contains software demos",
      issuesPerYear: "12",
      price: "45",
      currency: "USD",
    },
  ])

  const [technicalReports, setTechnicalReports] = useState<TechnicalReport[]>([
    {
      id: 1,
      title: "AI in Education: A Comprehensive Study",
      subject: "Artificial Intelligence",
      publisherName: "Research Institute",
      publicationDate: new Date("2023-03-20"),
      issuesPerYear: "4",
      price: "25",
      currency: "USD",
    },
  ])

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  // Article functions
  const handleDeleteArticle = (id: number) => {
    setArticles(articles.filter((article) => article.id !== id))
  }

  const handleEditArticle = (id: number) => {
    const item = articles.find((a) => a.id === id)
    if (item) {
      setEditingItem({ ...item, type: "article" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  // Book functions
  const handleDeleteBook = (id: number) => {
    setBooks(books.filter((book) => book.id !== id))
  }

  const handleEditBook = (id: number) => {
    const item = books.find((b) => b.id === id)
    if (item) {
      setEditingItem({ ...item, type: "book" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  // Magazine functions
  const handleDeleteMagazine = (id: number) => {
    setMagazines(magazines.filter((magazine) => magazine.id !== id))
  }

  const handleEditMagazine = (id: number) => {
    const item = magazines.find((m) => m.id === id)
    if (item) {
      setEditingItem({ ...item, type: "magazine" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  // Technical Report functions
  const handleDeleteTechnicalReport = (id: number) => {
    setTechnicalReports(technicalReports.filter((report) => report.id !== id))
  }

  const handleEditTechnicalReport = (id: number) => {
    const item = technicalReports.find((t) => t.id === id)
    if (item) {
      setEditingItem({ ...item, type: "technical" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Academic Recommendations</h1>
        </div>

        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="articles">📘 Articles/Journals</TabsTrigger>
            <TabsTrigger value="books">📚 Books</TabsTrigger>
            <TabsTrigger value="magazines">📖 Magazines</TabsTrigger>
            <TabsTrigger value="technical">📝 Technical Reports</TabsTrigger>
          </TabsList>

          {/* Articles/Journals Section */}
          <TabsContent value="articles" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Articles / Journals / Edited Volumes</CardTitle>
                <Button onClick={() => router.push("/add-academic-recommendations")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Article
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Journal Name</TableHead>
                        <TableHead>ISSN</TableHead>
                        <TableHead>E-ISSN</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Publisher</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Peer Reviewed</TableHead>
                        <TableHead>H Index</TableHead>
                        <TableHead>Impact Factor</TableHead>
                        <TableHead>DOI</TableHead>
                        <TableHead>Scopus</TableHead>
                        <TableHead>UGC CARE</TableHead>
                        <TableHead>CLARIVATE</TableHead>
                        <TableHead>Old UGC</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map((article, index) => (
                        <TableRow key={article.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{article.journalName}</TableCell>
                          <TableCell>{article.issn}</TableCell>
                          <TableCell>{article.eIssn}</TableCell>
                          <TableCell>{article.volumeNo}</TableCell>
                          <TableCell>{article.publisherName}</TableCell>
                          <TableCell>{article.type}</TableCell>
                          <TableCell>{article.level}</TableCell>
                          <TableCell>{article.peerReviewed}</TableCell>
                          <TableCell>{article.hIndex}</TableCell>
                          <TableCell>{article.impactFactor}</TableCell>
                          <TableCell>{article.doi}</TableCell>
                          <TableCell>{article.inScopus}</TableCell>
                          <TableCell>{article.inUgcCare}</TableCell>
                          <TableCell>{article.inClarivate}</TableCell>
                          <TableCell>{article.inOldUgcList}</TableCell>
                          <TableCell>{article.price}</TableCell>
                          <TableCell>{article.currency}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditArticle(article.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteArticle(article.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Section */}
          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Books</CardTitle>
                <Button onClick={() => router.push("/add-academic-recommendations")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author(s)</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Publisher</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Edition</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Publication Date</TableHead>
                        <TableHead>EBook</TableHead>
                        <TableHead>Digital Media</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book, index) => (
                        <TableRow key={book.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.authors}</TableCell>
                          <TableCell>{book.isbn}</TableCell>
                          <TableCell>{book.publisherName}</TableCell>
                          <TableCell>{book.publishingLevel}</TableCell>
                          <TableCell>{book.bookType}</TableCell>
                          <TableCell>{book.edition}</TableCell>
                          <TableCell>{book.volumeNo}</TableCell>
                          <TableCell>{book.publicationDate ? book.publicationDate.toLocaleDateString() : ""}</TableCell>
                          <TableCell>{book.eBook}</TableCell>
                          <TableCell>{book.digitalMedia}</TableCell>
                          <TableCell>{book.price}</TableCell>
                          <TableCell>{book.currency}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditBook(book.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteBook(book.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Magazines Section */}
          <TabsContent value="magazines" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Magazines</CardTitle>
                <Button onClick={() => router.push("/add-academic-recommendations")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Magazine
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Publishing Agency</TableHead>
                        <TableHead>Volume No.</TableHead>
                        <TableHead>Publication Date</TableHead>
                        <TableHead>Additional Attachment</TableHead>
                        <TableHead>Attachment Notes</TableHead>
                        <TableHead>Issues per Year</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {magazines.map((magazine, index) => (
                        <TableRow key={magazine.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{magazine.title}</TableCell>
                          <TableCell>{magazine.mode}</TableCell>
                          <TableCell>{magazine.publishingAgency}</TableCell>
                          <TableCell>{magazine.volumeNo}</TableCell>
                          <TableCell>
                            {magazine.publicationDate ? magazine.publicationDate.toLocaleDateString() : ""}
                          </TableCell>
                          <TableCell>{magazine.additionalAttachment}</TableCell>
                          <TableCell>{magazine.attachmentNotes}</TableCell>
                          <TableCell>{magazine.issuesPerYear}</TableCell>
                          <TableCell>{magazine.price}</TableCell>
                          <TableCell>{magazine.currency}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditMagazine(magazine.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteMagazine(magazine.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Reports Section */}
          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Technical Report and Other(s)</CardTitle>
                <Button onClick={() => router.push("/add-academic-recommendations")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technical Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Publisher's Name</TableHead>
                        <TableHead>Publication Date</TableHead>
                        <TableHead>Issues per Year</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technicalReports.map((report, index) => (
                        <TableRow key={report.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{report.subject}</TableCell>
                          <TableCell>{report.publisherName}</TableCell>
                          <TableCell>
                            {report.publicationDate ? report.publicationDate.toLocaleDateString() : ""}
                          </TableCell>
                          <TableCell>{report.issuesPerYear}</TableCell>
                          <TableCell>{report.price}</TableCell>
                          <TableCell>{report.currency}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditTechnicalReport(report.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTechnicalReport(report.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.type?.toUpperCase()}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(editFormData).map((key) => {
                  if (key === "id" || key === "type") return null
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      {key.includes("Date") || key.includes("date") ? (
                        <Input
                          id={key}
                          type="date"
                          value={
                            editFormData[key] instanceof Date
                              ? editFormData[key].toISOString().split("T")[0]
                              : editFormData[key]
                          }
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          id={key}
                          value={editFormData[key] || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle save logic here
                    console.log("Saving:", editFormData)
                    setEditModalOpen(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
