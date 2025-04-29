"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  available: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    // Calculate totals whenever items change
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    
    setTotalItems(itemCount)
    setTotalAmount(amount)
  }, [items])

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id)
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const updatedItems = [...prevItems]
        const currentQuantity = updatedItems[existingItemIndex].quantity
        
        // Don't exceed available stock
        if (currentQuantity < item.available) {
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: currentQuantity + 1
          }
        }
        
        return updatedItems
      } else {
        // Item doesn't exist, add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.min(Math.max(quantity, 0), item.available) } 
          : item
      ).filter(item => item.quantity > 0) // Remove items with quantity 0
    )
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}