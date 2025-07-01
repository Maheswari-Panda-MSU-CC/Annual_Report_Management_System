"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from "recharts"
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  PieChartIcon,
  Download,
  RefreshCw,
} from "lucide-react"

// Mock data based on university faculty analytics
const facultyDemographics = [
  { department: "Computer Science", professors: 15, associates: 12, assistants: 18, total: 45 },
  { department: "Mathematics", professors: 8, associates: 10, assistants: 14, total: 32 },
  { department: "Physics", professors: 12, associates: 8, assistants: 15, total: 35 },
  { department: "Chemistry", professors: 10, associates: 9, assistants: 12, total: 31 },
  { department: "Biology", professors: 9, associates: 11, assistants: 16, total: 36 },
  { department: "English", professors: 6, associates: 8, assistants: 10, total: 24 },
]

const researchOutput = [
  { year: "2020", publications: 145, patents: 8, projects: 32, funding: 2.5 },
  { year: "2021", publications: 162, patents: 12, projects: 38, funding: 3.2 },
  { year: "2022", publications: 178, patents: 15, projects: 42, funding: 3.8 },
  { year: "2023", publications: 195, patents: 18, projects: 48, funding: 4.5 },
  { year: "2024", publications: 210, patents: 22, projects: 55, funding: 5.2 },
]

const facultyPerformance = [
  { name: "Dr. Smith", publications: 12, citations: 245, hIndex: 8, rating: 4.8 },
  { name: "Dr. Johnson", publications: 8, citations: 189, hIndex: 6, rating: 4.6 },
  { name: "Dr. Williams", publications: 15, citations: 312, hIndex: 10, rating: 4.9 },
  { name: "Dr. Brown", publications: 6, citations: 134, hIndex: 5, rating: 4.4 },
  { name: "Dr. Davis", publications: 10, citations: 198, hIndex: 7, rating: 4.7 },
]

const ageDistribution = [
  { range: "25-30", count: 28, percentage: 12 },
  { range: "31-35", count: 45, percentage: 19 },
  { range: "36-40", count: 52, percentage: 22 },
  { range: "41-45", count: 38, percentage: 16 },
  { range: "46-50", count: 35, percentage: 15 },
  { range: "51-55", count: 25, percentage: 11 },
  { range: "56-60", count: 12, percentage: 5 },
]

const teachingLoad = [
  { semester: "Fall 2023", avgHours: 12, maxHours: 18, minHours: 8 },
  { semester: "Spring 2024", avgHours: 14, maxHours: 20, minHours: 10 },
  { semester: "Fall 2024", avgHours: 13, maxHours: 19, minHours: 9 },
]

const genderDistribution = [
  { name: "Male", value: 145, color: "#3b82f6" },
  { name: "Female", value: 98, color: "#ec4899" },
  { name: "Other", value: 5, color: "#10b981" },
]

const qualificationDistribution = [
  { name: "PhD", value: 180, color: "#8b5cf6" },
  { name: "Masters", value: 58, color: "#06b6d4" },
  { name: "Bachelors", value: 10, color: "#f59e0b" },
]

const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]

export default function AnalyticsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    // Export functionality
    console.log("Exporting analytics data...")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into faculty performance and trends</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publications</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18%</span> from last year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research Projects</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+25%</span> from last year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.3</span> from last semester
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Faculty by Department */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Faculty Distribution by Department
                  </CardTitle>
                  <CardDescription>Current faculty count across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      professors: { label: "Professors", color: "#3b82f6" },
                      associates: { label: "Associate Professors", color: "#ec4899" },
                      assistants: { label: "Assistant Professors", color: "#10b981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={facultyDemographics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="professors" stackId="a" fill="var(--color-professors)" />
                        <Bar dataKey="associates" stackId="a" fill="var(--color-associates)" />
                        <Bar dataKey="assistants" stackId="a" fill="var(--color-assistants)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Research Output Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Research Output Trends
                  </CardTitle>
                  <CardDescription>Publications and research metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      publications: { label: "Publications", color: "#3b82f6" },
                      patents: { label: "Patents", color: "#ec4899" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={researchOutput}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="publications"
                          stroke="var(--color-publications)"
                          strokeWidth={2}
                        />
                        <Line type="monotone" dataKey="patents" stroke="var(--color-patents)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Research Funding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Research Funding Trends
                </CardTitle>
                <CardDescription>Annual research funding in millions USD</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    funding: { label: "Funding (M$)", color: "#10b981" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={researchOutput}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="funding"
                        stroke="var(--color-funding)"
                        fill="var(--color-funding)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      male: { label: "Male", color: "#3b82f6" },
                      female: { label: "Female", color: "#ec4899" },
                      other: { label: "Other", color: "#10b981" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {genderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Faculty Count", color: "#8b5cf6" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Qualification Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Qualification Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      phd: { label: "PhD", color: "#8b5cf6" },
                      masters: { label: "Masters", color: "#06b6d4" },
                      bachelors: { label: "Bachelors", color: "#f59e0b" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={qualificationDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {qualificationDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Research Performers</CardTitle>
                  <CardDescription>Faculty with highest research output</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facultyPerformance.map((faculty, index) => (
                      <div key={faculty.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{faculty.name}</p>
                            <p className="text-sm text-gray-600">{faculty.publications} publications</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">H-Index: {faculty.hIndex}</Badge>
                          <p className="text-sm text-gray-600 mt-1">{faculty.citations} citations</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Research Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Projects Timeline</CardTitle>
                  <CardDescription>Active research projects over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      projects: { label: "Projects", color: "#10b981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={researchOutput}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="projects"
                          stroke="var(--color-projects)"
                          fill="var(--color-projects)"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Teaching Tab */}
          <TabsContent value="teaching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Teaching Load Analysis
                </CardTitle>
                <CardDescription>Average teaching hours per semester</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgHours: { label: "Average Hours", color: "#3b82f6" },
                    maxHours: { label: "Maximum Hours", color: "#ef4444" },
                    minHours: { label: "Minimum Hours", color: "#10b981" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teachingLoad}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgHours" fill="var(--color-avgHours)" />
                      <Bar dataKey="maxHours" fill="var(--color-maxHours)" />
                      <Bar dataKey="minHours" fill="var(--color-minHours)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Performance Metrics</CardTitle>
                  <CardDescription>Overall performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Teaching Excellence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Research Output</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Student Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Professional Development</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: "71%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">71%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Rating Distribution</CardTitle>
                  <CardDescription>Distribution of faculty performance ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      rating: { label: "Rating", color: "#8b5cf6" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="80%"
                        data={[
                          { name: "Excellent (4.5-5.0)", value: 35, fill: "#10b981" },
                          { name: "Good (4.0-4.4)", value: 45, fill: "#3b82f6" },
                          { name: "Average (3.5-3.9)", value: 15, fill: "#f59e0b" },
                          { name: "Below Average (<3.5)", value: 5, fill: "#ef4444" },
                        ]}
                      >
                        <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
