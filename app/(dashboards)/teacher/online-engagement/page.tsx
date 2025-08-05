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
import { Plus, Edit, Trash2, Upload, Globe, Monitor, Presentation, FileImage, Save, ExternalLink } from "lucide-react"

// Sample data for each section
const initialSampleData = {
  social: [
    {
      id: 1,
      srNo: 1,
      platform: "LinkedIn",
      profileUrl: "https://linkedin.com/in/drjohnsmith",
      followers: "5200",
      contentType: "Professional Articles",
      engagementRate: "8.5%",
      lastActive: "2023-12-01",
      verificationStatus: "Verified",
      supportingDocument: ["linkedin_analytics.pdf"],
    },
  ],
  courses: [
    {
      id: 1,
      srNo: 1,
      courseTitle: "Introduction to Machine Learning",
      platform: "Coursera",
      duration: "8 weeks",
      enrollments: "12500",
      rating: "4.8",
      completionRate: "85%",
      launchDate: "2023-01-15",
      courseUrl: "https://coursera.org/course/ml-intro",
      supportingDocument: ["course_certificate.pdf"],
    },
  ],
  webinars: [
    {
      id: 1,
      srNo: 1,
      title: "AI in Healthcare: Current Trends and Future Prospects",
      platform: "Zoom",
      date: "2023-11-15",
      duration: "90 minutes",
      attendees: "450",
      recording: "Available",
      topic: "Artificial Intelligence",
      targetAudience: "Healthcare Professionals",
      supportingDocument: ["webinar_recording.mp4"],
    },
  ],
  content: [
    {
      id: 1,
      srNo: 1,
      title: "Interactive Data Visualization Tutorial",
      contentType: "Video Tutorial",
      platform: "YouTube",
      publishDate: "2023-10-20",
      views: "25000",
      likes: "1200",
      duration: "45 minutes",
      category: "Educational",
      supportingDocument: ["video_thumbnail.jpg"],
    },
  ],
}

const sections = [
  {
    id: "social",
    title: "Social Media Engagement",
    icon: Globe,
    columns: [
      "Sr No.",
      "Platform",
      "Profile URL",
      "Followers",
      "Content Type",
      "Engagement Rate",
      "Last Active",
      "Verification",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "courses",
    title: "Online Courses",
    icon: Monitor,
    columns: [
      "Sr No.",
      "Course Title",
      "Platform",
      "Duration",
      "Enrollments",
      "Rating",
      "Completion Rate",
      "Launch Date",
      "Course URL",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "webinars",
    title: "Webinars",
    icon: Presentation,
    columns: [
      "Sr No.",
      "Title",
      "Platform",
      "Date",
      "Duration",
      "Attendees",
      "Recording",
      "Topic",
      "Target Audience",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "content",
    title: "Digital Content",
    icon: FileImage,
    columns: [
      "Sr No.",
      "Title",
      "Content Type",
      "Platform",
      "Publish Date",
      "Views",
      "Likes",
      "Duration",
      "Category",
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

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png,.mp4", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG, MP4 up to 10MB each</span>
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

export default function OnlineEngagementPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("social")
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
      case "social":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.platform}</TableCell>
            <TableCell>
              <a
                href={item.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                View Profile <ExternalLink className="h-3 w-3" />
              </a>
            </TableCell>
            <TableCell>{Number.parseInt(item.followers).toLocaleString()}</TableCell>
            <TableCell>{item.contentType}</TableCell>
            <TableCell>{item.engagementRate}</TableCell>
            <TableCell>{item.lastActive}</TableCell>
            <TableCell>
              <Badge variant={item.verificationStatus === "Verified" ? "default" : "secondary"}>
                {item.verificationStatus}
              </Badge>
            </TableCell>
          </>
        )
      case "courses":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.courseTitle}</TableCell>
            <TableCell>{item.platform}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{Number.parseInt(item.enrollments).toLocaleString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <span>{item.rating}</span>
                <span className="text-yellow-500">★</span>
              </div>
            </TableCell>
            <TableCell>{item.completionRate}</TableCell>
            <TableCell>{item.launchDate}</TableCell>
            <TableCell>
              <a
                href={item.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                View Course <ExternalLink className="h-3 w-3" />
              </a>
            </TableCell>
          </>
        )
      case "webinars":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.platform}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{Number.parseInt(item.attendees).toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={item.recording === "Available" ? "default" : "secondary"}>{item.recording}</Badge>
            </TableCell>
            <TableCell>{item.topic}</TableCell>
            <TableCell>{item.targetAudience}</TableCell>
          </>
        )
      case "content":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.contentType}</TableCell>
            <TableCell>{item.platform}</TableCell>
            <TableCell>{item.publishDate}</TableCell>
            <TableCell>{Number.parseInt(item.views).toLocaleString()}</TableCell>
            <TableCell>{Number.parseInt(item.likes).toLocaleString()}</TableCell>
            <TableCell>{item.duration}</TableCell>
            <TableCell>{item.category}</TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "social":
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={currentData.platform || ""}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="profileUrl">Profile URL</Label>
                <Input
                  id="profileUrl"
                  placeholder="Enter profile URL"
                  value={currentData.profileUrl || ""}
                  onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="followers">Followers</Label>
                <Input
                  id="followers"
                  type="number"
                  placeholder="Enter follower count"
                  value={currentData.followers || ""}
                  onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Input
                  id="contentType"
                  placeholder="e.g., Professional Articles"
                  value={currentData.contentType || ""}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="engagementRate">Engagement Rate</Label>
                <Input
                  id="engagementRate"
                  placeholder="e.g., 8.5%"
                  value={currentData.engagementRate || ""}
                  onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Supporting Document (PDF, Image, or Video)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.mp4" />
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
              <Label>Supporting Document (PDF, Image, or Video)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.mp4" />
            </div>
          </div>
        )
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Online Engagement Information Summary</h1>
          <p className="text-muted-foreground">
            Track your digital presence, online courses, webinars, and content creation activities
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
                      router.push("/teacher/add-online-engagement")
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
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] pr-2">
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
