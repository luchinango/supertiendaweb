"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SalesFormContextType {
  isSalesFormOpen: boolean
  openSalesForm: () => void
  closeSalesForm: () => void
}

const SalesFormContext = createContext<SalesFormContextType | undefined>(undefined)

export function SalesFormProvider({ children }: { children: ReactNode }) {
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false)

  const openSalesForm = () => setIsSalesFormOpen(true)
  const closeSalesForm = () => setIsSalesFormOpen(false)

  return (
    <SalesFormContext.Provider value={{ isSalesFormOpen, openSalesForm, closeSalesForm }}>
      {children}
    </SalesFormContext.Provider>
  )
}

export function useSalesForm() {
  const context = useContext(SalesFormContext)
  if (context === undefined) {
    throw new Error("useSalesForm must be used within a SalesFormProvider")
  }
  return context
}