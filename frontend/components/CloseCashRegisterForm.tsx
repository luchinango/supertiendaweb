"use client"

import type React from "react"

import { useState } from "react"
import { X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCashRegister } from "../contexts/CashRegisterContext"

export function CloseCashRegisterForm() {
  const { registerStatus, closeCashRegister } = useCashRegister()
  const [finalAmount, setFinalAmount] = useState("0")
  const [isFormOpen, setIsFormOpen] = useState(false)

  const openForm = () => setIsFormOpen(true)
  const closeForm = () => setIsFormOpen(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    closeCashRegister()
    closeForm()
  }

  if (!isFormOpen) {
    return registerStatus === "open" ? (
      <Button onClick={openForm} className="bg-red-600 hover:bg-red-700">
        Cerrar caja
      </Button>
    ) : null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={closeForm} />

      {/* Form panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Cerrar caja</h2>
            <Button variant="ghost" size="icon" onClick={closeForm} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="finalAmount">
                  ¿Con cuánto dinero cierras el turno?
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Info className="h-4 w-4 text-gray-400 ml-2" />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">Bs</span>
                </div>
                <Input
                  id="finalAmount"
                  type="number"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Asegúrate de contar correctamente el dinero en caja antes de cerrar el turno.
              </p>
            </div>

            <div className="mt-auto pt-6">
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Cerrar turno
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}