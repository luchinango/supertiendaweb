"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewSupplierDialog } from "../../components/NewSupplierDialog";
import { EditSupplierDialog } from "../../components/EditSupplierDialog";
import { ProveedoresOverlay } from "../../components/ProveedoresOverlay";
import { Supplier } from "@/types/types";

const sampleSupplierPurchases = [
  { id: 1, supplierId: 1, date: "2025-04-20", amount: 1050, items: 10, paymentType: "Contado" }, // 7 días
  { id: 2, supplierId: 2, date: "2025-03-01", amount: 400, items: 5, paymentType: "Crédito" }, // 2 meses
  { id: 3, supplierId: 3, date: "2024-06-01", amount: 400, items: 8, paymentType: "Contado" }, // 11 meses
  // ...más compras
];

const initialSuppliers = [
  { id: 1, name: "Ariana Hipermaxi paneton", phone: "+591 70332997", initials: "AH", hasDebt: false, debtAmount: 0, contact: "", email: "" },
  { id: 2, name: "Cobolde", phone: "", initials: "C", hasDebt: true, debtAmount: 300, contact: "", email: "" },
  { id: 3, name: "Delizia", phone: "", initials: "D", hasDebt: false, debtAmount: 0, contact: "", email: "" },
  // ...más proveedores
];

// Función para calcular el estado de la última compra
function getLastPurchaseStatus(lastPurchase: string | null): { label: string; color: string } {
  if (!lastPurchase) {
    return { label: "Sin compras", color: "text-gray-400" }
  }
  const now = new Date()
  const last = new Date(lastPurchase)
  const diffMonths = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth())
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  if (diffMonths < 1) return { label: `${diffDays} días`, color: "text-green-600 font-bold" }
  if (diffMonths === 1) return { label: "1 mes", color: "text-orange-500 font-bold" }
  if (diffMonths === 2) return { label: "2 meses", color: "text-red-600 font-bold" }
  return { label: `${diffMonths} meses`, color: "text-red-600 font-bold" }
}

