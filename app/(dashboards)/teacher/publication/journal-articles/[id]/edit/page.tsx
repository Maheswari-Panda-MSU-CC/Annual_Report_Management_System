"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicationForm } from "@/components/forms/publication-form"
import { ArrowLeft } from "lucide-react"

export default function EditJournalArticlePage() {
  const router = useRouter()
  const [publication, setPublication] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { id } = useParams();

  useEffect(() => {
    // In a real implementation, fetch the publication data from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setPublication({
        id: id,
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
  }, [id])

  const handleEditSuccess = () => {
    // In a real implementation, show success message and redirect
    router.push(`/teacher/publication/journal-articles/${id}`)
  }

  const handleCancel = () => {
    router.push(`/teacher/publication/journal-articles/${id}`)
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/teacher/publication/journal-articles/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Article
          </Button>
          <h1 className="text-3xl font-bold">Edit Journal Article</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Publication Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PublicationForm initialData={publication} onSuccess={handleEditSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
  )
}
