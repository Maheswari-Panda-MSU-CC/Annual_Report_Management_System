"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Building, Calendar, Edit, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const academicYears = [
  { id: "2023-24", year: "2023-24" },
  { id: "2022-23", year: "2022-23" },
  { id: "2021-22", year: "2021-22" },
  { id: "2020-21", year: "2020-21" },
  { id: "2019-20", year: "2019-20" },
]

const universityData = {
  "2023-24": {
    name: "Maharaja Sayajirao University of Baroda",
    establishedYear: "1949",
    location: "Vadodara, Gujarat, India",
    introduction:
      "The Maharaja Sayajirao University of Baroda, commonly referred to as MSU, is a public university in the city of Vadodara, in the state of Gujarat, India. Originally established as a college in 1881, it became a university in 1949 after India's independence. It was later renamed after its benefactor Maharaja Sayajirao Gaekwad III, the former ruler of Baroda State. The university is recognized by the University Grants Commission (UGC) and is accredited by the National Assessment and Accreditation Council (NAAC) with an 'A' grade.",
    vision: "To be a world-class university committed to excellence in teaching, research, and service to society.",
    mission:
      "To provide quality education, foster research and innovation, and contribute to the socio-economic development of the region and the nation.",
    chancellor: "Hon'ble Governor of Gujarat",
    viceChancellor: "Prof. Parimal Vyas",
    totalFaculties: 13,
    totalDepartments: 95,
    totalStudents: 35000,
    totalTeachers: 1200,
  },
  "2022-23": {
    name: "Maharaja Sayajirao University of Baroda",
    establishedYear: "1949",
    location: "Vadodara, Gujarat, India",
    introduction:
      "The Maharaja Sayajirao University of Baroda has been a beacon of higher education for over seven decades. In the academic year 2022-23, the university continued its tradition of excellence in education, research, and community service. The university has consistently maintained its position as one of the leading institutions in India.",
    vision: "To be a world-class university committed to excellence in teaching, research, and service to society.",
    mission:
      "To provide quality education, foster research and innovation, and contribute to the socio-economic development of the region and the nation.",
    chancellor: "Hon'ble Governor of Gujarat",
    viceChancellor: "Prof. Parimal Vyas",
    totalFaculties: 13,
    totalDepartments: 93,
    totalStudents: 33500,
    totalTeachers: 1150,
  },
}

export default function AdminProfile() {
  const [selectedYear, setSelectedYear] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const { toast } = useToast()

  const currentData = selectedYear ? universityData[selectedYear as keyof typeof universityData] : null

  const handleEdit = () => {
    setEditData({ ...currentData })
    setIsEditing(true)
  }

  const handleSave = () => {
    // Here you would typically save to database
    setIsEditing(false)
    toast({
      title: "Success",
      description: "University profile updated successfully",
    })
  }

  const handleCancel = () => {
    setEditData(null)
    setIsEditing(false)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">University Profile</h1>
            <p className="text-gray-600 mt-2">Manage university information and details</p>
          </div>
          {currentData && !isEditing && (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
          {isEditing && (
            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Year Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Select Academic Year
            </CardTitle>
            <CardDescription>Choose an academic year to view or edit university profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-sm">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
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
          </CardContent>
        </Card>

        {/* University Details */}
        {currentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">University Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData?.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{currentData.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="established">Established Year</Label>
                  {isEditing ? (
                    <Input
                      id="established"
                      value={editData?.establishedYear || ""}
                      onChange={(e) => setEditData({ ...editData, establishedYear: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{currentData.establishedYear}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={editData?.location || ""}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{currentData.location}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="chancellor">Chancellor</Label>
                  {isEditing ? (
                    <Input
                      id="chancellor"
                      value={editData?.chancellor || ""}
                      onChange={(e) => setEditData({ ...editData, chancellor: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{currentData.chancellor}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="viceChancellor">Vice Chancellor</Label>
                  {isEditing ? (
                    <Input
                      id="viceChancellor"
                      value={editData?.viceChancellor || ""}
                      onChange={(e) => setEditData({ ...editData, viceChancellor: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{currentData.viceChancellor}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>University Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{currentData.totalFaculties}</div>
                    <div className="text-sm text-gray-600">Total Faculties</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{currentData.totalDepartments}</div>
                    <div className="text-sm text-gray-600">Total Departments</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentData.totalStudents.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{currentData.totalTeachers}</div>
                    <div className="text-sm text-gray-600">Total Teachers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Introduction, Vision & Mission */}
        {currentData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>University Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editData?.introduction || ""}
                    onChange={(e) => setEditData({ ...editData, introduction: e.target.value })}
                    rows={6}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{currentData.introduction}</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editData?.vision || ""}
                      onChange={(e) => setEditData({ ...editData, vision: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-700">{currentData.vision}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editData?.mission || ""}
                      onChange={(e) => setEditData({ ...editData, mission: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-700">{currentData.mission}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedYear && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Academic Year</h3>
              <p className="text-gray-600">Please select an academic year to view university profile information.</p>
            </CardContent>
          </Card>
        )}
      </div>
  )
}
