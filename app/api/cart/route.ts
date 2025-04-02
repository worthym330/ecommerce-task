import { getOrCreateCart } from "@/lib/store"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return NextResponse.json({ items: [], totalAmount: 0 })
  }

  const cart = getOrCreateCart(userId)

  return NextResponse.json({
    items: cart.items,
    totalAmount: cart.totalAmount,
  })
}

