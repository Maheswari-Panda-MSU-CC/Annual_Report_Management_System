"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Feedback {
  id: number
  feedbackFrom: string
  activityDate: string
  resultsOfAnalysis: string
  remarks: string
}

export default function DepartmentCurriculumEnrichment() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      feedbackFrom: "Students",
      activityDate: "2024-01-15",
      resultsOfAnalysis:
        "85% students satisfied with course content. Need more practical sessions. Request for industry exposure.",
      remarks: "Overall positive feedback with suggestions for improvement",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddFeedback = (formData: FormData) => {
    const newFeedback: Feedback = {
      id: Date.now(),
      feedbackFrom: formData.get("feedbackFrom") as string,
      activityDate: formData.get("activityDate") as string,
      resultsOfAnalysis: formData.get("resultsOfAnalysis") as string,
      remarks: formData.get("remarks") as string,
    }
    setFeedbacks([...feedbacks, newFeedback])
    setIsDialogOpen(false)
  }

  const deleteFeedback = (id: number) => {
    setFeedbacks(feedbacks.filter((feedback) => feedback.id !== id))
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Curriculum Enrichment</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Feedback taken during the year</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Feedback Record</DialogTitle>
                </DialogHeader>
                <form action={handleAddFeedback} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="feedbackFrom">Feedback From</Label>
                      <Input
                        id="feedbackFrom"
                        name="feedbackFrom"
                        placeholder="e.g., Students, Faculty, Industry Partners"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="activityDate">Activity Date</Label>
                      <Input id="activityDate" name="activityDate" type="date" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="resultsOfAnalysis">Results of Analysis of the feedback in points</Label>
                    <Textarea
                      id="resultsOfAnalysis"
                      name="resultsOfAnalysis"
                      rows={4}
                      placeholder="Provide detailed analysis results in bullet points"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="remarks">Remarks if any</Label>
                    <Textarea id="remarks" name="remarks" rows={3} placeholder="Additional remarks or observations" />
                  </div>
                  <Button type="submit">Add Feedback</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feedback From</TableHead>
                  <TableHead>Activity Date</TableHead>
                  <TableHead>Results of Analysis of the feedback in points</TableHead>
                  <TableHead>Remarks if any</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.feedbackFrom}</TableCell>
                    <TableCell>{feedback.activityDate}</TableCell>
                    <TableCell className="max-w-md">{feedback.resultsOfAnalysis}</TableCell>
                    <TableCell className="max-w-md">{feedback.remarks}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteFeedback(feedback.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  )
}
