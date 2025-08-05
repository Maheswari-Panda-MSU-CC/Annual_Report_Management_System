"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Award, TrendingUp, BookOpen, Hash, User, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ResearchMetrics {
  scopus: {
    hIndex: number
    citations: number
    documents: number
    coAuthors: number
  }
  googleScholar: {
    hIndex: number
    i10Index: number
    citations: number
    citationsLast5Years: number
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [researchMetrics, setResearchMetrics] = useState<ResearchMetrics>({
    scopus: {
      hIndex: 12,
      citations: 1340,
      documents: 45,
      coAuthors: 28,
    },
    googleScholar: {
      hIndex: 15,
      i10Index: 18,
      citations: 1580,
      citationsLast5Years: 890,
    },
  })
  const [loading, setLoading] = useState(false)

  const stats = [
    {
      title: "Research Projects",
      value: "12",
      description: "Active research projects",
      icon: Award,
      color: "text-purple-600",
      href: "/teacher/research",
    },
    {
      title: "Books Published",
      value: "8",
      description: "Books published this year",
      icon: BookOpen,
      color: "text-green-600",
      href: "/teacher/publication?tab=books",
    },
    {
      title: "Journal Articles",
      value: "24",
      description: "Journal papers published",
      icon: FileText,
      color: "text-blue-600",
      href: "/teacher/publication?tab=journals",
    },
    {
      title: "Total Publications",
      value: "45",
      description: "All publications this year",
      icon: TrendingUp,
      color: "text-orange-600",
      href: "/teacher/publication",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      title: "Research project updated",
      description: "IoT Security Research - Progress report submitted",
      color: "bg-purple-500",
      time: "2 hours ago",
      href: "/teacher/research",
    },
    {
      id: 2,
      title: "Publication accepted",
      description: "Machine Learning in Healthcare - IEEE Journal",
      color: "bg-green-500",
      time: "4 hours ago",
      href: "/teacher/publication?tab=books",
    },
    {
      id: 3,
      title: "Grant application submitted",
      description: "SERB Core Research Grant - Rs. 25,00,000",
      color: "bg-blue-500",
      time: "6 hours ago",
      href: "/teacher/research-contributions",
    },
    {
      id: 4,
      title: "Conference presentation",
      description: "AI in Education - International Conference",
      color: "bg-orange-500",
      time: "1 day ago",
      href: "/teacher/talks-events",
    },
  ]

  const quickActions = [
    {
      title: "Generate CV",
      description: "Create your academic CV",
      href: "/teacher/generate-cv",
    },
    {
      title: "Update Profile",
      description: "Modify your information",
      href: "/teacher/profile",
    },
    {
      title: "Add Publication",
      description: "Submit new publication",
      href: "/teacher/publication?tab=books",
    },
    {
      title: "Add Research Project",
      description: "Register new research project",
      href: "/teacher/add-research",
    },
    {
      title: "Add Patent",
      description: "Register new patent",
      href: "/teacher/add-patents",
    },
    {
      title: "Add Event/Talk",
      description: "Add conference or talk",
      href: "/teacher/add-event",
    },
    {
      title: "Add Award",
      description: "Add recognition or award",
      href: "/teacher/add-awards",
    },
    {
      title: "Add Recommendation",
      description: "Add academic recommendation",
      href: "/teacher/add-academic-recommendations",
    },
  ]

  // Navigation handlers
  const handleStatClick = (href: string) => {
    router.push(href)
  }

  const handleQuickActionClick = (href: string) => {
    router.push(href)
  }

  const handleActivityClick = (href: string) => {
    router.push(href)
  }

  const handleExternalLinkClick = (type: "scopus" | "scholar") => {
    if (type === "scopus") {
      window.open("https://www.scopus.com", "_blank")
    } else {
      window.open("https://scholar.google.com", "_blank")
    }
  }

  // Simulate API calls to fetch research metrics
  useEffect(() => {
    const fetchResearchMetrics = async () => {
      setLoading(true)
      try {
        // Simulate API calls to Scopus and Google Scholar
        // In real implementation, these would be actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - replace with actual API calls
        setResearchMetrics({
          scopus: {
            hIndex: 12,
            citations: 1340,
            documents: 45,
            coAuthors: 28,
          },
          googleScholar: {
            hIndex: 15,
            i10Index: 18,
            citations: 1580,
            citationsLast5Years: 890,
          },
        })
      } catch (error) {
        console.error("Error fetching research metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResearchMetrics()
  }, [])

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500"
              onClick={() => handleStatClick(stat.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleActivityClick(activity.href)}
                  >
                    <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
                    onClick={() => handleQuickActionClick(action.href)}
                  >
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Index Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scopus Research Index */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-orange-600" />
                  Research Index (Scopus)
                </CardTitle>
                <CardDescription>Metrics from Scopus database</CardDescription>
              </div>
              <ExternalLink
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-orange-600 transition-colors"
                onClick={() => handleExternalLinkClick("scopus")}
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">H-Index</span>
                    <span className="text-lg font-bold text-orange-600">{researchMetrics.scopus.hIndex}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations</span>
                    <span className="text-lg font-bold text-blue-600">
                      {researchMetrics.scopus.citations.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Documents</span>
                    <span className="text-lg font-bold text-green-600">{researchMetrics.scopus.documents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Co-Authors</span>
                    <span className="text-lg font-bold text-purple-600">{researchMetrics.scopus.coAuthors}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Scholar Research Index */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Research Index (Google Scholar)
                </CardTitle>
                <CardDescription>Metrics from Google Scholar</CardDescription>
              </div>
              <ExternalLink
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleExternalLinkClick("scholar")}
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">H-Index</span>
                    <span className="text-lg font-bold text-blue-600">{researchMetrics.googleScholar.hIndex}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">i10-Index</span>
                    <span className="text-lg font-bold text-green-600">{researchMetrics.googleScholar.i10Index}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations</span>
                    <span className="text-lg font-bold text-orange-600">
                      {researchMetrics.googleScholar.citations.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations (5 years)</span>
                    <span className="text-lg font-bold text-purple-600">
                      {researchMetrics.googleScholar.citationsLast5Years.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* General Research Metrics */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Overview</CardTitle>
              <CardDescription>General research statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/research")}
                >
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/research")}
                >
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-muted-foreground">Completed Projects</div>
                </div>
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/research-contributions")}
                >
                  <div className="text-2xl font-bold text-purple-600">Rs. 15.2L</div>
                  <div className="text-sm text-muted-foreground">Total Funding</div>
                </div>
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/publication")}
                >
                  <div className="text-2xl font-bold text-orange-600">45</div>
                  <div className="text-sm text-muted-foreground">Publications</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => handleStatClick("/teacher/talks-events")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Talks & Events
              </CardTitle>
              <CardDescription>Academic talks and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">18</div>
              <p className="text-sm text-muted-foreground">Total events this year</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => handleStatClick("/teacher/awards-recognition")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                Awards & Recognition
              </CardTitle>
              <CardDescription>Awards and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">7</div>
              <p className="text-sm text-muted-foreground">Awards received</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => handleStatClick("/teacher/academic-recommendations")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Recommendations
              </CardTitle>
              <CardDescription>Academic recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">25</div>
              <p className="text-sm text-muted-foreground">Recommendations made</p>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
