"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

// Sample data for Infrastructure Facilities
const infrastructureFacilities = [
  {
    id: 1,
    facility: "Computer Lab",
    existing: "2",
    newlyCreated: "1",
    total: "3",
    sourceOfFund: "UGC Grant",
  },
  {
    id: 2,
    facility: "Smart Classroom",
    existing: "5",
    newlyCreated: "2",
    total: "7",
    sourceOfFund: "State Government",
  },
]

// Sample data for Library Services
const libraryServices = [
  {
    id: 1,
    service: "Books",
    existingNumber: "5000",
    existingValue: "25.00",
    newNumber: "500",
    newValue: "3.50",
    totalNumber: "5500",
    totalValue: "28.50",
  },
  {
    id: 2,
    service: "Journals",
    existingNumber: "50",
    existingValue: "2.00",
    newNumber: "10",
    newValue: "0.50",
    totalNumber: "60",
    totalValue: "2.50",
  },
]

// Sample data for ICT Facilities
const ictFacilities = [
  {
    id: 1,
    technology: "Computers",
    existing: "50",
    added: "10",
    total: "60",
  },
  {
    id: 2,
    technology: "Projectors",
    existing: "8",
    added: "2",
    total: "10",
  },
]

export default function DepartmentInfrastructure() {
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false)
  const [isAddLibraryServiceOpen, setIsAddLibraryServiceOpen] = useState(false)
  const [isAddICTOpen, setIsAddICTOpen] = useState(false)

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Infrastructure</h1>

        <Tabs defaultValue="facilities" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="facilities">Infrastructure Facilities</TabsTrigger>
            <TabsTrigger value="digitization">Digitization</TabsTrigger>
            <TabsTrigger value="library">Library Services</TabsTrigger>
            <TabsTrigger value="ict">ICT Facilities</TabsTrigger>
            <TabsTrigger value="upgradation">Technology Upgradation</TabsTrigger>
            <TabsTrigger value="training">Training Programs</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="facilities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Details of increase in Infrastructure Facilities</CardTitle>
                <Dialog open={isAddFacilityOpen} onOpenChange={setIsAddFacilityOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Facility
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Infrastructure Facility</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="facility">Facility</Label>
                        <Input id="facility" placeholder="Enter facility name" />
                      </div>
                      <div>
                        <Label htmlFor="existing">Existing</Label>
                        <Input id="existing" placeholder="Enter existing count" />
                      </div>
                      <div>
                        <Label htmlFor="newlyCreated">Newly Created</Label>
                        <Input id="newlyCreated" placeholder="Enter newly created count" />
                      </div>
                      <div>
                        <Label htmlFor="total">Total</Label>
                        <Input id="total" placeholder="Enter total count" />
                      </div>
                      <div>
                        <Label htmlFor="sourceOfFund">Source Of Fund</Label>
                        <Input id="sourceOfFund" placeholder="Enter source of fund" />
                      </div>
                      <Button onClick={() => setIsAddFacilityOpen(false)}>Add Facility</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Existing</TableHead>
                      <TableHead>Newly Created</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Source Of Fund</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {infrastructureFacilities.map((facility, index) => (
                      <TableRow key={facility.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{facility.facility}</TableCell>
                        <TableCell>{facility.existing}</TableCell>
                        <TableCell>{facility.newlyCreated}</TableCell>
                        <TableCell>{facility.total}</TableCell>
                        <TableCell>{facility.sourceOfFund}</TableCell>
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

          <TabsContent value="digitization">
            <Card>
              <CardHeader>
                <CardTitle>Digitization of Administration and Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe digitization initiatives for administration and library..."
                    className="min-h-[200px]"
                  />
                  <Button>Update Digitization Details</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Library Services</CardTitle>
                <Dialog open={isAddLibraryServiceOpen} onOpenChange={setIsAddLibraryServiceOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Library Service</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="service">Library Service</Label>
                        <Input id="service" placeholder="Enter service name" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="existingNumber">Existing Number</Label>
                          <Input id="existingNumber" placeholder="Enter existing number" />
                        </div>
                        <div>
                          <Label htmlFor="existingValue">Existing Value (Lakhs)</Label>
                          <Input id="existingValue" placeholder="Enter existing value" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newNumber">New Number</Label>
                          <Input id="newNumber" placeholder="Enter new number" />
                        </div>
                        <div>
                          <Label htmlFor="newValue">New Value (Lakhs)</Label>
                          <Input id="newValue" placeholder="Enter new value" />
                        </div>
                      </div>
                      <Button onClick={() => setIsAddLibraryServiceOpen(false)}>Add Service</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Library Service</TableHead>
                      <TableHead>Existing Number</TableHead>
                      <TableHead>Existing Value</TableHead>
                      <TableHead>New Number</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Total Number</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {libraryServices.map((service, index) => (
                      <TableRow key={service.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{service.service}</TableCell>
                        <TableCell>{service.existingNumber}</TableCell>
                        <TableCell>{service.existingValue}</TableCell>
                        <TableCell>{service.newNumber}</TableCell>
                        <TableCell>{service.newValue}</TableCell>
                        <TableCell>{service.totalNumber}</TableCell>
                        <TableCell>{service.totalValue}</TableCell>
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

          <TabsContent value="ict">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Details of ICT Facilities</CardTitle>
                <Dialog open={isAddICTOpen} onOpenChange={setIsAddICTOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add ICT Facility
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add ICT Facility</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="technology">Technology</Label>
                        <Input id="technology" placeholder="Enter technology name" />
                      </div>
                      <div>
                        <Label htmlFor="existing">Existing</Label>
                        <Input id="existing" placeholder="Enter existing count" />
                      </div>
                      <div>
                        <Label htmlFor="added">Added</Label>
                        <Input id="added" placeholder="Enter added count" />
                      </div>
                      <div>
                        <Label htmlFor="total">Total</Label>
                        <Input id="total" placeholder="Enter total count" />
                      </div>
                      <Button onClick={() => setIsAddICTOpen(false)}>Add ICT Facility</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Technology</TableHead>
                      <TableHead>Existing</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ictFacilities.map((facility, index) => (
                      <TableRow key={facility.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{facility.technology}</TableCell>
                        <TableCell>{facility.existing}</TableCell>
                        <TableCell>{facility.added}</TableCell>
                        <TableCell>{facility.total}</TableCell>
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

          <TabsContent value="upgradation">
            <Card>
              <CardHeader>
                <CardTitle>Technology Upgradation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea placeholder="Describe technology upgradation initiatives..." className="min-h-[200px]" />
                  <Button>Update Technology Details</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Computer, Internet access, Training to Teachers and Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe training programs for technology upgradation..."
                    className="min-h-[200px]"
                  />
                  <Button>Update Training Details</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Amount Spent On Maintenance (in lakhs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maintenanceAmount">Maintenance Amount (Lakhs)</Label>
                    <Input id="maintenanceAmount" placeholder="Enter amount spent on maintenance" />
                  </div>
                  <div>
                    <Label htmlFor="maintenanceDetails">Details</Label>
                    <Textarea
                      id="maintenanceDetails"
                      placeholder="Provide details of maintenance expenses..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button>Update Maintenance Details</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
