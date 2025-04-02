import { generateDiscountCode } from "@/lib/store"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customCode } = body

    const code = generateDiscountCode(customCode)

    return NextResponse.json({
      success: true,
      code,
    })
  } catch (error) {
    console.error("Create discount error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating discount code" },
      { status: 500 },
    )
  }
}

