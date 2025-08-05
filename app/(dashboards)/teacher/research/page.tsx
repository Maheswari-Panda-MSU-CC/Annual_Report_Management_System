"use client"

import { useState } from "react"
import { ResearchProjectsList } from "@/components/research-projects-list"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Hash, FileText, User, BadgeIcon as IdCard, Save, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ResearchProjectsPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isEditingMetrics, setIsEditingMetrics] = useState(false)

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Research Projects</h1>
            <p className="text-gray-600">Manage research projects, grants, and funding information</p>
          </div>

          <Button onClick={() => router.push("/teacher/research/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Research Project
          </Button>
        </div>

        {/* Research Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Research Metrics
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isEditingMetrics ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingMetrics(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingMetrics(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Handle save logic here
                        setIsEditingMetrics(false)
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">H-Index</label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  {isEditingMetrics ? (
                    <input
                      type="number"
                      defaultValue="12"
                      className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter H-Index"
                    />
                  ) : (
                    <div className="flex-1 px-3 py-2 text-sm font-medium">12</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">i10-Index</label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  {isEditingMetrics ? (
                    <input
                      type="number"
                      defaultValue="18"
                      className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter i10-Index"
                    />
                  ) : (
                    <div className="flex-1 px-3 py-2 text-sm font-medium">18</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Citations</label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {isEditingMetrics ? (
                    <input
                      type="number"
                      defaultValue="1340"
                      className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter Citations"
                    />
                  ) : (
                    <div className="flex-1 px-3 py-2 text-sm font-medium">1,340</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ORCID ID</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {isEditingMetrics ? (
                    <input
                      type="text"
                      defaultValue="0000-0002-1234-5678"
                      className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0000-0000-0000-0000"
                    />
                  ) : (
                    <div className="flex-1 px-3 py-2 text-sm font-medium">0000-0002-1234-5678</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Researcher ID</label>
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  {isEditingMetrics ? (
                    <input
                      type="text"
                      defaultValue=""
                      className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter Researcher ID"
                    />
                  ) : (
                    <div className="flex-1 px-3 py-2 text-sm text-muted-foreground">Not Available</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ResearchProjectsList key={refreshKey} />
      </div>
  )
}
