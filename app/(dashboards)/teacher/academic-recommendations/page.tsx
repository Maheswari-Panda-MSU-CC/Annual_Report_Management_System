"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherAcademicRecommendations } from "@/hooks/use-teacher-data"
import { useArticlesMutations, useBooksMutations, useMagazinesMutations, useTechReportsMutations } from "@/hooks/use-teacher-academic-recommendations-mutations"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  BookOpen,
  Newspaper,
  FileCheck,
  Save,
  Calendar,
  Loader2,
} from "lucide-react"
import { JournalArticlesForm } from "@/components/forms/JournalArticlesForm"
import { BooksForm } from "@/components/forms/BooksForm"
import { MagazinesForm } from "@/components/forms/MagazinesForm"
import { TechReportsForm } from "@/components/forms/TechReportsForm"


const sections = [
  {
    id: "articles",
    title: "Articles/Journals/Edited Volumes",
    icon: FileText,
    columns: [
      "Sr No.",
      "Journal Name",
      "ISSN (Without -)",
      "E-ISSN (Without -)",
      "Volume No.",
      "Publisher's Name",
      "Type",
      "Level",
      "Peer Reviewed?",
      "H Index",
      "Impact Factor",
      "In Scopus?",
      "In UGC CARE?",
      "In CLARIVATE?",
      "In Old UGC List?",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
  {
    id: "books",
    title: "Books",
    icon: BookOpen,
    columns: [
      "Sr No.",
      "Title",
      "Author(s)",
      "ISBN (Without -)",
      "Publisher Name",
      "Publishing Level",
      "Book Type",
      "Edition",
      "Volume No.",
      "Publication Date",
      "EBook",
      "Digital Media",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
  {
    id: "magazines",
    title: "Magazines",
    icon: Newspaper,
    columns: [
      "Sr No.",
      "Title",
      "Mode",
      "Publishing Agency",
      "Volume No.",
      "Publication Date",
      "Additional Attachment?",
      "Additional Attachment",
      "No. of Issues per Year",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
  {
    id: "technical",
    title: "Technical Report and Other(s)",
    icon: FileCheck,
    columns: [
      "Sr No.",
      "Title",
      "Subject",
      "Publisher's Name",
      "Publication Date",
      "No. of Issues per Year",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
]



export default function AcademicRecommendationsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("articles")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)
  const form = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  // React Query hooks
  const { articles, books, magazines, technical, data: queryData } = useTeacherAcademicRecommendations()

  // Mutation hooks
  const articlesMutations = useArticlesMutations()
  const booksMutations = useBooksMutations()
  const magazinesMutations = useMagazinesMutations()
  const techReportsMutations = useTechReportsMutations()

  // Derive submitting state from mutations
  const isSubmitting = articlesMutations.updateMutation.isPending || 
                       booksMutations.updateMutation.isPending || 
                       magazinesMutations.updateMutation.isPending || 
                       techReportsMutations.updateMutation.isPending
  
  // Derive deleting state from mutations
  const isDeleting = articlesMutations.deleteMutation.isPending || 
                     booksMutations.deleteMutation.isPending || 
                     magazinesMutations.deleteMutation.isPending || 
                     techReportsMutations.deleteMutation.isPending

  // Fetch dropdowns (handled internally by useDropDowns hook)
  const {
    resPubLevelOptions,
    journalEditedTypeOptions,
    bookTypeOptions,
  } = useDropDowns()

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Map API data to UI format
  const data = useMemo(() => {
    const articlesData = (queryData?.journals || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      title: item.title || "",
      issn: item.ISSN || "",
      eISSN: item.eISSN || "",
      volume_num: item.volume_num || "",
      publisherName: item.PublisherName || "",
      type: item.Teacher_Jour_Edited_Type_Name || "",
      typeId: item.type !== null && item.type !== undefined ? Number(item.type) : null,
      level: item.Res_Pub_Level_Name || "",
      levelId: item.level !== null && item.level !== undefined ? Number(item.level) : null,
      peer_reviewed: item.peer_reviewed || false,
      h_index: item.h_index || "",
      impact_factor: item.impact_factor || "",
      in_scopus: item.in_scopus || false,
      in_ugc: item.in_ugc || false,
      in_clarivate: item.in_clarivate || false,
      in_oldUGCList: item.in_oldUGCList || false,
      doi: item.DOI || "",
      noofIssuePerYr: item.NoofIssuePerYr || "",
      price: item.Price || "",
      currency: item.Currency || "",
    }))

    const booksData = (queryData?.books || []).map((item: any, index: number) => ({
      id: item.Id,
      srNo: index + 1,
      title: item.Title || "",
      authors: item.Authors || "",
      isbn: item.ISBN || "",
      book_category: item.Book_Category || "",
      publisher_name: item.Publisher_Name || "",
      publishing_level: item.LevelName || "",
      publishing_levelId: item.Publishing_Level,
      book_type: item.BookType || "",
      book_typeId: item.Book_Type,
      edition: item.Edition || "",
      volume: item.Volume || "",
      ebook: item.Ebook || "",
      digital_media: item.DigitalMedia || "",
      approx_price: item.ApproxPrice || "",
      currency: item.Currency || "",
      publication_date: item.PublicationDate ? new Date(item.PublicationDate).toISOString().split('T')[0] : "",
      proposed_ay: item.Proposed_AY || "",
    }))

    const magazinesData = (queryData?.magazines || []).map((item: any, index: number) => ({
      id: item.Id,
      srNo: index + 1,
      title: item.Title || "",
      mode: item.Mode || "",
      category: item.Category || "",
      is_additional_attachment: item.IsAdditionalAttachment || false,
      additional_attachment: item.AdditionalAttachment || "",
      publication_date: item.PublicationDate ? new Date(item.PublicationDate).toISOString().split('T')[0] : "",
      publishing_agency: item.PublishingAgency || "",
      volume: item.Volume || "",
      no_of_issue_per_yr: item.NoOfIssuePerYr || "",
      price: item.Price || "",
      currency: item.Currency || "",
    }))

    const technicalData = (queryData?.techReports || []).map((item: any, index: number) => ({
      id: item.Id,
      srNo: index + 1,
      title: item.Title || "",
      subject: item.Subject || "",
      publisher_name: item.PublisherName || "",
      publication_date: item.PublicationDate ? new Date(item.PublicationDate).toISOString().split('T')[0] : "",
      no_of_issue_per_year: item.NoOfIssuePerYear || "",
      price: item.Price || "",
      currency: item.Currency || "",
    }))

    return {
      articles: articlesData,
      books: booksData,
      magazines: magazinesData,
      technical: technicalData,
    }
  }, [queryData])

  // Loading states derived from queries
  const loadingStates = useMemo(() => ({
    articles: articles.isLoading || articles.isFetching,
    books: books.isLoading || books.isFetching,
    magazines: magazines.isLoading || magazines.isFetching,
    technical: technical.isLoading || technical.isFetching,
  }), [articles.isLoading, articles.isFetching, books.isLoading, books.isFetching, magazines.isLoading, magazines.isFetching, technical.isLoading, technical.isFetching])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  const handleDeleteClick = useCallback((sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }, [])

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { sectionId, itemId } = deleteConfirm

    try {
      if (sectionId === "articles") {
        await articlesMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "books") {
        await booksMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "magazines") {
        await magazinesMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "technical") {
        await techReportsMutations.deleteMutation.mutateAsync(itemId)
      }
      setDeleteConfirm(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleEdit = useCallback((sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "articles") {
      formItem = {
        title: item.title || "",
        issn: item.issn || "",
        eISSN: item.eISSN || "",
        volume_num: item.volume_num || "",
        publisherName: item.publisherName || "",
        type: item.typeId !== null && item.typeId !== undefined ? Number(item.typeId) : null,
        level: item.levelId !== null && item.levelId !== undefined ? Number(item.levelId) : null,
        peer_reviewed: item.peer_reviewed || false,
        h_index: item.h_index || "",
        impact_factor: item.impact_factor || "",
        in_scopus: item.in_scopus || false,
        in_ugc: item.in_ugc || false,
        in_clarivate: item.in_clarivate || false,
        in_oldUGCList: item.in_oldUGCList || false,
        doi: item.doi || "",
        noofIssuePerYr: item.noofIssuePerYr || "",
        price: item.price || "",
        currency: item.currency || "",
      }
    } else if (sectionId === "books") {
      formItem = {
        title: item.title || "",
        authors: item.authors || "",
        isbn: item.isbn || "",
        book_category: item.book_category || "",
        publisher_name: item.publisher_name || "",
        publishing_level: item.publishing_levelId || null,
        book_type: item.book_typeId || null,
        edition: item.edition || "",
        volume: item.volume || "",
        ebook: item.ebook || "",
        digital_media: item.digital_media || "",
        approx_price: item.approx_price || "",
        currency: item.currency || "",
        publication_date: item.publication_date || "",
        proposed_ay: item.proposed_ay || "",
      }
    } else if (sectionId === "magazines") {
      formItem = {
        title: item.title || "",
        mode: item.mode || "",
        category: item.category || "",
        is_additional_attachment: item.is_additional_attachment || false,
        additional_attachment: item.additional_attachment || "",
        publication_date: item.publication_date || "",
        publishing_agency: item.publishing_agency || "",
        volume: item.volume || "",
        no_of_issue_per_yr: item.no_of_issue_per_yr || "",
        price: item.price || "",
        currency: item.currency || "",
      }
    } else if (sectionId === "technical") {
      formItem = {
        title: item.title || "",
        subject: item.subject || "",
        publisher_name: item.publisher_name || "",
        publication_date: item.publication_date || "",
        no_of_issue_per_year: item.no_of_issue_per_year || "",
        price: item.price || "",
        currency: item.currency || "",
      }
    }
    
    // Reset form with the mapped data
    // Ensure type and level are numbers for dropdown matching
    const normalizedFormItem = {
      ...formItem,
      type: formItem.type !== null && formItem.type !== undefined ? Number(formItem.type) : null,
      level: formItem.level !== null && formItem.level !== undefined ? Number(formItem.level) : null,
    }
    form.reset(normalizedFormItem)
    setIsEditDialogOpen(true)
  }, [form])

  const handleSaveEdit = async () => {
    if (!editingItem || !user?.role_id) return

    const formValues = form.getValues()
    let updateData: any = {}

    try {
      if (editingItem.sectionId === "articles") {
        updateData = {
          title: formValues.title,
          issn: formValues.issn || null,
          eISSN: formValues.eISSN || null,
          publisherName: formValues.publisherName || null,
          volume_num: formValues.volume_num ? parseInt(formValues.volume_num) : null,
          level: formValues.level || null,
          peer_reviewed: formValues.peer_reviewed || false,
          h_index: formValues.h_index ? parseFloat(formValues.h_index) : null,
          impact_factor: formValues.impact_factor ? parseFloat(formValues.impact_factor) : null,
          in_scopus: formValues.in_scopus || false,
          type: formValues.type || null,
          in_ugc: formValues.in_ugc || false,
          in_clarivate: formValues.in_clarivate || false,
          doi: formValues.doi || null,
          in_oldUGCList: formValues.in_oldUGCList || false,
          noofIssuePerYr: formValues.noofIssuePerYr ? parseInt(formValues.noofIssuePerYr) : null,
          price: formValues.price ? parseFloat(formValues.price) : null,
          currency: formValues.currency || null,
        }
        await articlesMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      } else if (editingItem.sectionId === "books") {
        updateData = {
          title: formValues.title,
          authors: formValues.authors || null,
          isbn: formValues.isbn || null,
          book_category: formValues.book_category || null,
          publisher_name: formValues.publisher_name || null,
          publishing_level: formValues.publishing_level || null,
          book_type: formValues.book_type || null,
          edition: formValues.edition || null,
          volume: formValues.volume || null,
          ebook: formValues.ebook || null,
          digital_media: formValues.digital_media || null,
          approx_price: formValues.approx_price ? parseFloat(formValues.approx_price) : null,
          currency: formValues.currency || null,
          publication_date: formValues.publication_date || null,
          proposed_ay: formValues.proposed_ay || null,
        }
        await booksMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      } else if (editingItem.sectionId === "magazines") {
        updateData = {
          title: formValues.title,
          mode: formValues.mode || null,
          category: formValues.category || null,
          is_additional_attachment: formValues.is_additional_attachment || false,
          additional_attachment: formValues.additional_attachment || null,
          publication_date: formValues.publication_date || null,
          publishing_agency: formValues.publishing_agency || null,
          volume: formValues.volume || null,
          no_of_issue_per_yr: formValues.no_of_issue_per_yr ? parseInt(formValues.no_of_issue_per_yr) : null,
          price: formValues.price ? parseFloat(formValues.price) : null,
          currency: formValues.currency || null,
        }
        await magazinesMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      } else if (editingItem.sectionId === "technical") {
        updateData = {
          title: formValues.title,
          subject: formValues.subject || null,
          publisher_name: formValues.publisher_name || null,
          publication_date: formValues.publication_date || null,
          no_of_issue_per_year: formValues.no_of_issue_per_year ? parseInt(formValues.no_of_issue_per_year) : null,
          price: formValues.price ? parseFloat(formValues.price) : null,
          currency: formValues.currency || null,
        }
        await techReportsMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
      }
      setIsEditDialogOpen(false)
      setEditingItem(null)
      form.reset()
    } catch (error: any) {
      console.error("Error updating record:", error)
      // Toast handled by mutation hook
    }
  }

  // Helper function to display values
  const displayValue = (value: any, fallback: string = ""): string => {
    if (value === null || value === undefined || value === "") return fallback
    return String(value)
  }

  // Helper function to format date to dd/mm/yyyy
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "N/A"
    
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return "N/A"
      
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      
      return `${day}/${month}/${year}`
    } catch {
      // If it's already a formatted string, try to parse it
      if (typeof dateValue === 'string') {
        // Try to parse common date formats
        const parsed = new Date(dateValue)
        if (!isNaN(parsed.getTime())) {
          const day = String(parsed.getDate()).padStart(2, '0')
          const month = String(parsed.getMonth() + 1).padStart(2, '0')
          const year = parsed.getFullYear()
          return `${day}/${month}/${year}`
        }
        // If it's already in dd/mm/yyyy format, return as is
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
          return dateValue
        }
      }
      return String(dateValue)
    }
  }

  // Create column definitions for each section
  const createColumnsForSection = useCallback((section: any): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = []

    if (section.id === "articles") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "title", 
          header: "Journal Name", 
          enableSorting: true, 
          cell: ({ row }) => {
            const title = displayValue(row.original.title)
            return (
              <div className="font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4 truncate" title={title}>{title}</div>
            )
          },
          meta: { className: "font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "issn", header: "ISSN (Without -)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.issn)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "eISSN", header: "E-ISSN (Without -)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.eISSN)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "volume_num", header: "Volume No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.volume_num)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "publisherName", 
          header: "Publisher's Name", 
          enableSorting: true, 
          cell: ({ row }) => {
            const publisher = displayValue(row.original.publisherName)
            return (
              <div className="max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4 truncate" title={publisher}>{publisher}</div>
            )
          },
          meta: { className: "max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "type", header: "Type", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.type)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "level", 
          header: "Level", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant="outline" className="text-[10px] sm:text-xs">{displayValue(row.original.level)}</Badge>
          )
        },
        { 
          accessorKey: "peer_reviewed", 
          header: "Peer Reviewed?", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant={row.original.peer_reviewed ? "default" : "secondary"} className="text-[10px] sm:text-xs">
              {row.original.peer_reviewed ? "Yes" : "No"}
            </Badge>
          )
        },
        { accessorKey: "h_index", header: "H Index", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.h_index)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "impact_factor", header: "Impact Factor", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.impact_factor)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "in_scopus", 
          header: "In Scopus?", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant={row.original.in_scopus ? "default" : "secondary"} className="text-[10px] sm:text-xs">
              {row.original.in_scopus ? "Yes" : "No"}
            </Badge>
          )
        },
        { 
          accessorKey: "in_ugc", 
          header: "In UGC CARE?", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant={row.original.in_ugc ? "default" : "secondary"} className="text-[10px] sm:text-xs">
              {row.original.in_ugc ? "Yes" : "No"}
            </Badge>
          )
        },
        { 
          accessorKey: "in_clarivate", 
          header: "In CLARIVATE?", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant={row.original.in_clarivate ? "default" : "secondary"} className="text-[10px] sm:text-xs">
              {row.original.in_clarivate ? "Yes" : "No"}
            </Badge>
          )
        },
        { 
          accessorKey: "in_oldUGCList", 
          header: "In Old UGC List?", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant={row.original.in_oldUGCList ? "default" : "secondary"} className="text-[10px] sm:text-xs">
              {row.original.in_oldUGCList ? "Yes" : "No"}
            </Badge>
          )
        },
        { accessorKey: "price", header: "Approx. Price", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.price)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "currency", header: "Currency", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.currency)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    } else if (section.id === "books") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "title", 
          header: "Title", 
          enableSorting: true, 
          cell: ({ row }) => {
            const title = displayValue(row.original.title)
            return (
              <div className="font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4 truncate" title={title}>{title}</div>
            )
          },
          meta: { className: "font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4" }
        },
        { 
          accessorKey: "authors", 
          header: "Author(s)", 
          enableSorting: true, 
          cell: ({ row }) => {
            const authors = displayValue(row.original.authors)
            return (
              <div className="max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4 truncate" title={authors}>{authors}</div>
            )
          },
          meta: { className: "max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "isbn", header: "ISBN (Without -)", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.isbn)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "publisher_name", 
          header: "Publisher Name", 
          enableSorting: true, 
          cell: ({ row }) => {
            const publisher = displayValue(row.original.publisher_name)
            return (
              <div className="max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4 truncate" title={publisher}>{publisher}</div>
            )
          },
          meta: { className: "max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4" }
        },
        { 
          accessorKey: "publishing_level", 
          header: "Publishing Level", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant="outline" className="text-[10px] sm:text-xs">{displayValue(row.original.publishing_level)}</Badge>
          )
        },
        { accessorKey: "book_type", header: "Book Type", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.book_type)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "edition", header: "Edition", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.edition)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "volume", header: "Volume No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.volume)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "publication_date", 
          header: "Publication Date", 
          enableSorting: true, 
          cell: ({ row }) => {
            const date = formatDate(row.original.publication_date)
            return (
              <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{date}</span>
              </div>
            )
          },
          meta: { className: "text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "ebook", header: "EBook", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.ebook, "N/A")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "digital_media", header: "Digital Media", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.digital_media, "N/A")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "approx_price", header: "Approx. Price", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.approx_price)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "currency", header: "Currency", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.currency)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    } else if (section.id === "magazines") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "title", 
          header: "Title", 
          enableSorting: true, 
          cell: ({ row }) => {
            const title = displayValue(row.original.title)
            return (
              <div className="font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4 truncate" title={title}>{title}</div>
            )
          },
          meta: { className: "font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "mode", header: "Mode", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.mode)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "publishing_agency", 
          header: "Publishing Agency", 
          enableSorting: true, 
          cell: ({ row }) => {
            const agency = displayValue(row.original.publishing_agency)
            return (
              <div className="max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4 truncate" title={agency}>{agency}</div>
            )
          },
          meta: { className: "max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "volume", header: "Volume No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.volume)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "publication_date", 
          header: "Publication Date", 
          enableSorting: true, 
          cell: ({ row }) => {
            const date = formatDate(row.original.publication_date)
            return (
              <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{date}</span>
              </div>
            )
          },
          meta: { className: "text-xs sm:text-sm px-2 sm:px-4" }
        },
        { 
          accessorKey: "is_additional_attachment", 
          header: "Additional Attachment?", 
          enableSorting: true, 
          cell: ({ row }) => (
            <Badge variant={row.original.is_additional_attachment ? "default" : "secondary"} className="text-[10px] sm:text-xs">
              {row.original.is_additional_attachment ? "Yes" : "No"}
            </Badge>
          )
        },
        { accessorKey: "additional_attachment", header: "Additional Attachment", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.additional_attachment, "N/A")}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "no_of_issue_per_yr", header: "No. of Issues per Year", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.no_of_issue_per_yr)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "price", header: "Approx. Price", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.price)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "currency", header: "Currency", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.currency)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    } else if (section.id === "technical") {
      columns.push(
        { accessorKey: "srNo", header: "Sr No.", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "title", 
          header: "Title", 
          enableSorting: true, 
          cell: ({ row }) => {
            const title = displayValue(row.original.title)
            return (
              <div className="font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4 truncate" title={title}>{title}</div>
            )
          },
          meta: { className: "font-medium max-w-[120px] sm:max-w-none text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "subject", header: "Subject", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.subject)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { 
          accessorKey: "publisher_name", 
          header: "Publisher's Name", 
          enableSorting: true, 
          cell: ({ row }) => {
            const publisher = displayValue(row.original.publisher_name)
            return (
              <div className="max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4 truncate" title={publisher}>{publisher}</div>
            )
          },
          meta: { className: "max-w-[120px] sm:max-w-xs text-xs sm:text-sm px-2 sm:px-4" }
        },
        { 
          accessorKey: "publication_date", 
          header: "Publication Date", 
          enableSorting: true, 
          cell: ({ row }) => {
            const date = formatDate(row.original.publication_date)
            return (
              <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{date}</span>
              </div>
            )
          },
          meta: { className: "text-xs sm:text-sm px-2 sm:px-4" }
        },
        { accessorKey: "no_of_issue_per_year", header: "No. of Issues per Year", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.no_of_issue_per_year)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "price", header: "Approx. Price", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.price)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
        { accessorKey: "currency", header: "Currency", enableSorting: true, cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.currency)}</span>, meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } },
      )
    }

    // Add Actions column for all sections
    columns.push({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(section.id, item)
              }} 
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
              title="Edit"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(section.id, item.id, item.title || "this record")
              }}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-red-600 hover:text-red-700"
              title="Delete"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )
      },
    })

    return columns
  }, [handleEdit, handleDeleteClick])

  // Memoize columns for all sections
  const columnsBySection = useMemo(() => {
    const columnsMap: Record<string, ColumnDef<any>[]> = {}
    sections.forEach((section) => {
      columnsMap[section.id] = createColumnsForSection(section)
    })
    return columnsMap
  }, [createColumnsForSection])

  // Memoize edit data to prevent infinite loops
  const editDataRef = useRef<any>({})
  
  useEffect(() => {
    if (editingItem && isEditDialogOpen) {
      if (editingItem.sectionId === "articles") {
        editDataRef.current = {
          title: editingItem.title || "",
          issn: editingItem.issn || "",
          eISSN: editingItem.eISSN || "",
          volume_num: editingItem.volume_num || "",
          publisherName: editingItem.publisherName || "",
          type: editingItem.typeId !== null && editingItem.typeId !== undefined ? Number(editingItem.typeId) : null,
          level: editingItem.levelId !== null && editingItem.levelId !== undefined ? Number(editingItem.levelId) : null,
          peer_reviewed: editingItem.peer_reviewed || false,
          h_index: editingItem.h_index || "",
          impact_factor: editingItem.impact_factor || "",
          in_scopus: editingItem.in_scopus || false,
          in_ugc: editingItem.in_ugc || false,
          in_clarivate: editingItem.in_clarivate || false,
          in_oldUGCList: editingItem.in_oldUGCList || false,
          doi: editingItem.doi || "",
          noofIssuePerYr: editingItem.noofIssuePerYr || "",
          price: editingItem.price || "",
          currency: editingItem.currency || "",
        }
      } else if (editingItem.sectionId === "books") {
        editDataRef.current = {
          title: editingItem.title || "",
          authors: editingItem.authors || "",
          isbn: editingItem.isbn || "",
          book_category: editingItem.book_category || "",
          publisher_name: editingItem.publisher_name || "",
          publishing_level: editingItem.publishing_levelId || null,
          book_type: editingItem.book_typeId || null,
          edition: editingItem.edition || "",
          volume: editingItem.volume || "",
          ebook: editingItem.ebook || "",
          digital_media: editingItem.digital_media || "",
          approx_price: editingItem.approx_price || "",
          currency: editingItem.currency || "",
          publication_date: editingItem.publication_date || "",
          proposed_ay: editingItem.proposed_ay || "",
        }
      } else if (editingItem.sectionId === "magazines") {
        editDataRef.current = {
          title: editingItem.title || "",
          mode: editingItem.mode || "",
          category: editingItem.category || "",
          is_additional_attachment: editingItem.is_additional_attachment || false,
          additional_attachment: editingItem.additional_attachment || "",
          publication_date: editingItem.publication_date || "",
          publishing_agency: editingItem.publishing_agency || "",
          volume: editingItem.volume || "",
          no_of_issue_per_yr: editingItem.no_of_issue_per_yr || "",
          price: editingItem.price || "",
          currency: editingItem.currency || "",
        }
      } else if (editingItem.sectionId === "technical") {
        editDataRef.current = {
          title: editingItem.title || "",
          subject: editingItem.subject || "",
          publisher_name: editingItem.publisher_name || "",
          publication_date: editingItem.publication_date || "",
          no_of_issue_per_year: editingItem.no_of_issue_per_year || "",
          price: editingItem.price || "",
          currency: editingItem.currency || "",
        }
      }
    } else {
      editDataRef.current = {}
    }
  }, [editingItem, isEditDialogOpen])

  const renderForm = useCallback((sectionId: string, isEdit = false) => {
    // Get current form values for edit mode
    const currentData = isEdit ? editDataRef.current : {}

    switch (sectionId) {
      case "articles":
        return (
          <JournalArticlesForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
            journalEditedTypeOptions={journalEditedTypeOptions}
          />
        )
      case "books":
        return (
          <BooksForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
            bookTypeOptions={bookTypeOptions}
          />
        )
      case "magazines":
        return (
          <MagazinesForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      case "technical":
        return (
          <TechReportsForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      default:
        return null
    }
  }, [form, isSubmitting, resPubLevelOptions, journalEditedTypeOptions, bookTypeOptions, handleSaveEdit])

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Teacher's Recommendations for Learning Resources
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Manage your academic recommendations for articles, books, magazines, and technical reports
        </p>
      </div>

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
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {section.title}
                </CardTitle>
                <Button
                  onClick={() => {
                    router.push(`/teacher/academic-recommendations/add?tab=${section.id}`)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add </span>{section.title}
                </Button>
              </CardHeader>
              <CardContent>
                <EnhancedDataTable
                  columns={columnsBySection[section.id] || []}
                  data={data[section.id as keyof typeof data] || []}
                  loading={loadingStates[section.id as keyof typeof loadingStates]}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setEditingItem(null)
          form.reset()
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-3 sm:p-4 md:p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl">
              Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)] pr-2 mt-4">
            {editingItem && renderForm(editingItem.sectionId, true)}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingItem(null)
              form.reset()
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={() => {
                form.handleSubmit(handleSaveEdit)()
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the record
              <strong className="block mt-2 text-sm sm:text-base">
                "{deleteConfirm?.itemName}"
              </strong>
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
