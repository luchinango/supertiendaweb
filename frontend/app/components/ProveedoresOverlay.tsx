"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NewSupplierDialog } from "./NewSupplierDialog"

interface Supplier {
  id: number
  name: string
  phone: string
  initials: string
  hasDebt: boolean
  debtAmount?: number
}

interface ProveedoresOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
}

export function ProveedoresOverlay({ open, onOpenChange, suppliers: initialSuppliers }: ProveedoresOverlayProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewSupplier, setShowNewSupplier] = useState(false)

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm)
  )

  const handleAddSupplier = (newSupplier: { name: string; phone: string }) => {
    const initials = newSupplier.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    setSuppliers([
      ...suppliers,
      {
        id: suppliers.length + 1,
        ...newSupplier,
        initials,
        hasDebt: false,
        debtAmount: 0,
      },
    ])
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 bg-black/15 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-[400px] max-w-[90vw] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out h-screen ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Proveedores</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-gray-200">
                    <AvatarFallback>{supplier.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    {supplier.phone && <div className="text-sm text-muted-foreground">{supplier.phone}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium">Deuda total</div>
                  <div className="text-sm text-muted-foreground">
                    {supplier.hasDebt && supplier.debtAmount ? `Bs ${supplier.debtAmount}` : "Sin deuda"}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t mt-auto">
            <Button className="w-full bg-[#1e293b] hover:bg-[#334155]" onClick={() => setShowNewSupplier(true)}>
              Crear proveedor
            </Button>
          </div>
        </div>
      </div>

      <NewSupplierDialog open={showNewSupplier} onOpenChange={setShowNewSupplier} onAdd={handleAddSupplier} />
    </>
  )
}
