import { generateDiscountCode } from "@/lib/store"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const code = generateDiscountCode()
  return NextResponse.json({ code })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customCode } = body

    const code = generateDiscountCode(customCode)
    return NextResponse.json({ success: true, code })
  } catch (error) {
    console.error("Error generating discount code:", error)
    return NextResponse.json({ success: false, message: "Failed to generate discount code" }, { status: 500 })
  }
}

