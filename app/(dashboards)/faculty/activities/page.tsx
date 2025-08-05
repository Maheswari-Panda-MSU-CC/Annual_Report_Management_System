"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Building, DollarSign } from "lucide-react"

interface ExtensionActivity {
  id: number
  srNo: number
  activityName: string
  description: string
  date: string
  beneficiaries: number
  location: string
  status: string
}

interface ConsultancyDetails {
  id: number
  srNo: number
  clientName: string
  projectTitle: string
  duration: string
  amount: string
  status: string
  startDate: string
}

interface IndustryInterface {
  id: number
  srNo: number
  companyName: string
  collaborationType: string
  description: string
  duration: string
  benefits: string
  contactPerson: string
}

export default function FacultyActivitiesPage() {
  const { user } = useAuth()

  // Extension Activities Data
  const extensionActivities: ExtensionActivity[] = [
    {
      id: 1,
      srNo: 1,
      activityName: "Digital Literacy Program",
      description: "Training program for rural communities on basic computer skills and internet usage",
      date: "2024-03-15",
      beneficiaries: 150,
      location: "Village Community Center",
      status: "Completed",
    },
    {
      id: 2,
      srNo: 2,
      activityName: "Environmental Awareness Campaign",
      description: "Awareness program on environmental conservation and sustainable practices",
      date: "2024-02-28",
      beneficiaries: 200,
      location: "Local Schools",
      status: "Completed",
    },
    {
      id: 3,
      srNo: 3,
      activityName: "Skill Development Workshop",
      description: "Technical skill development program for unemployed youth",
      date: "2024-04-20",
      beneficiaries: 80,
      location: "Faculty Training Center",
      status: "Ongoing",
    },
  ]

  // Consultancy Details Data
  const consultancyDetails: ConsultancyDetails[] = [
    {
      id: 1,
      srNo: 1,
      clientName: "Gujarat State Electricity Board",
      projectTitle: "Smart Grid Implementation Study",
      duration: "6 months",
      amount: "Rs. 15,00,000",
      status: "Ongoing",
      startDate: "2024-01-15",
    },
    {
      id: 2,
      srNo: 2,
      clientName: "Vadodara Municipal Corporation",
      projectTitle: "Traffic Management System Design",
      duration: "4 months",
      amount: "Rs. 8,50,000",
      status: "Completed",
      startDate: "2023-10-01",
    },
    {
      id: 3,
      srNo: 3,
      clientName: "ONGC Vadodara",
      projectTitle: "Process Optimization Analysis",
      duration: "8 months",
      amount: "Rs. 22,00,000",
      status: "Ongoing",
      startDate: "2024-02-01",
    },
  ]

  // Industry Interface Data
  const industryInterface: IndustryInterface[] = [
    {
      id: 1,
      srNo: 1,
      companyName: "Tata Consultancy Services",
      collaborationType: "Industry-Academia Partnership",
      description: "Joint research on AI applications in software development",
      duration: "2 years",
      benefits: "Student internships, Faculty exchange, Research funding",
      contactPerson: "Mr. Rajesh Kumar, VP Technology",
    },
    {
      id: 2,
      srNo: 2,
      companyName: "Larsen & Toubro",
      collaborationType: "Project Collaboration",
      description: "Development of IoT solutions for construction industry",
      duration: "18 months",
      benefits: "Real-world project exposure, Industry mentorship",
      contactPerson: "Dr. Priya Sharma, Head R&D",
    },
    {
      id: 3,
      srNo: 3,
      companyName: "Reliance Industries",
      collaborationType: "Research Partnership",
      description: "Sustainable energy solutions research collaboration",
      duration: "3 years",
      benefits: "Research grants, Equipment support, Publication opportunities",
      contactPerson: "Mr. Amit Patel, Director Innovation",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Ongoing":
        return "bg-blue-100 text-blue-800"
      case "Planned":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Activities</h1>
            <p className="text-gray-600 mt-2">Overview of activities and collaborations for {user?.faculty}</p>
          </div>
        </div>

        {/* Activities Tabs */}
        <Tabs defaultValue="extension" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extension">Extension Activities</TabsTrigger>
            <TabsTrigger value="consultancy">Details of Consultancy Undertaken</TabsTrigger>
            <TabsTrigger value="industry">Industry Interface</TabsTrigger>
          </TabsList>

          {/* Extension Activities Tab */}
          <TabsContent value="extension" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Extension Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Activity Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Beneficiaries</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extensionActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.srNo}</TableCell>
                        <TableCell className="font-medium">{activity.activityName}</TableCell>
                        <TableCell className="max-w-xs truncate">{activity.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            {activity.beneficiaries}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {activity.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultancy Details Tab */}
          <TabsContent value="consultancy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details of Consultancy Undertaken</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Project Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultancyDetails.map((consultancy) => (
                      <TableRow key={consultancy.id}>
                        <TableCell>{consultancy.srNo}</TableCell>
                        <TableCell className="font-medium">{consultancy.clientName}</TableCell>
                        <TableCell className="max-w-xs truncate">{consultancy.projectTitle}</TableCell>
                        <TableCell>{consultancy.duration}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            {consultancy.amount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(consultancy.startDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(consultancy.status)}>{consultancy.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industry Interface Tab */}
          <TabsContent value="industry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Industry Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Collaboration Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Benefits</TableHead>
                      <TableHead>Contact Person</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {industryInterface.map((industry) => (
                      <TableRow key={industry.id}>
                        <TableCell>{industry.srNo}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            {industry.companyName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{industry.collaborationType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{industry.description}</TableCell>
                        <TableCell>{industry.duration}</TableCell>
                        <TableCell className="max-w-xs truncate">{industry.benefits}</TableCell>
                        <TableCell>{industry.contactPerson}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
