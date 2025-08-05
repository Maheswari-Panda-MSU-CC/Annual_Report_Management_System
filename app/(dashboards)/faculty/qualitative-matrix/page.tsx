"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function FacultyQualitativeMatrixPage() {
  const qualitativeCriteria = [
    {
      criterion: "Criterion I",
      title: "Curricular Aspects",
      keyIndicators: [
        "Curriculum Planning and Implementation",
        "Academic Flexibility",
        "Curriculum Enrichment",
        "Feedback System",
      ],
      status: "Completed",
      score: "3.2",
    },
    {
      criterion: "Criterion II",
      title: "Teaching-Learning and Evaluation",
      keyIndicators: [
        "Student Enrollment and Profile",
        "Catering to Student Diversity",
        "Teaching-Learning Process",
        "Teacher Profile and Quality",
      ],
      status: "In Progress",
      score: "2.8",
    },
    {
      criterion: "Criterion III",
      title: "Research, Innovations and Extension",
      keyIndicators: [
        "Resource Mobilization for Research",
        "Innovation Ecosystem",
        "Research Publications",
        "Extension Activities",
      ],
      status: "Completed",
      score: "3.0",
    },
    {
      criterion: "Criterion IV",
      title: "Infrastructure and Learning Resources",
      keyIndicators: [
        "Physical Facilities",
        "Library as Learning Resource",
        "IT Infrastructure",
        "Maintenance of Campus Infrastructure",
      ],
      status: "Completed",
      score: "3.1",
    },
    {
      criterion: "Criterion V",
      title: "Student Support and Progression",
      keyIndicators: ["Student Support", "Student Progression", "Student Participation", "Alumni Engagement"],
      status: "Pending",
      score: "2.5",
    },
    {
      criterion: "Criterion VI",
      title: "Governance, Leadership and Management",
      keyIndicators: [
        "Institutional Vision and Leadership",
        "Strategy Development",
        "Faculty Empowerment Strategies",
        "Financial Management",
      ],
      status: "In Progress",
      score: "2.9",
    },
    {
      criterion: "Criterion VII",
      title: "Institutional Values and Best Practices",
      keyIndicators: [
        "Institutional Values",
        "Best Practices",
        "Institutional Distinctiveness",
        "Environmental Consciousness",
      ],
      status: "Completed",
      score: "3.3",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "In Progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "Pending":
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getScoreBadge = (score: string) => {
    const numScore = Number.parseFloat(score)
    if (numScore >= 3.0) {
      return <Badge className="bg-green-100 text-green-800">{score}</Badge>
    } else if (numScore >= 2.5) {
      return <Badge className="bg-yellow-100 text-yellow-800">{score}</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">{score}</Badge>
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Qualitative Criteria Matrix</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Qualitative Criteria Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criterion</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Key Indicators</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualitativeCriteria.map((criteria, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{criteria.criterion}</TableCell>
                    <TableCell>{criteria.title}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {criteria.keyIndicators.map((indicator, idx) => (
                          <li key={idx}>{indicator}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>{getStatusBadge(criteria.status)}</TableCell>
                    <TableCell>{getScoreBadge(criteria.score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">71%</div>
              <p className="text-sm text-gray-600">Criteria Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">2.97</div>
              <p className="text-sm text-gray-600">Out of 4.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">2</div>
              <p className="text-sm text-gray-600">Criteria Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
