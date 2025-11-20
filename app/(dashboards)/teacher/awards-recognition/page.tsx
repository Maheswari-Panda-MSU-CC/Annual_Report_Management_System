"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Upload, BarChart3, Users, Save, Calendar, Trophy, FileText, Loader2, MapPin } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherAwardsRecognition, teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useQueryClient } from "@tanstack/react-query"
import { usePerformanceMutations, useAwardsMutations, useExtensionMutations } from "@/hooks/use-teacher-awards-recognition-mutations"
import { PerformanceTeacherForm } from "@/components/forms/PerformanceTeacherForm"
import { AwardsFellowshipForm } from "@/components/forms/AwardsFellowshipForm"
import { ExtensionActivityForm } from "@/components/forms/ExtensionActivityForm"

// Helper hook to invalidate section queries
function useInvalidateSection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const teacherId = user?.role_id ? parseInt(user.role_id.toString()) : 0

  return (sectionId: string) => {
    if (!teacherId || teacherId <= 0) return
    
    const queryKey = 
      sectionId === "performance" ? teacherQueryKeys.awards.performance(teacherId) :
      sectionId === "awards" ? teacherQueryKeys.awards.awards(teacherId) :
      sectionId === "extension" ? teacherQueryKeys.awards.extension(teacherId) :
      null
    
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey })
    }
  }
}

