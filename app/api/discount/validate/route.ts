import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getOrCreateCart, validateDiscountCode, calculateDiscount } from "@/lib/store"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 401 })
  }

  const cart = getOrCreateCart(userId)

  if (cart.items.length === 0) {
    return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ success: false, message: "No discount code provided" }, { status: 400 })
    }

    const discountCode = validateDiscountCode(code, userId)

    if (!discountCode) {
      return NextResponse.json({ success: false, message: "Invalid or already used discount code" }, { status: 400 })
    }

    const discountAmount = calculateDiscount(cart.totalAmount)

    return NextResponse.json({
      success: true,
      discountAmount,
      totalAfterDiscount: cart.totalAmount - discountAmount,
    })
  } catch (error) {
    console.error("Validate discount error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while validating discount code" },
      { status: 500 },
    )
  }
}

