"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Collaboration {
  id: number
  srNo: number
  collaborationType: string
  collaboratingInstitute: string
  address: string
  details: string
  duration: number
  level: string
  noOfBeneficiary: number
  mouSigned: string
  signingDate: string
}

export default function DepartmentCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([
    {
      id: 1,
      srNo: 1,
      collaborationType: "Research Collaboration",
      collaboratingInstitute: "IIT Delhi",
      address: "Hauz Khas, New Delhi - 110016",
      details: "Joint research project on AI and Machine Learning",
      duration: 24,
      level: "National",
      noOfBeneficiary: 50,
      mouSigned: "Yes",
      signingDate: "2024-01-15",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddCollaboration = (formData: FormData) => {
    const newCollaboration: Collaboration = {
      id: Date.now(),
      srNo: collaborations.length + 1,
      collaborationType: formData.get("collaborationType") as string,
      collaboratingInstitute: formData.get("collaboratingInstitute") as string,
      address: formData.get("address") as string,
      details: formData.get("details") as string,
      duration: Number.parseInt(formData.get("duration") as string),
      level: formData.get("level") as string,
      noOfBeneficiary: Number.parseInt(formData.get("noOfBeneficiary") as string),
      mouSigned: formData.get("mouSigned") as string,
      signingDate: formData.get("signingDate") as string,
    }
    setCollaborations([...collaborations, newCollaboration])
    setIsDialogOpen(false)
  }

  const deleteCollaboration = (id: number) => {
    setCollaborations(collaborations.filter((collaboration) => collaboration.id !== id))
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Collaborations</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Collaborations/MOUs Signed</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Collaboration/MOU</DialogTitle>
                </DialogHeader>
                <form action={handleAddCollaboration} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="collaborationType">Collaboration Type</Label>
                      <Input id="collaborationType" name="collaborationType" required />
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
                  <div>
                    <Label htmlFor="details">Details</Label>
                    <Textarea id="details" name="details" required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (months)</Label>
                      <Input id="duration" name="duration" type="number" required />
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
                    <div>
                      <Label htmlFor="noOfBeneficiary">No. of Beneficiary</Label>
                      <Input id="noOfBeneficiary" name="noOfBeneficiary" type="number" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mouSigned">MOU Signed?</Label>
                      <Select name="mouSigned" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="signingDate">Signing Date</Label>
                      <Input id="signingDate" name="signingDate" type="date" required />
                    </div>
                  </div>
                  <Button type="submit">Add Collaboration</Button>
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
                    <TableHead>Collaboration Type</TableHead>
                    <TableHead>Collaborating Institute</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Duration (months)</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>No. of Beneficiary</TableHead>
                    <TableHead>MOU Signed?</TableHead>
                    <TableHead>Signing Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborations.map((collaboration) => (
                    <TableRow key={collaboration.id}>
                      <TableCell>{collaboration.srNo}</TableCell>
                      <TableCell>{collaboration.collaborationType}</TableCell>
                      <TableCell>{collaboration.collaboratingInstitute}</TableCell>
                      <TableCell>{collaboration.address}</TableCell>
                      <TableCell>{collaboration.details}</TableCell>
                      <TableCell>{collaboration.duration}</TableCell>
                      <TableCell>{collaboration.level}</TableCell>
                      <TableCell>{collaboration.noOfBeneficiary}</TableCell>
                      <TableCell>{collaboration.mouSigned}</TableCell>
                      <TableCell>{collaboration.signingDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteCollaboration(collaboration.id)}>
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
