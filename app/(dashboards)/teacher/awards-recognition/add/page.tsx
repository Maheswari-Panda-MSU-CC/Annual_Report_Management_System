"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Award, Users, Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { PerformanceTeacherForm } from "@/components/forms/PerformanceTeacherForm"
import { AwardsFellowshipForm } from "@/components/forms/AwardsFellowshipForm"
import { ExtensionActivityForm } from "@/components/forms/ExtensionActivityForm"

interface UploadStatus {
  performance: File | null
  awards: File | null
  extension: File | null
}

interface ExtractionStatus {
  performance: boolean
  awards: boolean
  extension: boolean
}

export default function AddAwardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("performance")
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null)
  const form = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())

  // Fetch dropdowns
  const { 
    awardFellowLevelOptions,
    sponserNameOptions,
    fetchAwardFellowLevels,
    fetchSponserNames
  } = useDropDowns()

  // Handle URL tab parameter on component mount
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["performance", "awards", "extension"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Reset form when tab changes
  useEffect(() => {
    form.reset({
      name: "",
      place: "",
      date: "",
      perf_nature: "",
      details: "",
      organization: "",
      address: "",
      date_of_award: "",
      level: undefined,
      name_of_activity: "",
      names: "",
      sponsered: undefined,
    })
    setExtractionError(null)
    setExtractionSuccess(null)
    // Clear form errors
    form.clearErrors()
  }, [activeTab])

  // Fetch dropdowns for tabs
  useEffect(() => {
    if (activeTab === "awards") {
      if (!fetchedDropdownsRef.current.has("awardFellowLevelOptions") && 
          !fetchingDropdownsRef.current.has("awardFellowLevelOptions") &&
          awardFellowLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("awardFellowLevelOptions")
        fetchAwardFellowLevels()
          .then(() => {
            fetchedDropdownsRef.current.add("awardFellowLevelOptions")
          })
          .catch(error => {
            console.error("Error fetching award fellow levels:", error)
          })
          .finally(() => {
            fetchingDropdownsRef.current.delete("awardFellowLevelOptions")
          })
      }
    } else if (activeTab === "extension") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("awardFellowLevelOptions") && 
          !fetchingDropdownsRef.current.has("awardFellowLevelOptions") &&
          awardFellowLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("awardFellowLevelOptions")
        dropdownsToFetch.push(
          fetchAwardFellowLevels()
            .then(() => {
              fetchedDropdownsRef.current.add("awardFellowLevelOptions")
            })
            .catch(error => {
              console.error("Error fetching award fellow levels:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("awardFellowLevelOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("sponserNameOptions") && 
          !fetchingDropdownsRef.current.has("sponserNameOptions") &&
          sponserNameOptions.length === 0) {
        fetchingDropdownsRef.current.add("sponserNameOptions")
        dropdownsToFetch.push(
          fetchSponserNames()
            .then(() => {
              fetchedDropdownsRef.current.add("sponserNameOptions")
            })
            .catch(error => {
              console.error("Error fetching sponser names:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("sponserNameOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for extension:", error)
        })
      }
    }
  }, [activeTab, awardFellowLevelOptions.length, sponserNameOptions.length, fetchAwardFellowLevels, fetchSponserNames])

  // Track uploaded files separately
  const [uploadedFiles, setUploadedFiles] = useState<UploadStatus>({
    performance: null,
    awards: null,
    extension: null,
  })

  // Track extraction status
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>({
    performance: false,
    awards: false,
    extension: false,
  })


  const handleExtractInformation = useCallback(
    async (tab: string) => {
      // Check if document is uploaded for the current tab
      let hasDocument = false
      if (tab === "performance" && uploadedFiles.performance) hasDocument = true
      if (tab === "awards" && uploadedFiles.awards) hasDocument = true
      if (tab === "extension" && uploadedFiles.extension) hasDocument = true

      if (!hasDocument) {
        setExtractionError("Please upload a document first before extracting information.")
        toast({
          title: "No Document",
          description: "Please upload a document first before extracting information.",
          variant: "destructive",
        })
        return
      }

      setIsExtracting(true)
      setExtractionError(null)
      setExtractionSuccess(null)

      try {
        // Simulate document processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // First API call to get category
        const categoryResponse = await fetch("/api/llm/get-category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: tab,
            documentType: "award_document",
            fileName: uploadedFiles[tab as keyof UploadStatus]?.name || "document",
          }),
        })

        if (!categoryResponse.ok) {
          throw new Error(`Failed to get category: ${categoryResponse.statusText}`)
        }

        const categoryData = await categoryResponse.json()

        // Second API call to get form fields
        const formFieldsResponse = await fetch("/api/llm/get-formfields", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: categoryData.category || tab,
            type: tab,
            documentContent: `Sample ${tab} document content for extraction`,
          }),
        })

        if (!formFieldsResponse.ok) {
          throw new Error(`Failed to get form fields: ${formFieldsResponse.statusText}`)
        }

        const formFieldsData = await formFieldsResponse.json()

        if (formFieldsData.success && formFieldsData.data) {
          const data = formFieldsData.data

          // Update the appropriate form state based on the tab using form.setValue
          if (tab === "performance") {
            const currentValues = form.getValues()
            form.setValue("name", data.titleOfPerformance || data.title || data.performanceTitle || currentValues.name || "")
            form.setValue("place", data.place || data.venue || data.location || currentValues.place || "")
            form.setValue("date", data.performanceDate || data.date || data.eventDate || currentValues.date || "")
            form.setValue("perf_nature", data.natureOfPerformance || data.nature || data.performanceType || data.type || currentValues.perf_nature || "")
            setExtractionStatus((prev) => ({ ...prev, performance: true }))
          } else if (tab === "awards") {
            const currentValues = form.getValues()
            form.setValue("name", data.nameOfAwardFellowship || data.name || data.awardName || data.title || currentValues.name || "")
            form.setValue("details", data.details || data.description || data.summary || currentValues.details || "")
            form.setValue("organization", data.nameOfAwardingAgency || data.agency || data.awardingBody || data.awardingAgency || data.organization || currentValues.organization || "")
            form.setValue("address", data.addressOfAwardingAgency || data.agencyAddress || data.address || data.organizationAddress || currentValues.address || "")
            form.setValue("date_of_award", data.dateOfAward || data.date || data.dateReceived || data.awardDate || data.dateAwarded || currentValues.date_of_award || "")
            // For level, we need to find the matching option ID from awardFellowLevelOptions
            if (data.level || data.scope) {
              const levelName = data.level || data.scope
              const levelOption = awardFellowLevelOptions.find(opt => 
                opt.name.toLowerCase().includes(levelName.toLowerCase()) || 
                levelName.toLowerCase().includes(opt.name.toLowerCase())
              )
              if (levelOption) {
                form.setValue("level", levelOption.id)
              }
            }
            setExtractionStatus((prev) => ({ ...prev, awards: true }))
          } else if (tab === "extension") {
            const currentValues = form.getValues()
            form.setValue("name_of_activity", data.nameOfActivity || data.name || data.activityName || data.title || currentValues.name_of_activity || "")
            form.setValue("names", data.natureOfActivity || data.nature || data.activityType || data.type || currentValues.names || "")
            form.setValue("place", data.place || data.venue || data.location || currentValues.place || "")
            form.setValue("date", data.date || data.activityDate || data.eventDate || currentValues.date || "")
            // For level, we need to find the matching option ID from awardFellowLevelOptions
            if (data.level || data.scope) {
              const levelName = data.level || data.scope
              const levelOption = awardFellowLevelOptions.find(opt => 
                opt.name.toLowerCase().includes(levelName.toLowerCase()) || 
                levelName.toLowerCase().includes(opt.name.toLowerCase())
              )
              if (levelOption) {
                form.setValue("level", levelOption.id)
              }
            }
            // For sponsered, we need to find the matching option ID from sponserNameOptions
            if (data.sponsoredBy || data.sponsor || data.organizingBody || data.organizer) {
              const sponsorName = data.sponsoredBy || data.sponsor || data.organizingBody || data.organizer
              const sponsorOption = sponserNameOptions.find(opt => 
                opt.name.toLowerCase().includes(sponsorName.toLowerCase()) || 
                sponsorName.toLowerCase().includes(opt.name.toLowerCase())
              )
              if (sponsorOption) {
                form.setValue("sponsered", sponsorOption.id)
              }
            }
            setExtractionStatus((prev) => ({ ...prev, extension: true }))
          }

          const extractedFieldsCount = formFieldsData.extracted_fields || Object.keys(data).length
          const confidence = formFieldsData.confidence || 0.85

          setExtractionSuccess(
            `Successfully extracted ${extractedFieldsCount} fields with ${Math.round(confidence * 100)}% confidence`,
          )

          toast({
            title: "Success",
            description: `Form auto-filled with ${extractedFieldsCount} fields (${Math.round(confidence * 100)}% confidence)`,
          })
        } else {
          throw new Error("No data extracted from document")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to extract information. Please try again."
        setExtractionError(errorMessage)
        toast({
          title: "Extraction Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsExtracting(false)
      }
    },
    [toast, uploadedFiles, awardFellowLevelOptions, sponserNameOptions, form],
  )

  // Form handlers
  const handlePerformanceSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        perfTeacher: {
          name: data.name,
          place: data.place,
          date: data.date,
          perf_nature: data.perf_nature,
          Image: "http://localhost:3000/assets/demo_document.pdf",
        },
      }

      const res = await fetch("/api/teacher/awards-recognition/performance-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add performance teacher")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setUploadedFiles((prev) => ({ ...prev, performance: null }))
      setExtractionStatus((prev) => ({ ...prev, performance: false }))

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=performance")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding performance teacher:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add performance teacher",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAwardSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        awardsFellow: {
          name: data.name,
          details: data.details || "",
          organization: data.organization,
          address: data.address || "",
          date_of_award: data.date_of_award,
          level: data.level,
          Image: "http://localhost:3000/assets/demo_document.pdf",
        },
      }

      const res = await fetch("/api/teacher/awards-recognition/awards-fellow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add awards/fellows")
      }

      toast({
        title: "Success",
        description: `"${data.name}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setUploadedFiles((prev) => ({ ...prev, awards: null }))
      setExtractionStatus((prev) => ({ ...prev, awards: false }))

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=awards")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding awards/fellows:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add awards/fellows",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExtensionSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        teacherId: user.role_id,
        extensionAct: {
          names: data.names,
          place: data.place,
          date: data.date,
          name_of_activity: data.name_of_activity,
          sponsered: data.sponsered,
          level: data.level,
          Image: "http://localhost:3000/assets/demo_document.pdf",
        },
      }

      const res = await fetch("/api/teacher/awards-recognition/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add extension activity")
      }

      toast({
        title: "Success",
        description: `"${data.name_of_activity}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setUploadedFiles((prev) => ({ ...prev, extension: null }))
      setExtractionStatus((prev) => ({ ...prev, extension: false }))

      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/teacher/awards-recognition?tab=extension")
      }, 1000)
    } catch (error: any) {
      console.error("Error adding extension activity:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add extension activity",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const file = e.target.files?.[0] || null

    // Update uploaded files state
    setUploadedFiles((prev) => ({
      ...prev,
      [section]: file,
    }))

    // Reset extraction status when new file is uploaded
    setExtractionStatus((prev) => ({ ...prev, [section]: false }))
    setExtractionError(null)
    setExtractionSuccess(null)

    if (file) {
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Awards & Recognition
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Add Awards & Recognition</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[600px]">
              <TabsTrigger value="performance" className="text-xs px-2 py-2">
                <FileText className="mr-1 h-3 w-3" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="awards" className="text-xs px-2 py-2">
                <Award className="mr-1 h-3 w-3" />
                Awards/Fellowship/Recognition
              </TabsTrigger>
              <TabsTrigger value="extension" className="text-xs px-2 py-2">
                <Users className="mr-1 h-3 w-3" />
                Extension
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Performance by Individual/Group
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceTeacherForm
                  form={form}
                  onSubmit={handlePerformanceSubmit}
                  isSubmitting={isSubmitting}
                  isExtracting={isExtracting}
                  selectedFiles={uploadedFiles.performance ? (() => {
                    const dt = new DataTransfer()
                    dt.items.add(uploadedFiles.performance!)
                    return dt.files
                  })() : null}
                  handleFileSelect={(files) => {
                    if (files && files.length > 0) {
                      handleFileUpload({ target: { files } } as any, "performance")
                    }
                  }}
                  handleExtractInfo={() => handleExtractInformation("performance")}
                  isEdit={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Awards/Fellowship/Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AwardsFellowshipForm
                  form={form}
                  onSubmit={handleAwardSubmit}
                  isSubmitting={isSubmitting}
                  isExtracting={isExtracting}
                  selectedFiles={uploadedFiles.awards ? (() => {
                    const dt = new DataTransfer()
                    dt.items.add(uploadedFiles.awards!)
                    return dt.files
                  })() : null}
                  handleFileSelect={(files) => {
                    if (files && files.length > 0) {
                      handleFileUpload({ target: { files } } as any, "awards")
                    }
                  }}
                  handleExtractInfo={() => handleExtractInformation("awards")}
                  isEdit={false}
                  awardFellowLevelOptions={awardFellowLevelOptions}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extension Activities Tab */}
          <TabsContent value="extension">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Extension
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExtensionActivityForm
                  form={form}
                  onSubmit={handleExtensionSubmit}
                  isSubmitting={isSubmitting}
                  isExtracting={isExtracting}
                  selectedFiles={uploadedFiles.extension ? (() => {
                    const dt = new DataTransfer()
                    dt.items.add(uploadedFiles.extension!)
                    return dt.files
                  })() : null}
                  handleFileSelect={(files: FileList | null) => {
                    if (files && files.length > 0) {
                      handleFileUpload({ target: { files } } as any, "extension")
                    }
                  }}
                  handleExtractInfo={() => handleExtractInformation("extension")}
                  isEdit={false}
                  awardFellowLevelOptions={awardFellowLevelOptions}
                  sponserNameOptions={sponserNameOptions}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
