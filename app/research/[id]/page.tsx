"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResearchProjectForm } from "@/components/research-project-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash2, Calendar, Users, FileText, DollarSign, Plus } from "lucide-react"

export default function ResearchProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, fetch the project data from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setProject({
        projid: params.id,
        title: "Development of Novel Nanomaterials for Sustainable Energy Applications",
        funding_agency: 3, // DST
        funding_agency_name: "Department of Science and Technology",
        grant_sanctioned: 2500000,
        grant_received: 1800000,
        proj_nature: 2, // Applied Research
        proj_nature_name: "Applied Research",
        duration: 36, // months
        status: 1, // Ongoing
        status_name: "Ongoing",
        start_date: "2022-07-01",
        proj_level: 2, // National
        proj_level_name: "National",
        investigators: [
          { name: "Dr. Rajesh Kumar", role: "Principal Investigator", department: "Chemistry" },
          { name: "Dr. Meera Singh", role: "Co-Investigator", department: "Physics" },
          { name: "Dr. Anand Patel", role: "Co-Investigator", department: "Materials Science" },
        ],
        objectives: [
          "Synthesize novel nanomaterials with enhanced energy conversion efficiency",
          "Characterize the structural and electronic properties of the synthesized materials",
          "Develop prototype devices for energy harvesting and storage",
          "Evaluate the performance and stability of the developed materials and devices",
        ],
        description:
          "This project aims to develop novel nanomaterials for sustainable energy applications. The research focuses on synthesizing and characterizing new materials with enhanced properties for energy conversion and storage. The project includes the development of prototype devices and evaluation of their performance under various conditions.",
        outcomes: [
          "3 research papers published in international journals",
          "1 patent filed",
          "2 PhD students trained",
          "1 prototype device developed",
        ],
        progress: 65, // percentage
        department: "Chemistry",
        faculty: "Faculty of Science",
      })
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleDelete = async () => {
    // In a real implementation, delete the project from the database
    // For now, we'll just navigate back to the projects list
    router.push("/research")
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    // In a real implementation, refresh the project data
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/research")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/research/${params.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the research project record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">{project.title}</h1>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Research Project</CardTitle>
            </CardHeader>
            <CardContent>
              <ResearchProjectForm
                initialData={project}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="funding">Funding & Timeline</TabsTrigger>
              <TabsTrigger value="team">Research Team</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    <Badge variant={project.status === 1 ? "default" : project.status === 2 ? "success" : "secondary"}>
                      {project.status_name}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {project.proj_level_name}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {project.proj_nature_name}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Project Description</h3>
                    <p className="mt-1">{project.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Project Objectives</h3>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {project.objectives.map((objective: string, index: number) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Department</h3>
                      <p>{project.department}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Faculty</h3>
                      <p>{project.faculty}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Project Progress</h3>
                    <div className="mt-2">
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-sm text-gray-500 mt-1">{project.progress}% Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funding" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Funding & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Grant Sanctioned</h3>
                      <p className="text-2xl font-bold">₹{project.grant_sanctioned.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Grant Received</h3>
                      <p className="text-2xl font-bold">₹{project.grant_received.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Utilization</h3>
                      <p className="text-2xl font-bold">
                        {Math.round((project.grant_received / project.grant_sanctioned) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Funding Agency</h3>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                        <p>{project.funding_agency_name}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                      <p>{project.duration} months</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                        <p>{new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                        <p>
                          {new Date(
                            new Date(project.start_date).setMonth(
                              new Date(project.start_date).getMonth() + project.duration,
                            ),
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Research Team</CardTitle>
                  <CardDescription>Investigators and team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.investigators.map((investigator: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="bg-gray-100 rounded-full p-2">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{investigator.name}</p>
                          <p className="text-sm text-gray-500">
                            {investigator.role} • {investigator.department}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Outcomes</CardTitle>
                  <CardDescription>Publications, patents, and other outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.outcomes.map((outcome: string, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="bg-gray-100 rounded-full p-2">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p>{outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Outcome
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
