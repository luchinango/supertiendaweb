"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PromotionFormContextType {
  isPromotionFormOpen: boolean
  openPromotionForm: (productId?: number) => void
  closePromotionForm: () => void
  selectedProductId: number | null
}

const PromotionFormContext = createContext<PromotionFormContextType | undefined>(undefined)

export function PromotionFormProvider({ children }: { children: ReactNode }) {
  const [isPromotionFormOpen, setIsPromotionFormOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  const openPromotionForm = (productId?: number) => {
    if (productId) {
      setSelectedProductId(productId)
    }
    setIsPromotionFormOpen(true)
  }

  const closePromotionForm = () => {
    setIsPromotionFormOpen(false)
    setSelectedProductId(null)
  }

  return (
    <PromotionFormContext.Provider
      value={{
        isPromotionFormOpen,
        openPromotionForm,
        closePromotionForm,
        selectedProductId,
      }}
    >
      {children}
    </PromotionFormContext.Provider>
  )
}

export function usePromotionForm() {
  const context = useContext(PromotionFormContext)
  if (context === undefined) {
    throw new Error("usePromotionForm must be used within a PromotionFormProvider")
  }
  return context
}