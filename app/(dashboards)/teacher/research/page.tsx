"use client"

import { useState, useEffect } from "react"
import { ResearchProjectsList } from "@/components/research-projects-list"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Hash, FileText, User, BadgeIcon as IdCard, Save, Edit, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ResearchMetrics } from "@/types/interfaces"
import { useTeacherResearch } from "@/hooks/use-teacher-data"
import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"

export default function ResearchProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditingMetrics, setIsEditingMetrics] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // State to hold metrics data
  const [metrics, setMetrics] = useState<ResearchMetrics>({
    hIndex: 0,
    i10Index: 0,
    citations: 0,
    orcidId: "",
    researcherId: "",
  })

  // Use React Query for research data
  const { data: researchData, isLoading: researchLoading } = useTeacherResearch()

  // Check if we're coming from an update and refresh
  useEffect(() => {
    if (searchParams.get('updated') === 'true') {
      // Remove query parameter from URL (clean URL)
      router.replace('/teacher/research', { scroll: false })
      // Increment refreshKey to remount ResearchProjectsList and fetch fresh data
      setRefreshKey(prev => prev + 1)
    }
  }, [searchParams, router])

  // Fetch metrics data from backend (separate endpoint)
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/teacher/research/research-indices?teacherId=${user?.role_id}`);
        if (!res.ok) throw new Error("Failed to fetch research metrics")
        const data = await res.json()
        setMetrics({
          hIndex: data.researchIndexes.H_INDEX || 0,
          i10Index: data.researchIndexes.i10_INDEX || 0,
          citations: data.researchIndexes.CITIATIONS || 0,
          orcidId: data.researchIndexes.ORCHID_ID || "",
          researcherId: data.researchIndexes.RESEARCHER_ID || "",
        })
      } catch (err) {
        console.error("Error fetching research metrics:", err)
      }
    }

    if (user?.role_id) {
      fetchMetrics()
    }
  }, [refreshKey, user?.role_id])

  // Show loading skeleton during initial data fetch
  // ✅ All hooks must be called before any conditional returns (Rules of Hooks)
  if (researchLoading && !researchData) {
    return <PageLoadingSkeleton />
  }

  // Handle save (PUT / PATCH API call)
  const handleSaveMetrics = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/teacher/research/research-indices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user?.role_id,
          hIndex: metrics.hIndex,
          i10Index: metrics.i10Index,
          citations: metrics.citations,
          orcidId: metrics.orcidId,
          researcherId: metrics.researcherId,
        }),
      })
      
      const result = await res.json()
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update metrics")
      }
      
      toast({
        title: "Success",
        description: "Research metrics updated successfully",
      })
      
      setIsEditingMetrics(false)
      setRefreshKey(prev => prev + 1)
    } catch (err: any) {
      console.error("Error saving research metrics:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update research metrics",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 w-full">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Research Projects</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Manage research projects, grants, and funding information</p>
        </div>

        <div className="flex justify-start sm:justify-end w-full sm:w-auto">
          <Button onClick={() => router.push("/teacher/research/add")} size="sm" className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Research Project</span>
            <span className="sm:hidden">Add Project</span>
          </Button>
        </div>
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
                  <Button variant="outline" size="sm" onClick={() => setIsEditingMetrics(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveMetrics} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
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
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="text-sm font-medium text-muted-foreground">ORCHID ID</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {isEditingMetrics ? (
                  <input
                    type="text"
                    value={metrics.orcidId}
                    onChange={(e) => setMetrics({ ...metrics, orcidId: e.target.value })}
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
      <ResearchProjectsList refreshKey={refreshKey} />
    </div>
  )
}
