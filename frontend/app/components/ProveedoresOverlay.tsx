"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { NewSupplierDialog } from "./NewSupplierDialog"

interface Supplier {
  id: number
  name: string
  phone: string
  initials: string
  hasDebt: boolean
  debtAmount?: number
}

// Sample suppliers data matching the screenshot
const initialSuppliers: Supplier[] = [
  { id: 1, name: "Ariana Hipermaxi paneton", phone: "+591 70332997", initials: "AH", hasDebt: false, debtAmount: 0 },
  { id: 2, name: "Cobolde", phone: "", initials: "C", hasDebt: false, debtAmount: 0 },
  { id: 3, name: "Delizia", phone: "", initials: "D", hasDebt: false, debtAmount: 0 },
  { id: 4, name: "Diana", phone: "", initials: "D", hasDebt: false, debtAmount: 0 },
  { id: 5, name: "Entel", phone: "", initials: "E", hasDebt: false, debtAmount: 0 },
  { id: 6, name: "luz cessa", phone: "+591 67868887", initials: "LC", hasDebt: false, debtAmount: 0 },
  { id: 7, name: "Pedido Dico", phone: "+591 72898119", initials: "PD", hasDebt: false, debtAmount: 0 },
  { id: 8, name: "Pedido Dispa", phone: "+591 73419988", initials: "PD", hasDebt: false, debtAmount: 0 },
  { id: 9, name: "Pedido Nacional", phone: "+591 69691210", initials: "PN", hasDebt: false, debtAmount: 0 },
  { id: 10, name: "Pedido Unilevel", phone: "+591 72892921", initials: "PU", hasDebt: false, debtAmount: 0 },
]

interface ProveedoresOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProveedoresOverlay({ open, onOpenChange }: ProveedoresOverlayProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewSupplier, setShowNewSupplier] = useState(false)

  const filteredSuppliers = suppliers.filter(
    (supplier) => supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.phone.includes(searchTerm),
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 overflow-hidden h-[100vh] absolute right-0 top-0 bottom-0 rounded-none w-[400px] max-w-[90vw]">
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
        </DialogContent>
      </Dialog>

      <NewSupplierDialog open={showNewSupplier} onOpenChange={setShowNewSupplier} onAdd={handleAddSupplier} />
    </>
  )
}
