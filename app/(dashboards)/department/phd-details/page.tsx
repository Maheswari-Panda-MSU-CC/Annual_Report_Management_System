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

interface PhDRecord {
  id: number
  srNo: number
  scholarName: string
  subject: string
  thesisTitle: string
  guideName: string
  registrationYear: string
  completionYear: string
  notificationNo: string
}

export default function DepartmentPhDDetails() {
  const [phdRecords, setPhdRecords] = useState<PhDRecord[]>([
    {
      id: 1,
      srNo: 1,
      scholarName: "Dr. Rajesh Kumar",
      subject: "Computer Science",
      thesisTitle: "Machine Learning Applications in Healthcare Data Analysis",
      guideName: "Prof. Suresh Patel",
      registrationYear: "2018",
      completionYear: "2023",
      notificationNo: "PhD/CS/2023/001",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddRecord = (formData: FormData) => {
    const newRecord: PhDRecord = {
      id: Date.now(),
      srNo: phdRecords.length + 1,
      scholarName: formData.get("scholarName") as string,
      subject: formData.get("subject") as string,
      thesisTitle: formData.get("thesisTitle") as string,
      guideName: formData.get("guideName") as string,
      registrationYear: formData.get("registrationYear") as string,
      completionYear: formData.get("completionYear") as string,
      notificationNo: formData.get("notificationNo") as string,
    }
    setPhdRecords([...phdRecords, newRecord])
    setIsDialogOpen(false)
  }

  const deleteRecord = (id: number) => {
    setPhdRecords(phdRecords.filter((record) => record.id !== id))
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">PhD Details</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>PhD Awarded</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add PhD Record</DialogTitle>
                </DialogHeader>
                <form action={handleAddRecord} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scholarName">Scholar Name</Label>
                      <Input id="scholarName" name="scholarName" required />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="thesisTitle">Thesis Title</Label>
                    <Textarea id="thesisTitle" name="thesisTitle" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guideName">Guide Name</Label>
                      <Input id="guideName" name="guideName" required />
                    </div>
                    <div>
                      <Label htmlFor="notificationNo">Notification No.</Label>
                      <Input id="notificationNo" name="notificationNo" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registrationYear">Registration Year</Label>
                      <Input
                        id="registrationYear"
                        name="registrationYear"
                        type="number"
                        min="2000"
                        max="2030"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="completionYear">Completion Year</Label>
                      <Input id="completionYear" name="completionYear" type="number" min="2000" max="2030" required />
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
                    <TableHead>Scholar Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Thesis Title</TableHead>
                    <TableHead>Guide Name</TableHead>
                    <TableHead>Registration Year</TableHead>
                    <TableHead>Completion Year</TableHead>
                    <TableHead>Notification No.</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phdRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.srNo}</TableCell>
                      <TableCell>{record.scholarName}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell className="max-w-md">{record.thesisTitle}</TableCell>
                      <TableCell>{record.guideName}</TableCell>
                      <TableCell>{record.registrationYear}</TableCell>
                      <TableCell>{record.completionYear}</TableCell>
                      <TableCell>{record.notificationNo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteRecord(record.id)}>
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
      </div>
  )
}
