import type { Product, Cart, Order, DiscountCode, UserStats } from "./types"
import { v4 as uuidv4 } from "uuid"

// In-memory store
const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    description: "Premium noise-cancelling wireless headphones",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 149.99,
    description: "Fitness tracking and notifications on your wrist",
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    price: 79.99,
    description: "Portable speaker with amazing sound quality",
  },
  {
    id: "4",
    name: "Laptop Backpack",
    price: 49.99,
    description: "Water-resistant backpack with laptop compartment",
  },
]

const carts: Map<string, Cart> = new Map()
const orders: Order[] = []
const discountCodes: DiscountCode[] = []
const userStats: Map<string, UserStats> = new Map() // Track per-user stats

// Configuration
const DISCOUNT_PERCENTAGE = 10
const NTH_ORDER_FOR_DISCOUNT = 3 // Every 3rd order per user gets a discount

// Helper functions
export function getProducts(): Product[] {
  return products
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getOrCreateCart(userId: string): Cart {
  if (!carts.has(userId)) {
    carts.set(userId, {
      userId,
      items: [],
      totalAmount: 0,
    })
  }
  return carts.get(userId)!
}

export function updateCart(userId: string, cart: Cart): void {
  carts.set(userId, cart)
}

export function getUserOrderCount(userId: string): number {
  const stats = userStats.get(userId)
  return stats ? stats.orderCount : 0
}

export function updateUserStats(userId: string, orderAmount: number): UserStats {
  const existingStats = userStats.get(userId) || {
    userId,
    orderCount: 0,
    totalSpent: 0,
  }

  const updatedStats: UserStats = {
    ...existingStats,
    orderCount: existingStats.orderCount + 1,
    totalSpent: existingStats.totalSpent + orderAmount,
    lastOrderDate: new Date(),
  }

  userStats.set(userId, updatedStats)
  return updatedStats
}

export function createOrder(
  userId: string,
  items: Cart["items"],
  totalAmount: number,
  discountCode?: string,
  discountAmount = 0,
): Order {
  // Get current user order count and increment
  const userOrderCount = getUserOrderCount(userId) + 1

  const order: Order = {
    id: uuidv4(),
    userId,
    items,
    totalAmount,
    discountCode,
    discountAmount,
    finalAmount: totalAmount - discountAmount,
    date: new Date(),
    orderNumber: userOrderCount,
  }

  orders.push(order)

  // Update user stats
  updateUserStats(userId, order.finalAmount)

  return order
}

export function getOrders(): Order[] {
  return orders
}

export function getUserOrders(userId: string): Order[] {
  return orders.filter((order) => order.userId === userId)
}

export function getOrderCount(): number {
  return orders.length
}

export function generateDiscountCode(customCode?: string, userId?: string): string {
  const code = customCode || `DISCOUNT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  discountCodes.push({
    code,
    used: false,
    userId,
    createdAt: new Date(),
  })
  return code
}

export function validateDiscountCode(code: string, userId: string): DiscountCode | undefined {
  // Find an unused discount code that either belongs to this user or has no user (admin generated)
  return discountCodes.find((dc) => dc.code === code && !dc.used && (!dc.userId || dc.userId === userId))
}

export function markDiscountCodeAsUsed(code: string, orderId: string): void {
  const discountCode = discountCodes.find((dc) => dc.code === code)
  if (discountCode) {
    discountCode.used = true
    discountCode.orderId = orderId
    discountCode.usedAt = new Date()
  }
}

export function getDiscountCodes(): DiscountCode[] {
  return discountCodes
}

export function getAllDiscountCodes(): DiscountCode[] {
  // Return all discount codes sorted by creation date (newest first)
  return [...discountCodes].sort((a, b) => {
    return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
  })
}

export function getUserDiscountCodes(userId: string): DiscountCode[] {
  return discountCodes.filter((dc) => dc.userId === userId)
}

export function getUserAvailableDiscountCodes(userId: string): DiscountCode[] {
  return discountCodes.filter((dc) => dc.userId === userId && !dc.used)
}

export function calculateDiscount(amount: number): number {
  return (amount * DISCOUNT_PERCENTAGE) / 100
}

export function shouldGenerateDiscountCode(userId: string): boolean {
  const userOrderCount = getUserOrderCount(userId)
  // Generate a discount code if this is the user's Nth order
  return userOrderCount > 0 && userOrderCount % NTH_ORDER_FOR_DISCOUNT === 0
}

export function getAllUserStats(): UserStats[] {
  return Array.from(userStats.values())
}

export function getStats() {
  const totalItemsPurchased = orders.reduce((total, order) => {
    return total + order.items.reduce((sum, item) => sum + item.quantity, 0)
  }, 0)

  const totalPurchaseAmount = orders.reduce((total, order) => total + order.totalAmount, 0)

  const totalDiscountAmount = orders.reduce((total, order) => total + order.discountAmount, 0)

  return {
    totalOrders: orders.length,
    totalItemsPurchased,
    totalPurchaseAmount,
    discountCodes: discountCodes,
    totalDiscountAmount,
    userStats: getAllUserStats(),
  }
}

