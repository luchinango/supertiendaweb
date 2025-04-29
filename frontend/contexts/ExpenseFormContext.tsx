"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ExpenseFormContextType {
  isExpenseFormOpen: boolean
  openExpenseForm: () => void
  closeExpenseForm: () => void
}

const ExpenseFormContext = createContext<ExpenseFormContextType | undefined>(undefined)

export function ExpenseFormProvider({ children }: { children: ReactNode }) {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)

  const openExpenseForm = () => setIsExpenseFormOpen(true)
  const closeExpenseForm = () => setIsExpenseFormOpen(false)

  return (
    <ExpenseFormContext.Provider value={{ isExpenseFormOpen, openExpenseForm, closeExpenseForm }}>
      {children}
    </ExpenseFormContext.Provider>
  )
}

export function useExpenseForm() {
  const context = useContext(ExpenseFormContext)
  if (context === undefined) {
    throw new Error("useExpenseForm must be used within an ExpenseFormProvider")
  }
  return context
}