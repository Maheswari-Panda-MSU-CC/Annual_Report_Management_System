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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  BookOpen,
  Newspaper,
  FileCheck,
  Save,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"

// Sample data for each section with correct fields
const initialSampleData = {
  articles: [
    {
      id: 1,
      srNo: 1,
      journalName: "Journal of Medical AI",
      issn: "23456789",
      eIssn: "87654321",
      volumeNo: "15",
      publisherName: "Medical Publishers Inc",
      type: "Research Journal",
      level: "International",
      peerReviewed: "Yes",
      hIndex: "85",
      impactFactor: "8.5",
      inScopus: true,
      inUgcCare: true,
      inClarivate: true,
      inOldUgcList: false,
      approxPrice: "2500",
      currency: "USD",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  books: [
    {
      id: 1,
      srNo: 1,
      title: "Artificial Intelligence: A Comprehensive Guide",
      authors: "Dr. Robert Johnson, Dr. Sarah Smith",
      isbn: "9781234567890",
      publisherName: "Tech Publications",
      publishingLevel: "International",
      bookType: "Textbook",
      edition: "3rd Edition",
      volumeNo: "1",
      publicationDate: "2023-06-15",
      isEbook: "Yes",
      digitalMedia: "USB Drive",
      approxPrice: "150",
      currency: "USD",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  magazines: [
    {
      id: 1,
      srNo: 1,
      title: "Tech Today Magazine",
      mode: "Print + Digital",
      publishingAgency: "Tech Media Group",
      volumeNo: "45",
      publicationDate: "2023-08-15",
      isAdditionalAttachment: true,
      additionalAttachment: "CD/DVD",
      issuesPerYear: "12",
      approxPrice: "120",
      currency: "USD",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
  technical: [
    {
      id: 1,
      srNo: 1,
      title: "Technical Analysis of 5G Network Implementation",
      subject: "Telecommunications",
      publisherName: "Telecom Research Institute",
      publicationDate: "2023-06-30",
      issuesPerYear: "4",
      approxPrice: "200",
      currency: "USD",
      supportingDocument: ["http://localhost:3000/assets/demo_document.pdf"],
    },
  ],
}

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
      "Documents",
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
      "Documents",
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
      "Documents",
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
      "Documents",
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

export default function AcademicRecommendationsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("articles")
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
        [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).filter((item: any) => item.id !== itemId),
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

  const handleSaveEdit = () => {
    if (!editingItem) return

    setData((prevData) => ({
      ...prevData,
      [editingItem.sectionId]: (prevData[editingItem.sectionId as keyof typeof prevData] || []).map((item: any) =>
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
        [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).map((item: any) =>
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
      case "articles":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.journalName}>
                {item.journalName}
              </div>
            </TableCell>
            <TableCell>{item.issn}</TableCell>
            <TableCell>{item.eIssn}</TableCell>
            <TableCell>{item.volumeNo}</TableCell>
            <TableCell>{item.publisherName}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.level}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.peerReviewed === "Yes" ? "default" : "secondary"}>{item.peerReviewed}</Badge>
            </TableCell>
            <TableCell>{item.hIndex}</TableCell>
            <TableCell>{item.impactFactor}</TableCell>
           
            <TableCell>
              <Badge variant={item.inScopus ? "default" : "secondary"}>{item.inScopus ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.inUgcCare ? "default" : "secondary"}>{item.inUgcCare ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.inClarivate ? "default" : "secondary"}>{item.inClarivate ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.inOldUgcList ? "default" : "secondary"}>{item.inOldUgcList ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>{item.approxPrice}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      case "books":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.authors}>
                {item.authors}
              </div>
            </TableCell>
            <TableCell>{item.isbn}</TableCell>
            <TableCell>{item.publisherName}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.publishingLevel}</Badge>
            </TableCell>
            <TableCell>{item.bookType}</TableCell>
            <TableCell>{item.edition}</TableCell>
            <TableCell>{item.volumeNo}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publicationDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.isEbook === "Yes" ? "default" : "secondary"}>{item.isEbook}</Badge>
            </TableCell>
            <TableCell>{item.digitalMedia}</TableCell>
            <TableCell>{item.approxPrice}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      case "magazines":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.mode}</TableCell>
            <TableCell>{item.publishingAgency}</TableCell>
            <TableCell>{item.volumeNo}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publicationDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.isAdditionalAttachment ? "default" : "secondary"}>
                {item.isAdditionalAttachment ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>{item.additionalAttachment}</TableCell>
            <TableCell>{item.issuesPerYear}</TableCell>
            <TableCell>{item.approxPrice}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      case "technical":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.subject}</TableCell>
            <TableCell>{item.publisherName}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publicationDate}</span>
              </div>
            </TableCell>
            <TableCell>{item.issuesPerYear}</TableCell>
            <TableCell>{item.approxPrice}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "articles":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="journalName">Journal Name *</Label>
                <Input
                  id="journalName"
                  placeholder="Enter journal name"
                  value={currentData.journalName || ""}
                  onChange={(e) => setFormData({ ...formData, journalName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="issn">ISSN (Without -)</Label>
                <Input
                  id="issn"
                  placeholder="Enter ISSN without dashes"
                  value={currentData.issn || ""}
                  onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eIssn">E-ISSN (Without -)</Label>
                <Input
                  id="eIssn"
                  placeholder="Enter E-ISSN without dashes"
                  value={currentData.eIssn || ""}
                  onChange={(e) => setFormData({ ...formData, eIssn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="volumeNo">Volume No.</Label>
                <Input
                  id="volumeNo"
                  placeholder="Enter volume number"
                  value={currentData.volumeNo || ""}
                  onChange={(e) => setFormData({ ...formData, volumeNo: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publisherName">Publisher's Name</Label>
                <Input
                  id="publisherName"
                  placeholder="Enter publisher name"
                  value={currentData.publisherName || ""}
                  onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  placeholder="Enter type"
                  value={currentData.type || ""}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hIndex">H Index</Label>
                <Input
                  id="hIndex"
                  type="number"
                  placeholder="Enter H Index"
                  value={currentData.hIndex || ""}
                  onChange={(e) => setFormData({ ...formData, hIndex: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="impactFactor">Impact Factor</Label>
                <Input
                  id="impactFactor"
                  type="number"
                  step="0.001"
                  placeholder="Enter impact factor"
                  value={currentData.impactFactor || ""}
                  onChange={(e) => setFormData({ ...formData, impactFactor: e.target.value })}
                />
              </div>
             
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inScopus"
                  checked={currentData.inScopus || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, inScopus: checked })}
                />
                <Label htmlFor="inScopus">In Scopus?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inUgcCare"
                  checked={currentData.inUgcCare || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, inUgcCare: checked })}
                />
                <Label htmlFor="inUgcCare">In UGC CARE?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inClarivate"
                  checked={currentData.inClarivate || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, inClarivate: checked })}
                />
                <Label htmlFor="inClarivate">In CLARIVATE?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inOldUgcList"
                  checked={currentData.inOldUgcList || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, inOldUgcList: checked })}
                />
                <Label htmlFor="inOldUgcList">In Old UGC List?</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approxPrice">Approx. Price</Label>
                <Input
                  id="approxPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter approximate price"
                  value={currentData.approxPrice || ""}
                  onChange={(e) => setFormData({ ...formData, approxPrice: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currentData.currency || "USD"}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="authors">Author(s)</Label>
                <Input
                  id="authors"
                  placeholder="Enter author names"
                  value={currentData.authors || ""}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publisherName">Publisher Name</Label>
                <Input
                  id="publisherName"
                  placeholder="Enter publisher name"
                  value={currentData.publisherName || ""}
                  onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
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
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem value="Popular Science">Popular Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edition">Edition</Label>
                <Input
                  id="edition"
                  placeholder="e.g., 3rd Edition"
                  value={currentData.edition || ""}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="volumeNo">Volume No.</Label>
                <Input
                  id="volumeNo"
                  placeholder="Enter volume number"
                  value={currentData.volumeNo || ""}
                  onChange={(e) => setFormData({ ...formData, volumeNo: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={currentData.publicationDate || ""}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="isEbook">EBook</Label>
                <Select
                  value={currentData.isEbook || ""}
                  onValueChange={(value) => setFormData({ ...formData, isEbook: value })}
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
              <Label htmlFor="digitalMedia">Digital Media (If any provided like Pendrive, CD/DVD)</Label>
              <Input
                id="digitalMedia"
                placeholder="e.g., USB Drive, CD/DVD"
                value={currentData.digitalMedia || ""}
                onChange={(e) => setFormData({ ...formData, digitalMedia: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approxPrice">Approx. Price</Label>
                <Input
                  id="approxPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter approximate price"
                  value={currentData.approxPrice || ""}
                  onChange={(e) => setFormData({ ...formData, approxPrice: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currentData.currency || "USD"}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
      case "magazines":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter magazine title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select
                  value={currentData.mode || ""}
                  onValueChange={(value) => setFormData({ ...formData, mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Print">Print</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Print + Digital">Print + Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="publishingAgency">Publishing Agency</Label>
                <Input
                  id="publishingAgency"
                  placeholder="Enter publishing agency"
                  value={currentData.publishingAgency || ""}
                  onChange={(e) => setFormData({ ...formData, publishingAgency: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volumeNo">Volume No.</Label>
                <Input
                  id="volumeNo"
                  placeholder="Enter volume number"
                  value={currentData.volumeNo || ""}
                  onChange={(e) => setFormData({ ...formData, volumeNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={currentData.publicationDate || ""}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAdditionalAttachment"
                checked={currentData.isAdditionalAttachment || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdditionalAttachment: checked })}
              />
              <Label htmlFor="isAdditionalAttachment">Is Additional Attachment (USB/CD/DVD)?</Label>
            </div>
            <div>
              <Label htmlFor="additionalAttachment">Additional Attachment</Label>
              <Input
                id="additionalAttachment"
                placeholder="e.g., USB, CD/DVD"
                value={currentData.additionalAttachment || ""}
                onChange={(e) => setFormData({ ...formData, additionalAttachment: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="issuesPerYear">No. of Issues per Year</Label>
              <Input
                id="issuesPerYear"
                type="number"
                placeholder="Enter number of issues per year"
                value={currentData.issuesPerYear || ""}
                onChange={(e) => setFormData({ ...formData, issuesPerYear: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approxPrice">Approx. Price</Label>
                <Input
                  id="approxPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter approximate price"
                  value={currentData.approxPrice || ""}
                  onChange={(e) => setFormData({ ...formData, approxPrice: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currentData.currency || "USD"}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
      case "technical":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter report title"
                value={currentData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject"
                  value={currentData.subject || ""}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publisherName">Publisher's Name</Label>
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
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={currentData.publicationDate || ""}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="issuesPerYear">No. of Issues per Year</Label>
                <Input
                  id="issuesPerYear"
                  type="number"
                  placeholder="Enter number of issues per year"
                  value={currentData.issuesPerYear || ""}
                  onChange={(e) => setFormData({ ...formData, issuesPerYear: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approxPrice">Approx. Price</Label>
                <Input
                  id="approxPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter approximate price"
                  value={currentData.approxPrice || ""}
                  onChange={(e) => setFormData({ ...formData, approxPrice: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currentData.currency || "USD"}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        return null
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teacher's Recommendation(s) for Journals/Databases and other Learning Resources
          </h1>
          <p className="text-muted-foreground">
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      router.push(`/teacher/academic-recommendations/add?tab=${section.id}`)
                    }}
                  >
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
                        {!data[section.id as keyof typeof data] ||
                        data[section.id as keyof typeof data].length === 0 ? (
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
                                              documentUrl={item.supportingDocument[0]}
                                              documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
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
                                      <FileUpload onFileSelect={handleFileSelect} />
                                      <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={() => handleFileUpload(section.id, item.id)}>
                                          Upload Files
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
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
