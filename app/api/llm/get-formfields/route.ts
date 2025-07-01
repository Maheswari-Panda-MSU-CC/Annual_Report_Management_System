import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate comprehensive mock form data based on the type
    let mockFormData = {}

    switch (type) {
      case "performance":
        mockFormData = {
          title: "Keynote Presentation on AI in Healthcare",
          place: "New Delhi, India",
          date: "2024-03-15",
          nature: "Oral Presentation",
        }
        break
      case "awards":
        mockFormData = {
          name: "Excellence in Research Award",
          awardName: "Excellence in Research Award",
          details:
            "Awarded for outstanding contributions to artificial intelligence research and innovation in healthcare applications",
          agency: "National Academy of Sciences",
          awardingBody: "National Academy of Sciences",
          awardingAgency: "National Academy of Sciences",
          agencyAddress: "2101 Constitution Avenue NW, Washington, DC 20418, USA",
          address: "2101 Constitution Avenue NW, Washington, DC 20418, USA",
          date: "2024-01-20",
          dateReceived: "2024-01-20",
          awardDate: "2024-01-20",
          level: "National",
        }
        break
      case "extension":
        mockFormData = {
          name: "Community Health Awareness Program",
          activityName: "Community Health Awareness Program",
          nature: "Health & Wellness",
          activityType: "Health & Wellness",
          level: "State",
          sponsoredBy: "State Health Department",
          sponsor: "State Health Department",
          organizingBody: "State Health Department",
          place: "Mumbai, Maharashtra",
          venue: "Mumbai, Maharashtra",
          date: "2024-02-10",
          activityDate: "2024-02-10",
        }
        break
      case "refresher":
        mockFormData = {
          name: "Dr. Sarah Johnson",
          courseType: "Faculty Development Program",
          startDate: "2024-01-15",
          endDate: "2024-01-19",
          organizingUniversity: "Indian Institute of Technology Delhi",
          organizingInstitute: "Centre for Educational Technology",
          organizingDepartment: "Computer Science and Engineering",
          centre: "Academic Staff College",
        }
        break
      case "contribution":
        mockFormData = {
          name: "Dr. Michael Chen",
          programme: "Conference",
          place: "New Delhi, India",
          date: "2024-03-15",
          year: "2024",
          participatedAs: "Organizer",
        }
        break
      case "academic-body":
        mockFormData = {
          courseTitle: "Advanced Machine Learning Techniques",
          academicBody: "Board of Studies in Computer Science",
          place: "Mumbai, India",
          participatedAs: "Expert",
          year: "2024",
        }
        break
      case "committee":
        mockFormData = {
          name: "Dr. Emily Davis",
          committeeName: "Academic Planning Committee",
          level: "University",
          participatedAs: "Member",
          year: "2024",
        }
        break
      case "talks":
        mockFormData = {
          name: "Dr. Alex Thompson",
          programme: "Keynote Speech",
          place: "Bangalore, India",
          talkDate: "2024-04-20",
          titleOfEvent: "Future of Artificial Intelligence in Healthcare",
          participatedAs: "Keynote Speaker",
        }
        break
      case "articles":
        mockFormData = {
          title: "Deep Learning Approaches for Medical Image Analysis: A Comprehensive Review",
          authors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Davis"],
          journal: "IEEE Transactions on Medical Imaging",
          volume: "42",
          issue: "8",
          pages: "1234-1247",
          year: "2024",
          date: "2024-03-15",
          doi: "10.1109/TMI.2024.1234567",
          impactFactor: "10.048",
          issn: "02780062",
          level: "International",
          type: "Journal Article",
          authorType: "First Author",
          journalBookName: "IEEE Transactions on Medical Imaging",
          volumeNo: "42",
          pageNo: "1234-1247",
          hIndex: "85",
        }
        break
      case "books":
        mockFormData = {
          title: "Artificial Intelligence in Healthcare: Principles and Applications",
          authors: ["Dr. Alex Thompson", "Dr. Maria Rodriguez", "Dr. James Wilson"],
          isbn: "9781234567890",
          publisherName: "Academic Press",
          publishingDate: "2024-02-20",
          publishingPlace: "New York, USA",
          chapterCount: "15",
          publishingLevel: "International",
          bookType: "Textbook",
          authorType: "Author",
        }
        break
      case "papers":
        mockFormData = {
          titleOfPaper: "Novel Approaches to Federated Learning in Healthcare Systems",
          authors: ["Dr. Lisa Park", "Dr. Robert Kim", "Dr. Anna Chen"],
          presentationLevel: "International",
          themeOfConference: "Artificial Intelligence and Machine Learning in Healthcare",
          modeOfParticipation: "Physical",
          organizingBody: "IEEE Computer Society",
          place: "San Francisco, USA",
          dateOfPresentation: "2024-04-15",
        }
        break
      case "research_project":
        mockFormData = {
          title: "AI-Driven Predictive Analytics for Smart Healthcare Systems",
          fundingAgency: "Department of Science and Technology (DST)",
          totalGrantSanctioned: "2500000",
          totalGrantReceived: "1875000",
          projectNature: "applied-research",
          level: "national",
          duration: "3 years",
          status: "ongoing",
          startDate: "2023-04-01",
          seedGrant: "150000",
          seedGrantYear: "2022",
        }
        break
      case "patent":
        mockFormData = {
          title: "Advanced Machine Learning Algorithm for Predictive Analytics",
          level: "International",
          status: "Published",
          date: "2024-01-15",
          transferOfTechnology: "Yes",
          earningGenerated: "250000",
          patentApplicationNo: "PCT/US2024/012345",
          inventors: "Dr. John Smith, Dr. Jane Doe",
          assignee: "University Research Institute",
          priority_date: "2023-12-01",
          publication_date: "2024-01-15",
          grant_date: "",
          patent_family: "Machine Learning Patents",
          technology_domain: "Artificial Intelligence",
          commercial_potential: "High",
          licensing_status: "Available",
          maintenance_fee_status: "Paid",
        }
        break
      case "publication":
        mockFormData = {
          title: "Deep Learning Approaches for Medical Image Analysis",
          authors: "Dr. Sarah Johnson, Dr. Michael Chen, Dr. Emily Davis",
          journal: "IEEE Transactions on Medical Imaging",
          volume: "42",
          issue: "8",
          pages: "1234-1247",
          year: "2024",
          doi: "10.1109/TMI.2024.1234567",
          impactFactor: "10.048",
          quartile: "Q1",
          citationCount: "15",
          publicationType: "journal-article",
          indexing: "SCI",
        }
        break
      case "online_engagement":
        mockFormData = {
          platform: "YouTube",
          contentType: "Educational Video Series",
          title: "Introduction to Machine Learning for Beginners",
          description: "A comprehensive video series covering fundamental concepts of machine learning",
          url: "https://youtube.com/watch?v=example123",
          datePublished: "2024-02-15",
          views: "25000",
          engagement: "1200",
          duration: "45 minutes",
          language: "English",
          targetAudience: "Students and Professionals",
        }
        break
      case "event":
        mockFormData = {
          eventName: "International Conference on Artificial Intelligence",
          eventType: "conference",
          role: "keynote-speaker",
          organizingInstitute: "IEEE Computer Society",
          venue: "New Delhi, India",
          startDate: "2024-03-15",
          endDate: "2024-03-17",
          participantCount: "500",
          level: "international",
          certificateReceived: "yes",
          topicPresented: "Future of AI in Healthcare",
        }
        break
      case "award":
        mockFormData = {
          awardName: "Excellence in Research Award",
          awardingBody: "National Academy of Sciences",
          category: "research-excellence",
          level: "national",
          dateReceived: "2024-01-20",
          monetaryValue: "100000",
          citation: "For outstanding contributions to artificial intelligence research",
          certificateNumber: "NAS-2024-001",
        }
        break
      case "academic_recommendation":
        mockFormData = {
          title: "Advances in Neural Network Architectures",
          recommendationType: "journal-article",
          authors: "Dr. Alex Thompson, Dr. Maria Rodriguez",
          publication: "Nature Machine Intelligence",
          recommendationDate: "2024-02-10",
          significance: "Breakthrough research in transformer architectures",
          impact: "High impact on computer vision applications",
          relevance: "Directly applicable to current research projects",
        }
        break
      case "jrf_srf":
        mockFormData = {
          candidateName: "Rahul Sharma",
          fellowshipType: "JRF",
          researchArea: "Machine Learning and Data Science",
          guideName: "Dr. Priya Patel",
          registrationDate: "2023-07-01",
          expectedCompletion: "2026-06-30",
          currentStatus: "ongoing",
          stipendAmount: "31000",
          researchTitle: "Federated Learning for Privacy-Preserving Healthcare Analytics",
        }
        break
      default:
        mockFormData = {
          title: "Sample Research Project",
          description: "This is a sample description extracted from the document",
          date: "2024-01-15",
          status: "active",
        }
    }

    return NextResponse.json({
      success: true,
      data: mockFormData,
      extracted_fields: Object.keys(mockFormData).length,
      confidence: 0.89,
      extraction_method: "AI Document Analysis",
      processing_time: "1.2s",
    })
  } catch (error) {
    console.error("Error in get-formfields API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to extract form fields from document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
