import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getProductById, getOrCreateCart, updateCart } from "@/lib/store"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productId, quantity = 1 } = body

    const product = getProductById(productId)

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const cart = getOrCreateCart(userId)

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.id === productId)

    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        product,
        quantity,
      })
    }

    // Recalculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)

    updateCart(userId, cart)

    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
      },
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ success: false, message: "An error occurred while adding to cart" }, { status: 500 })
  }
}

