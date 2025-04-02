"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { addToCart, getCart, checkout, applyDiscount } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Check, Copy, Gift } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { v4 as uuidv4 } from "uuid"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<{ items: any[]; totalAmount: number }>({ items: [], totalAmount: 0 })
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [orderCount, setOrderCount] = useState<number>(0)
  const [availableDiscountCode, setAvailableDiscountCode] = useState<string | null>(null)

  useEffect(() => {
    // Get or create user ID from localStorage
    let storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      storedUserId = uuidv4()
      localStorage.setItem("userId", storedUserId)
    }
    setUserId(storedUserId)

    // Get order count from localStorage
    const storedOrderCount = localStorage.getItem(`orderCount_₹{storedUserId}`)
    if (storedOrderCount) {
      setOrderCount(Number.parseInt(storedOrderCount, 10))
    }

    // Get available discount code from localStorage
    const storedDiscountCode = localStorage.getItem(`discountCode_₹{storedUserId}`)
    if (storedDiscountCode) {
      setAvailableDiscountCode(storedDiscountCode)
    }

    // Fetch products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  useEffect(() => {
    // Fetch cart when userId is available
    if (userId) {
      refreshCart()
    }
  }, [userId])

  const refreshCart = async () => {
    if (!userId) return

    const cartData = await getCart(userId)
    setCart(cartData)
    setDiscountApplied(false)
    setDiscountAmount(0)
  }

  const handleAddToCart = async (productId: string) => {
    if (!userId) return

    setLoading(true)
    const result = await addToCart(userId, productId, 1)
    if (result.success && result.cart) {
      setCart(result.cart)
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      })
    }
    setLoading(false)
  }

  const handleApplyDiscount = async () => {
    if (!userId) return

    if (!discountCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await applyDiscount(userId, discountCode)
      if (result.success) {
        setDiscountApplied(true)
        setDiscountAmount(result.discountAmount ?? 0)
        toast({
          title: "Discount applied",
          description: `You saved ₹${(result.discountAmount ?? 0).toFixed(2)}!`,
        })
      } else {
        toast({
          title: "Invalid code",
          description: result.message || "The discount code is invalid",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply discount code",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleCheckout = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const result = await checkout(userId, discountCode)
      if (result.success) {
        // Update local order count
        const newOrderCount = orderCount + 1
        setOrderCount(newOrderCount)
        localStorage.setItem(`orderCount_${userId}`, newOrderCount.toString())

        setCheckoutSuccess(true)
        setCart({ items: [], totalAmount: 0 })
        setDiscountCode("")
        setDiscountApplied(false)
        setDiscountAmount(0)

        toast({
          title: "Order placed!",
          description: `Your order #${result.orderNumber} has been placed successfully`,
        })

        // If a new discount code was generated, store it in localStorage
        if (result.newDiscountCode) {
          setAvailableDiscountCode(result.newDiscountCode)
          localStorage.setItem(`discountCode_${userId}`, result.newDiscountCode)
        }
      } else {
        toast({
          title: "Checkout failed",
          description: result.message || "Failed to place your order",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during checkout",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const copyDiscountCode = () => {
    if (availableDiscountCode) {
      navigator.clipboard.writeText(availableDiscountCode)
      toast({
        title: "Copied",
        description: "Discount code copied to clipboard",
      })
    }
  }

  const applyAvailableDiscount = () => {
    if (availableDiscountCode) {
      setDiscountCode(availableDiscountCode)
      handleApplyDiscount()
      // Remove the discount code from localStorage after applying
      setAvailableDiscountCode(null)
      localStorage.removeItem(`discountCode_${userId}`)
    }
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">E-Commerce Store</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-muted-foreground mb-2">{product.description}</p>
                  <p className="font-bold">₹{product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button onClick={() => handleAddToCart(product.id)} disabled={loading} className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderCount > 0 && (
                <div className="mb-4 text-sm">
                  <p>
                    Your order count: <span className="font-semibold">{orderCount}</span>
                  </p>
                  {orderCount > 0 && orderCount % 3 === 0 ? (
                    <p className="text-green-600 mt-1">You're eligible for a discount on your next order!</p>
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      {3 - (orderCount % 3)} more order(s) until your next discount
                    </p>
                  )}
                </div>
              )}

              {availableDiscountCode && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <Gift className="h-4 w-4 text-green-600 mr-2" />
                  <AlertDescription className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-700">Your discount code:</span>
                      <Button variant="ghost" size="sm" onClick={copyDiscountCode} className="h-6 px-2">
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <code className="bg-white px-2 py-1 rounded mt-1 font-mono text-sm">{availableDiscountCode}</code>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-green-700 border-green-300 hover:bg-green-100"
                      onClick={applyAvailableDiscount}
                    >
                      Apply to this order
                    </Button> */}
                  </AlertDescription>
                </Alert>
              )}

              {cart.items.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty</p>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {cart.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{cart.totalAmount.toFixed(2)}</span>
                    </div>

                    {discountApplied && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Discount:</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>₹{(cart.totalAmount - discountAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={loading || discountApplied}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={loading || discountApplied || !discountCode.trim()}
                      >
                        {discountApplied ? <Check className="h-4 w-4" /> : "Apply"}
                      </Button>
                    </div>

                    <Button className="w-full" onClick={handleCheckout} disabled={loading || cart.items.length === 0}>
                      Checkout
                    </Button>
                  </div>
                </>
              )}

              {checkoutSuccess && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                  <p className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Order placed successfully!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </main>
  )
}

