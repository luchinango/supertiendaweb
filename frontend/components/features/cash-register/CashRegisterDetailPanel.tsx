"use client"

import { X, Printer, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

interface CashRegisterDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  cashRegister: any
}

export function CashRegisterDetailPanel({ isOpen, onClose, cashRegister }: CashRegisterDetailPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-xs">$</span>
              </div>
              <h2 className="text-xl font-semibold">Resumen del turno</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Efectivo section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Efectivo</h3>
              <span className="text-lg font-bold">Bs {cashRegister.details.cash.total.toFixed(2)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Dinero base</span>
                <span>Bs {cashRegister.details.cash.base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Ventas</span>
                <span>Bs {cashRegister.details.cash.sales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Abonos</span>
                <span>Bs {cashRegister.details.cash.refunds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos</span>
                <span className="text-red-600">Bs {cashRegister.details.cash.expenses.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-2 border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Balance total</span>
                <span className="font-bold">Bs {cashRegister.details.cash.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta section */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Tarjeta</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold">Bs {cashRegister.details.card.toFixed(2)}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Transferencia section */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Transferencia</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold">Bs {cashRegister.details.transfer.toFixed(2)}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Otros section */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Otros</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold">Bs {cashRegister.details.other.toFixed(2)}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Dinero en efectivo section */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Dinero en efectivo</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold">Bs {cashRegister.details.cashInRegister.toFixed(2)}</span>
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">Descuadre</span>
              </div>
            </div>
          </div>

          {/* Warning message */}
          {cashRegister.details.difference > 0 && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <span className="text-red-800">
                Te sobran Bs {cashRegister.details.difference.toFixed(2)} en efectivo.
              </span>
            </div>
          )}

          {/* Apertura section */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Apertura</h3>
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <div className="text-gray-600">{cashRegister.details.opening.responsible}</div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                {cashRegister.details.opening.date}
              </div>
            </div>
          </div>

          {/* Cierre section */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Cierre</h3>
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <div className="text-gray-600">{cashRegister.details.closing.responsible}</div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                {cashRegister.details.closing.date}
              </div>
            </div>
          </div>

          {/* Resumen del turno section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Resumen del turno</h3>
              <ChevronUp className="h-4 w-4" />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Total ventas</span>
                <span>Bs {cashRegister.details.summary.totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Total abonos</span>
                <span>Bs {cashRegister.details.summary.totalRefunds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Descuadre</span>
                <span className="text-red-600">Bs {cashRegister.details.difference.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Total gastos</span>
                <span>Bs {cashRegister.details.summary.totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance</span>
                <span>Bs {cashRegister.details.summary.balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" className="flex-1 mr-2">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" className="flex-1 mx-2">
              <FileText className="h-4 w-4 mr-2" />
              Comprobante
            </Button>
            <Button className="bg-gray-800 hover:bg-gray-700 flex-1 ml-2">
              <span>Ver detalle de transacciones</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}