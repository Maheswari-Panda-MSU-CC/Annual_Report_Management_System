"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, FileText, Book, Search } from "lucide-react"

export function PublicationsList() {
  const router = useRouter()
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  useEffect(() => {
    // In a real implementation, fetch publications from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setPublications([
        {
          id: "1",
          title: "Advances in Machine Learning for Natural Language Processing",
          authors: "Dr. Amit Patel, Dr. Priya Sharma",
          journal_name: "International Journal of Computer Science",
          type: 1, // Journal
          type_name: "Journal Article",
          level: 2, // International
          level_name: "International",
          publish_date: "2023-05-15",
          year: 2023,
          impact_factor: 3.2,
          citations: 12,
          department: "Computer Science",
        },
        {
          id: "2",
          title: "Novel Approaches to Sustainable Energy Systems",
          authors: "Dr. Rajesh Kumar, Dr. Meera Singh",
          journal_name: "Renewable Energy Journal",
          type: 1, // Journal
          type_name: "Journal Article",
          level: 2, // International
          level_name: "International",
          publish_date: "2023-03-10",
          year: 2023,
          impact_factor: 4.5,
          citations: 8,
          department: "Mechanical Engineering",
        },
        {
          id: "3",
          title: "Modern Techniques in Organic Chemistry",
          authors: "Dr. Anand Patel",
          journal_name: "Chemistry Today",
          type: 1, // Journal
          type_name: "Journal Article",
          level: 1, // National
          level_name: "National",
          publish_date: "2022-11-22",
          year: 2022,
          impact_factor: 2.1,
          citations: 5,
          department: "Chemistry",
        },
        {
          id: "4",
          title: "Fundamentals of Data Structures and Algorithms",
          authors: "Dr. Amit Patel, Dr. Suresh Mehta",
          journal_name: "Computer Science Publications",
          type: 2, // Book
          type_name: "Book",
          level: 2, // International
          level_name: "International",
          publish_date: "2022-08-05",
          year: 2022,
          impact_factor: null,
          citations: 15,
          department: "Computer Science",
        },
        {
          id: "5",
          title: "Advanced Materials for Biomedical Applications",
          authors: "Dr. Priya Sharma, Dr. Rajesh Kumar",
          journal_name: "Journal of Biomedical Materials",
          type: 1, // Journal
          type_name: "Journal Article",
          level: 2, // International
          level_name: "International",
          publish_date: "2022-06-18",
          year: 2022,
          impact_factor: 5.2,
          citations: 20,
          department: "Biomedical Engineering",
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.journal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || pub.type.toString() === typeFilter
    const matchesLevel = levelFilter === "all" || pub.level.toString() === levelFilter
    const matchesYear = yearFilter === "all" || pub.year.toString() === yearFilter

    return matchesSearch && matchesType && matchesLevel && matchesYear
  })

  const years = [...new Set(publications.map((pub) => pub.year))].sort((a, b) => b - a)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publications</CardTitle>
        <CardDescription>Manage and view all research publications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search publications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Publication Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="1">Journal Articles</SelectItem>
                <SelectItem value="2">Books/Chapters</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Publication Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">National</SelectItem>
                <SelectItem value="2">International</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Publication Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No publications found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Authors</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Citations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublications.map((publication) => (
                    <TableRow key={publication.id}>
                      <TableCell className="font-medium">{publication.title}</TableCell>
                      <TableCell>{publication.authors}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {publication.type === 1 ? <FileText className="h-3 w-3" /> : <Book className="h-3 w-3" />}
                          {publication.type_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(publication.publish_date).getFullYear()}</TableCell>
                      <TableCell>{publication.citations}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/publications/${publication.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
