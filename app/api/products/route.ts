import { getProducts } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const products = getProducts()
  return NextResponse.json(products)
}

