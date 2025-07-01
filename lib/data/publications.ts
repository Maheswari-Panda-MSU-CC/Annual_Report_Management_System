export async function getPublicationsData() {
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    publications: [
      {
        id: "1",
        title: "Advanced Machine Learning Techniques",
        authors: "Dr. Rajesh Kumar, Dr. Priya Sharma",
        journal: "International Journal of AI",
        year: 2024,
        citations: 25,
        impactFactor: 4.2,
        type: "Journal Article",
      },
      // ... more publications
    ],
    totalCount: 1245,
    filters: {
      years: [2024, 2023, 2022, 2021],
      types: ["Journal Article", "Conference Paper", "Book Chapter"],
      departments: ["Computer Science", "Mathematics", "Physics"],
    },
  }
}
