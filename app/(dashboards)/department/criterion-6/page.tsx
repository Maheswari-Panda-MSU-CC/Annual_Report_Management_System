"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

export default function DepartmentCriterion6() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    facultyName: "Dr. John Smith",
    departmentName: "Computer Science",
    year: "2023-24",
    visionMission: "To provide quality education and foster innovation in computer science and technology.",
    managementSystem: "yes",
    curriculumDevelopment: "Regular curriculum updates based on industry requirements and academic standards.",
    teachingLearning: "Interactive teaching methods with practical implementation and project-based learning.",
    examinationEvaluation: "Continuous assessment with internal and external evaluation mechanisms.",
    researchDevelopment: "Encouraging faculty and student research through funding and infrastructure support.",
    libraryICT: "Modern library with digital resources and advanced ICT infrastructure.",
    humanResource: "Comprehensive HR policies for faculty development and performance management.",
    facultyRecruitment: "Merit-based recruitment following university guidelines and standards.",
    industryInteraction: "Regular industry collaborations and internship programs for students.",
    studentAdmission: "Transparent admission process based on merit and reservation policies.",
    teachingWelfare: "Health insurance, professional development, and housing facilities.",
    nonTeachingWelfare: "Medical benefits, training programs, and career advancement opportunities.",
    studentWelfare: "Scholarships, counselling services, and extracurricular support.",
    corpusFund: "25.50",
    financialAudit: "yes",
    externalAcademicAudit: "yes",
    externalAcademicAgency: "NAAC",
    externalAdministrativeAudit: "yes",
    externalAdministrativeAgency: "State Audit Department",
    internalAcademicAudit: "yes",
    internalAcademicAuthority: "Internal Quality Assurance Cell",
    internalAdministrativeAudit: "yes",
    internalAdministrativeAuthority: "University Administration",
    ugResults: "yes",
    pgResults: "yes",
    examinationReforms: "Implementation of online examination system and continuous assessment methods.",
    autonomyPromotion: "Providing academic freedom and encouraging innovative teaching methods.",
    alumniActivities: "Regular alumni meets, mentorship programs, and career guidance sessions.",
    parentTeacherActivities: "Monthly meetings, academic progress discussions, and feedback sessions.",
    supportStaffDevelopment: "Regular training programs and skill development workshops.",
    ecoFriendlyInitiatives: "Solar panels, waste management, and green campus initiatives.",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Criterion 6</h1>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criterion - VI Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facultyName">Faculty Name</Label>
                  <Input
                    id="facultyName"
                    value={formData.facultyName}
                    onChange={(e) => handleInputChange("facultyName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={formData.departmentName}
                    onChange={(e) => handleInputChange("departmentName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="year">Select Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleInputChange("year", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2022-23">2022-23</SelectItem>
                    <SelectItem value="2021-22">2021-22</SelectItem>
                    <SelectItem value="2020-21">2020-21</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visionMission">6.1 State the Vision and Mission of the institution</Label>
                <Textarea
                  id="visionMission"
                  value={formData.visionMission}
                  onChange={(e) => handleInputChange("visionMission", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>6.2 Does the institution has a Management Information System</Label>
                <RadioGroup
                  value={formData.managementSystem}
                  onValueChange={(value) => handleInputChange("managementSystem", value)}
                  disabled={!isEditing}
                  className="flex flex-row space-x-4 mt-2"
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

              <div>
                <Label className="text-base font-semibold">
                  6.3 Quality improvement strategies adopted by the institution for each of the following:
                </Label>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="curriculumDevelopment">6.3.1 Curriculum Development</Label>
                    <Textarea
                      id="curriculumDevelopment"
                      value={formData.curriculumDevelopment}
                      onChange={(e) => handleInputChange("curriculumDevelopment", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teachingLearning">6.3.2 Teaching and Learning</Label>
                    <Textarea
                      id="teachingLearning"
                      value={formData.teachingLearning}
                      onChange={(e) => handleInputChange("teachingLearning", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="examinationEvaluation">6.3.3 Examination and Evaluation</Label>
                    <Textarea
                      id="examinationEvaluation"
                      value={formData.examinationEvaluation}
                      onChange={(e) => handleInputChange("examinationEvaluation", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="researchDevelopment">6.3.4 Research and Development</Label>
                    <Textarea
                      id="researchDevelopment"
                      value={formData.researchDevelopment}
                      onChange={(e) => handleInputChange("researchDevelopment", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="libraryICT">6.3.5 Library, ICT and Physical infrastructure / instrumentation</Label>
                    <Textarea
                      id="libraryICT"
                      value={formData.libraryICT}
                      onChange={(e) => handleInputChange("libraryICT", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="humanResource">6.3.6 Human Resource Management</Label>
                    <Textarea
                      id="humanResource"
                      value={formData.humanResource}
                      onChange={(e) => handleInputChange("humanResource", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facultyRecruitment">6.3.7 Faculty and Staff recruitment</Label>
                    <Textarea
                      id="facultyRecruitment"
                      value={formData.facultyRecruitment}
                      onChange={(e) => handleInputChange("facultyRecruitment", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industryInteraction">6.3.8 Industry Interaction / Collaboration</Label>
                    <Textarea
                      id="industryInteraction"
                      value={formData.industryInteraction}
                      onChange={(e) => handleInputChange("industryInteraction", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentAdmission">6.3.9 Admission of Students</Label>
                    <Textarea
                      id="studentAdmission"
                      value={formData.studentAdmission}
                      onChange={(e) => handleInputChange("studentAdmission", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">6.4 Welfare Scheme for</Label>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="teachingWelfare">Teaching</Label>
                    <Textarea
                      id="teachingWelfare"
                      value={formData.teachingWelfare}
                      onChange={(e) => handleInputChange("teachingWelfare", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nonTeachingWelfare">Non teaching</Label>
                    <Textarea
                      id="nonTeachingWelfare"
                      value={formData.nonTeachingWelfare}
                      onChange={(e) => handleInputChange("nonTeachingWelfare", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentWelfare">Students</Label>
                    <Textarea
                      id="studentWelfare"
                      value={formData.studentWelfare}
                      onChange={(e) => handleInputChange("studentWelfare", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="corpusFund">6.5 Total corpus fund generated (In INR Lakhs)</Label>
                <Input
                  id="corpusFund"
                  value={formData.corpusFund}
                  onChange={(e) => handleInputChange("corpusFund", e.target.value)}
                  disabled={!isEditing}
                  type="number"
                  step="0.01"
                />
              </div>

              <div>
                <Label>6.6 Whether annual financial audit has been done?</Label>
                <RadioGroup
                  value={formData.financialAudit}
                  onValueChange={(value) => handleInputChange("financialAudit", value)}
                  disabled={!isEditing}
                  className="flex flex-row space-x-4 mt-2"
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

              <div>
                <Label className="text-base font-semibold">
                  6.7 Whether Academic and Administrative Audit(AAA) has been done?
                </Label>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="font-medium">External:</Label>

                    <div className="space-y-3 mt-2">
                      <div>
                        <Label>Audit Type-Academic</Label>
                        <RadioGroup
                          value={formData.externalAcademicAudit}
                          onValueChange={(value) => handleInputChange("externalAcademicAudit", value)}
                          disabled={!isEditing}
                          className="flex flex-row space-x-4 mt-1"
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
                        {formData.externalAcademicAudit === "yes" && (
                          <div className="mt-2">
                            <Label htmlFor="externalAcademicAgency">Agency</Label>
                            <Input
                              id="externalAcademicAgency"
                              value={formData.externalAcademicAgency}
                              onChange={(e) => handleInputChange("externalAcademicAgency", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Audit Type-Administrative</Label>
                        <RadioGroup
                          value={formData.externalAdministrativeAudit}
                          onValueChange={(value) => handleInputChange("externalAdministrativeAudit", value)}
                          disabled={!isEditing}
                          className="flex flex-row space-x-4 mt-1"
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
                        {formData.externalAdministrativeAudit === "yes" && (
                          <div className="mt-2">
                            <Label htmlFor="externalAdministrativeAgency">Agency</Label>
                            <Input
                              id="externalAdministrativeAgency"
                              value={formData.externalAdministrativeAgency}
                              onChange={(e) => handleInputChange("externalAdministrativeAgency", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Internal:</Label>

                    <div className="space-y-3 mt-2">
                      <div>
                        <Label>Audit Type-Academic</Label>
                        <RadioGroup
                          value={formData.internalAcademicAudit}
                          onValueChange={(value) => handleInputChange("internalAcademicAudit", value)}
                          disabled={!isEditing}
                          className="flex flex-row space-x-4 mt-1"
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
                        {formData.internalAcademicAudit === "yes" && (
                          <div className="mt-2">
                            <Label htmlFor="internalAcademicAuthority">Authority</Label>
                            <Input
                              id="internalAcademicAuthority"
                              value={formData.internalAcademicAuthority}
                              onChange={(e) => handleInputChange("internalAcademicAuthority", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Audit Type-Administrative</Label>
                        <RadioGroup
                          value={formData.internalAdministrativeAudit}
                          onValueChange={(value) => handleInputChange("internalAdministrativeAudit", value)}
                          disabled={!isEditing}
                          className="flex flex-row space-x-4 mt-1"
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
                        {formData.internalAdministrativeAudit === "yes" && (
                          <div className="mt-2">
                            <Label htmlFor="internalAdministrativeAuthority">Authority</Label>
                            <Input
                              id="internalAdministrativeAuthority"
                              value={formData.internalAdministrativeAuthority}
                              onChange={(e) => handleInputChange("internalAdministrativeAuthority", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">
                  6.8 Does the University / Autonomous College declares results within 30 days?
                </Label>
                <div className="space-y-3 mt-4">
                  <div>
                    <Label>For UG Programmes</Label>
                    <RadioGroup
                      value={formData.ugResults}
                      onValueChange={(value) => handleInputChange("ugResults", value)}
                      disabled={!isEditing}
                      className="flex flex-row space-x-4 mt-1"
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
                      disabled={!isEditing}
                      className="flex flex-row space-x-4 mt-1"
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
              </div>

              <div>
                <Label htmlFor="examinationReforms">
                  6.9 What efforts are made by the University / Autonomous College for Examination Reforms?
                </Label>
                <Textarea
                  id="examinationReforms"
                  value={formData.examinationReforms}
                  onChange={(e) => handleInputChange("examinationReforms", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="autonomyPromotion">
                  6.10 What efforts are made by the University to promote autonomy in the affiliated / constituent
                  colleges?
                </Label>
                <Textarea
                  id="autonomyPromotion"
                  value={formData.autonomyPromotion}
                  onChange={(e) => handleInputChange("autonomyPromotion", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="alumniActivities">6.11 Activities and support from the Alumni Association</Label>
                <Textarea
                  id="alumniActivities"
                  value={formData.alumniActivities}
                  onChange={(e) => handleInputChange("alumniActivities", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
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
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="supportStaffDevelopment">6.13 Development programmes for support staff</Label>
                <Textarea
                  id="supportStaffDevelopment"
                  value={formData.supportStaffDevelopment}
                  onChange={(e) => handleInputChange("supportStaffDevelopment", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
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
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-4">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
