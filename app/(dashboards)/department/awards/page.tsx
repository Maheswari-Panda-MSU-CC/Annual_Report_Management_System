"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Achievement {
  id: number
  srNo: number
  name: string
  awardeeType: string
  level: string
  awardCategory: string
  organisingBody: string
  achievementNature: string
  date: string
}

export default function DepartmentAwards() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      srNo: 1,
      name: "Best Research Paper Award",
      awardeeType: "Faculty",
      level: "National",
      awardCategory: "Research Excellence",
      organisingBody: "Indian Science Congress",
      achievementNature: "Individual",
      date: "2024-01-15",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddAchievement = (formData: FormData) => {
    const newAchievement: Achievement = {
      id: Date.now(),
      srNo: achievements.length + 1,
      name: formData.get("name") as string,
      awardeeType: formData.get("awardeeType") as string,
      level: formData.get("level") as string,
      awardCategory: formData.get("awardCategory") as string,
      organisingBody: formData.get("organisingBody") as string,
      achievementNature: formData.get("achievementNature") as string,
      date: formData.get("date") as string,
    }
    setAchievements([...achievements, newAchievement])
    setIsDialogOpen(false)
  }

  const deleteAchievement = (id: number) => {
    setAchievements(achievements.filter((achievement) => achievement.id !== id))
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Awards</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Achievements/Honours/Awards</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Achievement/Honour/Award</DialogTitle>
                </DialogHeader>
                <form action={handleAddAchievement} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="awardeeType">Awardee Type</Label>
                      <Select name="awardeeType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select awardee type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faculty">Faculty</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Department">Department</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="University">University</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="awardCategory">Award Category</Label>
                      <Input id="awardCategory" name="awardCategory" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organisingBody">Organising Body</Label>
                      <Input id="organisingBody" name="organisingBody" required />
                    </div>
                    <div>
                      <Label htmlFor="achievementNature">Achievement Nature</Label>
                      <Select name="achievementNature" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nature" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Team">Team</SelectItem>
                          <SelectItem value="Institutional">Institutional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <Button type="submit">Add Achievement</Button>
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
                  <TableHead>Awardee Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Award Category</TableHead>
                  <TableHead>Organising Body</TableHead>
                  <TableHead>Achievement Nature</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell>{achievement.srNo}</TableCell>
                    <TableCell>{achievement.name}</TableCell>
                    <TableCell>{achievement.awardeeType}</TableCell>
                    <TableCell>{achievement.level}</TableCell>
                    <TableCell>{achievement.awardCategory}</TableCell>
                    <TableCell>{achievement.organisingBody}</TableCell>
                    <TableCell>{achievement.achievementNature}</TableCell>
                    <TableCell>{achievement.date}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteAchievement(achievement.id)}>
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
