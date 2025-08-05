"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"

interface ExtensionActivity {
  id: number
  srNo: number
  nameOfActivity: string
  details: string
  place: string
  activityStartDate: string
  noOfDays: number
  noOfParticipants: number
  image: string
}

interface ConsultancyDetail {
  id: number
  srNo: number
  name: string
  collaboratingInstitute: string
  address: string
  duration: number
  amount: number
  date: string
}

interface IndustryLinkage {
  id: number
  srNo: number
  details: string
  place: string
  date: string
  noOfParticipants: number
  image: string
}

export default function DepartmentActivities() {
  const [extensionActivities, setExtensionActivities] = useState<ExtensionActivity[]>([
    {
      id: 1,
      srNo: 1,
      nameOfActivity: "Community Health Awareness",
      details: "Health awareness program for rural communities",
      place: "Village Panchayat Hall",
      activityStartDate: "2024-01-15",
      noOfDays: 3,
      noOfParticipants: 150,
      image: "health-awareness.jpg",
    },
  ])

  const [consultancyDetails, setConsultancyDetails] = useState<ConsultancyDetail[]>([
    {
      id: 1,
      srNo: 1,
      name: "IT Infrastructure Consultancy",
      collaboratingInstitute: "Tech Solutions Ltd",
      address: "123 Business Park, City",
      duration: 6,
      amount: 250000,
      date: "2024-02-01",
    },
  ])

  const [industryLinkages, setIndustryLinkages] = useState<IndustryLinkage[]>([
    {
      id: 1,
      srNo: 1,
      details: "Industry visit and collaboration discussion",
      place: "Manufacturing Plant, Industrial Area",
      date: "2024-03-10",
      noOfParticipants: 25,
      image: "industry-visit.jpg",
    },
  ])

  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false)
  const [isConsultancyDialogOpen, setIsConsultancyDialogOpen] = useState(false)
  const [isIndustryDialogOpen, setIsIndustryDialogOpen] = useState(false)

  const handleAddExtensionActivity = (formData: FormData) => {
    const newActivity: ExtensionActivity = {
      id: Date.now(),
      srNo: extensionActivities.length + 1,
      nameOfActivity: formData.get("nameOfActivity") as string,
      details: formData.get("details") as string,
      place: formData.get("place") as string,
      activityStartDate: formData.get("activityStartDate") as string,
      noOfDays: Number.parseInt(formData.get("noOfDays") as string),
      noOfParticipants: Number.parseInt(formData.get("noOfParticipants") as string),
      image: (formData.get("image") as File)?.name || "",
    }
    setExtensionActivities([...extensionActivities, newActivity])
    setIsExtensionDialogOpen(false)
  }

  const handleAddConsultancyDetail = (formData: FormData) => {
    const newConsultancy: ConsultancyDetail = {
      id: Date.now(),
      srNo: consultancyDetails.length + 1,
      name: formData.get("name") as string,
      collaboratingInstitute: formData.get("collaboratingInstitute") as string,
      address: formData.get("address") as string,
      duration: Number.parseInt(formData.get("duration") as string),
      amount: Number.parseInt(formData.get("amount") as string),
      date: formData.get("date") as string,
    }
    setConsultancyDetails([...consultancyDetails, newConsultancy])
    setIsConsultancyDialogOpen(false)
  }

  const handleAddIndustryLinkage = (formData: FormData) => {
    const newLinkage: IndustryLinkage = {
      id: Date.now(),
      srNo: industryLinkages.length + 1,
      details: formData.get("details") as string,
      place: formData.get("place") as string,
      date: formData.get("date") as string,
      noOfParticipants: Number.parseInt(formData.get("noOfParticipants") as string),
      image: (formData.get("image") as File)?.name || "",
    }
    setIndustryLinkages([...industryLinkages, newLinkage])
    setIsIndustryDialogOpen(false)
  }

  const deleteExtensionActivity = (id: number) => {
    setExtensionActivities(extensionActivities.filter((activity) => activity.id !== id))
  }

  const deleteConsultancyDetail = (id: number) => {
    setConsultancyDetails(consultancyDetails.filter((detail) => detail.id !== id))
  }

  const deleteIndustryLinkage = (id: number) => {
    setIndustryLinkages(industryLinkages.filter((linkage) => linkage.id !== id))
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Activities</h1>

        <Tabs defaultValue="extension" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extension">Extension Activities</TabsTrigger>
            <TabsTrigger value="consultancy">Consultancy Details</TabsTrigger>
            <TabsTrigger value="industry">Industry Linkages</TabsTrigger>
          </TabsList>

          <TabsContent value="extension">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Extension Activities</CardTitle>
                <Dialog open={isExtensionDialogOpen} onOpenChange={setIsExtensionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Extension Activity</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddExtensionActivity} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nameOfActivity">Name of Activity</Label>
                          <Input id="nameOfActivity" name="nameOfActivity" required />
                        </div>
                        <div>
                          <Label htmlFor="place">Place</Label>
                          <Input id="place" name="place" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="details">Details</Label>
                        <Textarea id="details" name="details" required />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="activityStartDate">Activity Start Date</Label>
                          <Input id="activityStartDate" name="activityStartDate" type="date" required />
                        </div>
                        <div>
                          <Label htmlFor="noOfDays">No. of Days</Label>
                          <Input id="noOfDays" name="noOfDays" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="noOfParticipants">No. of Participants</Label>
                          <Input id="noOfParticipants" name="noOfParticipants" type="number" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="image">Image</Label>
                        <Input id="image" name="image" type="file" accept="image/*" />
                      </div>
                      <Button type="submit">Add Activity</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Name of Activity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Activity Start Date</TableHead>
                      <TableHead>No. of Days</TableHead>
                      <TableHead>No. of Participants</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extensionActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.srNo}</TableCell>
                        <TableCell>{activity.nameOfActivity}</TableCell>
                        <TableCell>{activity.details}</TableCell>
                        <TableCell>{activity.place}</TableCell>
                        <TableCell>{activity.activityStartDate}</TableCell>
                        <TableCell>{activity.noOfDays}</TableCell>
                        <TableCell>{activity.noOfParticipants}</TableCell>
                        <TableCell>{activity.image}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteExtensionActivity(activity.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultancy">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Details of Consultancy Undertaken</CardTitle>
                <Dialog open={isConsultancyDialogOpen} onOpenChange={setIsConsultancyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Consultancy Detail</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddConsultancyDetail} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" required />
                        </div>
                        <div>
                          <Label htmlFor="collaboratingInstitute">Collaborating Institute</Label>
                          <Input id="collaboratingInstitute" name="collaboratingInstitute" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" name="address" required />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="duration">Duration (Months)</Label>
                          <Input id="duration" name="duration" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount (Rs.)</Label>
                          <Input id="amount" name="amount" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" name="date" type="date" required />
                        </div>
                      </div>
                      <Button type="submit">Add Consultancy</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Collaborating Institute</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Duration (Months)</TableHead>
                      <TableHead>Amount (Rs.)</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultancyDetails.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.srNo}</TableCell>
                        <TableCell>{detail.name}</TableCell>
                        <TableCell>{detail.collaboratingInstitute}</TableCell>
                        <TableCell>{detail.address}</TableCell>
                        <TableCell>{detail.duration}</TableCell>
                        <TableCell>{detail.amount}</TableCell>
                        <TableCell>{detail.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteConsultancyDetail(detail.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="industry">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Industry Linkages</CardTitle>
                <Dialog open={isIndustryDialogOpen} onOpenChange={setIsIndustryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Industry Linkage</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddIndustryLinkage} className="space-y-4">
                      <div>
                        <Label htmlFor="details">Details</Label>
                        <Textarea id="details" name="details" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="place">Place</Label>
                          <Input id="place" name="place" required />
                        </div>
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" name="date" type="date" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="noOfParticipants">No. of Participants</Label>
                          <Input id="noOfParticipants" name="noOfParticipants" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="image">Image</Label>
                          <Input id="image" name="image" type="file" accept="image/*" />
                        </div>
                      </div>
                      <Button type="submit">Add Linkage</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>No. of Participants</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {industryLinkages.map((linkage) => (
                      <TableRow key={linkage.id}>
                        <TableCell>{linkage.srNo}</TableCell>
                        <TableCell>{linkage.details}</TableCell>
                        <TableCell>{linkage.place}</TableCell>
                        <TableCell>{linkage.date}</TableCell>
                        <TableCell>{linkage.noOfParticipants}</TableCell>
                        <TableCell>{linkage.image}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteIndustryLinkage(linkage.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
