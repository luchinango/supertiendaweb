"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/contexts/CashRegisterContext"

export function CashRegisterForm() {
  const { isOpenFormVisible, openCashRegister } = useCashRegister()
  const [initialAmount, setInitialAmount] = useState("")

  if (!isOpenFormVisible) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí puedes obtener el userId de tu sesión o contexto. Por ejemplo, se envía como 1.
    await openCashRegister(Number(initialAmount), 1)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-md">
      <h2 className="text-lg font-bold mb-2">Abrir caja</h2>
      <Input
        type="number"
        placeholder="Monto inicial"
        value={initialAmount}
        onChange={(e) => setInitialAmount(e.target.value)}
        className="mb-2"
      />
      <Button type="submit" className="bg-green-600 text-white">
        Confirmar
      </Button>
    </form>
  )
}