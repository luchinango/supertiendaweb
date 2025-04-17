"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewSupplierDialog } from "../components/NewSupplierDialog";
import { EditSupplierDialog } from "../components/EditSupplierDialog";
import { ProveedoresOverlay } from "../components/ProveedoresOverlay";
import { Supplier } from "@/app/types";

const initialSuppliers: Supplier[] = [
  { id: 1, name: "Ariana Hipermaxi paneton", phone: "+591 70332997", contact: "", email: "", initials: "AH", hasDebt: false, debtAmount: 0 },
  { id: 2, name: "Cobolde", phone: "", contact: "", email: "", initials: "C", hasDebt: false, debtAmount: 0 },
  { id: 3, name: "Delizia", phone: "", contact: "", email: "", initials: "D", hasDebt: false, debtAmount: 0 },
  { id: 4, name: "Diana", phone: "", contact: "", email: "", initials: "D", hasDebt: false, debtAmount: 0 },
  { id: 5, name: "Entel", phone: "", contact: "", email: "", initials: "E", hasDebt: false, debtAmount: 0 },
  { id: 6, name: "luz cessa", phone: "+591 67868887", contact: "", email: "", initials: "LC", hasDebt: false, debtAmount: 0 },
  { id: 7, name: "Pedido Dico", phone: "+591 72898119", contact: "", email: "", initials: "PD", hasDebt: false, debtAmount: 0 },
  { id: 8, name: "Pedido Dispa", phone: "+591 73419988", contact: "", email: "", initials: "PD", hasDebt: false, debtAmount: 0 },
  { id: 9, name: "Pedido Nacional", phone: "+591 69691210", contact: "", email: "", initials: "PN", hasDebt: false, debtAmount: 0 },
  { id: 10, name: "Pedido Unilevel", phone: "+591 72892921", contact: "", email: "", initials: "PU", hasDebt: false, debtAmount: 0 },
];

export default function Proveedores() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showSuppliersDialog, setShowSuppliersDialog] = useState(false);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button onClick={() => setShowSuppliersDialog(true)}>Ver proveedores</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar proveedor..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-gray-200">
                <AvatarFallback>{supplier.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{supplier.name}</div>
                {supplier.phone && <div className="text-sm text-muted-foreground">{supplier.phone}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-right">
                <div className="font-medium">Deuda total</div>
                <div className="text-muted-foreground">
                  {supplier.hasDebt && supplier.debtAmount ? `Bs ${supplier.debtAmount}` : "Sin deuda"}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                    Editar proveedor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full" onClick={() => setShowNewSupplier(true)}>
        Crear proveedor
      </Button>

      {/* Overlay de proveedores */}
      <ProveedoresOverlay open={showSuppliersDialog} onOpenChange={setShowSuppliersDialog} />

      <NewSupplierDialog
        open={showNewSupplier}
        onOpenChange={setShowNewSupplier}
        onAdd={(newSupplier: { name: string; phone: string; contact: string; email: string }) => {
          const initials = newSupplier.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setSuppliers([
            ...suppliers,
            { id: suppliers.length + 1, ...newSupplier, initials, hasDebt: false, debtAmount: 0 },
          ]);
        }}
      />

      {editingSupplier && (
        <EditSupplierDialog
          supplier={editingSupplier}
          open={true}
          onOpenChange={() => setEditingSupplier(null)}
          onEdit={(updatedSupplier: Supplier) => {
            setSuppliers(
              suppliers.map((s) =>
                s.id === updatedSupplier.id
                  ? {
                      id: s.id,
                      name: updatedSupplier.name,
                      phone: updatedSupplier.phone,
                      contact: updatedSupplier.contact,
                      email: updatedSupplier.email,
                      // Aseguramos que se conserven o actualicen estas propiedades:
                      initials: updatedSupplier.initials || s.initials,
                      hasDebt: updatedSupplier.hasDebt !== undefined ? updatedSupplier.hasDebt : s.hasDebt,
                      debtAmount: updatedSupplier.debtAmount !== undefined ? updatedSupplier.debtAmount : s.debtAmount,
                    }
                  : s
              )
            );
            setEditingSupplier(null);
          }}
        />
      )}
    </div>
  );
}
