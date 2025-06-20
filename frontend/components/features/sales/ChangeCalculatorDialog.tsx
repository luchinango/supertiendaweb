"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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

  const changeToReturn = useMemo(() => {
    const clientPaymentValue = Number.parseFloat(clientPayment || "0")
    const cashToPayValue = Number.parseFloat(cashToPay || "0")
    return clientPaymentValue >= cashToPayValue ? clientPaymentValue - cashToPayValue : 0
  }, [clientPayment, cashToPay])

  const handleSaleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSaleValue(e.target.value)
  }, [])

  const handleCashToPayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCashToPay(e.target.value)
  }, [])

  const handleClientPaymentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClientPayment(e.target.value)
  }, [])

  const handleConfirm = useCallback(() => {
    onConfirm()
    onClose()
  }, [onConfirm, onClose])

  useEffect(() => {
    if (isOpen) {
      setSaleValue(totalAmount.toString())
      setCashToPay(totalAmount.toString())
      setClientPayment("")
    }
  }, [isOpen, totalAmount])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[2px] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Calculadora de Cambio</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Valor de la venta</label>
            <Input
              type="number"
              value={saleValue}
              onChange={handleSaleValueChange}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Efectivo a pagar</label>
            <Input
              type="number"
              value={cashToPay}
              onChange={handleCashToPayChange}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Pago del cliente</label>
            <Input
              type="number"
              value={clientPayment}
              onChange={handleClientPaymentChange}
              className="mt-1"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cambio a devolver:</span>
              <span className="text-lg font-bold text-green-600">
                Bs {changeToReturn.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
