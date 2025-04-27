"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Calendar, ChevronRight } from "lucide-react"
import { useState } from "react"

interface EditSalePanelProps {
  isOpen: boolean
  onClose: () => void
  transaction: any
  onSave?: (updatedTransaction: any) => void
}

export function EditSalePanel({ isOpen, onClose, transaction, onSave }: EditSalePanelProps) {
  const [name, setName] = useState(transaction?.concept || "")
  const [date, setDate] = useState(transaction?.date?.split(" | ")[0] || "")

  if (!isOpen) return null

  const handleSave = () => {
    if (onSave) {
      const updatedTransaction = {
        ...transaction,
        concept: name,
        date: `${date} | ${transaction.date.split(" | ")[1]}`,
      }
      onSave(updatedTransaction)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Edit panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={onClose} className="flex items-center text-gray-600">
              <X className="h-5 w-5 mr-1" />
              <span>Editar venta</span>
            </button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-green-500 -mx-6 mb-6"></div>

          <div className="text-sm text-gray-500 mb-4">Los campos marcados con asterisco (*) son obligatorios</div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de la venta <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="pr-10" />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Productos vendidos</label>
              <button className="w-full flex items-center justify-between border rounded-md p-3 text-left">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                    <span className="text-xs text-gray-500">{transaction.details.length}</span>
                  </div>
                  <span>{transaction.details.length} productos seleccionados</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor de los productos</label>
              <div className="text-right font-bold">Bs {transaction.value}</div>
            </div>

            <div>
              <button className="flex items-center text-gray-600">
                <span className="h-5 w-5 rounded-full border flex items-center justify-center mr-2">+</span>
                Agregar un descuento
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">¿Quieres darle un nombre a esta venta?</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la venta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Selecciona el método de pago <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded-md p-3 flex flex-col items-center justify-center bg-green-50 border-green-500">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mb-1">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <line x1="6" y1="12" x2="18" y2="12" />
                    </svg>
                  </div>
                  <span className="text-sm">Efectivo</span>
                </div>
                <div className="border rounded-md p-3 flex flex-col items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <span className="text-sm">Tarjeta</span>
                </div>
                <div className="border rounded-md p-3 flex flex-col items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span className="text-sm">Transferencia</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <button className="w-full flex items-center justify-between border rounded-md p-3 text-left">
                <span>Selecciona un cliente</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              className="w-full flex items-center justify-between py-6 bg-gray-800 hover:bg-gray-700"
              onClick={handleSave}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs text-white">{transaction.details.length}</span>
                </div>
                <span>Guardar cambios</span>
              </div>
              <span>Bs {transaction.value}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}