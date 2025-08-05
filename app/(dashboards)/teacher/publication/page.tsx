"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  BookOpen,
  Presentation,
  Save,
  ExternalLink,
  Eye,
  TrendingUp,
} from "lucide-react"

// Sample data for each section
const initialSampleData = {
  journals: [
    {
      id: 1,
      srNo: 1,
      authors: "Dr. John Smith, Dr. Jane Doe",
      noOfAuthors: 2,
      authorType: "Principal Author",
      title: "Machine Learning Applications in Healthcare Diagnostics",
      type: "Journal Article",
      issn: "02780062",
      isbn: "",
      journalBookName: "IEEE Transactions on Medical Imaging",
      volumeNo: "42",
      pageNo: "123-135",
      date: "2023-05-15",
      level: "International",
      peerReviewed: "Yes",
      hIndex: "4.5",
      impactFactor: "10.048",
      doi: "10.1109/TMI.2023.1234567",
      inScopus: "Yes",
      inUgcCare: "Yes",
      inClarivate: "Yes",
      inOldUgcList: "No",
      chargesPaid: "No",
      supportingDocument: ["journal_article.pdf"],
    },
  ],
  books: [
    {
      id: 1,
      srNo: 1,
      authors: "Dr. John Smith, Dr. Jane Doe",
      title: "Fundamentals of Artificial Intelligence: Theory and Practice",
      isbn: "9783030123456",
      publisherName: "Springer Nature",
      publishingDate: "2023-01-15",
      publishingPlace: "New York, USA",
      chargesPaid: "No",
      edited: "No",
      chapterCount: "15",
      publishingLevel: "International",
      bookType: "Textbook",
      authorType: "Principal Author",
      supportingDocument: ["book_cover.pdf"],
    },
  ],
  papers: [
    {
      id: 1,
      srNo: 1,
      authors: "Dr. John Smith, Dr. Alice Brown",
      presentationLevel: "International",
      themeOfConference: "Artificial Intelligence and Machine Learning",
      modeOfParticipation: "Physical",
      titleOfPaper: "Deep Learning for Medical Image Analysis",
      organizingBody: "IEEE Computer Society",
      place: "Paris, France",
      dateOfPresentation: "2023-10-15",
      supportingDocument: ["conference_certificate.pdf"],
    },
  ],
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
      "DOI",
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

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

// Statistics Component
function PublicationStats({ data }: { data: typeof initialSampleData }) {
  const stats = [
    {
      title: "Journal Articles",
      count: data.journals.length,
      icon: FileText,
      description: "Published articles in journals and edited volumes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Books Published",
      count: data.books.length,
      icon: BookOpen,
      description: "Books and book chapters published",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Papers Presented",
      count: data.papers.length,
      icon: Presentation,
      description: "Conference papers and presentations",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
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
          <Card key={index} className={`${stat.borderColor} border-2 hover:shadow-md transition-shadow duration-200`}>
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
  const [activeTab, setActiveTab] = useState("journals")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [data, setData] = useState(initialSampleData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()

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

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleDelete = (sectionId: string, itemId: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setData((prevData) => ({
        ...prevData,
        [sectionId]: prevData[sectionId as keyof typeof prevData].filter((item: any) => item.id !== itemId),
      }))
      toast({
        title: "Success",
        description: "Item deleted successfully!",
        duration: 2000,
      })
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    setFormData({ ...item })
    setIsEditDialogOpen(true)
  }

  const handleView = (sectionId: string, itemId: number) => {
    // Navigate to the specific publication view page
    if (sectionId === "journals") {
      router.push(`/teacher/publication/journal-articles/${itemId}`)
    } else {
      // For now, other types will use the same pattern when implemented
      router.push(`/teacher/publication/${sectionId}/${itemId}`)
    }
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    setData((prevData) => ({
      ...prevData,
      [editingItem.sectionId]: prevData[editingItem.sectionId as keyof typeof prevData].map((item: any) =>
        item.id === editingItem.id ? { ...item, ...formData } : item,
      ),
    }))

    setIsEditDialogOpen(false)
    setEditingItem(null)
    setFormData({})
    toast({
      title: "Success",
      description: "Item updated successfully!",
      duration: 2000,
    })
  }

  const handleFileUpload = (sectionId: string, itemId: number) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const fileNames = Array.from(selectedFiles).map((f) => f.name)
      setData((prevData) => ({
        ...prevData,
        [sectionId]: prevData[sectionId as keyof typeof prevData].map((item: any) =>
          item.id === itemId
            ? { ...item, supportingDocument: [...(item.supportingDocument || []), ...fileNames] }
            : item,
        ),
      }))
      toast({
        title: "Files Uploaded",
        description: "Supporting documents uploaded successfully!",
        duration: 2000,
      })
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
              {item.doi && (
                <a
                  href={`https://doi.org/${item.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                >
                  DOI <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </TableCell>
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
            <TableCell>{new Date(item.publishingDate).toLocaleDateString()}</TableCell>
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
                {item.publishingLevel}
              </Badge>
            </TableCell>
            <TableCell>{item.bookType}</TableCell>
            <TableCell>{item.authorType}</TableCell>
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
            <TableCell>{new Date(item.dateOfPresentation).toLocaleDateString()}</TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "journals":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authors">Author(s) *</Label>
                <Input
                  id="authors"
                  placeholder="Enter all authors"
                  value={currentData.authors || ""}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="noOfAuthors">No. of Authors</Label>
                <Input
                  id="noOfAuthors"
                  type="number"
                  placeholder="Number of authors"
                  value={currentData.noOfAuthors || ""}
                  onChange={(e) => setFormData({ ...formData, noOfAuthors: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorType">Author Type</Label>
                <Select
                  value={currentData.authorType || ""}
                  onValueChange={(value) => setFormData({ ...formData, authorType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select author type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principal Author">Principal Author</SelectItem>
                    <SelectItem value="Co-Author">Co-Author</SelectItem>
                    <SelectItem value="Corresponding Author">Corresponding Author</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={currentData.type || ""}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Journal Article">Journal Article</SelectItem>
                    <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                    <SelectItem value="Review Article">Review Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issn">ISSN (Without -)</Label>
                <Input
                  id="issn"
                  placeholder="Enter ISSN without dashes"
                  value={currentData.issn || ""}
                  onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="isbn">ISBN (Without -)</Label>
                <Input
                  id="isbn"
                  placeholder="Enter ISBN without dashes"
                  value={currentData.isbn || ""}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="journalBookName">Journal/Book Name *</Label>
              <Input
                id="journalBookName"
                placeholder="Enter journal or book name"
                value={currentData.journalBookName || ""}
                onChange={(e) => setFormData({ ...formData, journalBookName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="volumeNo">Volume No.</Label>
                <Input
                  id="volumeNo"
                  placeholder="Volume"
                  value={currentData.volumeNo || ""}
                  onChange={(e) => setFormData({ ...formData, volumeNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pageNo">Page No. (Range)</Label>
                <Input
                  id="pageNo"
                  placeholder="e.g., 123-135"
                  value={currentData.pageNo || ""}
                  onChange={(e) => setFormData({ ...formData, pageNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  value={currentData.level || ""}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="peerReviewed">Peer Reviewed?</Label>
                <Select
                  value={currentData.peerReviewed || ""}
                  onValueChange={(value) => setFormData({ ...formData, peerReviewed: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hIndex">H Index</Label>
                <Input
                  id="hIndex"
                  placeholder="H Index"
                  value={currentData.hIndex || ""}
                  onChange={(e) => setFormData({ ...formData, hIndex: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="impactFactor">Impact Factor</Label>
                <Input
                  id="impactFactor"
                  placeholder="Impact Factor"
                  value={currentData.impactFactor || ""}
                  onChange={(e) => setFormData({ ...formData, impactFactor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="Enter DOI"
                value={currentData.doi || ""}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inScopus">In Scopus?</Label>
                <Select
                  value={currentData.inScopus || ""}
                  onValueChange={(value) => setFormData({ ...formData, inScopus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inUgcCare">In UGC CARE?</Label>
                <Select
                  value={currentData.inUgcCare || ""}
                  onValueChange={(value) => setFormData({ ...formData, inUgcCare: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inClarivate">In CLARIVATE?</Label>
                <Select
                  value={currentData.inClarivate || ""}
                  onValueChange={(value) => setFormData({ ...formData, inClarivate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inOldUgcList">In Old UGC List?</Label>
                <Select
                  value={currentData.inOldUgcList || ""}
                  onValueChange={(value) => setFormData({ ...formData, inOldUgcList: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="chargesPaid">Charges Paid?</Label>
              <Select
                value={currentData.chargesPaid || ""}
                onValueChange={(value) => setFormData({ ...formData, chargesPaid: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
              {currentData.supportingDocument && currentData.supportingDocument.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current documents:</p>
                  <ul className="text-sm text-blue-600">
                    {currentData.supportingDocument.map((doc: string, index: number) => (
                      <li key={index}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      case "books":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="authors">Authors *</Label>
              <Input
                id="authors"
                placeholder="Enter all authors"
                value={currentData.authors || ""}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter book title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="isbn">ISBN (Without -)</Label>
                <Input
                  id="isbn"
                  placeholder="Enter ISBN without dashes"
                  value={currentData.isbn || ""}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publisherName">Publisher Name</Label>
                <Input
                  id="publisherName"
                  placeholder="Enter publisher name"
                  value={currentData.publisherName || ""}
                  onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishingDate">Publishing Date</Label>
                <Input
                  id="publishingDate"
                  type="date"
                  value={currentData.publishingDate || ""}
                  onChange={(e) => setFormData({ ...formData, publishingDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publishingPlace">Publishing Place</Label>
                <Input
                  id="publishingPlace"
                  placeholder="Enter publishing place"
                  value={currentData.publishingPlace || ""}
                  onChange={(e) => setFormData({ ...formData, publishingPlace: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chargesPaid">Charges Paid</Label>
                <Select
                  value={currentData.chargesPaid || ""}
                  onValueChange={(value) => setFormData({ ...formData, chargesPaid: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edited">Edited</Label>
                <Select
                  value={currentData.edited || ""}
                  onValueChange={(value) => setFormData({ ...formData, edited: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="chapterCount">Chapter Count</Label>
                <Input
                  id="chapterCount"
                  type="number"
                  placeholder="Number of chapters"
                  value={currentData.chapterCount || ""}
                  onChange={(e) => setFormData({ ...formData, chapterCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publishingLevel">Publishing Level</Label>
                <Select
                  value={currentData.publishingLevel || ""}
                  onValueChange={(value) => setFormData({ ...formData, publishingLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bookType">Book Type</Label>
                <Select
                  value={currentData.bookType || ""}
                  onValueChange={(value) => setFormData({ ...formData, bookType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Textbook">Textbook</SelectItem>
                    <SelectItem value="Reference Book">Reference Book</SelectItem>
                    <SelectItem value="Research Monograph">Research Monograph</SelectItem>
                    <SelectItem value="Edited Volume">Edited Volume</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="authorType">Author Type</Label>
              <Select
                value={currentData.authorType || ""}
                onValueChange={(value) => setFormData({ ...formData, authorType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal Author">Principal Author</SelectItem>
                  <SelectItem value="Co-Author">Co-Author</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
              {currentData.supportingDocument && currentData.supportingDocument.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current documents:</p>
                  <ul className="text-sm text-blue-600">
                    {currentData.supportingDocument.map((doc: string, index: number) => (
                      <li key={index}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      case "papers":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="authors">Author(s) *</Label>
              <Input
                id="authors"
                placeholder="Enter all authors"
                value={currentData.authors || ""}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="presentationLevel">Presentation Level</Label>
                <Select
                  value={currentData.presentationLevel || ""}
                  onValueChange={(value) => setFormData({ ...formData, presentationLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modeOfParticipation">Mode of Participation</Label>
                <Select
                  value={currentData.modeOfParticipation || ""}
                  onValueChange={(value) => setFormData({ ...formData, modeOfParticipation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="themeOfConference">Theme Of Conference/Seminar/Symposia</Label>
              <Input
                id="themeOfConference"
                placeholder="Enter conference theme"
                value={currentData.themeOfConference || ""}
                onChange={(e) => setFormData({ ...formData, themeOfConference: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="titleOfPaper">Title of Paper *</Label>
              <Input
                id="titleOfPaper"
                placeholder="Enter paper title"
                value={currentData.titleOfPaper || ""}
                onChange={(e) => setFormData({ ...formData, titleOfPaper: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizingBody">Organizing Body</Label>
                <Input
                  id="organizingBody"
                  placeholder="Enter organizing body"
                  value={currentData.organizingBody || ""}
                  onChange={(e) => setFormData({ ...formData, organizingBody: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="place">Place</Label>
                <Input
                  id="place"
                  placeholder="Enter place"
                  value={currentData.place || ""}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfPresentation">Date of Presentation/Seminar</Label>
              <Input
                id="dateOfPresentation"
                type="date"
                value={currentData.dateOfPresentation || ""}
                onChange={(e) => setFormData({ ...formData, dateOfPresentation: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
              {currentData.supportingDocument && currentData.supportingDocument.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current documents:</p>
                  <ul className="text-sm text-blue-600">
                    {currentData.supportingDocument.map((doc: string, index: number) => (
                      <li key={index}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
    }
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
        <PublicationStats data={data} />

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
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Upload Supporting Documents</DialogTitle>
                                      </DialogHeader>
                                      <FileUpload onFileSelect={handleFileSelect} />
                                      <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={() => handleFileUpload(section.id, item.id)}>
                                          Upload Files
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  {item.supportingDocument && item.supportingDocument.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
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
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(section.id, item.id)}>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] pr-2">
              {editingItem && renderForm(editingItem.sectionId, true)}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
