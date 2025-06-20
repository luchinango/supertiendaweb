"use client"

import { Button } from "@/components/ui/button"
import { X, Printer, FileText, Edit, Trash, Calendar, CreditCard, User, TrendingUp } from "lucide-react"

interface TransactionDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  transaction: any
  onEdit?: () => void
  onDelete?: () => void
}

export function TransactionDetailPanel({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Detail panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg
                className="h-5 w-5 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="12" x2="18" y2="12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Detalle de la venta</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-green-500 -mx-6 mb-6"></div>

          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-lg font-medium line-clamp-2">{transaction.concept}</h3>
              <p className="text-sm text-gray-500">Transacción #{transaction.transactionId}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Valor total</div>
                  <div className="text-xl font-bold">Bs {transaction.value}</div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pagada</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-sm text-gray-500">Fecha y hora</div>
                <div className="ml-auto">{transaction.date}</div>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-sm text-gray-500">Método de pago</div>
                <div className="ml-auto">{transaction.paymentMethod}</div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-sm text-gray-500">Cliente</div>
                <div className="ml-auto">-</div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-sm text-gray-500">Ganancia</div>
                <div className="ml-auto text-green-600">Bs {transaction.profit}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Listado de productos</h4>
              <div className="space-y-3">
                {transaction.details.map((item: any, index: number) => (
                  <div key={index} className="flex items-center border rounded-lg p-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-gray-500">P</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} Unidad{item.quantity > 1 ? "es" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Bs {item.total}</div>
                      <div className="text-xs text-gray-500">Bs {item.unitPrice} x Und</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            <Button variant="outline" className="flex flex-col items-center py-4">
              <Printer className="h-5 w-5 mb-1" />
              <span className="text-xs">Imprimir</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center py-4">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Comprobante</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center py-4" onClick={onEdit}>
              <Edit className="h-5 w-5 mb-1" />
              <span className="text-xs">Editar</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center py-4 text-red-500 hover:text-red-600"
              onClick={onDelete}
            >
              <Trash className="h-5 w-5 mb-1" />
              <span className="text-xs">Eliminar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}