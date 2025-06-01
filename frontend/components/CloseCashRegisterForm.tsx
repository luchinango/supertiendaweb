"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/contexts/CashRegisterContext"

export function CloseCashRegisterForm() {
  const [finalAmount, setFinalAmount] = useState("")
  const { registerStatus } = useCashRegister()

  if (registerStatus !== "open") return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica para cerrar caja, llamar a un endpoint (no incluido en este ejemplo)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-md mt-4">
      <h2 className="text-lg font-bold mb-2">Cerrar caja</h2>
      <Input
        type="number"
        placeholder="Monto final"
        value={finalAmount}
        onChange={(e) => setFinalAmount(e.target.value)}
        className="mb-2"
      />
      <Button type="submit" className="bg-red-600 text-white">
        Cerrar caja
      </Button>
    </form>
  )
}