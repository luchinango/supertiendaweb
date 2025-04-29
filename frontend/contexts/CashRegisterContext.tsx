"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type CashRegisterStatus = "closed" | "open"

interface CashRegisterContextType {
  isFormOpen: boolean
  registerStatus: CashRegisterStatus
  openCashRegisterForm: () => void
  closeCashRegisterForm: () => void
  openCashRegister: (employeeId: string, initialAmount: number) => void
  closeCashRegister: () => void
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined)

export function CashRegisterProvider({ children }: { children: ReactNode }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [registerStatus, setRegisterStatus] = useState<CashRegisterStatus>("closed")
  const [currentEmployee, setCurrentEmployee] = useState<string | null>(null)
  const [initialAmount, setInitialAmount] = useState(0)

  const openCashRegisterForm = () => setIsFormOpen(true)
  const closeCashRegisterForm = () => setIsFormOpen(false)

  const openCashRegister = (employeeId: string, amount: number) => {
    setCurrentEmployee(employeeId)
    setInitialAmount(amount)
    setRegisterStatus("open")
    setIsFormOpen(false)
  }

  const closeCashRegister = () => {
    setCurrentEmployee(null)
    setInitialAmount(0)
    setRegisterStatus("closed")
  }

  return (
    <CashRegisterContext.Provider
      value={{
        isFormOpen,
        registerStatus,
        openCashRegisterForm,
        closeCashRegisterForm,
        openCashRegister,
        closeCashRegister,
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  )
}

export function useCashRegister() {
  const context = useContext(CashRegisterContext)
  if (context === undefined) {
    throw new Error("useCashRegister must be used within a CashRegisterProvider")
  }
  return context
}
