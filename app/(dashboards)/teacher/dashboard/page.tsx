"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Award, TrendingUp, BookOpen, Hash, User, ExternalLink, Upload, Brain, GraduationCap } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SmartDocumentAnalyzer } from "@/components/smart-document-analyzer"

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
  const { user } = useAuth();
  const router = useRouter();

  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [researchMetrics, setResearchMetrics] = useState<ResearchMetrics>({
    scopus: { hIndex: 0, citations: 0, documents: 0, coAuthors: 0 },
    googleScholar: { hIndex: 0, i10Index: 0, citations: 0, citationsLast5Years: 0 },
  });
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [quickCounts, setQuickCounts] = useState<any>({});
  const [researchSummary, setResearchSummary] =  useState<any>({});
  const [researchIndexes, setResearchIndexes] = useState<any>({});
  const [phdStudentsCount, setPhdStudentsCount] = useState<any>({});
  const [phdStudentStatusCount, setPhdStudentStatusCount] = useState<any>({});

  // Quick actions
  const quickActions = [
    { title: "Smart Document Upload", description: "AI-powered document categorization", action: () => setShowDocumentUpload(true), isSpecial: true },
    { title: "Generate CV", description: "Create your academic CV", href: "/teacher/generate-cv" },
    { title: "Update Profile", description: "Modify your information", href: "/teacher/profile" },
    { title: "Add Publication", description: "Submit new publication", href: "/teacher/publication?tab=books" },
    { title: "Add Research Project", description: "Register new research project", href: "/teacher/add-research" },
    { title: "Add Patent", description: "Register new patent", href: "/teacher/add-patents" },
    { title: "Add Event/Talk", description: "Add conference or talk", href: "/teacher/add-event" },
    { title: "Add Award", description: "Add recognition or award", href: "/teacher/add-awards" },
    { title: "Add Recommendation", description: "Add academic recommendation", href: "/teacher/add-academic-recommendations" },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const teacherId = user?.role_id || user?.id;
        if (!teacherId) return;

        const response = await fetch(`/api/teacher/dashboard?teacherId=${teacherId}`);
        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();

        setStats([
          { title: "Books Published", value: data.booksPublished ?? 0, description: "Books published this year", icon: BookOpen, color: "text-green-600", href: "/teacher/publication?tab=books" },
          { title: "Journal Articles", value: data.journalArticles ?? 0, description: "Journal papers published", icon: FileText, color: "text-blue-600", href: "/teacher/publication?tab=journals" },
          { title: "Papers Presented", value: data.PapersPresented ?? 0, description: "Papers Presented", icon: Award, color: "text-purple-600", href: "/teacher/publication?tab=papers" },
          { title: "Total Publications", value: data.totalPublications ?? 0, description: "All publications this year", icon: TrendingUp, color: "text-orange-600", href: "/teacher/publication" },
        ]);

        setRecentActivities(data.recentActivities || []);
        setQuickCounts(data.quickCounts || {});
        setResearchSummary(data.researchSummary || {});
        setResearchIndexes(data.researchIndexes || {});
        setPhdStudentsCount(data.phdStudentsCount || {});
        setPhdStudentStatusCount(data.phdStudentStatusCount || {});
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);



  // Navigation handlers
  const handleStatClick = (href: string) => router.push(href);
  const handleQuickActionClick = (action: any) => action.href ? router.push(action.href) : action.action?.();
  const handleActivityClick = (href: string) => router.push(href);
  const handleExternalLinkClick = (type: "scopus" | "scholar") => {
    const url = type === "scopus" ? "https://www.scopus.com" : "https://scholar.google.com";
    window.open(url, "_blank");
  };

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading dashboard...</div>;
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={() => setShowDocumentUpload(!showDocumentUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            {showDocumentUpload ? 'Hide' : 'Smart'} Document Upload
          </button>
        </div>

        {/* Smart Document Analyzer */}
        {showDocumentUpload && (
          <div className="mb-6">
            <SmartDocumentAnalyzer />
          </div>
        )}

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
                {recentActivities.map((activity, index)=> (
                  <div
                    key={activity.id ?? index}
                    className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-2 h-2 bg-blue-500 rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.ActivityType}</p>
                      <p className="text-xs text-gray-500">{activity.Title}</p>
                    </div>
                    <div className="text-xs text-gray-400">{activity.TimeAgo}</div>
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
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200 ${
                      action.isSpecial ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleQuickActionClick(action)}
                  >
                    <div className="flex items-center gap-2">
                      {action.isSpecial && <Brain className="h-4 w-4 text-blue-600" />}
                      <div className="font-medium">{action.title}</div>
                    </div>
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
                    <span className="text-lg font-bold text-orange-600">{researchIndexes.H_INDEX}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">i10_INDEX</span>
                    <span className="text-lg font-bold text-green-600">{researchIndexes.i10_INDEX}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations</span>
                    <span className="text-lg font-bold text-blue-600">
                      {researchIndexes.CITIATIONS}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Researcher Id</span>
                    <span className="text-lg font-bold text-purple-600">{researchIndexes.RESEARCHER_ID}</span>
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
                    <span className="text-lg font-bold text-blue-600">{researchIndexes.H_INDEX}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">i10-Index</span>
                    <span className="text-lg font-bold text-green-600">{researchIndexes.i10_INDEX}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations</span>
                    <span className="text-lg font-bold text-orange-600">
                      {researchIndexes.CITIATIONS}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations (5 years)</span>
                    <span className="text-lg font-bold text-purple-600">
                      {researchIndexes.RESEARCHER_ID}
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
                  <div className="text-2xl font-bold text-green-600">{researchSummary.CompletedProjects}</div>
                  <div className="text-sm text-muted-foreground">Completed Projects</div>
                </div>
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/research")}
                >
                  <div className="text-2xl font-bold text-blue-600">{researchSummary.OngoingProjects}</div>
                  <div className="text-sm text-muted-foreground">Ongoing Projects</div>
                </div>
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/publication")}
                >
                  <div className="text-2xl font-bold text-orange-600">{researchSummary.TotalProjects}</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </div>
                <div
                  className="text-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStatClick("/teacher/research-contributions")}
                >
                  <div className="text-2xl font-bold text-purple-600">Rs. {researchSummary.TotalFunding}</div>
                  <div className="text-sm text-muted-foreground">Total Funding</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PhD Students Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                PhD Students Overview
              </CardTitle>
              <CardDescription>Total PhD students under guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {phdStudentsCount.TotalPhDStudents || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total PhD Students</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                PhD Students Status
              </CardTitle>
              <CardDescription>Breakdown by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {phdStudentStatusCount.Registered || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Registered</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {phdStudentStatusCount.SynopsisSubmitted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Synopsis Submitted</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {phdStudentStatusCount.ThesisSubmitted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Thesis Submitted</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {phdStudentStatusCount.Completed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
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
              <div className="text-2xl font-bold text-blue-600">{quickCounts.TotalTalksEvents}</div>
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
              <div className="text-2xl font-bold text-yellow-600">{quickCounts.TotalAwards}</div>
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
              <div className="text-2xl font-bold text-green-600">{quickCounts.TotalRecommendations}</div>
              <p className="text-sm text-muted-foreground">Recommendations made</p>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
