"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Search, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const questions = [
  { id: "1", text: "Number of research publications" },
  { id: "2", text: "Number of patents filed" },
  { id: "3", text: "Number of conferences attended" },
  { id: "4", text: "Number of workshops conducted" },
  { id: "5", text: "Number of students guided" },
]

const faculties = [
  { id: "1", name: "Faculty of Science" },
  { id: "2", name: "Faculty of Arts" },
  { id: "3", name: "Faculty of Commerce" },
  { id: "4", name: "Faculty of Engineering" },
  { id: "5", name: "Faculty of Medicine" },
]

const departments = [
  { id: "1", name: "Computer Science", facultyId: "1" },
  { id: "2", name: "Physics", facultyId: "1" },
  { id: "3", name: "Chemistry", facultyId: "1" },
  { id: "4", name: "English", facultyId: "2" },
  { id: "5", name: "History", facultyId: "2" },
]

const academicYears = [
  { id: "1", year: "2023-24" },
  { id: "2", year: "2022-23" },
  { id: "3", year: "2021-22" },
]

export default function AdditionalInformation() {
  const [formData, setFormData] = useState({
    question: "",
    faculty: "",
    department: "",
    year: "",
    count: "",
  })
  const [filteredDepartments, setFilteredDepartments] = useState(departments)
  const { toast } = useToast()

  const handleFacultyChange = (facultyId: string) => {
    setFormData({ ...formData, faculty: facultyId, department: "" })
    setFilteredDepartments(departments.filter((dept) => dept.facultyId === facultyId))
  }

  const handleSubmit = () => {
    if (!formData.question || !formData.faculty || !formData.department || !formData.year || !formData.count) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Additional information saved successfully",
    })

    // Reset form
    setFormData({
      question: "",
      faculty: "",
      department: "",
      year: "",
      count: "",
    })
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Additional Information</h1>
          <p className="text-gray-600 mt-2">Manage additional academic and research information</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Add Additional Information
            </CardTitle>
            <CardDescription>Enter additional information for faculty, department, and academic year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Select
                  value={formData.question}
                  onValueChange={(value) => setFormData({ ...formData, question: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {questions.map((question) => (
                      <SelectItem key={question.id} value={question.id}>
                        {question.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select value={formData.faculty} onValueChange={handleFacultyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a faculty" />
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
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  disabled={!formData.faculty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="count">Count</Label>
                <Input
                  id="count"
                  type="number"
                  placeholder="Enter count"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() =>
                  setFormData({
                    question: "",
                    faculty: "",
                    department: "",
                    year: "",
                    count: "",
                  })
                }
              >
                Clear
              </Button>
              <Button onClick={handleSubmit}>
                <Plus className="mr-2 h-4 w-4" />
                Save Information
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Additional Information</CardTitle>
            <CardDescription>Search and filter existing additional information records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input placeholder="Search by question, faculty, or department..." className="w-full" />
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Results Table */}
            <div className="border rounded-lg">
              <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                <div>Question</div>
                <div>Faculty</div>
                <div>Department</div>
                <div>Year</div>
                <div>Count</div>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-5 gap-4 p-4 text-sm">
                  <div>Number of research publications</div>
                  <div>Faculty of Science</div>
                  <div>Computer Science</div>
                  <div>2023-24</div>
                  <div>45</div>
                </div>
                <div className="grid grid-cols-5 gap-4 p-4 text-sm">
                  <div>Number of patents filed</div>
                  <div>Faculty of Engineering</div>
                  <div>Mechanical Engineering</div>
                  <div>2023-24</div>
                  <div>12</div>
                </div>
                <div className="grid grid-cols-5 gap-4 p-4 text-sm">
                  <div>Number of conferences attended</div>
                  <div>Faculty of Arts</div>
                  <div>English</div>
                  <div>2023-24</div>
                  <div>28</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
