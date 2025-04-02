import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  getOrCreateCart,
  validateDiscountCode,
  calculateDiscount,
  createOrder,
  markDiscountCodeAsUsed,
  updateCart,
  getOrderCount,
  shouldGenerateDiscountCode,
  generateDiscountCode,
} from "@/lib/store"

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
    const { discountCode } = body

    let discountAmount = 0
    let validDiscountCode = undefined

    // Validate discount code if provided
    if (discountCode) {
      validDiscountCode = validateDiscountCode(discountCode, userId)
      if (validDiscountCode) {
        discountAmount = calculateDiscount(cart.totalAmount)
      }
    }

    // Create the order
    const order = createOrder(userId, cart.items, cart.totalAmount, discountCode, discountAmount)

    // Mark discount code as used if valid
    if (validDiscountCode) {
      markDiscountCodeAsUsed(discountCode, order.id)
    }

    // Clear the cart
    updateCart(userId, {
      userId,
      items: [],
      totalAmount: 0,
    })

    // Check if we should generate a new discount code
    const orderCount = getOrderCount()
    let newDiscountCode = null

    if (shouldGenerateDiscountCode(userId)) {
      newDiscountCode = generateDiscountCode()
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: order.id,
      newDiscountCode,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during checkout" }, { status: 500 })
  }
}

