"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/api/auth/auth-provider"

interface ResearchProjectFormProps {
  initialData?: any; 
  project?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function ResearchProjectForm({ project, onSuccess }: ResearchProjectFormProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: project?.title || "",
    principalInvestigator: project?.principalInvestigator || user?.name || "",
    fundingAgency: project?.fundingAgency || "",
    fundingSource: project?.fundingSource || "",
    grantAmount: project?.grantAmount || "",
    startDate: project?.startDate || "",
    endDate: project?.endDate || "",
    duration: project?.duration || "",
    status: project?.status || "proposed",
    level: project?.level || "university",
    category: project?.category || "",
    description: project?.description || "",
    department: project?.department || user?.department || "",
    faculty: project?.faculty || user?.faculty || "",
  })

  // Co-investigators management
  const [coInvestigators, setCoInvestigators] = useState<string[]>(project?.coInvestigators || [])
  const [newCoInvestigator, setNewCoInvestigator] = useState("")

  // Keywords management
  const [keywords, setKeywords] = useState<string[]>(project?.keywords || [])
  const [newKeyword, setNewKeyword] = useState("")

  // Objectives management
  const [objectives, setObjectives] = useState<string[]>(project?.objectives || [])
  const [newObjective, setNewObjective] = useState("")

  const addCoInvestigator = () => {
    if (newCoInvestigator.trim() && !coInvestigators.includes(newCoInvestigator.trim())) {
      setCoInvestigators([...coInvestigators, newCoInvestigator.trim()])
      setNewCoInvestigator("")
    }
  }

  const removeCoInvestigator = (investigator: string) => {
    setCoInvestigators(coInvestigators.filter((inv) => inv !== investigator))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const addObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      setObjectives([...objectives, newObjective.trim()])
      setNewObjective("")
    }
  }

  const removeObjective = (objective: string) => {
    setObjectives(objectives.filter((obj) => obj !== objective))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock API call - replace with actual implementation
      const projectData = {
        ...formData,
        coInvestigators,
        keywords,
        objectives,
        addedBy: user?.name,
        addedDate: new Date().toISOString(),
      }

      console.log("Saving research project:", projectData)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: project ? "Research project updated successfully" : "Research project added successfully",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save research project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Textarea
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter the full title of the research project"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="principalInvestigator">Principal Investigator *</Label>
              <Input
                id="principalInvestigator"
                value={formData.principalInvestigator}
                onChange={(e) => setFormData({ ...formData, principalInvestigator: e.target.value })}
                placeholder="Principal investigator name"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Research Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Computer Science, Physics"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Project Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Project Level *</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Information */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fundingAgency">Funding Agency *</Label>
              <Input
                id="fundingAgency"
                value={formData.fundingAgency}
                onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
                placeholder="e.g., DST, CSIR, UGC"
                required
              />
            </div>

            <div>
              <Label htmlFor="fundingSource">Funding Source Type</Label>
              <Select
                value={formData.fundingSource}
                onValueChange={(value) => setFormData({ ...formData, fundingSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Major">Major Project</SelectItem>
                  <SelectItem value="Minor">Minor Project</SelectItem>
                  <SelectItem value="University/College Sponsored">University/College Sponsored</SelectItem>
                  <SelectItem value="Industry Sponsored">Industry Sponsored</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="grantAmount">Grant Amount (INR)</Label>
            <Input
              id="grantAmount"
              type="number"
              value={formData.grantAmount}
              onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })}
              placeholder="Enter grant amount"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (Months)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Project duration"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Co-Investigators */}
      <Card>
        <CardHeader>
          <CardTitle>Co-Investigators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
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
          <div className="flex flex-wrap gap-2">
            {coInvestigators.map((investigator, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {investigator}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeCoInvestigator(investigator)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Description */}
      <Card>
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide a detailed description of the research project, its scope, methodology, and expected outcomes"
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Objectives */}
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
            {objectives.map((objective, index) => (
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

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
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
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {keyword}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department & Faculty */}
      <Card>
        <CardHeader>
          <CardTitle>Institutional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Department name"
              />
            </div>
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Select value={formData.faculty} onValueChange={(value) => setFormData({ ...formData, faculty: value })}>
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
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : project ? "Update Project" : "Add Project"}
        </Button>
      </div>
    </form>
  )
}
