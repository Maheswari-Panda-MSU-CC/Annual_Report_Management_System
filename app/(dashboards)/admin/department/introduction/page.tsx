"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, Calendar, BookOpen, Microscope, Users, Edit, Save, X } from "lucide-react"

const faculties = [
  { id: "1", name: "Faculty of Science" },
  { id: "2", name: "Faculty of Arts" },
  { id: "3", name: "Faculty of Commerce" },
  { id: "4", name: "Faculty of Engineering" },
]

const academicYears = [
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
  { value: "2021-22", label: "2021-22" },
  { value: "2020-21", label: "2020-21" },
]

const mockDepartmentData = {
  "1": {
    "2023-24": {
      departments: [
        {
          id: "CS",
          name: "Computer Science",
          introduction:
            "The Department of Computer Science was established in 1985 with a vision to provide quality education in computer science and technology. The department offers undergraduate and postgraduate programs in computer science, focusing on both theoretical foundations and practical applications.",
          examinationReforms:
            "Implementation of continuous assessment methods, online examination systems, and project-based evaluations. Introduction of industry-relevant assessment criteria and peer review processes.",
          innovativeProcesses:
            "Flipped classroom methodology, project-based learning, industry mentorship programs, hackathons, and collaborative learning environments. Integration of AI and ML tools in teaching processes.",
          newEquipment:
            "High-performance computing servers (5 units), Advanced networking equipment, Cloud computing infrastructure, IoT development kits (20 units), VR/AR headsets for immersive learning",
          newBooks:
            "Latest editions of algorithms and data structures, Machine learning textbooks, Cybersecurity handbooks, Software engineering best practices, Research methodology books",
          newLaboratories:
            "AI/ML Research Lab (established March 2024), Cybersecurity Lab (upgraded), IoT Innovation Center, Software Development Studio",
          seminarRooms: "Smart Seminar Room with interactive displays, Video conferencing facility for 50 participants",
          conferenceRooms: "Department Conference Hall with capacity of 100, equipped with latest AV systems",
        },
        {
          id: "MATH",
          name: "Mathematics",
          introduction:
            "The Department of Mathematics has been a cornerstone of scientific education since 1960. We offer comprehensive programs in pure and applied mathematics, statistics, and computational mathematics.",
          examinationReforms:
            "Introduction of problem-solving based assessments, mathematical modeling projects, and research paper presentations as part of evaluation.",
          innovativeProcesses:
            "Use of mathematical software like MATLAB and Mathematica in teaching, collaborative problem-solving sessions, and research-oriented learning.",
          newEquipment:
            "Scientific calculators (50 units), Mathematical modeling software licenses, Statistical analysis tools",
          newBooks:
            "Advanced calculus texts, Statistical inference books, Mathematical modeling references, Research journals subscriptions",
          newLaboratories: "Computational Mathematics Lab, Statistics and Data Analysis Lab",
          seminarRooms: "Mathematics Seminar Room with smart board technology",
          conferenceRooms: "Department meeting room with video conferencing facility",
        },
      ],
    },
  },
}

