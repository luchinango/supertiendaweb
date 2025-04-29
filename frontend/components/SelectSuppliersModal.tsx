"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

interface SelectSuppliersModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSuppliers: string[]
  setSelectedSuppliers: (suppliers: string[]) => void
}

export function SelectSuppliersModal({
  isOpen,
  onClose,
  selectedSuppliers,
  setSelectedSuppliers,
}: SelectSuppliersModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(selectedSuppliers)

  // Sample suppliers data
  const suppliers = [
    { id: "1", name: "Ariana Hipermaxi paneton" },
    { id: "2", name: "Cobolde" },
    { id: "3", name: "Delizia" },
    { id: "4", name: "Diana" },
    { id: "5", name: "Entel" },
    { id: "6", name: "luz cessa" },
    { id: "7", name: "Pedido Dico" },
    { id: "8", name: "Pedido Dispa" },
    { id: "9", name: "Pedido Nacional" },
    { id: "10", name: "Pedido Unilevel" },
    { id: "11", name: "Pedidos Avicola" },
    { id: "12", name: "Pedidos blanquita" },
    { id: "13", name: "Pedidos Cera" },
    { id: "14", name: "Pedidos Chico Murillo" },
    { id: "15", name: "Pedidos Ferrari" },
    { id: "16", name: "Pedidos La mexicana" },
    { id: "17", name: "Pedidos Padres" },
    { id: "18", name: "Pedidos Proesa" },
    { id: "19", name: "Pedidos Rolos" },
    { id: "20", name: "Pedidos Todobrillo" },
    { id: "21", name: "Pedidos Wilber" },
  ]

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleSupplier = (name: string) => {
    if (tempSelected.includes(name)) {
      setTempSelected(tempSelected.filter((s) => s !== name))
    } else {
      setTempSelected([...tempSelected, name])
    }
  }

  const handleConfirm = () => {
    setSelectedSuppliers(tempSelected)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">Seleccionar proveedores</h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={`supplier-${supplier.id}`}
              checked={tempSelected.includes(supplier.name)}
              onCheckedChange={() => handleToggleSupplier(supplier.name)}
            />
            <label
              htmlFor={`supplier-${supplier.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {supplier.name}
            </label>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <Button onClick={handleConfirm} className="w-full bg-gray-800 hover:bg-gray-700">
          Confirmar
        </Button>
      </div>
    </div>
  )
}