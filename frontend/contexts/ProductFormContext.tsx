"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ProductFormContextType {
  isProductFormOpen: boolean
  openProductForm: () => void
  closeProductForm: () => void
}

const ProductFormContext = createContext<ProductFormContextType | undefined>(undefined)

export function ProductFormProvider({ children }: { children: ReactNode }) {
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)

  const openProductForm = () => setIsProductFormOpen(true)
  const closeProductForm = () => setIsProductFormOpen(false)

  return (
    <ProductFormContext.Provider value={{ isProductFormOpen, openProductForm, closeProductForm }}>
      {children}
    </ProductFormContext.Provider>
  )
}

export function useProductForm() {
  const context = useContext(ProductFormContext)
  if (context === undefined) {
    throw new Error("useProductForm must be used within a ProductFormProvider")
  }
  return context
}
