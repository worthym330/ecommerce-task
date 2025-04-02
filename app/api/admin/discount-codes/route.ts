import { getAllDiscountCodes } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const discountCodes = getAllDiscountCodes()
  return NextResponse.json({ success: true, codes: discountCodes })
}

