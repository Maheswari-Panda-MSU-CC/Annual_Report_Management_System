"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  BookOpen,
  Presentation,
  Eye,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"

// Empty initial data - will be populated from API
const initialData = {
  journals: [],
  books: [],
  papers: [],
}

const sections = [
  {
    id: "journals",
    title: "Published Articles/Papers in Journals/Edited Volumes",
    icon: FileText,
    addRoute: "/teacher/publication/journal-articles/add",
    viewRoute: "/teacher/publication/journal-articles",
    columns: [
      "Sr No.",
      "Author(s)",
      "No. of Authors",
      "Author Type",
      "Title",
      "Type",
      "ISSN (Without -)",
      "ISBN (Without -)",
      "Journal/Book Name",
      "Volume No.",
      "Page No. (Range)",
      "Date",
      "Level",
      "Peer Reviewed?",
      "H Index",
      "Impact Factor",
      "In Scopus?",
      "In UGC CARE?",
      "In CLARIVATE?",
      "In Old UGC List?",
      "Charges Paid?",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "books",
    title: "Books/Books Chapter(s) Published",
    icon: BookOpen,
    addRoute: "/teacher/publication/books/add",
    viewRoute: "/teacher/publication/books",
    columns: [
      "Sr No.",
      "Authors",
      "Title",
      "ISBN (Without -)",
      "Publisher Name",
      "Publishing Date",
      "Publishing Place",
      "Charges Paid",
      "Edited",
      "Chapter Count",
      "Publishing Level",
      "Book Type",
      "Author Type",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "papers",
    title: "Papers Presented",
    icon: Presentation,
    addRoute: "/teacher/publication/papers/add",
    viewRoute: "/teacher/publication/papers",
    columns: [
      "Sr No.",
      "Author(s)",
      "Presentation Level",
      "Theme Of Conference/Seminar/Symposia",
      "Mode of Participation",
      "Title of Paper",
      "Organizing Body",
      "Place",
      "Date of Presentation/Seminar",
      "Supporting Document",
      "Actions",
    ],
  },
]


// Statistics Component
function PublicationStats({ data, onStatClick }: { data: typeof initialData; onStatClick: (sectionId: string) => void }) {
  const stats = [
    {
      title: "Journal Articles",
      count: data.journals.length,
      icon: FileText,
      description: "Published articles in journals and edited volumes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      sectionId: "journals",
    },
    {
      title: "Books Published",
      count: data.books.length,
      icon: BookOpen,
      description: "Books and book chapters published",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      sectionId: "books",
    },
    {
      title: "Papers Presented",
      count: data.papers.length,
      icon: Presentation,
      description: "Conference papers and presentations",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      sectionId: "papers",
    },
  ]

  const totalPublications = data.journals.length + data.books.length + data.papers.length

  return (
    <div className="space-y-4 my-4">
      {/* Total Publications Summary */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Total Publications</h3>
                <p className="text-sm text-slate-600">Complete overview of all publication types</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{totalPublications}</div>
              <div className="text-sm text-slate-600">Publications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Publication Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.borderColor} border-2 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => onStatClick(stat.sectionId)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{stat.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {stat.count === 1 ? "Item" : "Items"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

     
    </div>
  )
}

export default function PublicationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("journals")
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)

  // Dropdowns
  const {
    journalAuthorTypeOptions,
    journalEditedTypeOptions,
    resPubLevelOptions,
    bookTypeOptions,
    fetchJournalAuthorTypes,
    fetchJournalEditedTypes,
    fetchResPubLevels,
    fetchBookTypes,
  } = useDropDowns()

  // Fetch dropdowns
  useEffect(() => {
    fetchJournalAuthorTypes()
    fetchJournalEditedTypes()
    fetchResPubLevels()
    fetchBookTypes()
  }, [])

  // Fetch publications data
  useEffect(() => {
    if (user?.role_id) {
      fetchPublications()
    }
  }, [user?.role_id])

  const fetchPublications = async () => {
    if (!user?.role_id) return

    setIsLoading(true)
    try {
      // Fetch all three types in parallel
      const [journalsRes, booksRes, papersRes] = await Promise.all([
        fetch(`/api/teacher/publication/journals?teacherId=${user.role_id}`),
        fetch(`/api/teacher/publication/books?teacherId=${user.role_id}`),
        fetch(`/api/teacher/publication/papers?teacherId=${user.role_id}`),
      ])

      const journalsData = await journalsRes.json()
      const booksData = await booksRes.json()
      const papersData = await papersRes.json()

      // Map database fields to UI format
      const mappedJournals = (journalsData.journals || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        authors: item.authors || "",
        noOfAuthors: item.author_num || 0,
        authorType: item.Teacher_Journals_Author_Type_Name || "",
        authorTypeId: item.author_type,
        title: item.title || "",
        type: item.Teacher_Jour_Edited_Type_Name || "",
        typeId: item.type,
        issn: item.issn || "",
        isbn: item.isbn || "",
        journalBookName: item.journal_name || "",
        volumeNo: item.volume_num || "",
        pageNo: item.page_num || "",
        date: item.month_year ? new Date(item.month_year).toISOString().split('T')[0] : "",
        level: item.Res_Pub_Level_Name || "",
        levelId: item.level,
        peerReviewed: item.peer_reviewed ? "Yes" : "No",
        hIndex: item.h_index?.toString() || "",
        impactFactor: item.impact_factor?.toString() || "",
        inScopus: item.in_scopus ? "Yes" : "No",
        inUgcCare: item.in_ugc ? "Yes" : "No",
        inClarivate: item.in_clarivate ? "Yes" : "No",
        inOldUgcList: item.in_oldUGCList ? "Yes" : "No",
        chargesPaid: item.paid ? "Yes" : "No",
        supportingDocument: item.Image ? [item.Image] : [],
        Image: item.Image,
        DOI: item.DOI || "",
      }))

      // Fetch books data - we'll resolve names later when dropdowns are loaded
      const mappedBooks = (booksData.books || []).map((item: any, index: number) => ({
        id: item.bid,
        srNo: index + 1,
        authors: item.authors || "",
        title: item.title || "",
        isbn: item.isbn || "",
        publisherName: item.publisher_name || "",
        publishingDate: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        publishingPlace: item.place || "",
        chargesPaid: item.paid ? "Yes" : "No",
        edited: item.edited ? "Yes" : "No",
        chapterCount: item.chap_count?.toString() || "",
        publishingLevelId: item.publishing_level,
        bookTypeId: item.book_type,
        authorTypeId: item.author_type,
        supportingDocument: item.Image ? [item.Image] : [],
        Image: item.Image,
        cha: item.cha || "",
      }))

      const mappedPapers = (papersData.papers || []).map((item: any, index: number) => ({
        id: item.papid,
        srNo: index + 1,
        authors: item.authors || "",
        presentationLevel: item.Res_Pub_Level_Name || "",
        levelId: item.level,
        themeOfConference: item.theme || "",
        modeOfParticipation: item.mode || "",
        titleOfPaper: item.title_of_paper || "",
        organizingBody: item.organising_body || "",
        place: item.place || "",
        dateOfPresentation: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        supportingDocument: item.Image ? [item.Image] : [],
        Image: item.Image,
      }))

      setData({
        journals: mappedJournals,
        books: mappedBooks,
        papers: mappedPapers,
      })
    } catch (error: any) {
      console.error("Error fetching publications:", error)
      toast({
        title: "Error",
        description: "Failed to load publications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }


  const handleDelete = (sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm || !user?.role_id) return

    setIsDeleting(true)
    try {
      let endpoint = ""
      let paramName = ""

      switch (deleteConfirm.sectionId) {
        case "journals":
          endpoint = `/api/teacher/publication/journals?journalId=${deleteConfirm.itemId}`
          break
        case "books":
          endpoint = `/api/teacher/publication/books?bookId=${deleteConfirm.itemId}`
          break
        case "papers":
          endpoint = `/api/teacher/publication/papers?paperId=${deleteConfirm.itemId}`
          break
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete")
      }

      toast({
        title: "Success",
        description: "Item deleted successfully!",
      })

      // Refresh data
      await fetchPublications()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    // Redirect to edit page based on section type
    if (sectionId === "journals") {
      router.push(`/teacher/publication/journal-articles/${item.id}/edit`)
    } else if (sectionId === "books") {
      router.push(`/teacher/publication/books/${item.id}/edit`)
    } else if (sectionId === "papers") {
      router.push(`/teacher/publication/papers/${item.id}/edit`)
    }
  }

  const handleView = (sectionId: string, itemId: number) => {
    // Navigate to the specific publication view page
    if (sectionId === "journals") {
      router.push(`/teacher/publication/journal-articles/${itemId}`)
    } else if (sectionId === "books") {
      router.push(`/teacher/publication/books/${itemId}`)
    } else if (sectionId === "papers") {
      router.push(`/teacher/publication/papers/${itemId}`)
    }
  }



  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "journals":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.authors}>
                {item.authors}
              </div>
            </TableCell>
            <TableCell>{item.noOfAuthors}</TableCell>
            <TableCell>{item.authorType}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.issn}</TableCell>
            <TableCell>{item.isbn}</TableCell>
            <TableCell>{item.journalBookName}</TableCell>
            <TableCell>{item.volumeNo}</TableCell>
            <TableCell>{item.pageNo}</TableCell>
            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge variant={item.level === "International" ? "default" : "secondary"}>{item.level}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.peerReviewed === "Yes" ? "default" : "secondary"}>{item.peerReviewed}</Badge>
            </TableCell>
            <TableCell>{item.hIndex}</TableCell>
            <TableCell>{item.impactFactor}</TableCell>
           
            <TableCell>
              <Badge variant={item.inScopus === "Yes" ? "default" : "secondary"}>{item.inScopus}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.inUgcCare === "Yes" ? "default" : "secondary"}>{item.inUgcCare}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.inClarivate === "Yes" ? "default" : "secondary"}>{item.inClarivate}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.inOldUgcList === "Yes" ? "default" : "secondary"}>{item.inOldUgcList}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.chargesPaid === "Yes" ? "destructive" : "default"}>{item.chargesPaid}</Badge>
            </TableCell>
          </>
        )
      case "books":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.authors}>
                {item.authors}
              </div>
            </TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.isbn}</TableCell>
            <TableCell>{item.publisherName}</TableCell>
            <TableCell>{item.publishingDate ? new Date(item.publishingDate).toLocaleDateString() : ""}</TableCell>
            <TableCell>{item.publishingPlace}</TableCell>
            <TableCell>
              <Badge variant={item.chargesPaid === "Yes" ? "destructive" : "default"}>{item.chargesPaid}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.edited === "Yes" ? "default" : "secondary"}>{item.edited}</Badge>
            </TableCell>
            <TableCell>{item.chapterCount}</TableCell>
            <TableCell>
              <Badge variant={item.publishingLevel === "International" ? "default" : "secondary"}>
                {resPubLevelOptions.find(l => l.id === item.publishingLevelId)?.name || item.publishingLevel}
              </Badge>
            </TableCell>
            <TableCell>{bookTypeOptions.find(b => b.id === item.bookTypeId)?.name || item.bookType}</TableCell>
            <TableCell>{journalAuthorTypeOptions.find(a => a.id === item.authorTypeId)?.name || item.authorType}</TableCell>
          </>
        )
      case "papers":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.authors}>
                {item.authors}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.presentationLevel === "International" ? "default" : "secondary"}>
                {item.presentationLevel}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.themeOfConference}>
                {item.themeOfConference}
              </div>
            </TableCell>
            <TableCell>{item.modeOfParticipation}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.titleOfPaper}>
                {item.titleOfPaper}
              </div>
            </TableCell>
            <TableCell>{item.organizingBody}</TableCell>
            <TableCell>{item.place}</TableCell>
            <TableCell>{item.dateOfPresentation ? new Date(item.dateOfPresentation).toLocaleDateString() : ""}</TableCell>
          </>
        )
      default:
        return null
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading publications...</p>
        </div>
      </div>
    )
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publications</h1>
          <p className="text-muted-foreground">
            Manage your academic publications, books, and conference presentations
          </p>
        </div>

        {/* Publication Statistics Section */}
        <PublicationStats data={data} onStatClick={handleTabChange} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex min-w-max w-full">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-xs">{section.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <Button onClick={() => router.push(section.addRoute)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {section.title}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.columns.map((column) => (
                            <TableHead key={column} className="whitespace-nowrap">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data[section.id as keyof typeof data].length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={section.columns.length}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No {section.title.toLowerCase()} found. Click "Add {section.title}" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data[section.id as keyof typeof data].map((item: any) => (
                            <TableRow key={item.id}>
                              {renderTableData(section, item)}
                              <TableCell>
                              <div className="flex items-center gap-2">
                                {item.supportingDocument && item.supportingDocument.length > 0 ? (
                                  <>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" title="View Document">
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent
                                        className="w-[90vw] max-w-4xl h-[80vh] p-0 overflow-hidden"
                                        style={{ display: "flex", flexDirection: "column" }}
                                      >
                                        <DialogHeader className="p-4 border-b">
                                          <DialogTitle>View Document</DialogTitle>
                                        </DialogHeader>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                          <div className="w-full h-full">
                                            <DocumentViewer
                                              documentUrl={item.supportingDocument?.[0] || item.Image || ""}
                                              documentName={item.title || item.titleOfPaper || "Document"}
                                              documentType={(item.supportingDocument?.[0] || item.Image || "").split('.').pop()?.toLowerCase() || 'pdf'}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Badge variant="outline" className="text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
                                  </>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" title="Upload Document">
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Upload Supporting Documents</DialogTitle>
                                      </DialogHeader>
                                      <p className="text-sm text-muted-foreground">Please edit the publication to upload documents</p>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleView(section.id, item.id)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(section.id, item.id, item.title || item.titleOfPaper || "this item")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "{deleteConfirm?.itemName}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}
