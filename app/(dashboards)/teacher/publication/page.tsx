"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherPublications } from "@/hooks/use-teacher-data"
import { usePaperMutations, useJournalMutations, useBookMutations } from "@/hooks/use-teacher-mutations"
import { TableLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import type { ColumnDef } from "@tanstack/react-table"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.borderColor} border-2 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => onStatClick(stat.sectionId)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-2 sm:p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{stat.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right ml-2 sm:ml-4">
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.count}</div>
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)

  // Use React Query for data fetching with automatic caching
  const { journals, books, papers, isLoading, isFetching, data: rawData } = useTeacherPublications()
  const { deletePaper } = usePaperMutations()
  const { deleteJournal } = useJournalMutations()
  const { deleteBook } = useBookMutations()
  
  // Show loading only if we have no data at all (first load)
  const isInitialLoading = isLoading && !journals.data && !books.data && !papers.data

  // Check if any delete mutation is pending
  const isDeleting = deletePaper.isPending || deleteJournal.isPending || deleteBook.isPending

  // Dropdowns
  const {
    journalAuthorTypeOptions,
    journalEditedTypeOptions,
    resPubLevelOptions,
    bookTypeOptions,
  } = useDropDowns()

  // Note: Dropdown data is already available from Context, no need to fetch

  // Use useMemo to compute mapped data - automatically updates when dependencies change
  const mappedData = useMemo(() => {
    // Only proceed if we have data
    if (!journals.data || !books.data || !papers.data) {
      return initialData
    }

    const journalsData = journals.data
    const booksData = books.data
    const papersData = papers.data

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

    return {
      journals: mappedJournals,
      books: mappedBooks,
      papers: mappedPapers,
    }
  }, [
    journals.data, 
    journals.dataUpdatedAt,
    journals.isSuccess,
    journals.isFetching,
    books.data, 
    books.dataUpdatedAt,
    books.isSuccess,
    books.isFetching,
    papers.data, 
    papers.dataUpdatedAt,
    papers.isSuccess,
    papers.isFetching,
    // Add length checks to detect changes even if object reference doesn't change
    journals.data?.journals?.length,
    books.data?.books?.length,
    papers.data?.papers?.length,
  ])

  // Use mappedData directly instead of state to avoid sync issues
  const data = mappedData
  
  // Note: Mutations handle cache invalidation automatically
  // Removed all manual refetch logic - React Query handles it
  
  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Show loading skeleton during initial data fetch
  // ✅ All hooks must be called before any conditional returns (Rules of Hooks)
  if (isInitialLoading) {
    return <TableLoadingSkeleton />
  }

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

  const confirmDelete = () => {
    if (!deleteConfirm) return

    // Use mutations for delete operations - they handle cache invalidation automatically
    switch (deleteConfirm.sectionId) {
      case "journals":
        deleteJournal.mutate(deleteConfirm.itemId)
        break
      case "books":
        deleteBook.mutate(deleteConfirm.itemId)
        break
      case "papers":
        deletePaper.mutate(deleteConfirm.itemId)
        break
    }

    setDeleteConfirm(null)
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

  // Helper function to display N/A for empty/null/undefined values
  const displayValue = (value: any, fallback: string = "N/A"): string => {
    if (value === null || value === undefined || value === "") return fallback
    return String(value)
  }

  // Create columns for enhanced table - preserves exact same rendering as renderTableData
  const createColumnsForSection = (section: any, resPubLevelOptions: any[], bookTypeOptions: any[], journalAuthorTypeOptions: any[], handleView: (sectionId: string, itemId: number) => void, handleEdit: (sectionId: string, item: any) => void, handleDelete: (sectionId: string, itemId: number, itemName: string) => void): ColumnDef<any>[] => {
      const columns: ColumnDef<any>[] = []

      // Journals columns
      if (section.id === "journals") {
        columns.push(
          { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "authors", header: "Author(s)", enableSorting: true, cell: ({ row }) => {
            const authors = displayValue(row.original.authors)
            return <div className="max-w-xs text-xs sm:text-sm"><div className="truncate" title={authors}>{authors}</div></div>
          }, meta: { className: "max-w-xs text-xs sm:text-sm" } },
          { accessorKey: "noOfAuthors", header: "No. of Authors", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.noOfAuthors)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "authorType", header: "Author Type", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.authorType)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
            const title = displayValue(row.original.title)
            return <div className="font-medium max-w-xs text-xs sm:text-sm"><div className="truncate" title={title}>{title}</div></div>
          }, meta: { className: "font-medium max-w-xs text-xs sm:text-sm" } },
          { accessorKey: "type", header: "Type", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.type)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "issn", header: "ISSN (Without -)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.issn)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "isbn", header: "ISBN (Without -)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.isbn)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "journalBookName", header: "Journal/Book Name", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.journalBookName)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "volumeNo", header: "Volume No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.volumeNo)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "pageNo", header: "Page No. (Range)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm">{displayValue(row.original.pageNo)}</span>, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "date", header: "Date", enableSorting: true, cell: ({ row }) => {
            const dateValue = row.original.date ? (isNaN(new Date(row.original.date).getTime()) ? "N/A" : new Date(row.original.date).toLocaleDateString()) : "N/A"
            return <span className="text-xs sm:text-sm">{dateValue}</span>
          }, meta: { className: "text-xs sm:text-sm" } },
          { accessorKey: "level", header: "Level", enableSorting: true, cell: ({ row }) => {
            const level = displayValue(row.original.level)
            return level === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={level === "International" ? "default" : "secondary"}>{level}</Badge>
          } },
          { accessorKey: "peerReviewed", header: "Peer Reviewed?", enableSorting: true, cell: ({ row }) => {
            const peerReviewed = displayValue(row.original.peerReviewed)
            return peerReviewed === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={peerReviewed === "Yes" ? "default" : "secondary"}>{peerReviewed}</Badge>
          } },
          { accessorKey: "hIndex", header: "H Index", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.hIndex)}</span> },
          { accessorKey: "impactFactor", header: "Impact Factor", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.impactFactor)}</span> },
          { accessorKey: "inScopus", header: "In Scopus?", enableSorting: true, cell: ({ row }) => {
            const inScopus = displayValue(row.original.inScopus)
            return inScopus === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={inScopus === "Yes" ? "default" : "secondary"}>{inScopus}</Badge>
          } },
          { accessorKey: "inUgcCare", header: "In UGC CARE?", enableSorting: true, cell: ({ row }) => {
            const inUgcCare = displayValue(row.original.inUgcCare)
            return inUgcCare === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={inUgcCare === "Yes" ? "default" : "secondary"}>{inUgcCare}</Badge>
          } },
          { accessorKey: "inClarivate", header: "In CLARIVATE?", enableSorting: true, cell: ({ row }) => {
            const inClarivate = displayValue(row.original.inClarivate)
            return inClarivate === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={inClarivate === "Yes" ? "default" : "secondary"}>{inClarivate}</Badge>
          } },
          { accessorKey: "inOldUgcList", header: "In Old UGC List?", enableSorting: true, cell: ({ row }) => {
            const inOldUgcList = displayValue(row.original.inOldUgcList)
            return inOldUgcList === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={inOldUgcList === "Yes" ? "default" : "secondary"}>{inOldUgcList}</Badge>
          } },
          { accessorKey: "chargesPaid", header: "Charges Paid?", enableSorting: true, cell: ({ row }) => {
            const chargesPaid = displayValue(row.original.chargesPaid)
            return chargesPaid === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={chargesPaid === "Yes" ? "destructive" : "default"}>{chargesPaid}</Badge>
          } },
        )
      }
      // Books columns
      else if (section.id === "books") {
        columns.push(
          { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.srNo)}</span> },
          { accessorKey: "authors", header: "Authors", enableSorting: true, cell: ({ row }) => {
            const authors = displayValue(row.original.authors)
            return <div className="max-w-xs"><div className="truncate" title={authors}>{authors}</div></div>
          }, meta: { className: "max-w-xs" } },
          { accessorKey: "title", header: "Title", enableSorting: true, cell: ({ row }) => {
            const title = displayValue(row.original.title)
            return <div className="font-medium max-w-xs"><div className="truncate" title={title}>{title}</div></div>
          }, meta: { className: "font-medium max-w-xs" } },
          { accessorKey: "isbn", header: "ISBN (Without -)", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.isbn)}</span> },
          { accessorKey: "publisherName", header: "Publisher Name", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.publisherName)}</span> },
          { accessorKey: "publishingDate", header: "Publishing Date", enableSorting: true, cell: ({ row }) => {
            const dateValue = row.original.publishingDate ? (isNaN(new Date(row.original.publishingDate).getTime()) ? "N/A" : new Date(row.original.publishingDate).toLocaleDateString()) : "N/A"
            return <span>{dateValue}</span>
          } },
          { accessorKey: "publishingPlace", header: "Publishing Place", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.publishingPlace)}</span> },
          { accessorKey: "chargesPaid", header: "Charges Paid", enableSorting: true, cell: ({ row }) => {
            const chargesPaid = displayValue(row.original.chargesPaid)
            return chargesPaid === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={chargesPaid === "Yes" ? "destructive" : "default"}>{chargesPaid}</Badge>
          } },
          { accessorKey: "edited", header: "Edited", enableSorting: true, cell: ({ row }) => {
            const edited = displayValue(row.original.edited)
            return edited === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={edited === "Yes" ? "default" : "secondary"}>{edited}</Badge>
          } },
          { accessorKey: "chapterCount", header: "Chapter Count", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.chapterCount)}</span> },
          { accessorKey: "publishingLevel", header: "Publishing Level", enableSorting: true, cell: ({ row }) => {
            const levelName = resPubLevelOptions.find(l => l.id === row.original.publishingLevelId)?.name || ""
            const displayLevel = displayValue(levelName)
            return displayLevel === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={displayLevel === "International" ? "default" : "secondary"}>{displayLevel}</Badge>
          } },
          { accessorKey: "bookType", header: "Book Type", enableSorting: true, cell: ({ row }) => {
            const bookType = bookTypeOptions.find(b => b.id === row.original.bookTypeId)?.name || ""
            return <span>{displayValue(bookType)}</span>
          } },
          { accessorKey: "authorType", header: "Author Type", enableSorting: true, cell: ({ row }) => {
            const authorType = journalAuthorTypeOptions.find(a => a.id === row.original.authorTypeId)?.name || ""
            return <span>{displayValue(authorType)}</span>
          } },
        )
      }
      // Papers columns
      else if (section.id === "papers") {
        columns.push(
          { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.srNo)}</span> },
          { accessorKey: "authors", header: "Authors", enableSorting: true, cell: ({ row }) => {
            const authors = displayValue(row.original.authors)
            return <div className="max-w-xs"><div className="truncate" title={authors}>{authors}</div></div>
          }, meta: { className: "max-w-xs" } },
          { accessorKey: "presentationLevel", header: "Level", enableSorting: true, cell: ({ row }) => {
            const level = displayValue(row.original.presentationLevel)
            return level === "N/A" ? <span className="text-xs sm:text-sm text-muted-foreground">N/A</span> : <Badge variant={level === "International" ? "default" : "secondary"}>{level}</Badge>
          } },
          { accessorKey: "themeOfConference", header: "Paper Theme", enableSorting: true, cell: ({ row }) => {
            const theme = displayValue(row.original.themeOfConference)
            return <div className="max-w-xs"><div className="truncate" title={theme}>{theme}</div></div>
          }, meta: { className: "max-w-xs" } },
          { accessorKey: "modeOfParticipation", header: "Mode of Participation", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.modeOfParticipation)}</span> },
          { accessorKey: "titleOfPaper", header: "Paper Title", enableSorting: true, cell: ({ row }) => {
            const title = displayValue(row.original.titleOfPaper)
            return <div className="font-medium max-w-xs"><div className="truncate" title={title}>{title}</div></div>
          }, meta: { className: "font-medium max-w-xs" } },
          { accessorKey: "organizingBody", header: "Organising Body", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.organizingBody)}</span> },
          { accessorKey: "place", header: "Place", enableSorting: true, cell: ({ row }) => <span>{displayValue(row.original.place)}</span> },
          { accessorKey: "dateOfPresentation", header: "Date of Publication", enableSorting: true, cell: ({ row }) => {
            const dateValue = row.original.dateOfPresentation ? (isNaN(new Date(row.original.dateOfPresentation).getTime()) ? "N/A" : new Date(row.original.dateOfPresentation).toLocaleDateString()) : "N/A"
            return <span>{dateValue}</span>
          } },
        )
      }

      // Add Supporting Document column
      columns.push({
        id: "supportingDocument",
        header: "Supporting Document",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
              {item.supportingDocument && item.supportingDocument.length > 0 ? (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="View Document" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="w-[95vw] sm:w-[90vw] max-w-4xl h-[85vh] sm:h-[80vh] p-0 overflow-hidden"
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <DialogHeader className="p-3 sm:p-4 border-b">
                        <DialogTitle className="text-base sm:text-lg">View Document</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
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
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                    uploded file
                  </Badge>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="Upload Document" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] sm:w-auto">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Upload Supporting Documents</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Please edit the publication to upload documents</p>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )
        },
      })

      // Add Actions column
      columns.push({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleView(section.id, item.id)
                }} 
                className="h-7 w-7 sm:h-8 sm:w-8 p-0" 
                title="View"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(section.id, item)
                }} 
                className="h-7 w-7 sm:h-8 sm:w-8 p-0" 
                title="Edit"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(section.id, item.id, item.title || item.titleOfPaper || "this item")
                }}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Delete"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )
        },
      })

      return columns
    }

  // Memoize columns for all sections at once (outside of map to follow Rules of Hooks)
  const columnsBySection = useMemo(() => {
    const columnsMap: Record<string, ColumnDef<any>[]> = {}
    sections.forEach((section) => {
      columnsMap[section.id] = createColumnsForSection(
        section,
        resPubLevelOptions,
        bookTypeOptions,
        journalAuthorTypeOptions,
        handleView,
        handleEdit,
        handleDelete
      )
    })
    return columnsMap
  }, [sections, resPubLevelOptions, bookTypeOptions, journalAuthorTypeOptions, handleView, handleEdit, handleDelete])

  // Keep renderTableData for backward compatibility (not used in new table but kept for reference)
  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "journals":
        return (
          <>
            <TableCell className="text-xs sm:text-sm">{item.srNo}</TableCell>
            <TableCell className="max-w-xs text-xs sm:text-sm">
              <div className="truncate" title={item.authors}>
                {item.authors}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm">{item.noOfAuthors}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.authorType}</TableCell>
            <TableCell className="font-medium max-w-xs text-xs sm:text-sm">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm">{item.type}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.issn}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.isbn}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.journalBookName}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.volumeNo}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.pageNo}</TableCell>
            <TableCell className="text-xs sm:text-sm">{new Date(item.date).toLocaleDateString()}</TableCell>
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

  return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Publications</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
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
                    className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm"
                  >
                    <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{section.title}</span>
                    <span className="sm:hidden">{section.title.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-base sm:text-lg">{section.title}</span>
                  </CardTitle>
                  <Button onClick={() => router.push(section.addRoute)} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add {section.title}</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <EnhancedDataTable
                    columns={columnsBySection[section.id] || []}
                    data={data[section.id as keyof typeof data] || []}
                    loading={isFetching}
                    pageSize={10}
                    exportable={true}
                    enableGlobalFilter={true}
                    emptyMessage={`No ${section.title.toLowerCase()} found. Click "Add ${section.title}" to get started.`}
                    wrapperClassName="rounded-md border overflow-x-auto"
                  />
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
