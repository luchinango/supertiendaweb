"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface ChangeCalculatorDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalAmount: number
}

export function ChangeCalculatorDialog({ isOpen, onClose, onConfirm, totalAmount }: ChangeCalculatorDialogProps) {
  const [saleValue, setSaleValue] = useState(totalAmount.toString())
  const [cashToPay, setCashToPay] = useState(totalAmount.toString())
  const [clientPayment, setClientPayment] = useState("")
  const [changeToReturn, setChangeToReturn] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setSaleValue(totalAmount.toString())
      setCashToPay(totalAmount.toString())
      setClientPayment("")
      setChangeToReturn(0)
    }
  }, [isOpen, totalAmount])

  useEffect(() => {
    const clientPaymentValue = Number.parseFloat(clientPayment || "0")
    const cashToPayValue = Number.parseFloat(cashToPay || "0")

    if (clientPaymentValue >= cashToPayValue) {
      setChangeToReturn(clientPaymentValue - cashToPayValue)
    } else {
      setChangeToReturn(0)
    }
  }, [clientPayment, cashToPay])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      <div className="bg-white rounded-md shadow-lg max-w-lg w-full mx-4 z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Calcula el cambio de tu venta</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium block">Valor de la venta</label>
            <Input
              value={saleValue}
              onChange={(e) => setSaleValue(e.target.value)}
              placeholder="Bs 0"
              type="number"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Valor a pagar en efectivo</label>
            <Input
              value={cashToPay}
              onChange={(e) => setCashToPay(e.target.value)}
              placeholder="Bs 0"
              type="number"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">¿Con cuánto paga tu cliente?</label>
            <Input
              value={clientPayment}
              onChange={(e) => setClientPayment(e.target.value)}
              placeholder="Bs 0"
              type="number"
              className="text-right"
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Valor a devolver</span>
            <span className="font-bold">Bs {changeToReturn}</span>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button onClick={onConfirm} className="bg-gray-800 hover:bg-gray-700">
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}