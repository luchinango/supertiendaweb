"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface RegisterPaymentPanelProps {
  isOpen: boolean
  onClose: () => void
  creditId: number
  creditType: "supplier" | "client"
  currentAmount: number
  entityName: string
  onRegisterPayment: (
    creditId: number,
    creditType: "supplier" | "client",
    payment: { date: string; amount: number; method: string },
  ) => void
}

export function RegisterPaymentPanel({
  isOpen,
  onClose,
  creditId,
  creditType,
  currentAmount,
  entityName,
  onRegisterPayment,
}: RegisterPaymentPanelProps) {
  const [amount, setAmount] = useState(currentAmount.toString())
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [method, setMethod] = useState("efectivo")
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegisterPayment(creditId, creditType, {
      date,
      amount: Number.parseFloat(amount),
      method,
    })
    setUnsavedChanges(false)
  }

  const handleClose = () => {
    if (unsavedChanges) {
      if (confirm("Aún no has guardado los cambios. ¿Estás seguro que deseas salir?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setUnsavedChanges(true)
    }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/15 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Registrar Pago</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">{creditType === "supplier" ? "Proveedor" : "Cliente"}</p>
            <p className="font-medium">{entityName}</p>
            <p className="text-sm text-gray-500 mt-2">Monto pendiente</p>
            <p className="font-medium">Bs {currentAmount}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a pagar</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleInputChange(setAmount)}
                placeholder="0.00"
                required
                max={currentAmount}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha de pago</Label>
              <Input id="date" type="date" value={date} onChange={handleInputChange(setDate)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método de pago</Label>
              <Select
                value={method}
                onValueChange={(value) => {
                  setMethod(value)
                  setUnsavedChanges(true)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="qr">QR</SelectItem>
                  <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Registrar Pago
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}