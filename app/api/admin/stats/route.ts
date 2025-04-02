import { getStats } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const stats = getStats()
  return NextResponse.json(stats)
}

