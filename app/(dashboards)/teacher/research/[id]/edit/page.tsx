"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Save, X, Plus, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ResearchData {
  projid: string
  title: string
  principalInvestigator: string
  coInvestigators: string[]
  fundingAgency: string
  fundingAgencyName: string
  grantSanctioned: number
  grantReceived: number
  projNature: string
  projNatureName: string
  duration: number
  status: string
  statusName: string
  startDate: string
  endDate: string
  projLevel: string
  projLevelName: string
  department: string
  faculty: string
  description: string
  objectives: string[]
  methodology: string
  expectedOutcomes: string[]
  keywords: string[]
  researchAreas: string[]
  collaboratingInstitutions: string[]
  equipmentRequired: string[]
  ethicalClearance: boolean
  ethicalClearanceNumber: string
  progress: number
  milestones: Array<{
    title: string
    description: string
    targetDate: string
    status: string
  }>
  publications: Array<{
    title: string
    journal: string
    year: string
    authors: string
  }>
  patents: Array<{
    title: string
    applicationNumber: string
    status: string
    filingDate: string
  }>
}

export default function EditResearchPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [formData, setFormData] = useState<ResearchData>({
    projid: "",
    title: "",
    principalInvestigator: "",
    coInvestigators: [],
    fundingAgency: "",
    fundingAgencyName: "",
    grantSanctioned: 0,
    grantReceived: 0,
    projNature: "",
    projNatureName: "",
    duration: 0,
    status: "",
    statusName: "",
    startDate: "",
    endDate: "",
    projLevel: "",
    projLevelName: "",
    department: "",
    faculty: "",
    description: "",
    objectives: [],
    methodology: "",
    expectedOutcomes: [],
    keywords: [],
    researchAreas: [],
    collaboratingInstitutions: [],
    equipmentRequired: [],
    ethicalClearance: false,
    ethicalClearanceNumber: "",
    progress: 0,
    milestones: [],
    publications: [],
    patents: [],
  })

  // Dynamic field states
  const [newCoInvestigator, setNewCoInvestigator] = useState("")
  const [newObjective, setNewObjective] = useState("")
  const [newOutcome, setNewOutcome] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [newResearchArea, setNewResearchArea] = useState("")
  const [newInstitution, setNewInstitution] = useState("")
  const [newEquipment, setNewEquipment] = useState("")

  // Load research data
  useEffect(() => {
    const loadResearchData = async () => {
      try {
        setIsLoading(true)

        // Mock data for research ID 2 - replace with actual API call
        const mockData: ResearchData = {
          projid: params.id as string,
          title: "Development of Novel Nanomaterials for Sustainable Energy Applications",
          principalInvestigator: "Dr. Rajesh Kumar",
          coInvestigators: ["Dr. Meera Singh", "Dr. Anand Patel", "Dr. Priya Sharma"],
          fundingAgency: "3",
          fundingAgencyName: "Department of Science and Technology (DST)",
          grantSanctioned: 2500000,
          grantReceived: 1800000,
          projNature: "2",
          projNatureName: "Applied Research",
          duration: 36,
          status: "1",
          statusName: "Ongoing",
          startDate: "2022-07-01",
          endDate: "2025-06-30",
          projLevel: "2",
          projLevelName: "National",
          department: "Chemistry",
          faculty: "Faculty of Science",
          description:
            "This project aims to develop novel nanomaterials for sustainable energy applications. The research focuses on synthesizing and characterizing new materials with enhanced properties for energy conversion and storage. The project includes the development of prototype devices and evaluation of their performance under various conditions.",
          objectives: [
            "Synthesize novel nanomaterials with enhanced energy conversion efficiency",
            "Characterize the structural and electronic properties of the synthesized materials",
            "Develop prototype devices for energy harvesting and storage",
            "Evaluate the performance and stability of the developed materials and devices",
          ],
          methodology:
            "The research will employ a multi-disciplinary approach combining materials synthesis, characterization, and device fabrication. Advanced techniques including XRD, SEM, TEM, and electrochemical analysis will be used.",
          expectedOutcomes: [
            "3-5 high-impact research publications",
            "1-2 patent applications",
            "Training of 2-3 PhD students",
            "Development of prototype energy devices",
          ],
          keywords: ["Nanomaterials", "Energy Storage", "Solar Cells", "Sustainability", "Materials Science"],
          researchAreas: ["Materials Science", "Nanotechnology", "Renewable Energy", "Electrochemistry"],
          collaboratingInstitutions: ["IIT Delhi", "CSIR-NCL", "University of California"],
          equipmentRequired: ["XRD Machine", "SEM", "Electrochemical Workstation", "Furnace"],
          ethicalClearance: true,
          ethicalClearanceNumber: "EC/2022/CHEM/001",
          progress: 65,
          milestones: [
            {
              title: "Literature Review and Material Selection",
              description: "Complete comprehensive literature review and select target materials",
              targetDate: "2022-12-31",
              status: "Completed",
            },
            {
              title: "Synthesis and Characterization",
              description: "Synthesize nanomaterials and perform basic characterization",
              targetDate: "2023-06-30",
              status: "Completed",
            },
            {
              title: "Device Fabrication",
              description: "Fabricate prototype energy devices",
              targetDate: "2024-03-31",
              status: "In Progress",
            },
          ],
          publications: [
            {
              title: "Novel Synthesis Route for High-Performance Nanomaterials",
              journal: "Advanced Materials",
              year: "2023",
              authors: "R. Kumar, M. Singh, A. Patel",
            },
            {
              title: "Characterization of Energy Storage Properties",
              journal: "Journal of Power Sources",
              year: "2023",
              authors: "R. Kumar, P. Sharma, M. Singh",
            },
          ],
          patents: [
            {
              title: "Method for Synthesizing High-Efficiency Nanomaterials",
              applicationNumber: "202341001234",
              status: "Filed",
              filingDate: "2023-08-15",
            },
          ],
        }

        setFormData(mockData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading research data:", error)
        toast({
          title: "Error",
          description: "Failed to load research data",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadResearchData()
    }
  }, [params.id, toast])

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required"
    }

    if (!formData.principalInvestigator.trim()) {
      newErrors.principalInvestigator = "Principal investigator is required"
    }

    if (!formData.fundingAgency) {
      newErrors.fundingAgency = "Funding agency is required"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Project description is required"
    }

    if (formData.grantSanctioned < 0) {
      newErrors.grantSanctioned = "Grant amount cannot be negative"
    }

    if (formData.grantReceived < 0) {
      newErrors.grantReceived = "Received amount cannot be negative"
    }

    if (formData.grantReceived > formData.grantSanctioned) {
      newErrors.grantReceived = "Received amount cannot exceed sanctioned amount"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Mock API call - replace with actual implementation
      console.log("Updating research project:", formData)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success",
        description: "Research project updated successfully",
      })

      setHasChanges(false)

      // Navigate back to research detail page
      setIsNavigating(true)
      router.push(`/teacher/research/${params.id}`)
    } catch (error) {
      console.error("Error updating research project:", error)
      toast({
        title: "Error",
        description: "Failed to update research project",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle navigation back
  const handleBack = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        setIsNavigating(true)
        router.push(`/teacher/research/${params.id}`)
      }
    } else {
      setIsNavigating(true)
      router.push(`/teacher/research/${params.id}`)
    }
  }

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Dynamic array management functions
  const addCoInvestigator = () => {
    if (newCoInvestigator.trim() && !formData.coInvestigators.includes(newCoInvestigator.trim())) {
      handleFieldChange("coInvestigators", [...formData.coInvestigators, newCoInvestigator.trim()])
      setNewCoInvestigator("")
    }
  }

  const removeCoInvestigator = (investigator: string) => {
    handleFieldChange(
      "coInvestigators",
      formData.coInvestigators.filter((inv) => inv !== investigator),
    )
  }

  const addObjective = () => {
    if (newObjective.trim() && !formData.objectives.includes(newObjective.trim())) {
      handleFieldChange("objectives", [...formData.objectives, newObjective.trim()])
      setNewObjective("")
    }
  }

  const removeObjective = (objective: string) => {
    handleFieldChange(
      "objectives",
      formData.objectives.filter((obj) => obj !== objective),
    )
  }

  const addOutcome = () => {
    if (newOutcome.trim() && !formData.expectedOutcomes.includes(newOutcome.trim())) {
      handleFieldChange("expectedOutcomes", [...formData.expectedOutcomes, newOutcome.trim()])
      setNewOutcome("")
    }
  }

  const removeOutcome = (outcome: string) => {
    handleFieldChange(
      "expectedOutcomes",
      formData.expectedOutcomes.filter((out) => out !== outcome),
    )
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      handleFieldChange("keywords", [...formData.keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    handleFieldChange(
      "keywords",
      formData.keywords.filter((k) => k !== keyword),
    )
  }

  const addResearchArea = () => {
    if (newResearchArea.trim() && !formData.researchAreas.includes(newResearchArea.trim())) {
      handleFieldChange("researchAreas", [...formData.researchAreas, newResearchArea.trim()])
      setNewResearchArea("")
    }
  }

  const removeResearchArea = (area: string) => {
    handleFieldChange(
      "researchAreas",
      formData.researchAreas.filter((a) => a !== area),
    )
  }

  const addInstitution = () => {
    if (newInstitution.trim() && !formData.collaboratingInstitutions.includes(newInstitution.trim())) {
      handleFieldChange("collaboratingInstitutions", [...formData.collaboratingInstitutions, newInstitution.trim()])
      setNewInstitution("")
    }
  }

  const removeInstitution = (institution: string) => {
    handleFieldChange(
      "collaboratingInstitutions",
      formData.collaboratingInstitutions.filter((inst) => inst !== institution),
    )
  }

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipmentRequired.includes(newEquipment.trim())) {
      handleFieldChange("equipmentRequired", [...formData.equipmentRequired, newEquipment.trim()])
      setNewEquipment("")
    }
  }

  const removeEquipment = (equipment: string) => {
    handleFieldChange(
      "equipmentRequired",
      formData.equipmentRequired.filter((eq) => eq !== equipment),
    )
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading research data...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack} disabled={isNavigating}>
            {isNavigating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
            Back to Project
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Research Project</h1>
            <p className="text-muted-foreground">Project ID: {formData.projid}</p>
          </div>
        </div>

        {/* Unsaved changes alert */}
        {hasChanges && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You have unsaved changes. Don't forget to save your work.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Textarea
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      placeholder="Enter the full title of the research project"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="principalInvestigator">Principal Investigator *</Label>
                      <Input
                        id="principalInvestigator"
                        value={formData.principalInvestigator}
                        onChange={(e) => handleFieldChange("principalInvestigator", e.target.value)}
                        placeholder="Principal investigator name"
                        className={errors.principalInvestigator ? "border-red-500" : ""}
                      />
                      {errors.principalInvestigator && (
                        <p className="text-sm text-red-500 mt-1">{errors.principalInvestigator}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleFieldChange("department", e.target.value)}
                        placeholder="Department name"
                        className={errors.department ? "border-red-500" : ""}
                      />
                      {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faculty">Faculty</Label>
                      <Select value={formData.faculty} onValueChange={(value) => handleFieldChange("faculty", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faculty of Science">Faculty of Science</SelectItem>
                          <SelectItem value="Faculty of Technology and Engineering">
                            Faculty of Technology and Engineering
                          </SelectItem>
                          <SelectItem value="Faculty of Arts">Faculty of Arts</SelectItem>
                          <SelectItem value="Faculty of Commerce">Faculty of Commerce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="projLevel">Project Level</Label>
                      <Select
                        value={formData.projLevel}
                        onValueChange={(value) => handleFieldChange("projLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">International</SelectItem>
                          <SelectItem value="2">National</SelectItem>
                          <SelectItem value="3">State</SelectItem>
                          <SelectItem value="4">University</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Project Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleFieldChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Proposed</SelectItem>
                          <SelectItem value="1">Ongoing</SelectItem>
                          <SelectItem value="2">Completed</SelectItem>
                          <SelectItem value="3">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="projNature">Project Nature</Label>
                      <Select
                        value={formData.projNature}
                        onValueChange={(value) => handleFieldChange("projNature", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project nature" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Basic Research</SelectItem>
                          <SelectItem value="2">Applied Research</SelectItem>
                          <SelectItem value="3">Development</SelectItem>
                          <SelectItem value="4">Consultancy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Co-Investigators */}
                  <div>
                    <Label>Co-Investigators</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add co-investigator name"
                        value={newCoInvestigator}
                        onChange={(e) => setNewCoInvestigator(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCoInvestigator())}
                      />
                      <Button type="button" onClick={addCoInvestigator}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.coInvestigators.map((investigator, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {investigator}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeCoInvestigator(investigator)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funding Tab */}
            <TabsContent value="funding">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fundingAgency">Funding Agency *</Label>
                    <Select
                      value={formData.fundingAgency}
                      onValueChange={(value) => handleFieldChange("fundingAgency", value)}
                    >
                      <SelectTrigger className={errors.fundingAgency ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select funding agency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">UGC</SelectItem>
                        <SelectItem value="2">CSIR</SelectItem>
                        <SelectItem value="3">DST</SelectItem>
                        <SelectItem value="4">ICMR</SelectItem>
                        <SelectItem value="5">DRDO</SelectItem>
                        <SelectItem value="6">Industry</SelectItem>
                        <SelectItem value="7">International</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.fundingAgency && <p className="text-sm text-red-500 mt-1">{errors.fundingAgency}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grantSanctioned">Grant Sanctioned (INR)</Label>
                      <Input
                        id="grantSanctioned"
                        type="number"
                        value={formData.grantSanctioned}
                        onChange={(e) => handleFieldChange("grantSanctioned", Number.parseInt(e.target.value) || 0)}
                        placeholder="Enter sanctioned amount"
                        className={errors.grantSanctioned ? "border-red-500" : ""}
                      />
                      {errors.grantSanctioned && <p className="text-sm text-red-500 mt-1">{errors.grantSanctioned}</p>}
                    </div>

                    <div>
                      <Label htmlFor="grantReceived">Grant Received (INR)</Label>
                      <Input
                        id="grantReceived"
                        type="number"
                        value={formData.grantReceived}
                        onChange={(e) => handleFieldChange("grantReceived", Number.parseInt(e.target.value) || 0)}
                        placeholder="Enter received amount"
                        className={errors.grantReceived ? "border-red-500" : ""}
                      />
                      {errors.grantReceived && <p className="text-sm text-red-500 mt-1">{errors.grantReceived}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleFieldChange("startDate", e.target.value)}
                        className={errors.startDate ? "border-red-500" : ""}
                      />
                      {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleFieldChange("endDate", e.target.value)}
                        className={errors.endDate ? "border-red-500" : ""}
                      />
                      {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (Months)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleFieldChange("duration", Number.parseInt(e.target.value) || 0)}
                        placeholder="Project duration"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="progress">Project Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => handleFieldChange("progress", Number.parseInt(e.target.value) || 0)}
                        placeholder="Progress percentage"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="ethicalClearance"
                        checked={formData.ethicalClearance}
                        onChange={(e) => handleFieldChange("ethicalClearance", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="ethicalClearance">Ethical Clearance Required</Label>
                    </div>
                  </div>

                  {formData.ethicalClearance && (
                    <div>
                      <Label htmlFor="ethicalClearanceNumber">Ethical Clearance Number</Label>
                      <Input
                        id="ethicalClearanceNumber"
                        value={formData.ethicalClearanceNumber}
                        onChange={(e) => handleFieldChange("ethicalClearanceNumber", e.target.value)}
                        placeholder="Enter clearance number"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      placeholder="Provide a detailed description of the research project"
                      rows={6}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Methodology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.methodology}
                      onChange={(e) => handleFieldChange("methodology", e.target.value)}
                      placeholder="Describe the research methodology and approach"
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Objectives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add project objective"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
                      />
                      <Button type="button" onClick={addObjective}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 text-sm">{objective}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={() => removeObjective(objective)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expected Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add expected outcome"
                        value={newOutcome}
                        onChange={(e) => setNewOutcome(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOutcome())}
                      />
                      <Button type="button" onClick={addOutcome}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.expectedOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 text-sm">{outcome}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={() => removeOutcome(outcome)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Keywords & Research Areas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Keywords</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add keyword"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                        />
                        <Button type="button" onClick={addKeyword}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {keyword}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Research Areas</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add research area"
                          value={newResearchArea}
                          onChange={(e) => setNewResearchArea(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResearchArea())}
                        />
                        <Button type="button" onClick={addResearchArea}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.researchAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {area}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeResearchArea(area)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Collaborating Institutions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add collaborating institution"
                        value={newInstitution}
                        onChange={(e) => setNewInstitution(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInstitution())}
                      />
                      <Button type="button" onClick={addInstitution}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.collaboratingInstitutions.map((institution, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 text-sm">{institution}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={() => removeInstitution(institution)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Required</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add required equipment"
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                      />
                      <Button type="button" onClick={addEquipment}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.equipmentRequired.map((equipment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 text-sm">{equipment}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={() => removeEquipment(equipment)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Outcomes Tab */}
            <TabsContent value="outcomes">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formData.publications.map((publication, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{publication.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {publication.journal} • {publication.year} • {publication.authors}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Patents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formData.patents.map((patent, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{patent.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Application No: {patent.applicationNumber} • Status: {patent.status} • Filed:{" "}
                            {patent.filingDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formData.milestones.map((milestone, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <Badge
                              variant={
                                milestone.status === "Completed"
                                  ? "default"
                                  : milestone.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {milestone.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          <p className="text-sm text-muted-foreground">Target Date: {milestone.targetDate}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
  )
}
