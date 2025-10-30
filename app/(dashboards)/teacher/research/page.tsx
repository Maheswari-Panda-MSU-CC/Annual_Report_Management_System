"use client"

import { useState, useEffect } from "react"
import { ResearchProjectsList } from "@/components/research-projects-list"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Hash, FileText, User, BadgeIcon as IdCard, Save, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/api/auth/auth-provider"

interface ResearchMetrics {
  hIndex: number
  i10Index: number
  citations: number
  orcidId: string
  researcherId: string
}

export default function ResearchProjectsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isEditingMetrics, setIsEditingMetrics] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // State to hold metrics data
  const [metrics, setMetrics] = useState<ResearchMetrics>({
    hIndex: 0,
    i10Index: 0,
    citations: 0,
    orcidId: "",
    researcherId: "",
  })

  // Fetch metrics data from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/teacher/research/research-indices?teacherId=${user?.role_id}`);
        if (!res.ok) throw new Error("Failed to fetch research metrics")
        const data = await res.json()
      console.log(data.researchIndexes);
        setMetrics({
          hIndex: data.researchIndexes.H_INDEX || 0,
          i10Index:data.researchIndexes.i10_INDEX || 0,
          citations: data.researchIndexes.CITIATIONS || 0,
          orcidId: data.researchIndexes.ORCHID_ID || "",
          researcherId: data.researchIndexes.RESEARCHER_ID || "",
        })
      } catch (err) {
        console.error("Error fetching research metrics:", err)
      }
    }


    fetchMetrics()
  }, [refreshKey])

  // Handle save (PUT / PATCH API call)
  const handleSaveMetrics = async () => {
    try {
      const res = await fetch("/api/teacher/research", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metrics),
      })
      if (!res.ok) throw new Error("Failed to update metrics")
      setIsEditingMetrics(false)
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      console.error("Error saving research metrics:", err)
    }
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
                  <Button size="sm" onClick={handleSaveMetrics}>
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
            {/* H-Index */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">H-Index</label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {isEditingMetrics ? (
                  <input
                    type="number"
                    value={metrics.hIndex}
                    onChange={(e) => setMetrics({ ...metrics, hIndex: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter H-Index"
                  />
                ) : (
                  <div className="flex-1 px-3 py-2 text-sm font-medium">{metrics.hIndex}</div>
                )}
              </div>
            </div>

            {/* i10-Index */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">i10-Index</label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {isEditingMetrics ? (
                  <input
                    type="number"
                    value={metrics.i10Index}
                    onChange={(e) => setMetrics({ ...metrics, i10Index: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter i10-Index"
                  />
                ) : (
                  <div className="flex-1 px-3 py-2 text-sm font-medium">{metrics.i10Index}</div>
                )}
              </div>
            </div>

            {/* Citations */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Citations</label>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {isEditingMetrics ? (
                  <input
                    type="number"
                    value={metrics.citations}
                    onChange={(e) => setMetrics({ ...metrics, citations: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter Citations"
                  />
                ) : (
                  <div className="flex-1 px-3 py-2 text-sm font-medium">
                    {metrics.citations.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* ORCID ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">ORCID ID</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {isEditingMetrics ? (
                  <input
                    type="text"
                    value={metrics.orcidId}
                    onChange={(e) => setMetrics({ ...metrics, orcidId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0000-0000-0000-0000"
                  />
                ) : (
                  <div className="flex-1 px-3 py-2 text-sm font-medium">
                    {metrics.orcidId || "Not Available"}
                  </div>
                )}
              </div>
            </div>

            {/* Researcher ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Researcher ID</label>
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                {isEditingMetrics ? (
                  <input
                    type="text"
                    value={metrics.researcherId}
                    onChange={(e) => setMetrics({ ...metrics, researcherId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter Researcher ID"
                  />
                ) : (
                  <div className="flex-1 px-3 py-2 text-sm text-muted-foreground">
                    {metrics.researcherId || "Not Available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Projects List */}
      <ResearchProjectsList key={refreshKey} />
    </div>
  )
}
