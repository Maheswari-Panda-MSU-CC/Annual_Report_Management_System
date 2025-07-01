"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Calendar, MapPin, Award, BookOpen, Users, Download, Edit } from "lucide-react"

interface FacultyProfileProps {
  facultyId: string
}

// Mock data based on Dr. Viral Kapadia's biodata
const mockFacultyData = {
  id: "1",
  name: "Dr. Viral Vinod Kapadia",
  email: "viral.kapadia-cse@msubaroda.ac.in",
  phone: "6353861988",
  designation: "Associate Professor (Direct Recruitment)",
  department: "Computer Science & Engineering",
  faculty: "Faculty of Technology and Engineering",
  status: "active",
  joiningDate: "2019-11-28",
  teachingStatus: "tenured", // Add this field

  education: [
    {
      degree: "PhD",
      university: "Sardar Patel University",
      year: "2015",
      state: "Gujarat",
    },
    {
      degree: "Post Graduate",
      university: "Sardar Patel University",
      year: "2009",
      state: "Gujarat",
    },
    {
      degree: "Graduate",
      university: "Veer Narmad South Gujarat University",
      year: "2005",
      state: "Gujarat",
    },
  ],

  experience: [
    {
      employer: "The M S University of Baroda",
      designation: "Associate Professor",
      startDate: "2019-11-28",
      endDate: "Present",
      nature: "Teaching",
    },
    {
      employer: "The M S University of Baroda",
      designation: "Assistant Professor",
      startDate: "2013-05-06",
      endDate: "2019-11-27",
      nature: "Teaching",
    },
    {
      employer: "Birla Vishwakarma Mahavidyalaya Engineering College",
      designation: "Assistant Professor",
      startDate: "2006-01-16",
      endDate: "2013-05-04",
      nature: "Teaching",
    },
  ],

  researchProjects: [
    {
      title: "Finding fastest algorithm for shortest route using parallel computing",
      fundingAgency: "University",
      level: "University",
      duration: 36,
    },
    {
      title: "Aakash Tablet",
      fundingAgency: "MHRD",
      level: "National",
      duration: 36,
    },
  ],

  phdGuidance: [
    {
      studentName: "Meghna Desai",
      topic:
        "Modelling and Optimizing Gait Classification using Deep Learning for assistance in Clinical Treatment Decision Making",
      status: "Registered",
      registrationDate: "2017-12-27",
    },
    {
      studentName: "Virendra Barot",
      topic: "Optimizing Real Time Analytics of Big Data Induced from IOT Devices",
      status: "Completed",
      registrationDate: "2017-04-06",
    },
  ],

  publications: [
    {
      title: "Designing defensive techniques to handle adversarial attack on deep learning-based model",
      journal: "PeerJ Computer Science",
      year: "2024",
      type: "Journal",
      level: "International",
    },
    {
      title: "Efficient Key Exchange Using Identity-Based Encryption in Multipath TCP Environment",
      journal: "Applied Sciences",
      year: "2022",
      type: "Journal",
      level: "International",
    },
  ],

  books: [
    {
      title: "Garbage Collection Techniques & Optimizations for Distributed Systems",
      publisher: "Lambert Academic Publishing",
      year: "2019",
      isbn: "978-613-9-99516-5",
    },
    {
      title: "Design & analysis of Algorithms",
      publisher: "Research india Publication",
      year: "2014",
      isbn: "9789384144616",
    },
  ],

  awards: [
    {
      name: "Research Award",
      agency: "The MS University",
      level: "International",
      year: "2016",
    },
    {
      name: "Best Research Paper Award",
      agency: "IRD India",
      level: "International",
      year: "2015",
    },
  ],

  researchAreas: ["Machine Learning", "IoT", "Network Security", "Deep Learning", "Cybersecurity"],
}

export function FacultyProfile({ facultyId }: FacultyProfileProps) {
  const [faculty] = useState(mockFacultyData)

  const generateResume = () => {
    // This would generate a PDF resume
    console.log("Generating resume for:", faculty.name)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "on_leave":
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{faculty.name}</h1>
          <p className="text-gray-600">{faculty.designation}</p>
          <p className="text-gray-500">{faculty.department}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(faculty.status)}
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
          <Button onClick={generateResume} size="sm">
            <Download className="h-4 w-4 mr-1" />
            Generate Resume
          </Button>
        </div>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{faculty.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{faculty.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Joined: {new Date(faculty.joiningDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Status: {faculty.teachingStatus === "tenured" ? "Tenured" : "Permanent"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{faculty.faculty}</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Research Areas</h4>
            <div className="flex flex-wrap gap-2">
              {faculty.researchAreas.map((area, index) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="education" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="guidance">PhD Guidance</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Educational Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty.education.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-gray-600">{edu.university}</p>
                        <p className="text-sm text-gray-500">{edu.state}</p>
                      </div>
                      <Badge variant="outline">{edu.year}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty.experience.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{exp.designation}</h4>
                        <p className="text-gray-600">{exp.employer}</p>
                        <p className="text-sm text-gray-500">{exp.nature}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(exp.startDate).toLocaleDateString()} -{" "}
                          {exp.endDate === "Present" ? "Present" : new Date(exp.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Research Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty.researchProjects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-gray-600">Funding Agency: {project.fundingAgency}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{project.level}</Badge>
                          <Badge variant="secondary">{project.duration} months</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Journal Publications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faculty.publications.map((pub, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{pub.title}</h4>
                      <p className="text-gray-600">{pub.journal}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{pub.year}</Badge>
                        <Badge variant="secondary">{pub.level}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Books Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faculty.books.map((book, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{book.title}</h4>
                      <p className="text-gray-600">{book.publisher}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{book.year}</Badge>
                        <Badge variant="secondary">ISBN: {book.isbn}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guidance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                PhD Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty.phdGuidance.map((student, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{student.studentName}</h4>
                        <p className="text-gray-600 text-sm mt-1">{student.topic}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Registered: {new Date(student.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={student.status === "Completed" ? "default" : "secondary"}>{student.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Awards & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty.awards.map((award, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{award.name}</h4>
                        <p className="text-gray-600">{award.agency}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{award.year}</Badge>
                        <p className="text-sm text-gray-500 mt-1">{award.level}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
