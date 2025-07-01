"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PublicationForm } from "@/components/publication-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash2, ExternalLink, Download, Users } from "lucide-react"

export default function PublicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [publication, setPublication] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, fetch the publication data from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setPublication({
        id: params.id,
        title: "Advances in Machine Learning for Natural Language Processing",
        authors: "Dr. Amit Patel, Dr. Priya Sharma, Dr. John Smith",
        journal_name: "International Journal of Computer Science",
        type: 1, // Journal
        level: 2, // International
        volume_num: 45,
        page_num: "123-145",
        month_year: "2023-05-15",
        isbn: "978-3-16-148410-0",
        issn: "2049-3630",
        peer_reviewed: true,
        h_index: 4.5,
        impact_factor: 3.2,
        in_scopus: true,
        in_ugc: true,
        in_clarivate: true,
        DOI: "10.1234/ijcs.2023.45.123",
        abstract:
          "This paper presents a novel approach to natural language processing using advanced machine learning techniques. The proposed method demonstrates significant improvements in accuracy and efficiency compared to existing methods.",
        keywords: ["Machine Learning", "NLP", "AI", "Deep Learning"],
        citations: 12,
        department: "Computer Science",
        faculty: "Faculty of Technology",
      })
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleDelete = async () => {
    // In a real implementation, delete the publication from the database
    // For now, we'll just navigate back to the publications list
    router.push("/publications")
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    // In a real implementation, refresh the publication data
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/publications")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Publications
          </Button>
          <h1 className="text-3xl font-bold flex-1">{publication.title}</h1>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the publication record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Publication</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicationForm
                initialData={publication}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Publication Details</TabsTrigger>
              <TabsTrigger value="metrics">Metrics & Indexing</TabsTrigger>
              <TabsTrigger value="authors">Authors</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Publication Type</h3>
                      <p>{publication.type === 1 ? "Journal Article" : "Book/Chapter"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Publication Level</h3>
                      <p>{publication.level === 2 ? "International" : "National"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Journal/Publisher</h3>
                      <p>{publication.journal_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Volume/Issue</h3>
                      <p>
                        Vol. {publication.volume_num}, Pages {publication.page_num}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Publication Date</h3>
                      <p>{new Date(publication.month_year).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">DOI</h3>
                      <p className="flex items-center">
                        {publication.DOI}
                        <a
                          href={`https://doi.org/${publication.DOI}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">ISSN/ISBN</h3>
                      <p>{publication.issn || publication.isbn}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Department</h3>
                      <p>{publication.department}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Abstract</h3>
                    <p className="mt-1">{publication.abstract}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Keywords</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {publication.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Citation
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Metrics & Indexing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Impact Factor</h3>
                      <p className="text-2xl font-bold">{publication.impact_factor}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">H-Index</h3>
                      <p className="text-2xl font-bold">{publication.h_index}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Citations</h3>
                      <p className="text-2xl font-bold">{publication.citations}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Indexing</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {publication.in_scopus && <Badge variant="secondary">Scopus</Badge>}
                        {publication.in_ugc && <Badge variant="secondary">UGC Care</Badge>}
                        {publication.in_clarivate && <Badge variant="secondary">Web of Science</Badge>}
                        {publication.peer_reviewed && <Badge variant="secondary">Peer Reviewed</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authors" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authors</CardTitle>
                  <CardDescription>Authors and contributors to this publication</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {publication.authors.split(", ").map((author: string, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="bg-gray-100 rounded-full p-2">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{author}</p>
                          <p className="text-sm text-gray-500">{index === 0 ? "Primary Author" : "Co-Author"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
