// Server-side data fetching functions
export async function getFacultyData() {
  // Simulate database call
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    faculty: [
      {
        id: "1",
        employeeId: "MSU001",
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@msubaroda.ac.in",
        department: "Computer Science",
        designation: "Professor",
        publications: 45,
        projects: 8,
        experience: 15,
        status: "Active",
      },
      // ... more faculty data
    ],
    totalCount: 248,
    departments: ["Computer Science", "Mathematics", "Physics", "Chemistry"],
    designations: ["Professor", "Associate Professor", "Assistant Professor"],
  }
}
