"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/auth-provider"
import { User, Camera, Save, X, Edit, Plus, Trash2, Upload, FileText } from "lucide-react"

interface ExperienceEntry {
  id: number
  employer: string
  currentlyEmployed: boolean
  designation: string
  dateOfJoining: string
  dateOfRelieving: string
  natureOfJob: string
  typeOfTeaching: string
}

interface PostDocEntry {
  id: number
  institute: string
  startDate: string
  endDate: string
  sponsoredBy: string
  ranking: string
  supportingDocument: string
}

interface EducationEntry {
  id: number
  degree: string
  degreeType: string // Add this field
  institution: string
  university: string
  state: string // Add this field
  yearOfPassing: string
  percentage: string
  specialization: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const isAuthenticated = user !== null;
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false) // Only for personal details
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Personal Information based on database schema
  const [formData, setFormData] = useState({
    // From faculty table
    facultyId: "FAC001",
    salutation: "Dr.",
    firstName: "Viral",
    middleName: "",
    lastName: "Kapadiya",
    email: "rajesh.sharma@msu.edu.in",
    phone: "+91 9876543210",
    alternatePhone: "+91 9876543211",
    address: "123, University Campus, Vadodara",
    city: "Vadodara",
    state: "Gujarat",
    pincode: "390001",
    dateOfBirth: "1980-05-15",
    gender: "Male",
    category: "General",
    religion: "Hindu",
    nationality: "Indian",
    maritalStatus: "Married",

    // Academic Information
    employeeId: "EMP001",
    designation: "Associate Professor",
    teachingStatus: "Tenured", // Add this line
    department: "Computer Science",
    faculty: "Faculty of Science & Technology",
    dateOfJoining: "2015-07-01",
    employmentType: "Permanent",

    // Qualification Information
    netQualified: true,
    netYear: "2010",
    netSubject: "Computer Science",
    gateQualified: false,
    gateYear: "",
    gateSpecialization: "",

    // Additional Information
    panNo: "ABCDE1234F",
    aadharNo: "123456789012",
    registeredGuide: true,
    registrationYear: "2018",
    researchAreas: "Machine Learning, Data Mining",

    // Bank Details
    bankName: "State Bank of India",
    accountNumber: "12345678901234",
    ifscCode: "SBIN0001234",

    // Emergency Contact
    emergencyContactName: "Priya Sharma",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+91 9876543212",

    // ICT in Teaching
    ictSmartBoard: false,
    ictPowerPoint: true,
    ictTools: true,
    ictELearningTools: false,
    ictOnlineCourse: true,
    ictOthers: false,
    ictOthersSpecify: "",

    // Add these fields to the formData state
    // Academic Year Information Availability
    noInfoAY201617: false,
    noInfoAY201718: false,
    noInfoAY201819: false,
    noInfoAY201920: false,
    noInfoAY202021: false,
    noInfoAY202122: false,
    noInfoAY202223: false,
    noInfoAY202324: false,
  })

  // Experience Details - Always editable
  const [experienceData, setExperienceData] = useState<ExperienceEntry[]>([
    {
      id: 1,
      employer: "ABC University",
      currentlyEmployed: false,
      designation: "Assistant Professor",
      dateOfJoining: "2012-07-01",
      dateOfRelieving: "2015-06-30",
      natureOfJob: "Teaching & Research",
      typeOfTeaching: "UG & PG",
    },
    {
      id: 2,
      employer: "MSU",
      currentlyEmployed: true,
      designation: "Associate Professor",
      dateOfJoining: "2015-07-01",
      dateOfRelieving: "",
      natureOfJob: "Teaching & Research",
      typeOfTeaching: "UG, PG & PhD",
    },
  ])

  // Post Doctoral Research Experience - Always editable
  const [postDocData, setPostDocData] = useState<PostDocEntry[]>([
    {
      id: 1,
      institute: "IIT Bombay",
      startDate: "2011-01-01",
      endDate: "2012-06-30",
      sponsoredBy: "UGC",
      ranking: "QS Ranking: 172",
      supportingDocument: "postdoc_certificate.pdf",
    },
  ])

  // Education Details - Always editable
  const [educationData, setEducationData] = useState<EducationEntry[]>([
    {
      id: 1,
      degree: "Ph.D",
      degreeType: "Post Graduate",
      institution: "IIT Delhi",
      university: "IIT Delhi",
      state: "Delhi",
      yearOfPassing: "2011",
      percentage: "8.5 CGPA",
      specialization: "Computer Science",
    },
    {
      id: 2,
      degree: "M.Tech",
      degreeType: "Post Graduate",
      institution: "NIT Surat",
      university: "NIT Surat",
      state: "Gujarat",
      yearOfPassing: "2008",
      percentage: "85%",
      specialization: "Computer Science & Engineering",
    },
    {
      id: 3,
      degree: "B.Tech",
      degreeType: "Graduate",
      institution: "Gujarat University",
      university: "Gujarat University",
      state: "Gujarat",
      yearOfPassing: "2006",
      percentage: "78%",
      specialization: "Computer Engineering",
    },
  ])

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/teacher/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const addExperienceEntry = () => {
    const newEntry: ExperienceEntry = {
      id: Date.now(),
      employer: "",
      currentlyEmployed: false,
      designation: "",
      dateOfJoining: "",
      dateOfRelieving: "",
      natureOfJob: "",
      typeOfTeaching: "",
    }
    setExperienceData([...experienceData, newEntry])
  }

  const updateExperienceEntry = (id: number, field: string, value: any) => {
    setExperienceData((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const removeExperienceEntry = (id: number) => {
    setExperienceData((prev) => prev.filter((entry) => entry.id !== id))
  }

  const addPostDocEntry = () => {
    const newEntry: PostDocEntry = {
      id: Date.now(),
      institute: "",
      startDate: "",
      endDate: "",
      sponsoredBy: "",
      ranking: "",
      supportingDocument: "",
    }
    setPostDocData([...postDocData, newEntry])
  }

  const updatePostDocEntry = (id: number, field: string, value: string) => {
    setPostDocData((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const removePostDocEntry = (id: number) => {
    setPostDocData((prev) => prev.filter((entry) => entry.id !== id))
  }

  const addEducationEntry = () => {
    const newEntry: EducationEntry = {
      id: Date.now(),
      degree: "",
      degreeType: "",
      institution: "",
      university: "",
      state: "",
      yearOfPassing: "",
      percentage: "",
      specialization: "",
    }
    setEducationData([...educationData, newEntry])
  }

  const updateEducationEntry = (id: number, field: string, value: string) => {
    setEducationData((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const removeEducationEntry = (id: number) => {
    setEducationData((prev) => prev.filter((entry) => entry.id !== id))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    setIsUploadingImage(true)

    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)

      // Here you would typically upload to your server
      // const formData = new FormData()
      // formData.append('profileImage', file)
      // await uploadProfileImage(formData)

      console.log("Image uploaded:", file.name)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const triggerImageUpload = () => {
    const fileInput = document.getElementById("profile-image-input") as HTMLInputElement
    fileInput?.click()
  }

  const handleSavePersonal = () => {
    console.log("Saving personal data:", formData)
    setIsEditingPersonal(false)
  }

  const handleCancelPersonal = () => {
    setIsEditingPersonal(false)
  }

  const handleSaveExperience = () => {
    console.log("Saving experience data:", experienceData)
    // Show success message
  }

  const handleSavePostDoc = () => {
    console.log("Saving post-doc data:", postDocData)
    // Show success message
  }

  const handleSaveEducation = () => {
    console.log("Saving education data:", educationData)
    // Show success message
  }

  const handleSaveAcademicYears = () => {
    console.log("Saving academic years data:", {
      noInfoAY201617: formData.noInfoAY201617,
      noInfoAY201718: formData.noInfoAY201718,
      noInfoAY201819: formData.noInfoAY201819,
      noInfoAY201920: formData.noInfoAY201920,
      noInfoAY202021: formData.noInfoAY202021,
      noInfoAY202122: formData.noInfoAY202122,
      noInfoAY202223: formData.noInfoAY202223,
      noInfoAY202324: formData.noInfoAY202324,
    })
    // Show success message
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>

        {/* Generate CV Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/teacher/generate-cv")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <FileText className="h-4 w-4" />
            Generate CV
          </Button>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal and academic details</CardDescription>
              </div>
              {!isEditingPersonal ? (
                <Button onClick={() => setIsEditingPersonal(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Personal Info
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSavePersonal} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelPersonal}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salutation">Salutation</Label>
                    <Select
                      value={formData.salutation}
                      onValueChange={(value) => handleInputChange("salutation", value)}
                      disabled={!isEditingPersonal}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Prof.">Prof.</SelectItem>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange("middleName", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      disabled={!isEditingPersonal}
                    />
                  </div>
                </div>

                {/* Additional Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        disabled={!isEditingPersonal}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfJoining">Date of Joining</Label>
                      <Input
                        id="dateOfJoining"
                        type="date"
                        value={formData.dateOfJoining}
                        onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                        disabled={!isEditingPersonal}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panNo">PAN Number</Label>
                      <Input
                        id="panNo"
                        value={formData.panNo}
                        onChange={(e) => handleInputChange("panNo", e.target.value)}
                        disabled={!isEditingPersonal}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Teaching Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Teaching Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teachingStatus">Teaching Status</Label>
                      <Select
                        value={formData.teachingStatus}
                        onValueChange={(value) => {
                          handleInputChange("teachingStatus", value)
                          // Reset designation when teaching status changes
                          handleInputChange("designation", "")
                        }}
                        disabled={!isEditingPersonal}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teaching status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tenured">Tenured</SelectItem>
                          <SelectItem value="Permanent">Permanent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Select
                        value={formData.designation}
                        onValueChange={(value) => handleInputChange("designation", value)}
                        disabled={!isEditingPersonal || !formData.teachingStatus}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formData.teachingStatus ? "Select teaching status first" : "Select designation"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.teachingStatus === "Tenured" && (
                            <>
                              <SelectItem value="Professor">Professor</SelectItem>
                              <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                              <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                            </>
                          )}
                          {formData.teachingStatus === "Permanent" && (
                            <>
                              <SelectItem value="Assistant Professor (Contract)">
                                Assistant Professor (Contract)
                              </SelectItem>
                              <SelectItem value="Lecturer">Lecturer</SelectItem>
                              <SelectItem value="Visiting Faculty">Visiting Faculty</SelectItem>
                              <SelectItem value="Adjunct Professor">Adjunct Professor</SelectItem>
                              <SelectItem value="Guest Faculty">Guest Faculty</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faculty">Faculty</Label>
                      <Select
                        value={formData.faculty}
                        onValueChange={(value) => handleInputChange("faculty", value)}
                        disabled={!isEditingPersonal}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faculty of Science & Technology">
                            Faculty of Science & Technology
                          </SelectItem>
                          <SelectItem value="Faculty of Arts">Faculty of Arts</SelectItem>
                          <SelectItem value="Faculty of Commerce">Faculty of Commerce</SelectItem>
                          <SelectItem value="Faculty of Education">Faculty of Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                        disabled={!isEditingPersonal}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Qualification Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Qualification Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Qualified NET Exam</Label>
                        <RadioGroup
                          value={formData.netQualified ? "yes" : "no"}
                          onValueChange={(value) =>
                            handleInputChange("netQualified", value === "yes" ? "true" : "false")
                          }
                          disabled={!isEditingPersonal}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="net-yes" disabled={!isEditingPersonal} />
                            <Label htmlFor="net-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="net-no" disabled={!isEditingPersonal} />
                            <Label htmlFor="net-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {formData.netQualified && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="netYear">NET Qualified Year</Label>
                            <Input
                              id="netYear"
                              value={formData.netYear}
                              onChange={(e) => handleInputChange("netYear", e.target.value)}
                              disabled={!isEditingPersonal}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="netSubject">NET Subject</Label>
                            <Input
                              id="netSubject"
                              value={formData.netSubject}
                              onChange={(e) => handleInputChange("netSubject", e.target.value)}
                              disabled={!isEditingPersonal}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Qualified GATE Exam</Label>
                        <RadioGroup
                          value={formData.gateQualified ? "yes" : "no"}
                          onValueChange={(value) =>
                            handleInputChange("gateQualified", value === "yes" ? "true" : "false")
                          }
                          disabled={!isEditingPersonal}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="gate-yes" disabled={!isEditingPersonal} />
                            <Label htmlFor="gate-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="gate-no" disabled={!isEditingPersonal} />
                            <Label htmlFor="gate-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {formData.gateQualified && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="gateYear">GATE Qualified Year</Label>
                            <Input
                              id="gateYear"
                              value={formData.gateYear}
                              onChange={(e) => handleInputChange("gateYear", e.target.value)}
                              disabled={!isEditingPersonal}
                              placeholder="e.g., 2018"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gateSpecialization">GATE Specialization</Label>
                            <Select
                              value={formData.gateSpecialization}
                              onValueChange={(value) => handleInputChange("gateSpecialization", value)}
                              disabled={!isEditingPersonal}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select GATE specialization" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Science and Information Technology (CS)">
                                  Computer Science and Information Technology (CS)
                                </SelectItem>
                                <SelectItem value="Electronics and Communication Engineering (EC)">
                                  Electronics and Communication Engineering (EC)
                                </SelectItem>
                                <SelectItem value="Electrical Engineering (EE)">Electrical Engineering (EE)</SelectItem>
                                <SelectItem value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</SelectItem>
                                <SelectItem value="Civil Engineering (CE)">Civil Engineering (CE)</SelectItem>
                                <SelectItem value="Chemical Engineering (CH)">Chemical Engineering (CH)</SelectItem>
                                <SelectItem value="Instrumentation Engineering (IN)">
                                  Instrumentation Engineering (IN)
                                </SelectItem>
                                <SelectItem value="Biotechnology (BT)">Biotechnology (BT)</SelectItem>
                                <SelectItem value="Aerospace Engineering (AE)">Aerospace Engineering (AE)</SelectItem>
                                <SelectItem value="Agricultural Engineering (AG)">
                                  Agricultural Engineering (AG)
                                </SelectItem>
                                <SelectItem value="Architecture and Planning (AR)">
                                  Architecture and Planning (AR)
                                </SelectItem>
                                <SelectItem value="Biomedical Engineering (BM)">Biomedical Engineering (BM)</SelectItem>
                                <SelectItem value="Engineering Sciences (XE)">Engineering Sciences (XE)</SelectItem>
                                <SelectItem value="Ecology and Evolution (EY)">Ecology and Evolution (EY)</SelectItem>
                                <SelectItem value="Geology and Geophysics (GG)">Geology and Geophysics (GG)</SelectItem>
                                <SelectItem value="Mathematics (MA)">Mathematics (MA)</SelectItem>
                                <SelectItem value="Metallurgical Engineering (MT)">
                                  Metallurgical Engineering (MT)
                                </SelectItem>
                                <SelectItem value="Mining Engineering (MN)">Mining Engineering (MN)</SelectItem>
                                <SelectItem value="Naval Architecture and Marine Engineering (NM)">
                                  Naval Architecture and Marine Engineering (NM)
                                </SelectItem>
                                <SelectItem value="Petroleum Engineering (PE)">Petroleum Engineering (PE)</SelectItem>
                                <SelectItem value="Physics (PH)">Physics (PH)</SelectItem>
                                <SelectItem value="Production and Industrial Engineering (PI)">
                                  Production and Industrial Engineering (PI)
                                </SelectItem>
                                <SelectItem value="Statistics (ST)">Statistics (ST)</SelectItem>
                                <SelectItem value="Textile Engineering and Fibre Science (TF)">
                                  Textile Engineering and Fibre Science (TF)
                                </SelectItem>
                                <SelectItem value="Life Sciences (XL)">Life Sciences (XL)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Registration Information</h3>
                  <div className="space-y-2">
                    <Label>Registered Guide at MSU</Label>
                    <RadioGroup
                      value={formData.registeredGuide ? "yes" : "no"}
                      onValueChange={(value) =>
                        handleInputChange("registeredGuide", value === "yes" ? "true" : "false")
                      }
                      disabled={!isEditingPersonal}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="guide-yes" disabled={!isEditingPersonal} />
                        <Label htmlFor="guide-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="guide-no" disabled={!isEditingPersonal} />
                        <Label htmlFor="guide-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {formData.registeredGuide && (
                    <div className="space-y-2">
                      <Label htmlFor="registrationYear">Year of Registration</Label>
                      <Input
                        id="registrationYear"
                        value={formData.registrationYear}
                        onChange={(e) => handleInputChange("registrationYear", e.target.value)}
                        disabled={!isEditingPersonal}
                      />
                    </div>
                  )}
                </div>

                {/* ICT in Teaching */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Use of ICT in Teaching</h3>
                  <div className="space-y-4">
                    <Label>Technologies Used for Teaching (Select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="smartBoard"
                          checked={formData.ictSmartBoard}
                          onChange={(e) => handleCheckboxChange("ictSmartBoard", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditingPersonal}
                        />
                        <Label htmlFor="smartBoard" className="text-sm font-normal">
                          Smart Board
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="powerPoint"
                          checked={formData.ictPowerPoint}
                          onChange={(e) => handleCheckboxChange("ictPowerPoint", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditingPersonal}
                        />
                        <Label htmlFor="powerPoint" className="text-sm font-normal">
                          PowerPoint Presentation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ictTools"
                          checked={formData.ictTools}
                          onChange={(e) => handleCheckboxChange("ictTools", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditingPersonal}
                        />
                        <Label htmlFor="ictTools" className="text-sm font-normal">
                          ICT Tools
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="eLearningTools"
                          checked={formData.ictELearningTools}
                          onChange={(e) => handleCheckboxChange("ictELearningTools", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditingPersonal}
                        />
                        <Label htmlFor="eLearningTools" className="text-sm font-normal">
                          E-Learning Tools
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="onlineCourse"
                          checked={formData.ictOnlineCourse}
                          onChange={(e) => handleCheckboxChange("ictOnlineCourse", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditingPersonal}
                        />
                        <Label htmlFor="onlineCourse" className="text-sm font-normal">
                          Online Course
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="others"
                          checked={formData.ictOthers}
                          onChange={(e) => handleCheckboxChange("ictOthers", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditingPersonal}
                        />
                        <Label htmlFor="others" className="text-sm font-normal">
                          Others
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherIctTools">If Others, please specify:</Label>
                      <Input
                        id="otherIctTools"
                        value={formData.ictOthersSpecify}
                        onChange={(e) => handleInputChange("ictOthersSpecify", e.target.value)}
                        placeholder="Please specify other ICT tools used..."
                        disabled={!isEditingPersonal}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Photo Section */}
              <div className="lg:col-span-1 flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                  </div>
                  {isEditingPersonal && (
                    <>
                      <button
                        onClick={triggerImageUpload}
                        disabled={isUploadingImage}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload profile picture"
                      >
                        {isUploadingImage ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        id="profile-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium">{`${formData.salutation} ${formData.firstName} ${formData.lastName}`}</p>
                  <p className="text-sm text-muted-foreground">{formData.designation}</p>
                  <p className="text-sm text-muted-foreground">{formData.teachingStatus} Faculty</p>
                  <p className="text-sm text-muted-foreground">{formData.department}</p>
                  <p className="text-sm text-muted-foreground">ID: {formData.employeeId}</p>
                </div>
                {isEditingPersonal && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Click the camera icon to upload a profile picture</p>
                    <p className="text-xs text-gray-400">Supported: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience Details - Always Editable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Experience Details</CardTitle>
                <CardDescription>Your professional work experience</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addExperienceEntry} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
                <Button
                  onClick={handleSaveExperience}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr No.</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Currently Employed?</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Date of Joining</TableHead>
                    <TableHead>Date of Relieving</TableHead>
                    <TableHead>Nature of Job</TableHead>
                    <TableHead>Type of Teaching</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experienceData.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={entry.employer}
                          onChange={(e) => updateExperienceEntry(entry.id, "employer", e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.currentlyEmployed ? "yes" : "no"}
                          onValueChange={(value) =>
                            updateExperienceEntry(entry.id, "currentlyEmployed", value === "yes")
                          }
                        >
                          <SelectTrigger className="min-w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.designation}
                          onChange={(e) => updateExperienceEntry(entry.id, "designation", e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.dateOfJoining}
                          onChange={(e) => updateExperienceEntry(entry.id, "dateOfJoining", e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.dateOfRelieving}
                          onChange={(e) => updateExperienceEntry(entry.id, "dateOfRelieving", e.target.value)}
                          disabled={entry.currentlyEmployed}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.natureOfJob}
                          onValueChange={(value) => updateExperienceEntry(entry.id, "natureOfJob", value)}
                        >
                          <SelectTrigger className="min-w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Teaching">Teaching</SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                            <SelectItem value="Teaching & Research">Teaching & Research</SelectItem>
                            <SelectItem value="Administrative">Administrative</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.typeOfTeaching}
                          onValueChange={(value) =>
                            updateExperienceEntry(entry.id, "typeOfTeaching", value)
                          }
                        >
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UG">UG</SelectItem>
                            <SelectItem value="PG">PG</SelectItem>
                            <SelectItem value="UG & PG">UG & PG</SelectItem>
                            <SelectItem value="UG, PG & PhD">UG, PG & PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removeExperienceEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Post Doctoral Research Experience - Always Editable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Post Doctoral Research Experience</CardTitle>
                <CardDescription>Your post-doctoral research positions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addPostDocEntry} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Post-Doc
                </Button>
                <Button
                  onClick={handleSavePostDoc}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr No.</TableHead>
                    <TableHead>Institute / Industry</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Sponsored By</TableHead>
                    <TableHead>QS / THE World University Ranking</TableHead>
                    <TableHead>Supporting Document</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postDocData.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={entry.institute}
                          onChange={(e) => updatePostDocEntry(entry.id, "institute", e.target.value)}
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.startDate}
                          onChange={(e) => updatePostDocEntry(entry.id, "startDate", e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.endDate}
                          onChange={(e) => updatePostDocEntry(entry.id, "endDate", e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.sponsoredBy}
                          onChange={(e) => updatePostDocEntry(entry.id, "sponsoredBy", e.target.value)}
                          className="min-w-[150px]"
                          placeholder="e.g., UGC, CSIR"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.ranking}
                          onChange={(e) => updatePostDocEntry(entry.id, "ranking", e.target.value)}
                          className="min-w-[200px]"
                          placeholder="e.g., QS Ranking: 172"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={entry.supportingDocument}
                            onChange={(e) => updatePostDocEntry(entry.id, "supportingDocument", e.target.value)}
                            className="min-w-[150px]"
                            placeholder="Document name"
                          />
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removePostDocEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Education Details - Always Editable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Education Details</CardTitle>
                <CardDescription>Your academic qualifications</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addEducationEntry} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
                <Button
                  onClick={handleSaveEducation}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr No.</TableHead>
                    <TableHead>Degree</TableHead>
                    <TableHead>Degree Type</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Year of Passing</TableHead>
                    <TableHead>Percentage/CGPA</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {educationData.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={entry.degree}
                          onValueChange={(value) => updateEducationEntry(entry.id, "degree", value)}
                        >
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ph.D">Ph.D</SelectItem>
                            <SelectItem value="M.Tech">M.Tech</SelectItem>
                            <SelectItem value="M.Sc">M.Sc</SelectItem>
                            <SelectItem value="M.A">M.A</SelectItem>
                            <SelectItem value="M.Phil">M.Phil</SelectItem>
                            <SelectItem value="MBA">MBA</SelectItem>
                            <SelectItem value="B.Tech">B.Tech</SelectItem>
                            <SelectItem value="B.E">B.E</SelectItem>
                            <SelectItem value="B.Sc">B.Sc</SelectItem>
                            <SelectItem value="B.A">B.A</SelectItem>
                            <SelectItem value="B.Com">B.Com</SelectItem>
                            <SelectItem value="BBA">BBA</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="12th">12th</SelectItem>
                            <SelectItem value="10th">10th</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.degreeType}
                          onValueChange={(value) => updateEducationEntry(entry.id, "degreeType", value)}
                        >
                          <SelectTrigger className="min-w-[140px]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                            <SelectItem value="Secondary">Secondary</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.institution}
                          onChange={(e) => updateEducationEntry(entry.id, "institution", e.target.value)}
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.university}
                          onChange={(e) => updateEducationEntry(entry.id, "university", e.target.value)}
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.state}
                          onValueChange={(value) => updateEducationEntry(entry.id, "state", value)}
                        >
                          <SelectTrigger className="min-w-[140px]">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                            <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                            <SelectItem value="Assam">Assam</SelectItem>
                            <SelectItem value="Bihar">Bihar</SelectItem>
                            <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                            <SelectItem value="Goa">Goa</SelectItem>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                            <SelectItem value="Haryana">Haryana</SelectItem>
                            <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                            <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Kerala">Kerala</SelectItem>
                            <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Manipur">Manipur</SelectItem>
                            <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                            <SelectItem value="Mizoram">Mizoram</SelectItem>
                            <SelectItem value="Nagaland">Nagaland</SelectItem>
                            <SelectItem value="Odisha">Odisha</SelectItem>
                            <SelectItem value="Punjab">Punjab</SelectItem>
                            <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="Sikkim">Sikkim</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="Telangana">Telangana</SelectItem>
                            <SelectItem value="Tripura">Tripura</SelectItem>
                            <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                            <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                            <SelectItem value="Puducherry">Puducherry</SelectItem>
                            <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                            <SelectItem value="Ladakh">Ladakh</SelectItem>
                            <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
                            <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">
                              Dadra and Nagar Haveli and Daman and Diu
                            </SelectItem>
                            <SelectItem value="Lakshadweep">Lakshadweep</SelectItem>
                            <SelectItem value="Other Country">Other Country</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.yearOfPassing}
                          onChange={(e) => updateEducationEntry(entry.id, "yearOfPassing", e.target.value)}
                          className="min-w-[120px]"
                          placeholder="YYYY"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.percentage}
                          onChange={(e) => updateEducationEntry(entry.id, "percentage", e.target.value)}
                          className="min-w-[120px]"
                          placeholder="85% or 8.5 CGPA"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.specialization}
                          onChange={(e) => updateEducationEntry(entry.id, "specialization", e.target.value)}
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removeEducationEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Academic Year Information Availability */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Academic Year Information Availability</CardTitle>
                <CardDescription>
                  Academic Year Information Activity - Please tick if you DON'T have any information to submit in the
                  following academic years
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAcademicYears}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2016-17"
                    checked={formData.noInfoAY201617 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY201617", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2016-17" className="text-sm font-normal">
                    A.Y. 2016-17
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2017-18"
                    checked={formData.noInfoAY201718 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY201718", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2017-18" className="text-sm font-normal">
                    A.Y. 2017-18
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2018-19"
                    checked={formData.noInfoAY201819 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY201819", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2018-19" className="text-sm font-normal">
                    A.Y. 2018-19
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2019-20"
                    checked={formData.noInfoAY201920 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY201920", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2019-20" className="text-sm font-normal">
                    A.Y. 2019-20
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2020-21"
                    checked={formData.noInfoAY202021 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY202021", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2020-21" className="text-sm font-normal">
                    A.Y. 2020-21
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2021-22"
                    checked={formData.noInfoAY202122 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY202122", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2021-22" className="text-sm font-normal">
                    A.Y. 2021-22
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2022-23"
                    checked={formData.noInfoAY202223 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY202223", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2022-23" className="text-sm font-normal">
                    A.Y. 2022-23
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2023-24"
                    checked={formData.noInfoAY202324 || false}
                    onChange={(e) => handleCheckboxChange("noInfoAY202324", e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="ay2023-24" className="text-sm font-normal">
                    A.Y. 2023-24
                  </Label>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Academic Year Information Activity:</strong> Please check the academic years for which you do
                  NOT have any information to submit. This helps in generating accurate reports and understanding your
                  research activity across different academic years.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
