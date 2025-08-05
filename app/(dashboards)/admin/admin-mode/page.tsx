"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  Building,
  BarChart3,
} from "lucide-react"

const faculties = [
  { id: "all", name: "All Faculties" },
  { id: "1", name: "Faculty of Science" },
  { id: "2", name: "Faculty of Arts" },
  { id: "3", name: "Faculty of Commerce" },
  { id: "4", name: "Faculty of Engineering" },
]

const departments = {
  "1": [
    { id: "all", name: "All Departments" },
    { id: "1", name: "Computer Science" },
    { id: "2", name: "Mathematics" },
    { id: "3", name: "Physics" },
  ],
  "2": [
    { id: "all", name: "All Departments" },
    { id: "4", name: "English Literature" },
    { id: "5", name: "History" },
    { id: "6", name: "Philosophy" },
  ],
}

// Mock data for last 5 years
const mockData = {
  academicPrograms: {
    "2023-24": { faculty: 45, department: 120 },
    "2022-23": { faculty: 42, department: 115 },
    "2021-22": { faculty: 40, department: 110 },
    "2020-21": { faculty: 38, department: 105 },
    "2019-20": { faculty: 35, department: 100 },
  },
  phdAwarded: {
    "2023-24": { faculty: 85, department: 220 },
    "2022-23": { faculty: 78, department: 205 },
    "2021-22": { faculty: 72, department: 190 },
    "2020-21": { faculty: 68, department: 175 },
    "2019-20": { faculty: 65, department: 160 },
  },
  researchPublications: {
    "2023-24": { faculty: 450, department: 1200 },
    "2022-23": { faculty: 420, department: 1150 },
    "2021-22": { faculty: 390, department: 1100 },
    "2020-21": { faculty: 365, department: 1050 },
    "2019-20": { faculty: 340, department: 1000 },
  },
  awards: {
    "2023-24": { faculty: 25, department: 65 },
    "2022-23": { faculty: 22, department: 58 },
    "2021-22": { faculty: 20, department: 52 },
    "2020-21": { faculty: 18, department: 48 },
    "2019-20": { faculty: 15, department: 42 },
  },
  grants: {
    "2023-24": { faculty: 35, department: 95 },
    "2022-23": { faculty: 32, department: 88 },
    "2021-22": { faculty: 28, department: 82 },
    "2020-21": { faculty: 25, department: 75 },
    "2019-20": { faculty: 22, department: 68 },
  },
  booksAndChapters: {
    "2023-24": { faculty: 120, department: 320 },
    "2022-23": { faculty: 115, department: 305 },
    "2021-22": { faculty: 108, department: 290 },
    "2020-21": { faculty: 102, department: 275 },
    "2019-20": { faculty: 95, department: 260 },
  },
  consultancy: {
    "2023-24": { faculty: 45, department: 125 },
    "2022-23": { faculty: 42, department: 118 },
    "2021-22": { faculty: 38, department: 110 },
    "2020-21": { faculty: 35, department: 102 },
    "2019-20": { faculty: 32, department: 95 },
  },
  academicRecommendation: {
    "2023-24": { faculty: 180, department: 480 },
    "2022-23": { faculty: 165, department: 445 },
    "2021-22": { faculty: 152, department: 410 },
    "2020-21": { faculty: 140, department: 375 },
    "2019-20": { faculty: 128, department: 340 },
  },
}

const categories = [
  {
    id: "academicPrograms",
    name: "Academic Programs",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "phdAwarded",
    name: "PhD Awarded",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "researchPublications",
    name: "Research Publications",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "awards",
    name: "Awards",
    icon: Award,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "grants",
    name: "Grants",
    icon: TrendingUp,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "booksAndChapters",
    name: "Books and Chapters",
    icon: BookOpen,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "consultancy",
    name: "Consultancy",
    icon: Briefcase,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    id: "academicRecommendation",
    name: "Academic Recommendation",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

export default function AdminMode() {
  const [selectedFaculty, setSelectedFaculty] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [activeTab, setActiveTab] = useState("academicPrograms")

  const years = ["2023-24", "2022-23", "2021-22", "2020-21", "2019-20"]

  const getCurrentData = (categoryId: string) => {
    return mockData[categoryId as keyof typeof mockData]
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return (((current - previous) / previous) * 100).toFixed(1)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Mode - Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive 5-year analytics by faculty and department levels</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Select faculty and department to view specific analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                  disabled={selectedFaculty === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {selectedFaculty !== "all" &&
                      departments[selectedFaculty as keyof typeof departments]?.slice(1).map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>5-Year Analytics Overview</CardTitle>
            <CardDescription>Detailed statistics across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="flex flex-col items-center p-3 h-auto">
                    <category.icon className={`h-4 w-4 mb-1 ${category.color}`} />
                    <span className="text-xs text-center leading-tight">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="space-y-6">
                    {/* Current Year Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className={category.bgColor}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Faculty Level (2023-24)</p>
                              <p className={`text-3xl font-bold ${category.color}`}>
                                {getCurrentData(category.id)["2023-24"].faculty}
                              </p>
                              <div className="flex items-center mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {calculateGrowth(
                                    getCurrentData(category.id)["2023-24"].faculty,
                                    getCurrentData(category.id)["2022-23"].faculty,
                                  )}
                                  % from last year
                                </Badge>
                              </div>
                            </div>
                            <category.icon className={`h-12 w-12 ${category.color} opacity-20`} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={category.bgColor}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Department Level (2023-24)</p>
                              <p className={`text-3xl font-bold ${category.color}`}>
                                {getCurrentData(category.id)["2023-24"].department}
                              </p>
                              <div className="flex items-center mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {calculateGrowth(
                                    getCurrentData(category.id)["2023-24"].department,
                                    getCurrentData(category.id)["2022-23"].department,
                                  )}
                                  % from last year
                                </Badge>
                              </div>
                            </div>
                            <Building className={`h-12 w-12 ${category.color} opacity-20`} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 5-Year Trend Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <category.icon className={`mr-2 h-5 w-5 ${category.color}`} />
                          5-Year Trend - {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-2 text-left">Academic Year</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Faculty Level</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Department Level</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Growth %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {years.map((year, index) => {
                                const data = getCurrentData(category.id)[year as keyof typeof getCurrentData]
                                const total = data.faculty + data.department
                                const prevYear = years[index + 1]
                                const prevData = prevYear
                                  ? getCurrentData(category.id)[prevYear as keyof typeof getCurrentData]
                                  : null
                                const prevTotal = prevData ? prevData.faculty + prevData.department : 0
                                const growth = prevTotal ? calculateGrowth(total, prevTotal) : "N/A"

                                return (
                                  <tr key={year} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{year}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{data.faculty}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{data.department}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                      {total}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {growth !== "N/A" && (
                                        <Badge
                                          variant={Number.parseFloat(growth) >= 0 ? "default" : "destructive"}
                                          className="text-xs"
                                        >
                                          {Number.parseFloat(growth) >= 0 ? "+" : ""}
                                          {growth}%
                                        </Badge>
                                      )}
                                      {growth === "N/A" && <span className="text-gray-400">N/A</span>}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
  )
}
