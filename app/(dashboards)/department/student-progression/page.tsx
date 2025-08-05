"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"

interface QualifiedStudent {
  id: number
  srNo: number
  net: number
  slet: number
  gate: number
  cat: number
  upsc: number
  gpsc: number
  others: number
  iasIpsIcs: number
  statePsc: number
  gre: number
  gmat: number
  tofel: number
  ielts: number
  ca: number
  cs: number
  date: string
}

interface OutsideMSUActivity {
  id: number
  eventName: string
  level: string
  place: string
  noOfDays: number
  eventStartDate: string
  noOfParticipant: number
  image: string
}

interface OtherActivity {
  id: number
  srNo: number
  activityType: string
  organization: string
  place: string
  activityStartDate: string
  noOfDays: number
  noOfParticipant: number
  image: string
}

export default function StudentProgression() {
  const [qualifiedStudents, setQualifiedStudents] = useState<QualifiedStudent[]>([
    {
      id: 1,
      srNo: 1,
      net: 5,
      slet: 3,
      gate: 8,
      cat: 2,
      upsc: 1,
      gpsc: 4,
      others: 6,
      iasIpsIcs: 1,
      statePsc: 3,
      gre: 2,
      gmat: 1,
      tofel: 4,
      ielts: 3,
      ca: 2,
      cs: 1,
      date: "2024-01-15",
    },
  ])

  const [outsideMSUActivities, setOutsideMSUActivities] = useState<OutsideMSUActivity[]>([
    {
      id: 1,
      eventName: "National Conference on AI",
      level: "National",
      place: "IIT Delhi",
      noOfDays: 3,
      eventStartDate: "2024-02-15",
      noOfParticipant: 25,
      image: "conference.jpg",
    },
  ])

  const [otherActivities, setOtherActivities] = useState<OtherActivity[]>([
    {
      id: 1,
      srNo: 1,
      activityType: "Workshop",
      organization: "Tech Institute",
      place: "Auditorium",
      activityStartDate: "2024-03-10",
      noOfDays: 2,
      noOfParticipant: 50,
      image: "workshop.jpg",
    },
  ])

  const [isQualifiedDialogOpen, setIsQualifiedDialogOpen] = useState(false)
  const [isOutsideDialogOpen, setIsOutsideDialogOpen] = useState(false)
  const [isOtherDialogOpen, setIsOtherDialogOpen] = useState(false)

  const handleAddQualifiedStudent = (formData: FormData) => {
    const newRecord: QualifiedStudent = {
      id: Date.now(),
      srNo: qualifiedStudents.length + 1,
      net: Number.parseInt(formData.get("net") as string) || 0,
      slet: Number.parseInt(formData.get("slet") as string) || 0,
      gate: Number.parseInt(formData.get("gate") as string) || 0,
      cat: Number.parseInt(formData.get("cat") as string) || 0,
      upsc: Number.parseInt(formData.get("upsc") as string) || 0,
      gpsc: Number.parseInt(formData.get("gpsc") as string) || 0,
      others: Number.parseInt(formData.get("others") as string) || 0,
      iasIpsIcs: Number.parseInt(formData.get("iasIpsIcs") as string) || 0,
      statePsc: Number.parseInt(formData.get("statePsc") as string) || 0,
      gre: Number.parseInt(formData.get("gre") as string) || 0,
      gmat: Number.parseInt(formData.get("gmat") as string) || 0,
      tofel: Number.parseInt(formData.get("tofel") as string) || 0,
      ielts: Number.parseInt(formData.get("ielts") as string) || 0,
      ca: Number.parseInt(formData.get("ca") as string) || 0,
      cs: Number.parseInt(formData.get("cs") as string) || 0,
      date: formData.get("date") as string,
    }
    setQualifiedStudents([...qualifiedStudents, newRecord])
    setIsQualifiedDialogOpen(false)
  }

  const handleAddOutsideMSUActivity = (formData: FormData) => {
    const newActivity: OutsideMSUActivity = {
      id: Date.now(),
      eventName: formData.get("eventName") as string,
      level: formData.get("level") as string,
      place: formData.get("place") as string,
      noOfDays: Number.parseInt(formData.get("noOfDays") as string),
      eventStartDate: formData.get("eventStartDate") as string,
      noOfParticipant: Number.parseInt(formData.get("noOfParticipant") as string),
      image: (formData.get("image") as File)?.name || "",
    }
    setOutsideMSUActivities([...outsideMSUActivities, newActivity])
    setIsOutsideDialogOpen(false)
  }

  const handleAddOtherActivity = (formData: FormData) => {
    const newActivity: OtherActivity = {
      id: Date.now(),
      srNo: otherActivities.length + 1,
      activityType: formData.get("activityType") as string,
      organization: formData.get("organization") as string,
      place: formData.get("place") as string,
      activityStartDate: formData.get("activityStartDate") as string,
      noOfDays: Number.parseInt(formData.get("noOfDays") as string),
      noOfParticipant: Number.parseInt(formData.get("noOfParticipant") as string),
      image: (formData.get("image") as File)?.name || "",
    }
    setOtherActivities([...otherActivities, newActivity])
    setIsOtherDialogOpen(false)
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Progression</h1>

        <Tabs defaultValue="qualified" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qualified">Qualified Students</TabsTrigger>
            <TabsTrigger value="outside">Outside MSU Activities</TabsTrigger>
            <TabsTrigger value="other">Other Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="qualified">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>No. of students who qualified the exams this year</CardTitle>
                <Dialog open={isQualifiedDialogOpen} onOpenChange={setIsQualifiedDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Add Qualified Students Record</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddQualifiedStudent} className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="net">NET</Label>
                          <Input id="net" name="net" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="slet">SLET</Label>
                          <Input id="slet" name="slet" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="gate">GATE</Label>
                          <Input id="gate" name="gate" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="cat">CAT</Label>
                          <Input id="cat" name="cat" type="number" defaultValue="0" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="upsc">UPSC</Label>
                          <Input id="upsc" name="upsc" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="gpsc">GPSC</Label>
                          <Input id="gpsc" name="gpsc" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="others">Others</Label>
                          <Input id="others" name="others" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="iasIpsIcs">IAS/IPS/ICS</Label>
                          <Input id="iasIpsIcs" name="iasIpsIcs" type="number" defaultValue="0" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="statePsc">State PSC</Label>
                          <Input id="statePsc" name="statePsc" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="gre">GRE</Label>
                          <Input id="gre" name="gre" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="gmat">GMAT</Label>
                          <Input id="gmat" name="gmat" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="tofel">TOFEL</Label>
                          <Input id="tofel" name="tofel" type="number" defaultValue="0" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="ielts">IELTS</Label>
                          <Input id="ielts" name="ielts" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="ca">CA</Label>
                          <Input id="ca" name="ca" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="cs">CS</Label>
                          <Input id="cs" name="cs" type="number" defaultValue="0" />
                        </div>
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" name="date" type="date" required />
                        </div>
                      </div>
                      <Button type="submit">Add Record</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>NET</TableHead>
                        <TableHead>SLET</TableHead>
                        <TableHead>GATE</TableHead>
                        <TableHead>CAT</TableHead>
                        <TableHead>UPSC</TableHead>
                        <TableHead>GPSC</TableHead>
                        <TableHead>Others</TableHead>
                        <TableHead>IAS/IPS/ICS</TableHead>
                        <TableHead>State PSC</TableHead>
                        <TableHead>GRE</TableHead>
                        <TableHead>GMAT</TableHead>
                        <TableHead>TOFEL</TableHead>
                        <TableHead>IELTS</TableHead>
                        <TableHead>CA</TableHead>
                        <TableHead>CS</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualifiedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.srNo}</TableCell>
                          <TableCell>{student.net}</TableCell>
                          <TableCell>{student.slet}</TableCell>
                          <TableCell>{student.gate}</TableCell>
                          <TableCell>{student.cat}</TableCell>
                          <TableCell>{student.upsc}</TableCell>
                          <TableCell>{student.gpsc}</TableCell>
                          <TableCell>{student.others}</TableCell>
                          <TableCell>{student.iasIpsIcs}</TableCell>
                          <TableCell>{student.statePsc}</TableCell>
                          <TableCell>{student.gre}</TableCell>
                          <TableCell>{student.gmat}</TableCell>
                          <TableCell>{student.tofel}</TableCell>
                          <TableCell>{student.ielts}</TableCell>
                          <TableCell>{student.ca}</TableCell>
                          <TableCell>{student.cs}</TableCell>
                          <TableCell>{student.date}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outside">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Activities Organized outside MSU</CardTitle>
                <Dialog open={isOutsideDialogOpen} onOpenChange={setIsOutsideDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Outside MSU Activity</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddOutsideMSUActivity} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="eventName">Event Name</Label>
                          <Input id="eventName" name="eventName" required />
                        </div>
                        <div>
                          <Label htmlFor="level">Level</Label>
                          <Select name="level" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="International">International</SelectItem>
                              <SelectItem value="National">National</SelectItem>
                              <SelectItem value="State">State</SelectItem>
                              <SelectItem value="Regional">Regional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="place">Place</Label>
                          <Input id="place" name="place" required />
                        </div>
                        <div>
                          <Label htmlFor="eventStartDate">Event Start Date</Label>
                          <Input id="eventStartDate" name="eventStartDate" type="date" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="noOfDays">No. of Days</Label>
                          <Input id="noOfDays" name="noOfDays" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="noOfParticipant">No. of Participant</Label>
                          <Input id="noOfParticipant" name="noOfParticipant" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="image">Image</Label>
                          <Input id="image" name="image" type="file" accept="image/*" />
                        </div>
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
                      <TableHead>Event Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>No. of Days</TableHead>
                      <TableHead>Event Start Date</TableHead>
                      <TableHead>No. of Participant</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outsideMSUActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.eventName}</TableCell>
                        <TableCell>{activity.level}</TableCell>
                        <TableCell>{activity.place}</TableCell>
                        <TableCell>{activity.noOfDays}</TableCell>
                        <TableCell>{activity.eventStartDate}</TableCell>
                        <TableCell>{activity.noOfParticipant}</TableCell>
                        <TableCell>{activity.image}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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

          <TabsContent value="other">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Other Activities Organised</CardTitle>
                <Dialog open={isOtherDialogOpen} onOpenChange={setIsOtherDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Other Activity</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddOtherActivity} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="activityType">Activity Type</Label>
                          <Input id="activityType" name="activityType" required />
                        </div>
                        <div>
                          <Label htmlFor="organization">Organization</Label>
                          <Input id="organization" name="organization" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="place">Place</Label>
                          <Input id="place" name="place" required />
                        </div>
                        <div>
                          <Label htmlFor="activityStartDate">Activity Start Date</Label>
                          <Input id="activityStartDate" name="activityStartDate" type="date" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="noOfDays">No. of Days</Label>
                          <Input id="noOfDays" name="noOfDays" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="noOfParticipant">No. of Participant</Label>
                          <Input id="noOfParticipant" name="noOfParticipant" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="image">Image</Label>
                          <Input id="image" name="image" type="file" accept="image/*" />
                        </div>
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
                      <TableHead>Activity Type</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Activity Start Date</TableHead>
                      <TableHead>No. of Days</TableHead>
                      <TableHead>No. of Participant</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.srNo}</TableCell>
                        <TableCell>{activity.activityType}</TableCell>
                        <TableCell>{activity.organization}</TableCell>
                        <TableCell>{activity.place}</TableCell>
                        <TableCell>{activity.activityStartDate}</TableCell>
                        <TableCell>{activity.noOfDays}</TableCell>
                        <TableCell>{activity.noOfParticipant}</TableCell>
                        <TableCell>{activity.image}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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
