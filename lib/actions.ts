"use server"

import {
  getProductById,
  getOrCreateCart,
  updateCart,
  createOrder,
  validateDiscountCode,
  markDiscountCodeAsUsed,
  calculateDiscount,
  shouldGenerateDiscountCode,
  generateDiscountCode,
  getProducts,
  getAllDiscountCodes,
} from "./store"

export async function getCart(userId: string) {
  const cart = getOrCreateCart(userId)
  return {
    items: cart.items,
    totalAmount: cart.totalAmount,
  }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const product = getProductById(productId)

  if (!product) {
    return { success: false, message: "Product not found" }
  }

  const cart = getOrCreateCart(userId)


  const existingItemIndex = cart.items.findIndex((item) => item.product.id === productId)

  if (existingItemIndex >= 0) {
  
    cart.items[existingItemIndex].quantity += quantity
  } else {
  
    cart.items.push({
      product,
      quantity,
    })
  }


  cart.totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  updateCart(userId, cart)

  return { success: true, cart }
}

export async function applyDiscount(userId: string, code: string) {
  const cart = getOrCreateCart(userId)

  if (cart.items.length === 0) {
    return { success: false, message: "Your cart is empty" }
  }

  const discountCode = validateDiscountCode(code, userId)

  if (!discountCode) {
    return { success: false, message: "Invalid or already used discount code" }
  }

  const discountAmount = calculateDiscount(cart.totalAmount)

  return {
    success: true,
    discountAmount,
    totalAfterDiscount: cart.totalAmount - discountAmount,
  }
}

export async function checkout(userId: string, discountCode?: string) {
  const cart = getOrCreateCart(userId)

  if (cart.items.length === 0) {
    return { success: false, message: "Your cart is empty" }
  }

  let discountAmount = 0
  let validDiscountCode = undefined


  if (discountCode) {
    validDiscountCode = validateDiscountCode(discountCode, userId)
    if (validDiscountCode) {
      discountAmount = calculateDiscount(cart.totalAmount)
    }
  }


  const order = createOrder(userId, cart.items, cart.totalAmount, discountCode, discountAmount)


  if (validDiscountCode) {
    if (discountCode) {
      markDiscountCodeAsUsed(discountCode, order.id)
    }
  }


  updateCart(userId, {
    userId,
    items: [],
    totalAmount: 0,
  })


  let newDiscountCode = null

  if (shouldGenerateDiscountCode(userId)) {
    newDiscountCode = generateDiscountCode(undefined, userId)
  }

  return {
    success: true,
    message: "Order placed successfully",
    orderId: order.id,
    orderNumber: order.orderNumber,
    newDiscountCode,
  }
}

export async function getAllProducts() {
  return getProducts()
}

export async function createDiscountCode(customCode?: string) {
  const code = generateDiscountCode(customCode)
  return { success: true, code }
}

export async function fetchAllDiscountCodes() {
  const codes = getAllDiscountCodes()
  return { success: true, codes }
}

