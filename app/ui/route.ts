import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Automatically detect environment
    // In Docker: use service name, in dev: use localhost
    const isDocker = process.env.DOCKER_ENV === "true" || process.env.NODE_ENV === "production"
    const backendUrl = isDocker
      ? "http://ai-converse-translate:8100"
      : "http://localhost:8100"

    const response = await fetch(`${backendUrl}/infer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: "Backend service error",
      }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