const sections = [
  {
    id: "performance",
    title: "Performance by Individual/Group",
    icon: BarChart3,
    columns: [
      "Sr No.",
      "Title of Performance",
      "Place",
      "Performance Date",
      "Nature of Performance",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
  {
    id: "awards",
    title: "Awards/Fellowship/Recognition",
    icon: Trophy,
    columns: [
      "Sr No.",
      "Name of Award / Fellowship",
      "Details",
      "Name of Awarding Agency",
      "Address of Awarding Agency",
      "Date of Award",
      "Level",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
  {
    id: "extension",
    title: "Extension",
    icon: Users,
    columns: [
      "Sr No.",
      "Name of Activity",
      "Nature of Activity",
      "Level",
      "Sponsored By",
      "Place",
      "Date",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
]

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png,.bmp", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, JPEG, PNG, BMP up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

export default function AwardsRecognitionPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("performance")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)

  const [formData, setFormData] = useState<any>({})
  const form = useForm()

  // React Query hooks
  const { performance, awards, extension, isLoading, isFetching, data: queryData } = useTeacherAwardsRecognition()
  const invalidateSection = useInvalidateSection()

  // Mutation hooks
  const performanceMutations = usePerformanceMutations()
  const awardsMutations = useAwardsMutations()
  const extensionMutations = useExtensionMutations()

  
    
  // Derive submitting state from mutations
  const isSubmitting = performanceMutations.updateMutation.isPending || 
                       awardsMutations.updateMutation.isPending || 
                       extensionMutations.updateMutation.isPending
  
  // Derive deleting state from mutations
  const isDeleting = performanceMutations.deleteMutation.isPending || 
                     awardsMutations.deleteMutation.isPending || 
                     extensionMutations.deleteMutation.isPending
  // Fetch dropdowns
  const { 
    awardFellowLevelOptions,
    sponserNameOptions
  } = useDropDowns()

  // Map API data to UI format
  const data = useMemo(() => {
    const performanceData = (queryData?.performanceTeacher || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      name: item.name || "",
      titleOfPerformance: item.name || "",
      place: item.place || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      performanceDate: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      perf_nature: item.perf_nature || "",
      natureOfPerformance: item.perf_nature || "",
      Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    const awardsData = (queryData?.awardsFellows || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      name: item.name || "",
      nameOfAwardFellowship: item.name || "",
      details: item.details || "",
      organization: item.organization || "",
      nameOfAwardingAgency: item.organization || "",
      address: item.address || "",
      addressOfAwardingAgency: item.address || "",
      date_of_award: item.date_of_award ? new Date(item.date_of_award).toISOString().split('T')[0] : "",
      dateOfAward: item.date_of_award ? new Date(item.date_of_award).toISOString().split('T')[0] : "",
      level: item.level || "",
      levelId: item.level,
      Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    const extensionData = (queryData?.extensionActivities || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      names: item.names || "",
      nameOfActivity: item.name_of_activity || "",
      natureOfActivity: item.names || "",
      place: item.place || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      sponsered: item.sponsered || "",
      sponseredId: item.sponsered,
      sponsoredBy: item.sponsered_name || "",
      level: item.level || "",
      levelId: item.level,
      levelName: item.Awards_Fellows_Level_name || "",
      Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    return {
      performance: performanceData,
      awards: awardsData,
      extension: extensionData,
    }
  }, [queryData])

  // Loading states derived from queries
  const loadingStates = useMemo(() => ({
    performance: performance.isLoading || performance.isFetching,
    awards: awards.isLoading || awards.isFetching,
    extension: extension.isLoading || extension.isFetching,
  }), [performance.isLoading, performance.isFetching, awards.isLoading, awards.isFetching, extension.isLoading, extension.isFetching])

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleDeleteClick = (sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { sectionId, itemId } = deleteConfirm

    try {
      if (sectionId === "performance") {
        await performanceMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "awards") {
        await awardsMutations.deleteMutation.mutateAsync(itemId)
      } else if (sectionId === "extension") {
        await extensionMutations.deleteMutation.mutateAsync(itemId)
      }
      setDeleteConfirm(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "performance") {
      formItem = {
        name: item.name || item.titleOfPerformance,
        place: item.place,
        date: item.date || item.performanceDate,
        perf_nature: item.perf_nature || item.natureOfPerformance,
      }
    } else if (sectionId === "awards") {
      formItem = {
        name: item.name || item.nameOfAwardFellowship,
        details: item.details || "",
        organization: item.organization || item.nameOfAwardingAgency,
        address: item.address || item.addressOfAwardingAgency || "",
        date_of_award: item.date_of_award || item.dateOfAward,
        level: item.levelId || item.level,
      }
    } else if (sectionId === "extension") {
      formItem = {
        names: item.names || item.natureOfActivity,
        name_of_activity: item.nameOfActivity || item.name_of_activity,
        place: item.place,
        date: item.date,
        sponsered: item.sponseredId || item.sponsered,
        level: item.levelId || item.level,
      }
    } else {
      formItem = { ...item }
    }
    
    setFormData(formItem)
    form.reset(formItem)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !user?.role_id) return

    const formValues = form.getValues()
    let updateData: any = {}

    if (editingItem.sectionId === "performance") {
      updateData = {
        name: formValues.name,
        place: formValues.place,
        date: formValues.date,
        perf_nature: formValues.perf_nature,
        Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
      }
      
      try {
        await performanceMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        form.reset()
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    } else if (editingItem.sectionId === "awards") {
      updateData = {
        name: formValues.name,
        details: formValues.details || "",
        organization: formValues.organization,
        address: formValues.address || "",
        date_of_award: formValues.date_of_award,
        level: formValues.level,
        Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
      }
      
      try {
        await awardsMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        form.reset()
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    } else if (editingItem.sectionId === "extension") {
      updateData = {
        names: formValues.names,
        place: formValues.place,
        date: formValues.date,
        name_of_activity: formValues.name_of_activity,
        sponsered: formValues.sponsered,
        level: formValues.level,
        Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
      }
      
      try {
        await extensionMutations.updateMutation.mutateAsync({
          id: editingItem.id,
          data: updateData,
        })
        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        form.reset()
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const handleFileUpload = async (sectionId: string, itemId: number) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive",
      })
      return
    }

    const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
    let updateData: any = {}
    let item: any = null

    if (sectionId === "performance") {
      item = data.performance.find((r: any) => r.id === itemId)
      if (!item) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        })
        return
      }
      updateData = {
        name: item.name || item.titleOfPerformance,
        place: item.place,
        date: item.date || item.performanceDate,
        perf_nature: item.perf_nature || item.natureOfPerformance,
        Image: dummyUrl,
      }
      try {
        await performanceMutations.updateMutation.mutateAsync({
          id: itemId,
          data: updateData,
        })
        setSelectedFiles(null)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    } else if (sectionId === "awards") {
      item = data.awards.find((r: any) => r.id === itemId)
      if (!item) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        })
        return
      }
      updateData = {
        name: item.name || item.nameOfAwardFellowship,
        details: item.details || "",
        organization: item.organization || item.nameOfAwardingAgency,
        address: item.address || item.addressOfAwardingAgency || "",
        date_of_award: item.date_of_award || item.dateOfAward,
        level: item.levelId || item.level,
        Image: dummyUrl,
      }
      try {
        await awardsMutations.updateMutation.mutateAsync({
          id: itemId,
          data: updateData,
        })
        setSelectedFiles(null)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    } else if (sectionId === "extension") {
      item = data.extension.find((r: any) => r.id === itemId)
      if (!item) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        })
        return
      }
      updateData = {
        names: item.names || item.natureOfActivity,
        place: item.place,
        date: item.date,
        name_of_activity: item.nameOfActivity || item.name_of_activity,
        sponsered: item.sponseredId || item.sponsered,
        level: item.levelId || item.level,
        Image: dummyUrl,
      }
      try {
        await extensionMutations.updateMutation.mutateAsync({
          id: itemId,
          data: updateData,
        })
        setSelectedFiles(null)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "performance":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm">{item.titleOfPerformance}</TableCell>
            <TableCell className="text-xs sm:text-sm">{item.place}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs sm:text-sm">{item.performanceDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.natureOfPerformance}</Badge>
            </TableCell>
          </>
        )
      case "awards":
        const awardLevelName = awardFellowLevelOptions.find(l => l.id === item.levelId || l.id === item.level)?.name || item.level || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm">{item.nameOfAwardFellowship || item.name}</TableCell>
            <TableCell className="max-w-[120px] sm:max-w-xs">
              <div className="truncate text-xs sm:text-sm" title={item.details}>
                {item.details}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm">{item.nameOfAwardingAgency || item.organization}</TableCell>
            <TableCell className="max-w-[120px] sm:max-w-xs">
              <div className="truncate text-xs sm:text-sm" title={item.addressOfAwardingAgency || item.address}>
                {item.addressOfAwardingAgency || item.address}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs sm:text-sm">{item.dateOfAward || item.date_of_award}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{awardLevelName}</Badge>
            </TableCell>
          </>
        )
      case "extension":
        const extensionLevelName = awardFellowLevelOptions.find(l => l.id === item.levelId || l.id === item.level)?.name || item.levelName || item.level || "N/A"
        const sponserName = sponserNameOptions.find(s => s.id === item.sponseredId || s.id === item.sponsered)?.name || item.sponsoredBy || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm">{item.nameOfActivity || item.name_of_activity}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.natureOfActivity || item.names}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{extensionLevelName}</Badge>
            </TableCell>
            <TableCell>{sponserName}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs sm:text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs sm:text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "performance":
        return (
          <PerformanceTeacherForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      case "awards":
        return (
          <AwardsFellowshipForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            awardFellowLevelOptions={awardFellowLevelOptions}
          />
        )
      case "extension":
        return (
          <ExtensionActivityForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            awardFellowLevelOptions={awardFellowLevelOptions}
            sponserNameOptions={sponserNameOptions}
          />
        )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
            </div>
          </div>
        )
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Awards & Recognition</h1>
          <p className="text-muted-foreground">Manage your awards, recognitions, and extension activities</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="flex flex-wrap min-w-max w-full sm:w-auto">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm"
                  >
                    <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{section.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    {section.title}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      router.push(`/teacher/awards-recognition/add?tab=${section.id}`)
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {section.title}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.columns.map((column) => (
                            <TableHead key={column} className="whitespace-nowrap text-xs sm:text-sm">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingStates[section.id as keyof typeof loadingStates] ? (
                          <TableRow>
                            <TableCell
                              colSpan={section.columns.length}
                              className="h-24 text-center text-muted-foreground text-xs sm:text-sm"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                <span className="text-xs sm:text-sm">Loading...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : !data[section.id as keyof typeof data] ||
                        data[section.id as keyof typeof data].length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={section.columns.length}
                              className="h-24 text-center text-muted-foreground text-xs sm:text-sm px-2"
                            >
                              No {section.title.toLowerCase()} found. Click "Add {section.title}" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data[section.id as keyof typeof data].map((item: any) => (
                            <TableRow key={item.id}>
                              {renderTableData(section, item)}
                             <TableCell>
                              <div className="flex items-center gap-1 sm:gap-2">
                                {item.supportingDocument && item.supportingDocument.length > 0 ? (
                                  <>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" title="View Document" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
                                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span className="hidden sm:inline ml-1">View</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent
                                        className="w-[95vw] sm:w-[90vw] max-w-4xl h-[85vh] sm:h-[80vh] p-0 overflow-hidden"
                                        style={{ display: "flex", flexDirection: "column" }}
                                      >
                                        <DialogHeader className="p-4 border-b">
                                          <DialogTitle>View Document</DialogTitle>
                                        </DialogHeader>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                          <div className="w-full h-full">
                                            <DocumentViewer
                                              documentUrl={item.supportingDocument[0]}
                                              documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Badge variant="outline" className="text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
                                  </>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" title="Upload Document" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
                                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline ml-1">Upload</span>
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[95vw] sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Upload Supporting Documents</DialogTitle>
                                      </DialogHeader>
                                      <FileUpload onFileSelect={handleFileSelect} />
                                      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                        <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                                        <Button onClick={() => handleFileUpload(section.id, item.id)} className="w-full sm:w-auto">
                                          Upload Files
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)} className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline ml-1">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteClick(section.id, item.id, item.name || item.nameOfAwardFellowship || item.nameOfActivity || "this record")}
                                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline ml-1">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh] pr-1 sm:pr-2 -mr-1 sm:mr-0">
              {editingItem && renderForm(editingItem.sectionId, true)}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Trigger form submission
                  form.handleSubmit(handleSaveEdit)()
                }} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                This action cannot be undone. This will permanently delete the record
                <strong className="block mt-2 text-base">
                  "{deleteConfirm?.itemName}"
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}

