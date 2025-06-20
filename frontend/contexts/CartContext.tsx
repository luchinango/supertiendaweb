"use client"

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  image?: string
  available: number
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  totalAmount: number
  totalItems: number
  addItem(item: Omit<CartItem,"quantity">): void
  removeItem(id: number): void
  updateQuantity(id: number, quantity: number): void
  clearCart(): void
}

const CartContext = createContext<CartContextType|undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(item: Omit<CartItem,"quantity">) {
    setItems((prev) => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity+1, i.available) }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function updateQuantity(id: number, quantity: number) {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter(i => i.id !== id)
      return prev.map(i =>
        i.id === id
          ? { ...i, quantity: Math.min(Math.max(quantity,1), i.available) }
          : i
      )
    })
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter(i => i.id !== id))
  }

  function clearCart() {
    setItems([])
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      totalAmount,
      totalItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be inside CartProvider")
  return ctx
}