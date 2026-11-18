"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/contexts/CashRegisterContext"
import { useAuth } from "@/hooks/useAuth"

export function CashRegisterForm() {
  const { isOpenFormVisible, openCashRegister } = useCashRegister()
  const { user } = useAuth()
  const [initialAmount, setInitialAmount] = useState("")
  const [error, setError] = useState("")

  if (!isOpenFormVisible) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.id
    if (!userId) {
      setError("Sesión inválida: no hay usuario autenticado")
      return
    }
    setError("")
    await openCashRegister(Number(initialAmount), userId)
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
      {error ? <p className="text-sm text-red-600 mb-2">{error}</p> : null}
      <Button type="submit" className="bg-green-600 text-white">
        Confirmar
      </Button>
    </form>
  )
}