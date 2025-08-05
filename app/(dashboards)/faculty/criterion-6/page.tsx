"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, FileText, Building, Users } from "lucide-react"

interface Criterion6Data {
  facultyName: string
  selectedYear: string
  visionMission: string
  managementInfoSystem: string
  curriculumDevelopment: string
  teachingLearning: string
  examinationEvaluation: string
  researchDevelopment: string
  libraryICT: string
  humanResourceManagement: string
  facultyStaffRecruitment: string
  industryInteraction: string
  studentAdmission: string
  teachingWelfare: string
  nonTeachingWelfare: string
  studentWelfare: string
  corpusFund: string
  financialAudit: string
  academicAuditExternal: string
  academicAuditExternalAgency: string
  administrativeAuditExternal: string
  administrativeAuditExternalAgency: string
  academicAuditInternal: string
  academicAuditInternalAuthority: string
  administrativeAuditInternal: string
  administrativeAuditInternalAuthority: string
  ugResults: string
  pgResults: string
  examinationReforms: string
  autonomyEfforts: string
  alumniActivities: string
  parentTeacherActivities: string
  supportStaffDevelopment: string
  ecoFriendlyInitiatives: string
}

export default function FacultyCriterion6Page() {
  const [formData, setFormData] = useState<Criterion6Data>({
    facultyName: "",
    selectedYear: "",
    visionMission: "",
    managementInfoSystem: "",
    curriculumDevelopment: "",
    teachingLearning: "",
    examinationEvaluation: "",
    researchDevelopment: "",
    libraryICT: "",
    humanResourceManagement: "",
    facultyStaffRecruitment: "",
    industryInteraction: "",
    studentAdmission: "",
    teachingWelfare: "",
    nonTeachingWelfare: "",
    studentWelfare: "",
    corpusFund: "",
    financialAudit: "",
    academicAuditExternal: "",
    academicAuditExternalAgency: "",
    administrativeAuditExternal: "",
    administrativeAuditExternalAgency: "",
    academicAuditInternal: "",
    academicAuditInternalAuthority: "",
    administrativeAuditInternal: "",
    administrativeAuditInternalAuthority: "",
    ugResults: "",
    pgResults: "",
    examinationReforms: "",
    autonomyEfforts: "",
    alumniActivities: "",
    parentTeacherActivities: "",
    supportStaffDevelopment: "",
    ecoFriendlyInitiatives: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Criterion VI data saved:", formData)
      alert("Criterion VI form data saved successfully!")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Error saving data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Criterion6Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Criterion - VI Form</h1>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Form"}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Form Status</p>
                  <p className="text-2xl font-bold text-gray-900">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Governance</p>
                  <p className="text-2xl font-bold text-gray-900">Leadership</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Management</p>
                  <p className="text-2xl font-bold text-gray-900">Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Criterion VI - Governance, Leadership and Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facultyName">Faculty Name</Label>
                <Input
                  id="facultyName"
                  value={formData.facultyName}
                  onChange={(e) => handleInputChange("facultyName", e.target.value)}
                  placeholder="Enter faculty name"
                />
              </div>

              <div>
                <Label htmlFor="selectedYear">Select Year</Label>
                <Select
                  value={formData.selectedYear}
                  onValueChange={(value) => handleInputChange("selectedYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}-{Number.parseInt(year) + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 6.1 Vision and Mission */}
            <div>
              <Label htmlFor="visionMission">6.1 State the Vision and Mission of the institution</Label>
              <Textarea
                id="visionMission"
                value={formData.visionMission}
                onChange={(e) => handleInputChange("visionMission", e.target.value)}
                placeholder="Enter the vision and mission of the institution..."
                rows={4}
              />
            </div>

            {/* 6.2 Management Information System */}
            <div>
              <Label>6.2 Does the institution has a Management Information System</Label>
              <RadioGroup
                value={formData.managementInfoSystem}
                onValueChange={(value) => handleInputChange("managementInfoSystem", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mis-yes" />
                  <Label htmlFor="mis-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mis-no" />
                  <Label htmlFor="mis-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 6.3 Quality Improvement Strategies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                6.3 Quality improvement strategies adopted by the institution for each of the following:
              </h3>

              <div>
                <Label htmlFor="curriculumDevelopment">6.3.1 Curriculum Development</Label>
                <Textarea
                  id="curriculumDevelopment"
                  value={formData.curriculumDevelopment}
                  onChange={(e) => handleInputChange("curriculumDevelopment", e.target.value)}
                  placeholder="Describe curriculum development strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="teachingLearning">6.3.2 Teaching and Learning</Label>
                <Textarea
                  id="teachingLearning"
                  value={formData.teachingLearning}
                  onChange={(e) => handleInputChange("teachingLearning", e.target.value)}
                  placeholder="Describe teaching and learning strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="examinationEvaluation">6.3.3 Examination and Evaluation</Label>
                <Textarea
                  id="examinationEvaluation"
                  value={formData.examinationEvaluation}
                  onChange={(e) => handleInputChange("examinationEvaluation", e.target.value)}
                  placeholder="Describe examination and evaluation strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="researchDevelopment">6.3.4 Research and Development</Label>
                <Textarea
                  id="researchDevelopment"
                  value={formData.researchDevelopment}
                  onChange={(e) => handleInputChange("researchDevelopment", e.target.value)}
                  placeholder="Describe research and development strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="libraryICT">6.3.5 Library, ICT and Physical infrastructure / instrumentation</Label>
                <Textarea
                  id="libraryICT"
                  value={formData.libraryICT}
                  onChange={(e) => handleInputChange("libraryICT", e.target.value)}
                  placeholder="Describe library, ICT and infrastructure strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="humanResourceManagement">6.3.6 Human Resource Management</Label>
                <Textarea
                  id="humanResourceManagement"
                  value={formData.humanResourceManagement}
                  onChange={(e) => handleInputChange("humanResourceManagement", e.target.value)}
                  placeholder="Describe human resource management strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="facultyStaffRecruitment">6.3.7 Faculty and Staff recruitment</Label>
                <Textarea
                  id="facultyStaffRecruitment"
                  value={formData.facultyStaffRecruitment}
                  onChange={(e) => handleInputChange("facultyStaffRecruitment", e.target.value)}
                  placeholder="Describe faculty and staff recruitment strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="industryInteraction">6.3.8 Industry Interaction / Collaboration</Label>
                <Textarea
                  id="industryInteraction"
                  value={formData.industryInteraction}
                  onChange={(e) => handleInputChange("industryInteraction", e.target.value)}
                  placeholder="Describe industry interaction and collaboration strategies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="studentAdmission">6.3.9 Admission of Students</Label>
                <Textarea
                  id="studentAdmission"
                  value={formData.studentAdmission}
                  onChange={(e) => handleInputChange("studentAdmission", e.target.value)}
                  placeholder="Describe student admission strategies..."
                  rows={3}
                />
              </div>
            </div>

            {/* 6.4 Welfare Schemes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">6.4 Welfare Scheme for</h3>

              <div>
                <Label htmlFor="teachingWelfare">Teaching</Label>
                <Textarea
                  id="teachingWelfare"
                  value={formData.teachingWelfare}
                  onChange={(e) => handleInputChange("teachingWelfare", e.target.value)}
                  placeholder="Describe welfare schemes for teaching staff..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="nonTeachingWelfare">Non teaching</Label>
                <Textarea
                  id="nonTeachingWelfare"
                  value={formData.nonTeachingWelfare}
                  onChange={(e) => handleInputChange("nonTeachingWelfare", e.target.value)}
                  placeholder="Describe welfare schemes for non-teaching staff..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="studentWelfare">Students</Label>
                <Textarea
                  id="studentWelfare"
                  value={formData.studentWelfare}
                  onChange={(e) => handleInputChange("studentWelfare", e.target.value)}
                  placeholder="Describe welfare schemes for students..."
                  rows={3}
                />
              </div>
            </div>

            {/* 6.5 Corpus Fund */}
            <div>
              <Label htmlFor="corpusFund">6.5 Total corpus fund generated (In INR Lakhs)</Label>
              <Input
                id="corpusFund"
                type="number"
                value={formData.corpusFund}
                onChange={(e) => handleInputChange("corpusFund", e.target.value)}
                placeholder="Enter corpus fund amount in lakhs"
              />
            </div>

            {/* 6.6 Financial Audit */}
            <div>
              <Label>6.6 Whether annual financial audit has been done?</Label>
              <RadioGroup
                value={formData.financialAudit}
                onValueChange={(value) => handleInputChange("financialAudit", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="audit-yes" />
                  <Label htmlFor="audit-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="audit-no" />
                  <Label htmlFor="audit-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 6.7 Academic and Administrative Audit */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                6.7 Whether Academic and Administrative Audit(AAA) has been done?
              </h3>

              <div className="space-y-4">
                <h4 className="font-medium">External:</h4>

                <div className="space-y-2">
                  <Label>Audit Type - Academic</Label>
                  <RadioGroup
                    value={formData.academicAuditExternal}
                    onValueChange={(value) => handleInputChange("academicAuditExternal", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="ext-academic-yes" />
                      <Label htmlFor="ext-academic-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="ext-academic-no" />
                      <Label htmlFor="ext-academic-no">No</Label>
                    </div>
                  </RadioGroup>

                  {formData.academicAuditExternal === "yes" && (
                    <div>
                      <Label htmlFor="academicAuditExternalAgency">Agency</Label>
                      <Input
                        id="academicAuditExternalAgency"
                        value={formData.academicAuditExternalAgency}
                        onChange={(e) => handleInputChange("academicAuditExternalAgency", e.target.value)}
                        placeholder="Enter agency name"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Audit Type - Administrative</Label>
                  <RadioGroup
                    value={formData.administrativeAuditExternal}
                    onValueChange={(value) => handleInputChange("administrativeAuditExternal", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="ext-admin-yes" />
                      <Label htmlFor="ext-admin-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="ext-admin-no" />
                      <Label htmlFor="ext-admin-no">No</Label>
                    </div>
                  </RadioGroup>

                  {formData.administrativeAuditExternal === "yes" && (
                    <div>
                      <Label htmlFor="administrativeAuditExternalAgency">Agency</Label>
                      <Input
                        id="administrativeAuditExternalAgency"
                        value={formData.administrativeAuditExternalAgency}
                        onChange={(e) => handleInputChange("administrativeAuditExternalAgency", e.target.value)}
                        placeholder="Enter agency name"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Internal:</h4>

                <div className="space-y-2">
                  <Label>Audit Type - Academic</Label>
                  <RadioGroup
                    value={formData.academicAuditInternal}
                    onValueChange={(value) => handleInputChange("academicAuditInternal", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="int-academic-yes" />
                      <Label htmlFor="int-academic-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="int-academic-no" />
                      <Label htmlFor="int-academic-no">No</Label>
                    </div>
                  </RadioGroup>

                  {formData.academicAuditInternal === "yes" && (
                    <div>
                      <Label htmlFor="academicAuditInternalAuthority">Authority</Label>
                      <Input
                        id="academicAuditInternalAuthority"
                        value={formData.academicAuditInternalAuthority}
                        onChange={(e) => handleInputChange("academicAuditInternalAuthority", e.target.value)}
                        placeholder="Enter authority name"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Audit Type - Administrative</Label>
                  <RadioGroup
                    value={formData.administrativeAuditInternal}
                    onValueChange={(value) => handleInputChange("administrativeAuditInternal", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="int-admin-yes" />
                      <Label htmlFor="int-admin-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="int-admin-no" />
                      <Label htmlFor="int-admin-no">No</Label>
                    </div>
                  </RadioGroup>

                  {formData.administrativeAuditInternal === "yes" && (
                    <div>
                      <Label htmlFor="administrativeAuditInternalAuthority">Authority</Label>
                      <Input
                        id="administrativeAuditInternalAuthority"
                        value={formData.administrativeAuditInternalAuthority}
                        onChange={(e) => handleInputChange("administrativeAuditInternalAuthority", e.target.value)}
                        placeholder="Enter authority name"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6.8 Results Declaration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                6.8 Does the University / Autonomous College declares results within 30 days?
              </h3>

              <div>
                <Label>For UG Programmes</Label>
                <RadioGroup
                  value={formData.ugResults}
                  onValueChange={(value) => handleInputChange("ugResults", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="ug-yes" />
                    <Label htmlFor="ug-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ug-no" />
                    <Label htmlFor="ug-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>For PG Programmes</Label>
                <RadioGroup
                  value={formData.pgResults}
                  onValueChange={(value) => handleInputChange("pgResults", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pg-yes" />
                    <Label htmlFor="pg-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pg-no" />
                    <Label htmlFor="pg-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Remaining fields */}
            <div>
              <Label htmlFor="examinationReforms">
                6.9 What efforts are made by the University / Autonomous College for Examination Reforms?
              </Label>
              <Textarea
                id="examinationReforms"
                value={formData.examinationReforms}
                onChange={(e) => handleInputChange("examinationReforms", e.target.value)}
                placeholder="Describe examination reform efforts..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="autonomyEfforts">
                6.10 What efforts are made by the University to promote autonomy in the affiliated / constituent
                colleges?
              </Label>
              <Textarea
                id="autonomyEfforts"
                value={formData.autonomyEfforts}
                onChange={(e) => handleInputChange("autonomyEfforts", e.target.value)}
                placeholder="Describe autonomy promotion efforts..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="alumniActivities">6.11 Activities and support from the Alumni Association</Label>
              <Textarea
                id="alumniActivities"
                value={formData.alumniActivities}
                onChange={(e) => handleInputChange("alumniActivities", e.target.value)}
                placeholder="Describe alumni association activities and support..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="parentTeacherActivities">
                6.12 Activities and support from the Parent-Teacher Association
              </Label>
              <Textarea
                id="parentTeacherActivities"
                value={formData.parentTeacherActivities}
                onChange={(e) => handleInputChange("parentTeacherActivities", e.target.value)}
                placeholder="Describe parent-teacher association activities..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="supportStaffDevelopment">6.13 Development programmes for support staff</Label>
              <Textarea
                id="supportStaffDevelopment"
                value={formData.supportStaffDevelopment}
                onChange={(e) => handleInputChange("supportStaffDevelopment", e.target.value)}
                placeholder="Describe development programmes for support staff..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="ecoFriendlyInitiatives">
                6.14 Initiatives taken by the institution to make the campus eco-friendly
              </Label>
              <Textarea
                id="ecoFriendlyInitiatives"
                value={formData.ecoFriendlyInitiatives}
                onChange={(e) => handleInputChange("ecoFriendlyInitiatives", e.target.value)}
                placeholder="Describe eco-friendly initiatives..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline">Reset Form</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save & Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
