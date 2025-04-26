"use client"

import { CashRegisterForm } from "./CashRegisterForm"
import { CloseCashRegisterForm } from "./CloseCashRegisterForm"
import { useCashRegister } from "@/app/context/CashRegisterContext"
import { Button } from "@/components/ui/button"

export function CashRegisterManager() {
  const { registerStatus, openCashRegisterForm } = useCashRegister()

  return (
    <>
      {registerStatus === "closed" && (
        <Button onClick={openCashRegisterForm} className="bg-gray-800 hover:bg-gray-700 text-white">
          Abrir caja
        </Button>
      )}
      <CashRegisterForm />
      <CloseCashRegisterForm />
    </>
  )
}