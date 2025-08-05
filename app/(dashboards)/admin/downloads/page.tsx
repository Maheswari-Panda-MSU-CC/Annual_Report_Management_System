"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Database, BookOpen, Award, Search, Filter } from "lucide-react"

const downloadCategories = [
  {
    id: "reports",
    name: "Reports",
    icon: FileText,
    items: [
      { name: "Annual Report 2023-24", type: "PDF", size: "15.2 MB", date: "2024-03-20" },
      { name: "AQAR Report 2023-24", type: "PDF", size: "8.7 MB", date: "2024-03-18" },
      { name: "Faculty Performance Report", type: "PDF", size: "5.4 MB", date: "2024-03-15" },
      { name: "Student Progression Report", type: "Excel", size: "2.1 MB", date: "2024-03-12" },
    ],
  },
  {
    id: "data",
    name: "Data Exports",
    icon: Database,
    items: [
      { name: "Faculty Database Export", type: "CSV", size: "1.8 MB", date: "2024-03-22" },
      { name: "Student Records Export", type: "Excel", size: "12.5 MB", date: "2024-03-20" },
      { name: "Publications Database", type: "JSON", size: "3.2 MB", date: "2024-03-18" },
      { name: "Research Projects Data", type: "CSV", size: "2.7 MB", date: "2024-03-15" },
    ],
  },
  {
    id: "publications",
    name: "Publications",
    icon: BookOpen,
    items: [
      { name: "Journal Articles 2023-24", type: "PDF", size: "25.8 MB", date: "2024-03-25" },
      { name: "Conference Papers Collection", type: "ZIP", size: "45.2 MB", date: "2024-03-22" },
      { name: "Book Chapters Compilation", type: "PDF", size: "18.7 MB", date: "2024-03-20" },
      { name: "Research Publications Index", type: "Excel", size: "4.1 MB", date: "2024-03-18" },
    ],
  },
  {
    id: "certificates",
    name: "Certificates & Awards",
    icon: Award,
    items: [
      { name: "Faculty Achievement Certificates", type: "ZIP", size: "8.9 MB", date: "2024-03-24" },
      { name: "Student Award Certificates", type: "ZIP", size: "12.3 MB", date: "2024-03-22" },
      { name: "Research Recognition Documents", type: "PDF", size: "6.7 MB", date: "2024-03-20" },
      { name: "University Awards Archive", type: "ZIP", size: "15.4 MB", date: "2024-03-18" },
    ],
  },
]

const fileTypes = ["All", "PDF", "Excel", "CSV", "JSON", "ZIP"]
const sortOptions = [
  { value: "date-desc", label: "Date (Newest First)" },
  { value: "date-asc", label: "Date (Oldest First)" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "size-desc", label: "Size (Largest First)" },
  { value: "size-asc", label: "Size (Smallest First)" },
]

export default function Downloads() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFileType, setSelectedFileType] = useState("All")
  const [sortBy, setSortBy] = useState("date-desc")
  const [activeTab, setActiveTab] = useState("reports")

  const handleDownload = (fileName: string, fileType: string) => {
    // Simulate download
    const link = document.createElement("a")
    link.href = "#"
    link.download = `${fileName.toLowerCase().replace(/\s+/g, "-")}.${fileType.toLowerCase()}`
    link.click()
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-800"
      case "Excel":
        return "bg-green-100 text-green-800"
      case "CSV":
        return "bg-blue-100 text-blue-800"
      case "JSON":
        return "bg-purple-100 text-purple-800"
      case "ZIP":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredItems =
    downloadCategories
      .find((cat) => cat.id === activeTab)
      ?.items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFileType = selectedFileType === "All" || item.type === selectedFileType
        return matchesSearch && matchesFileType
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime()
          case "name-asc":
            return a.name.localeCompare(b.name)
          case "name-desc":
            return b.name.localeCompare(a.name)
          case "size-desc":
            return Number.parseFloat(b.size) - Number.parseFloat(a.size)
          case "size-asc":
            return Number.parseFloat(a.size) - Number.parseFloat(b.size)
          default:
            return 0
        }
      }) || []

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Downloads</h1>
          <p className="text-gray-600 mt-2">Download various data exports, reports, and documents</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>Filter and search through available downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Files</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search downloads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredItems.length}</span> files found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Available Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                {downloadCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {category.name}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {downloadCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="space-y-4">
                    {filteredItems.map((item, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <Badge className={getFileTypeColor(item.type)}>{item.type}</Badge>
                                    <span className="text-xs text-gray-500">{item.size}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(item.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              <Button
                                onClick={() => handleDownload(item.name, item.type)}
                                size="sm"
                                className="flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredItems.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
                        <p className="text-gray-600">No files match your current search and filter criteria.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Download Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {downloadCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{category.items.length}</div>
                      <div className="text-sm font-medium text-gray-500">{category.name}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
  )
}
