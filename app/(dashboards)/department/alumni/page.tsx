"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface AlumniActivity {
  id: number
  srNo: number
  details: string
  venue: string
  activityStartDate: string
  noOfDays: number
  noOfParticipants: number
  image: string
}

export default function DepartmentAlumni() {
  const [alumniActivities, setAlumniActivities] = useState<AlumniActivity[]>([
    {
      id: 1,
      srNo: 1,
      details: "Annual Alumni Meet 2024",
      venue: "University Auditorium",
      activityStartDate: "2024-01-20",
      noOfDays: 2,
      noOfParticipants: 150,
      image: "alumni_meet_2024.jpg",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddActivity = (formData: FormData) => {
    const newActivity: AlumniActivity = {
      id: Date.now(),
      srNo: alumniActivities.length + 1,
      details: formData.get("details") as string,
      venue: formData.get("venue") as string,
      activityStartDate: formData.get("activityStartDate") as string,
      noOfDays: Number.parseInt(formData.get("noOfDays") as string),
      noOfParticipants: Number.parseInt(formData.get("noOfParticipants") as string),
      image: (formData.get("image") as File)?.name || "",
    }
    setAlumniActivities([...alumniActivities, newActivity])
    setIsDialogOpen(false)
  }

  const deleteActivity = (id: number) => {
    setAlumniActivities(alumniActivities.filter((activity) => activity.id !== id))
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Alumni</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alumni Activities</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Alumni Activity</DialogTitle>
                </DialogHeader>
                <form action={handleAddActivity} className="space-y-4">
                  <div>
                    <Label htmlFor="details">Details</Label>
                    <Textarea id="details" name="details" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venue">Venue</Label>
                      <Input id="venue" name="venue" required />
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
                      <Label htmlFor="noOfParticipants">No. of Participants</Label>
                      <Input id="noOfParticipants" name="noOfParticipants" type="number" required />
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
                  <TableHead>Details</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Activity Start Date</TableHead>
                  <TableHead>No. of Days</TableHead>
                  <TableHead>No. of Participants</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumniActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.srNo}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>{activity.venue}</TableCell>
                    <TableCell>{activity.activityStartDate}</TableCell>
                    <TableCell>{activity.noOfDays}</TableCell>
                    <TableCell>{activity.noOfParticipants}</TableCell>
                    <TableCell>{activity.image}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteActivity(activity.id)}>
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
      </div>
  )
}
