"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronRight } from "lucide-react"

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedPaymentMethods: string[]
  setSelectedPaymentMethods: (methods: string[]) => void
  selectedEmployees: string[]
  onSelectEmployees: () => void
  clearEmployees: () => void
  selectedClients: string[]
  onSelectClients: () => void
  clearClients: () => void
  selectedSuppliers: string[]
  onSelectSuppliers: () => void
  clearSuppliers: () => void
  clearAllFilters: () => void
  applyFilters: () => void
}

export function FilterPanel({
  isOpen,
  onClose,
  selectedPaymentMethods,
  setSelectedPaymentMethods,
  selectedEmployees,
  onSelectEmployees,
  clearEmployees,
  selectedClients,
  onSelectClients,
  clearClients,
  selectedSuppliers,
  onSelectSuppliers,
  clearSuppliers,
  clearAllFilters,
  applyFilters,
}: FilterPanelProps) {
  const [animateOut, setAnimateOut] = useState(false)

  // Handle closing animation
  const handleClose = () => {
    setAnimateOut(true)
    setTimeout(() => {
      setAnimateOut(false)
      onClose()
    }, 300)
  }

  // Payment methods
  const paymentMethods = [
    { id: "efectivo", name: "Efectivo" },
    { id: "tarjeta", name: "Tarjeta" },
    { id: "transferencia", name: "Transferencia bancaria" },
    { id: "otro", name: "Otro" },
  ]

  const togglePaymentMethod = (methodId: string) => {
    if (selectedPaymentMethods.includes(methodId)) {
      setSelectedPaymentMethods(selectedPaymentMethods.filter((id) => id !== methodId))
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, methodId])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Filter panel */}
      <div
        className={`relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl ${
          animateOut ? "animate-slide-out-to-right" : "animate-slide-in-from-right"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Filtros</h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Payment Methods */}
            <div className="space-y-2">
              <h3 className="font-medium">Métodos de pago</h3>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={selectedPaymentMethods.includes(method.id) ? "default" : "outline"}
                    className={
                      selectedPaymentMethods.includes(method.id) ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""
                    }
                    onClick={() => togglePaymentMethod(method.id)}
                  >
                    {method.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Employees */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Empleados</h3>
                {selectedEmployees.length > 0 && (
                  <Button
                    variant="ghost"
                    className="h-8 text-sm text-blue-600 hover:text-blue-800"
                    onClick={clearEmployees}
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              {selectedEmployees.length > 0 ? (
                <div
                  className="border rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={onSelectEmployees}
                >
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-yellow-800 text-xs">👤</span>
                    </div>
                    <span>{selectedEmployees[0]}</span>
                    {selectedEmployees.length > 1 && (
                      <span className="ml-1 text-gray-500">+{selectedEmployees.length - 1}</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <Button variant="outline" className="w-full justify-between" onClick={onSelectEmployees}>
                  <span>Todos los empleados</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Clients */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Clientes</h3>
                {selectedClients.length > 0 && (
                  <Button
                    variant="ghost"
                    className="h-8 text-sm text-blue-600 hover:text-blue-800"
                    onClick={clearClients}
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              {selectedClients.length > 0 ? (
                <div
                  className="border rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={onSelectClients}
                >
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-800 text-xs">👤</span>
                    </div>
                    <span>{selectedClients[0]}</span>
                    {selectedClients.length > 1 && (
                      <span className="ml-1 text-gray-500">+{selectedClients.length - 1}</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <Button variant="outline" className="w-full justify-between" onClick={onSelectClients}>
                  <span>Todos los clientes</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Suppliers */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Proveedores</h3>
                {selectedSuppliers.length > 0 && (
                  <Button
                    variant="ghost"
                    className="h-8 text-sm text-blue-600 hover:text-blue-800"
                    onClick={clearSuppliers}
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              {selectedSuppliers.length > 0 ? (
                <div
                  className="border rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={onSelectSuppliers}
                >
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-green-800 text-xs">🏢</span>
                    </div>
                    <span>{selectedSuppliers[0]}</span>
                    {selectedSuppliers.length > 1 && (
                      <span className="ml-1 text-gray-500">+{selectedSuppliers.length - 1}</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <Button variant="outline" className="w-full justify-between" onClick={onSelectSuppliers}>
                  <span>Todos los proveedores</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={clearAllFilters}>
              Limpiar filtros
            </Button>
            <Button className="bg-gray-800 hover:bg-gray-700" onClick={applyFilters}>
              Filtrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}