export default function Proveedores() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showKardex, setShowKardex] = useState(false);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [kardexStart, setKardexStart] = useState("");
  const [showSuppliersDialog, setShowSuppliersDialog] = useState(false);
  const [kardexEnd, setKardexEnd] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPurchases = sampleSupplierPurchases.filter((purchase) => {
    if (!selectedSupplier) return false;
    const purchaseDate = new Date(purchase.date);
    const start = kardexStart ? new Date(kardexStart) : null;
    const end = kardexEnd ? new Date(kardexEnd) : null;
    if (purchase.supplierId !== selectedSupplier.id) return false;
    if (start && purchaseDate < start) return false;
    if (end && purchaseDate > end) return false;
    return true;
  });

  const filteredPurchasesMain = sampleSupplierPurchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date);
    const start = filterStart ? new Date(filterStart) : null;
    const end = filterEnd ? new Date(filterEnd) : null;
    if (start && purchaseDate < start) return false;
    if (end && purchaseDate > end) return false;
    return true;
  });

  const totalAmount = filteredPurchases.reduce((sum, p) => sum + p.amount, 0);
  const totalPurchases = filteredPurchases.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <div className="flex gap-2 items-end">
          <Input
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-52"
          />
          <Input
            type="date"
            value={filterStart}
            onChange={e => setFilterStart(e.target.value)}
            className="w-36"
            placeholder="Desde"
          />
          <Input
            type="date"
            value={filterEnd}
            onChange={e => setFilterEnd(e.target.value)}
            className="w-36"
            placeholder="Hasta"
          />
          <Button
            className="bg-black text-white border border-gray-300"
            onClick={() => setShowSuppliersDialog(true)}
          >
            Ver proveedores
          </Button>
        </div>
      </div>

      {/* Header alineado */}
      <div className="grid grid-cols-5 gap-6 min-w-[1300px] w-[1300px] mx-auto pr-8">
        <div className="text-sm font-semibold text-left pl-2">Proveedor</div>
        <div /> {/* Columna vacía para el lápiz */}
        <div className="text-sm font-semibold text-right min-w-[120px]">Total comprado</div>
        <div className="text-sm font-semibold text-right min-w-[120px]">Deuda total</div>
        <div className="text-sm font-semibold text-right min-w-[120px]">Última compra</div>
      </div>

      <div className="space-y-2">
        {filteredSuppliers.map((supplier) => {
          const supplierPurchases = filteredPurchasesMain.filter(p => p.supplierId === supplier.id);
          const totalComprado = supplierPurchases.reduce((sum, p) => sum + p.amount, 0);
          const lastPurchase = supplierPurchases
            .map(p => p.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
          const lastPurchaseStatus = getLastPurchaseStatus(lastPurchase);

          return (
            <div
              key={supplier.id}
              className="grid grid-cols-5 gap-6 min-w-[1300px] w-[1300px] items-center mx-auto pr-8 bg-transparent hover:bg-accent rounded-lg cursor-pointer"
              onClick={() => { setSelectedSupplier(supplier); setShowKardex(true); }}
            >
              {/* Proveedor */}
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-gray-200">
                  <AvatarFallback>{supplier.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{supplier.name}</div>
                  {supplier.phone && <div className="text-sm text-muted-foreground">{supplier.phone}</div>}
                </div>
              </div>
              {/* Lápiz alineado */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={e => {
                    e.stopPropagation();
                    setEditingSupplier(supplier);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {/* Total comprado */}
              <div className="text-sm text-right min-w-[120px]">
                <div className="text-blue-700 font-semibold">Bs {totalComprado}</div>
              </div>
              {/* Deuda total */}
              <div className="text-sm text-right min-w-[120px]">
                <div className="text-muted-foreground">
                  {supplier.hasDebt && supplier.debtAmount ? `Bs ${supplier.debtAmount}` : "Sin deuda"}
                </div>
              </div>
              {/* Última compra */}
              <div className="text-sm text-right min-w-[120px]">
                <span className={lastPurchaseStatus.color}>{lastPurchaseStatus.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className="w-full bg-black text-white border border-gray-300"
        onClick={() => setShowNewSupplier(true)}
      >
        Crear proveedor
      </Button>

      {/* Overlay de proveedores */}
      <ProveedoresOverlay
        open={showSuppliersDialog}
        onOpenChange={setShowSuppliersDialog}
        suppliers={suppliers}
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

      {selectedSupplier && showKardex && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
            onClick={() => setShowKardex(false)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 animate-slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Kardex de {selectedSupplier.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowKardex(false)}>
                <span className="sr-only">Cerrar</span>
                ×
              </Button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
              {/* Filtros de fecha */}
              <div className="flex gap-2 items-end">
                <div>
                  <label className="block text-xs mb-1">Desde</label>
                  <Input
                    type="date"
                    value={kardexStart}
                    onChange={e => setKardexStart(e.target.value)}
                    className="w-36"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Hasta</label>
                  <Input
                    type="date"
                    value={kardexEnd}
                    onChange={e => setKardexEnd(e.target.value)}
                    className="w-36"
                  />
                </div>
              </div>
              {/* Resumen de compras */}
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
                <div className="font-medium">
                  Total de compras: <span className="text-blue-700">{totalPurchases}</span>
                </div>
                <div className="font-medium">
                  Monto total: <span className="text-green-700">Bs {totalAmount}</span>
                </div>
              </div>
              {/* Resumen de deuda y tipo de última compra */}
              <div className="bg-yellow-50 rounded-lg p-3 flex flex-col gap-2 border border-yellow-200">
                <div className="font-medium flex items-center gap-2">
                  Deuda actual:
                  {selectedSupplier.hasDebt && selectedSupplier.debtAmount && selectedSupplier.debtAmount > 0 ? (
                    <span className="text-yellow-800 font-bold">Bs {selectedSupplier.debtAmount}</span>
                  ) : (
                    <span className="text-green-700 font-semibold">Sin deuda</span>
                  )}
                </div>
                {/* Tipo de la última compra */}
                <div className="text-xs text-gray-700">
                  Última compra:&nbsp;
                  {(() => {
                    const supplierPurchases = sampleSupplierPurchases
                      .filter(p => p.supplierId === selectedSupplier.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    if (supplierPurchases.length === 0) return "Sin compras";
                    return supplierPurchases[0].paymentType;
                  })()}
                </div>
              </div>
              {/* Historial de compras */}
              <div>
                <div className="font-semibold mb-2">Historial de compras</div>
                <div className="space-y-2">
                  {filteredPurchases.length === 0 && (
                    <div className="text-sm text-muted-foreground">No hay compras en este rango de fechas.</div>
                  )}
                  {filteredPurchases.map((purchase) => (
                    <div key={purchase.id} className="flex justify-between items-center bg-gray-100 rounded px-3 py-2">
                      <div>
                        <div className="font-medium">Compra #{purchase.id}</div>
                        <div className="text-xs text-muted-foreground">{new Date(purchase.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-700">Bs {purchase.amount}</div>
                        <div className="text-xs text-gray-500">{purchase.items} productos</div>
                        <div className="text-xs text-gray-500">{purchase.paymentType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Usa este historial para controlar compras y deudas con proveedores.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Panel lateral para crear proveedor */}
      {showNewSupplier && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
            onClick={() => setShowNewSupplier(false)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 animate-slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Crear proveedor</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNewSupplier(false)}>
                <span className="sr-only">Cerrar</span>
                ×
              </Button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
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
                  setShowNewSupplier(false);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
