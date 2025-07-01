export async function getResearchProjectsData() {
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    projects: [
      {
        id: "1",
        title: "AI-Powered Educational Systems",
        principalInvestigator: "Dr. Rajesh Kumar",
        fundingAgency: "UGC",
        grantAmount: 2500000,
        status: "Ongoing",
        startDate: "2023-04-01",
        endDate: "2026-03-31",
      },
      // ... more projects
    ],
    totalCount: 156,
    totalFunding: 45000000,
    activeProjects: 89,
  }
}
