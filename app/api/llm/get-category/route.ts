import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock category response
    const mockCategory = {
      category: "patent",
      type: "intellectual_property",
      confidence: 0.95,
    }

    return NextResponse.json(mockCategory)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get category" }, { status: 500 })
  }
}
