"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResearchProjectForm } from "@/components/forms/research-project-form"
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
import { ArrowLeft, Edit, Trash2, Calendar, Users, FileText, IndianRupee, Plus } from "lucide-react"

export default function ResearchProjectDetailPage() {
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const params = useParams();
  const projectId = params?.id;

  useEffect(() => {
    // In a real implementation, fetch the project data from the API
    // For now, we'll use mock data
    setTimeout(() => { 
      setProject({
        projid: projectId,
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
  }, [projectId])

  const handleDelete = async () => {
    // In a real implementation, delete the project from the database
    // For now, we'll just navigate back to the projects list
          router.push("/teacher/research")
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    // In a real implementation, refresh the project data
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    )
  }

  return (
      <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => router.push("/teacher/research")} className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/teacher/research/${params.id}/edit`)} className="flex items-center gap-2 w-full sm:w-auto">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90vw] max-w-md mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This action cannot be undone. This will permanently delete the research project record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-2 sm:mt-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-words">{project?.title}</h1>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Edit Research Project</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <ResearchProjectForm
                initialData={project}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="details">
            <TabsList className="w-full overflow-x-auto flex-nowrap sm:flex-wrap">
              <TabsTrigger value="details" className="text-xs sm:text-sm whitespace-nowrap">Project Details</TabsTrigger>
              <TabsTrigger value="funding" className="text-xs sm:text-sm whitespace-nowrap">Funding & Timeline</TabsTrigger>
              <TabsTrigger value="team" className="text-xs sm:text-sm whitespace-nowrap">Research Team</TabsTrigger>
              <TabsTrigger value="outcomes" className="text-xs sm:text-sm whitespace-nowrap">Outcomes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">Project Information</CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={project.status === 1 ? "default" : project.status === 2 ? "secondary" : "destructive"} className="text-xs">
                      {project.status_name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.proj_level_name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.proj_nature_name}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Project Description</h3>
                    <p className="mt-1 text-xs sm:text-sm break-words">{project.description}</p>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Project Objectives</h3>
                    <ul className="list-disc pl-4 sm:pl-5 mt-1 space-y-1 text-xs sm:text-sm">
                      {project.objectives.map((objective: string, index: number) => (
                        <li key={index} className="break-words">{objective}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Department</h3>
                      <p className="text-xs sm:text-sm mt-1">{project.department}</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Faculty</h3>
                      <p className="text-xs sm:text-sm mt-1">{project.faculty}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Project Progress</h3>
                    <div className="mt-2">
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{project.progress}% Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funding" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">Funding & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Grant Sanctioned</h3>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 break-words">₹{project.grant_sanctioned.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Grant Received</h3>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 break-words">₹{project.grant_received.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Utilization</h3>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1">
                        {Math.round((project.grant_received / project.grant_sanctioned) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Funding Agency</h3>
                      <div className="flex items-center mt-1">
                        <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm break-words">{project.funding_agency_name}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Duration</h3>
                      <p className="text-xs sm:text-sm mt-1">{project.duration} months</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Start Date</h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm">{new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">End Date</h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm">
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

            <TabsContent value="team" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">Research Team</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Investigators and team members</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {project.investigators.map((investigator: any, index: number) => (
                      <div key={index} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 border rounded-lg">
                        <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm break-words">{investigator.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            {investigator.role} • {investigator.department}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">Project Outcomes</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Publications, patents, and other outcomes</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {project.outcomes.map((outcome: string, index: number) => (
                      <div key={index} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 border rounded-lg">
                        <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm break-words">{outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-3 sm:p-6">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto bg-transparent flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Outcome</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
  )
}
