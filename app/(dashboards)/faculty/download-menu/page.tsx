"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, FileText, Database, Users, BookOpen, Award, Building } from "lucide-react"

export default function FacultyDownloadMenuPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedFormat, setSelectedFormat] = useState("")

  const downloadCategories = [
    {
      title: "Faculty Data",
      icon: <Users className="h-6 w-6" />,
      items: [
        "Faculty Profile Information",
        "Faculty Events and Activities",
        "Visitor Information",
        "Development Programs",
        "Staff Details (Teaching & Non-Teaching)",
      ],
    },
    {
      title: "Academic Data",
      icon: <BookOpen className="h-6 w-6" />,
      items: [
        "Student Activities",
        "Student Progression Data",
        "Student Support Information",
        "Alumni Activities",
        "Enrolled Student Details",
      ],
    },
    {
      title: "Research & Collaboration",
      icon: <Database className="h-6 w-6" />,
      items: [
        "Collaborations and MOUs",
        "Curriculum Board Meetings",
        "Research Publications",
        "Patents and Copyrights",
        "Consultancy Details",
      ],
    },
    {
      title: "Infrastructure & Reports",
      icon: <Building className="h-6 w-6" />,
      items: [
        "Infrastructure Details",
        "Department Information",
        "AQAR Reports (All Criteria)",
        "Teachers ARMS Report",
        "Department ARMS Report",
      ],
    },
    {
      title: "Criteria Forms",
      icon: <Award className="h-6 w-6" />,
      items: [
        "Criterion V Form Data",
        "Criterion VI Form Data",
        "Criterion VII Form Data",
        "Qualitative Matrix Data",
        "Assessment Reports",
      ],
    },
    {
      title: "Generated Reports",
      icon: <FileText className="h-6 w-6" />,
      items: [
        "Faculty Annual Reports",
        "Performance Analytics",
        "Statistical Summaries",
        "Compliance Reports",
        "Custom Reports",
      ],
    },
  ]

  const handleDownload = (item: string) => {
    if (!selectedFormat) {
      alert("Please select a file format")
      return
    }

    console.log(`Downloading: ${item} in ${selectedFormat} format`)
    alert(`Downloading ${item} in ${selectedFormat} format`)
  }

  const handleBulkDownload = () => {
    if (!selectedCategory || !selectedFormat) {
      alert("Please select category and format")
      return
    }

    console.log(`Bulk downloading: ${selectedCategory} in ${selectedFormat} format`)
    alert(`Bulk downloading all ${selectedCategory} data in ${selectedFormat} format`)
  }

  const filteredCategories = downloadCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.items.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Download Center</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Data Download Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Data</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search for data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category Filter</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    {downloadCategories.map((category) => (
                      <SelectItem key={category.title} value={category.title}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">File Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="word">Word Document</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCategory !== "All Categories" && selectedFormat && (
              <div className="flex justify-end">
                <Button onClick={handleBulkDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Bulk Download {selectedCategory}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {category.icon}
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <span className="text-sm">{item}</span>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(item)}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Download Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <p className="text-sm text-gray-600">Total Downloads</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">23</div>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">2.3GB</div>
                <p className="text-sm text-gray-600">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
