export interface Product {
  id: string
  name: string
  price: number
  description: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  userId: string
  items: CartItem[]
  totalAmount: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  discountCode?: string
  discountAmount: number
  finalAmount: number
  date: Date
  orderNumber: number
}

export interface DiscountCode {
  code: string
  used: boolean
  orderId?: string
  userId?: string
  createdAt?: Date
  usedAt?: Date
}

export interface UserStats {
  userId: string
  orderCount: number
  totalSpent: number
  lastOrderDate?: Date
}

