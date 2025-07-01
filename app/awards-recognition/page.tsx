"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Performance {
  id: number
  title: string
  place: string
  date: Date
  nature: string
  upload?: string
}

interface Award {
  id: number
  name: string
  details: string
  agency: string
  agencyAddress: string
  date: Date
  level: string
  upload?: string
}

interface ExtensionActivity {
  id: number
  name: string
  nature: string
  level: string
  sponsoredBy: string
  place: string
  date: Date
  upload?: string
}

export default function AwardsRecognitionPage() {
  const router = useRouter()
  const [performances, setPerformances] = useState<Performance[]>([
    {
      id: 1,
      title: "Research Paper Presentation",
      place: "IIT Delhi",
      date: new Date("2024-03-15"),
      nature: "Oral Presentation",
      upload: "presentation.pdf",
    },
    {
      id: 2,
      title: "Workshop on AI in Education",
      place: "MSU Campus",
      date: new Date("2024-02-20"),
      nature: "Workshop Conduct",
      upload: "workshop_report.pdf",
    },
  ])

  const [awards, setAwards] = useState<Award[]>([
    {
      id: 1,
      name: "Best Teacher Award",
      details: "Outstanding contribution in Computer Science education",
      agency: "Maharashtra State University",
      agencyAddress: "Mumbai, Maharashtra",
      date: new Date("2024-01-10"),
      level: "State",
      upload: "award_certificate.pdf",
    },
  ])

  const [extensionActivities, setExtensionActivities] = useState<ExtensionActivity[]>([
    {
      id: 1,
      name: "Digital Literacy Program",
      nature: "Community Outreach",
      level: "District",
      sponsoredBy: "Government of Maharashtra",
      place: "Rural Villages, Maharashtra",
      date: new Date("2024-02-01"),
      upload: "activity_report.pdf",
    },
  ])

  const [editingAward, setEditingAward] = useState<Award | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  // Award handlers

  const handleDeleteAward = (id: number) => {
    setAwards((prev) => prev.filter((a) => a.id !== id))
  }

  // Extension Activity handlers

  const handleEditPerformance = (id: number) => {
    const item = performances.find((p) => p.id === id)
    if (item) {
      setEditingItem({ ...item, type: "performance" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  const handleEditAward = (id: number) => {
    const item = awards.find((a) => a.id === id)
    if (item) {
      setEditingItem({ ...item, type: "award" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  const handleEditExtension = (id: number) => {
    const item = extensionActivities.find((e) => e.id === id)
    if (item) {
      setEditingItem({ ...item, type: "extension" })
      setEditFormData({ ...item })
      setEditModalOpen(true)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Awards & Recognition</h1>
        </div>

        <Tabs defaultValue="performances" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performances">Performance</TabsTrigger>
            <TabsTrigger value="awards">Awards & Recognition</TabsTrigger>
            <TabsTrigger value="extension">Extension Activities</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performances">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Performance by Individual/Group</CardTitle>
                <Button onClick={() => router.push("/add-awards")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Performance
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Title of Performance</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Performance Date</TableHead>
                        <TableHead>Nature of Performance</TableHead>
                        <TableHead>Upload</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performances.map((performance, index) => (
                        <TableRow key={performance.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{performance.title}</TableCell>
                          <TableCell>{performance.place}</TableCell>
                          <TableCell>{format(performance.date, "dd/MM/yyyy")}</TableCell>
                          <TableCell>{performance.nature}</TableCell>
                          <TableCell>
                            {performance.upload && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{performance.upload}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPerformance(performance.id)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPerformances((prev) => prev.filter((p) => p.id !== performance.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Awards/Fellowship/Recognition</CardTitle>
                <Button onClick={() => router.push("/add-awards")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Award
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Name of Award</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Awarding Agency</TableHead>
                        <TableHead>Agency Address</TableHead>
                        <TableHead>Date of Award</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Upload</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awards.map((award, index) => (
                        <TableRow key={award.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{award.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{award.details}</TableCell>
                          <TableCell>{award.agency}</TableCell>
                          <TableCell className="max-w-xs truncate">{award.agencyAddress}</TableCell>
                          <TableCell>{format(award.date, "dd/MM/yyyy")}</TableCell>
                          <TableCell>{award.level}</TableCell>
                          <TableCell>
                            {award.upload && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{award.upload}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAward(award.id)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAward(award.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extension Activities Tab */}
          <TabsContent value="extension">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Extension Activities</CardTitle>
                <Button onClick={() => router.push("/add-awards")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Name of Activity</TableHead>
                        <TableHead>Nature of Activity</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Sponsored By</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Upload</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extensionActivities.map((activity, index) => (
                        <TableRow key={activity.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{activity.name}</TableCell>
                          <TableCell>{activity.nature}</TableCell>
                          <TableCell>{activity.level}</TableCell>
                          <TableCell>{activity.sponsoredBy}</TableCell>
                          <TableCell>{activity.place}</TableCell>
                          <TableCell>{format(activity.date, "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            {activity.upload && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{activity.upload}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditExtension(activity.id)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setExtensionActivities((prev) => prev.filter((e) => e.id !== activity.id))
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.type?.toUpperCase()}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(editFormData).map((key) => {
                  if (key === "id" || key === "type") return null
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      {key.includes("date") || key.includes("Date") ? (
                        <Input
                          id={key}
                          type="date"
                          value={
                            editFormData[key] instanceof Date
                              ? editFormData[key].toISOString().split("T")[0]
                              : editFormData[key]
                          }
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      ) : key === "details" ? (
                        <Textarea
                          id={key}
                          value={editFormData[key] || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          id={key}
                          value={editFormData[key] || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle save logic here
                    console.log("Saving:", editFormData)
                    setEditModalOpen(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
