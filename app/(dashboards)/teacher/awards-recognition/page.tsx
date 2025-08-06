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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Upload, BarChart3, Users, Save, Calendar, Trophy, FileText } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"

// Sample data for each section
const initialSampleData = {
  performance: [
    {
      id: 1,
      srNo: 1,
      titleOfPerformance: "Research Presentation on AI Applications",
      place: "IEEE Conference Hall, Mumbai",
      performanceDate: "2023-03-15",
      natureOfPerformance: "Oral Presentation",
      supportingDocument: ["presentation_certificate.pdf"],
    },
  ],
  awards: [
    {
      id: 1,
      srNo: 1,
      nameOfAwardFellowship: "Excellence in Teaching Award",
      details: "Awarded for innovative teaching methods and outstanding student engagement in computer science courses",
      nameOfAwardingAgency: "University of Technology",
      addressOfAwardingAgency: "123 University Road, Tech City, State - 400001",
      dateOfAward: "2023-05-20",
      level: "University",
      supportingDocument: ["teaching_award.pdf"],
    },
  ],
  extension: [
    {
      id: 1,
      srNo: 1,
      nameOfActivity: "Digital Literacy Program for Rural Communities",
      natureOfActivity: "Community Outreach",
      level: "State",
      sponsoredBy: "State Government Education Department",
      place: "Rural Development Center, District Headquarters",
      date: "2023-07-10",
      supportingDocument: ["outreach_report.pdf"],
    },
  ],
}

const sections = [
  {
    id: "performance",
    title: "Performance by Individual/Group",
    icon: BarChart3,
    columns: [
      "Sr No.",
      "Title of Performance",
      "Place",
      "Performance Date",
      "Nature of Performance",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
  {
    id: "awards",
    title: "Awards/Fellowship/Recognition",
    icon: Trophy,
    columns: [
      "Sr No.",
      "Name of Award / Fellowship",
      "Details",
      "Name of Awarding Agency",
      "Address of Awarding Agency",
      "Date of Award",
      "Level",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
  {
    id: "extension",
    title: "Extension",
    icon: Users,
    columns: [
      "Sr No.",
      "Name of Activity",
      "Nature of Activity",
      "Level",
      "Sponsored By",
      "Place",
      "Date",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
]

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png,.bmp", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, JPEG, PNG, BMP up to 10MB each</span>
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

export default function AwardsRecognitionPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("performance")
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
      case "performance":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.titleOfPerformance}</TableCell>
            <TableCell>{item.place}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.performanceDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.natureOfPerformance}</Badge>
            </TableCell>
          </>
        )
      case "awards":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfAwardFellowship}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.details}>
                {item.details}
              </div>
            </TableCell>
            <TableCell>{item.nameOfAwardingAgency}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.addressOfAwardingAgency}>
                {item.addressOfAwardingAgency}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.dateOfAward}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.level}</Badge>
            </TableCell>
          </>
        )
      case "extension":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfActivity}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.natureOfActivity}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.level}</Badge>
            </TableCell>
            <TableCell>{item.sponsoredBy}</TableCell>
            <TableCell>{item.place}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "performance":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="titleOfPerformance">Title of Performance *</Label>
              <Input
                id="titleOfPerformance"
                placeholder="Enter title of performance"
                value={currentData.titleOfPerformance || ""}
                onChange={(e) => setFormData({ ...formData, titleOfPerformance: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="place">Place *</Label>
                <Input
                  id="place"
                  placeholder="Enter place"
                  value={currentData.place || ""}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="performanceDate">Performance Date *</Label>
                <Input
                  id="performanceDate"
                  type="date"
                  value={currentData.performanceDate || ""}
                  onChange={(e) => setFormData({ ...formData, performanceDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="natureOfPerformance">Nature of Performance *</Label>
              <Select
                value={currentData.natureOfPerformance || ""}
                onValueChange={(value) => setFormData({ ...formData, natureOfPerformance: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nature of performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral Presentation">Oral Presentation</SelectItem>
                  <SelectItem value="Poster Presentation">Poster Presentation</SelectItem>
                  <SelectItem value="Workshop Conduct">Workshop Conduct</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Cultural Performance">Cultural Performance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
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
      case "awards":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="nameOfAwardFellowship">Name of Award / Fellowship *</Label>
              <Input
                id="nameOfAwardFellowship"
                placeholder="Enter name of award/fellowship"
                value={currentData.nameOfAwardFellowship || ""}
                onChange={(e) => setFormData({ ...formData, nameOfAwardFellowship: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="Enter details"
                value={currentData.details || ""}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="nameOfAwardingAgency">Name of Awarding Agency *</Label>
              <Input
                id="nameOfAwardingAgency"
                placeholder="Enter name of awarding agency"
                value={currentData.nameOfAwardingAgency || ""}
                onChange={(e) => setFormData({ ...formData, nameOfAwardingAgency: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="addressOfAwardingAgency">Address of Awarding Agency</Label>
              <Textarea
                id="addressOfAwardingAgency"
                placeholder="Enter address of awarding agency"
                value={currentData.addressOfAwardingAgency || ""}
                onChange={(e) => setFormData({ ...formData, addressOfAwardingAgency: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfAward">Date of Award *</Label>
                <Input
                  id="dateOfAward"
                  type="date"
                  value={currentData.dateOfAward || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfAward: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
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
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
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
      case "extension":
        return (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="nameOfActivity">Name of Activity *</Label>
              <Input
                id="nameOfActivity"
                placeholder="Enter name of activity"
                value={currentData.nameOfActivity || ""}
                onChange={(e) => setFormData({ ...formData, nameOfActivity: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="natureOfActivity">Nature of Activity *</Label>
                <Select
                  value={currentData.natureOfActivity || ""}
                  onValueChange={(value) => setFormData({ ...formData, natureOfActivity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nature of activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                    <SelectItem value="Social Service">Social Service</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
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
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="District">District</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sponsoredBy">Sponsored By *</Label>
              <Input
                id="sponsoredBy"
                placeholder="Enter sponsor name"
                value={currentData.sponsoredBy || ""}
                onChange={(e) => setFormData({ ...formData, sponsoredBy: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="place">Place *</Label>
                <Input
                  id="place"
                  placeholder="Enter place"
                  value={currentData.place || ""}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
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
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
            </div>
          </div>
        )
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Awards & Recognition</h1>
          <p className="text-muted-foreground">Manage your awards, recognitions, and extension activities</p>
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
                      router.push(`/teacher/awards-recognition/add?tab=${section.id}`)
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
