import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { ShoppingCart, LayoutDashboard, Tag } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "A simple e-commerce store with cart and checkout functionality"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link href="/" className="font-bold text-xl">
              E-Commerce Store
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="flex items-center gap-1 hover:text-primary">
                <ShoppingCart className="h-4 w-4" />
                Store
              </Link>
              <Link href="/admin" className="flex items-center gap-1 hover:text-primary">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
              <Link href="/admin/discounts" className="flex items-center gap-1 hover:text-primary">
                <Tag className="h-4 w-4" />
                Discounts
              </Link>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}



import './globals.css'