export default function DepartmentIntroduction() {
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [editingDept, setEditingDept] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  const handleEdit = (deptId: string, currentData: any) => {
    setEditingDept(deptId)
    setEditData(currentData)
  }

  const handleSave = () => {
    // Save logic here
    setEditingDept(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingDept(null)
    setEditData({})
  }

  const departmentData =
    selectedFaculty && selectedYear
      ? mockDepartmentData[selectedFaculty as keyof typeof mockDepartmentData]?.[
          selectedYear as keyof (typeof mockDepartmentData)["1"]
        ]?.departments || []
      : []

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Introduction</h1>
          <p className="text-gray-600 mt-2">View and manage department details by faculty and academic year</p>
        </div>

        {/* Selection Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Department Selection
            </CardTitle>
            <CardDescription>Select faculty and academic year to view department details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="year">Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Details */}
        {departmentData.length > 0 && (
          <div className="space-y-6">
            {departmentData.map((dept) => (
              <Card key={dept.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        {dept.name} Department
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="mr-1 h-4 w-4" />
                        Academic Year: {selectedYear}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(dept.id, dept)}
                      disabled={editingDept === dept.id}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Introduction */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Introduction
                    </h4>
                    {editingDept === dept.id ? (
                      <Textarea
                        value={editData.introduction || dept.introduction}
                        onChange={(e) => setEditData({ ...editData, introduction: e.target.value })}
                        rows={4}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{dept.introduction}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Examination Reforms */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Examination Reforms</h4>
                    {editingDept === dept.id ? (
                      <Textarea
                        value={editData.examinationReforms || dept.examinationReforms}
                        onChange={(e) => setEditData({ ...editData, examinationReforms: e.target.value })}
                        rows={3}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{dept.examinationReforms}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Innovative Processes */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Innovative Processes in Teaching/Learning</h4>
                    {editingDept === dept.id ? (
                      <Textarea
                        value={editData.innovativeProcesses || dept.innovativeProcesses}
                        onChange={(e) => setEditData({ ...editData, innovativeProcesses: e.target.value })}
                        rows={3}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{dept.innovativeProcesses}</p>
                    )}
                  </div>

                  <Separator />

                  {/* New Equipment and Books */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <Microscope className="mr-2 h-5 w-5" />
                        New Equipment
                      </h4>
                      {editingDept === dept.id ? (
                        <Textarea
                          value={editData.newEquipment || dept.newEquipment}
                          onChange={(e) => setEditData({ ...editData, newEquipment: e.target.value })}
                          rows={4}
                          className="w-full"
                        />
                      ) : (
                        <div className="space-y-2">
                          {dept.newEquipment.split(", ").map((item, index) => (
                            <div key={index} className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                •
                              </Badge>
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        New Books in Library
                      </h4>
                      {editingDept === dept.id ? (
                        <Textarea
                          value={editData.newBooks || dept.newBooks}
                          onChange={(e) => setEditData({ ...editData, newBooks: e.target.value })}
                          rows={4}
                          className="w-full"
                        />
                      ) : (
                        <div className="space-y-2">
                          {dept.newBooks.split(", ").map((book, index) => (
                            <div key={index} className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                •
                              </Badge>
                              <span className="text-sm text-gray-700">{book}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* New Laboratories/Seminar/Conference Rooms */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">New Laboratories/Seminar/Conference Rooms</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">New Laboratories</h5>
                        {editingDept === dept.id ? (
                          <Textarea
                            value={editData.newLaboratories || dept.newLaboratories}
                            onChange={(e) => setEditData({ ...editData, newLaboratories: e.target.value })}
                            rows={3}
                            className="w-full"
                          />
                        ) : (
                          <p className="text-sm text-blue-800">{dept.newLaboratories}</p>
                        )}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-2">Seminar Rooms</h5>
                        {editingDept === dept.id ? (
                          <Textarea
                            value={editData.seminarRooms || dept.seminarRooms}
                            onChange={(e) => setEditData({ ...editData, seminarRooms: e.target.value })}
                            rows={3}
                            className="w-full"
                          />
                        ) : (
                          <p className="text-sm text-green-800">{dept.seminarRooms}</p>
                        )}
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">Conference Rooms</h5>
                        {editingDept === dept.id ? (
                          <Textarea
                            value={editData.conferenceRooms || dept.conferenceRooms}
                            onChange={(e) => setEditData({ ...editData, conferenceRooms: e.target.value })}
                            rows={3}
                            className="w-full"
                          />
                        ) : (
                          <p className="text-sm text-purple-800">{dept.conferenceRooms}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit Actions */}
                  {editingDept === dept.id && (
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Data Message */}
        {selectedFaculty && selectedYear && departmentData.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Department Data Found</h3>
              <p className="text-gray-600">
                No department information is available for the selected faculty and academic year.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
  )
}
