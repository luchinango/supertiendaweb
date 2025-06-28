"use client"

// Eliminamos la URL externa y usamos proxy local

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit } from "lucide-react"
import { NewSupplierDialog } from '@/components/features/suppliers/NewSupplierDialog'
import { EditSupplierDialog } from '@/components/features/suppliers/EditSupplierDialog'
import { ProveedoresOverlay } from '@/components/features/suppliers/ProveedoresOverlay'
import { useSuppliers, useSuppliersStats, useSuppliersWithDebt } from '@/hooks/useSuppliers'
import type {Supplier} from "@/types/types"; // Ajusta la ruta según tu proyecto
// Ajusta la ruta según tu proyecto

// --- Nuevos tipos y función utilitaria ---
interface APIResponse {
  suppliers: {
    id: number
    code: string | null
    name: string
    documentType: string
    documentNumber: string | null
    contactPerson: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    department: string | null
    country: string | null
    status: string
  }[]
}
interface SupplierDetail {
  id: number
  name: string
  phone: string | null
  // …otros campos de /api/suppliers/:id
}
interface DebtSupplier {
  id: number
  name: string
  phone?: string
  // …otros campos de /api/suppliers/debt
}
interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  inactiveSuppliers: number
  totalCreditLimit: string
  totalCurrentBalance: string
  suppliersWithDebt: number
  averagePaymentTerms: number
}
function getLastPurchaseStatus(lastPurchase: string | null) {
  if (!lastPurchase) return { text: "Nunca", color: "text-gray-400" }

  const today = new Date()
  const purchaseDate = new Date(lastPurchase)
  const diffInDays = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays <= 7) return { text: `${diffInDays}d`, color: "text-green-600" }
  if (diffInDays <= 30) return { text: `${diffInDays}d`, color: "text-yellow-600" }
  return { text: `${diffInDays}d`, color: "text-red-600" }
}

// --- 1) declara el array de compras de ejemplo y su tipo ---
interface Purchase {
  id: number
  supplierId: number
  date: string
  amount: number
  items: number
  paymentType: string
}
const sampleSupplierPurchases: Purchase[] = [
  { id: 1, supplierId: 1, date: "2025-04-20", amount: 1050, items: 10, paymentType: "Contado" },
  { id: 2, supplierId: 2, date: "2025-03-01", amount: 400, items: 5, paymentType: "Crédito" },
  { id: 3, supplierId: 3, date: "2024-06-01", amount: 400, items: 8, paymentType: "Contado" },
]

// --- Inicio del componente ---
export default function Proveedores() {
  // Usar los nuevos hooks de suppliers
  const { suppliers, isLoading: isLoadingSuppliers, mutate: mutateSuppliers, addSupplier, editSupplier: editSupplierHook } = useSuppliers();
  const { stats, isLoading: isLoadingStats } = useSuppliersStats();
  const { suppliers: suppliersWithDebt, isLoading: isLoadingDebt } = useSuppliersWithDebt();

  const [editId, setEditId]         = useState<number | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // + nuevos estados para búsqueda y "ver más"
  const [searchTerm, setSearchTerm]     = useState<string>("")
  const [pageSize, setPageSize]         = useState<number>(10)
  const [visibleCount, setVisibleCount] = useState<number>(10)
  const [page, setPage]                 = useState<number>(1)
  const [totalPages, setTotalPages]     = useState<number>(0)
  const pageSizeOptions = [10, 20, 30, 50, 100]

  // filtros, dialogs y selección
  const [filterStart, setFilterStart]     = useState<string>("")
  const [filterEnd, setFilterEnd]         = useState<string>("")
  const [showOverlay, setShowOverlay]     = useState<boolean>(false)

  const [selectedSupplier, setSelectedSupplier]       = useState<Supplier|null>(null)
  const [showKardex, setShowKardex]                   = useState<boolean>(false)
  const [editingSupplier, setEditingSupplier]         = useState<Supplier|null>(null)
  const [showNewSupplier, setShowNewSupplier]         = useState<boolean>(false)
  const [kardexStart, setKardexStart] = useState<string>("")
  const [kardexEnd,   setKardexEnd]   = useState<string>("")
  const [selectedId, setSelectedId]   = useState<number|null>(null)
  const [detail, setDetail]           = useState<SupplierDetail|null>(null)
  // Los debtSuppliers y stats ahora vienen de los hooks

  // Detalle al click - mantener este ya que es específico
  useEffect(() => {
    if (selectedId != null) {
      fetch(`/api/suppliers/${selectedId}`)
        .then(r => r.json())
        .then((d: SupplierDetail) => setDetail(d))
        .catch(() => setDetail(null))
    }
  }, [selectedId])

  // --- 2) añade tipos a los filtros/maps ---
  const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPurchasesMain = sampleSupplierPurchases.filter((p: Purchase) => {
    const purchaseDate = new Date(p.date)
    const start = filterStart ? new Date(filterStart) : null
    const end   = filterEnd   ? new Date(filterEnd)   : null
    if (start && purchaseDate < start) return false
    if (end   && purchaseDate > end)   return false
    return true
  })

  // Define el tipo para el payload de nuevo proveedor
  interface NewSupplierPayload {
    name: string;
    phone?: string;
    contactPerson?: string;
    email?: string;
    // Agrega aquí otros campos requeridos por tu backend
  }

  async function handleAddSupplier(data: {
    code: string
    name: string
    documentType: string
    documentNumber: string
    contactPerson: string
    email: string
    phone: string
    address: string
    city: string
    department: string
    country: string
    postalCode: string
    paymentTerms: number
    creditLimit: number
    status: string
    notes: string
  }) {
    try {
      await addSupplier(data);
      console.log("✅ Proveedor creado exitosamente");
    } catch (error) {
      console.error("❌ Error al crear proveedor:", error);
      throw error;
    }
  }

  function handleEditSupplier(supplier: Supplier) {
    setEditId(supplier.id)
    setIsEditOpen(true)
  }

  function openEdit(id: number) {
    console.log("click edit row id:", id)
    setEditId(id)
    setIsEditOpen(true)
  }
  async function onEdit(updatedSupplier: Supplier) {
    try {
      await editSupplierHook(updatedSupplier.id, updatedSupplier);
      console.log("✅ Proveedor actualizado exitosamente");
    } catch (error) {
      console.error("❌ Error al actualizar proveedor:", error);
    }
  }

  // filtrar siempre sobre todo el array
  const filtered = suppliers

  // al cambiar término/tamaño o lista, reinicio el conteo visible
  useEffect(() => {
    setVisibleCount(pageSize)
  }, [searchTerm, pageSize, suppliers])

  // solo muestro los primeros `visibleCount`
  const visible = filtered.slice(0, visibleCount)

  // Este useEffect ya no es necesario porque los datos vienen del hook

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
          <Button
            className="bg-black text-white border border-gray-300"
            onClick={() => setShowOverlay(true)}
          >
            Ver proveedores
          </Button>
        </div>
      </div>

      {/* Header alineado */}
      <div className="grid grid-cols-8 gap-6 min-w-[1300px] w-[1300px] mx-auto pr-8">
        <div className="text-sm font-semibold text-left pl-2">Proveedor</div>
        <div className="text-sm font-semibold text-left">Código</div>
        <div className="text-sm font-semibold text-left">Dirección</div>
        <div className="text-sm font-semibold text-right">Teléfono</div>
        <div className="text-sm font-semibold text-right min-w-[120px]">Total comprado</div>
        <div className="text-sm font-semibold text-right min-w-[120px]">Deuda total</div>
        <div className="text-sm font-semibold text-right min-w-[120px]">Última compra</div>
        <div className="text-sm font-semibold text-right">Editar</div>
      </div>

      <div className="space-y-2">
        {visible.map((supplier) => {
          // Filtra compras hechas a este proveedor
          const supplierPurchases = filteredPurchasesMain.filter(p => p.supplierId === supplier.id)
          const totalComprado = supplierPurchases.reduce((sum, p) => sum + p.amount, 0)
          const totalDeuda = supplier.hasDebt && supplier.debtAmount ? supplier.debtAmount : 0
          const lastPurchase = supplierPurchases
            .map(p => p.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null
          const lastPurchaseStatus = getLastPurchaseStatus(lastPurchase)

          return (
            <div
              key={supplier.id}
              className="grid grid-cols-8 gap-6 min-w-[1300px] w-[1300px] items-center mx-auto pr-8 hover:bg-accent rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedSupplier(supplier)
                setShowKardex(true)
              }}
            >
              {/* Proveedor */}
              <div className="pl-2 text-sm">{supplier.name}</div>
              {/* Código */}
              <div className="text-sm">{supplier.code ?? "—"}</div>
              {/* Dirección */}
              <div className="text-sm">{supplier.address ?? "—"}</div>
              {/* Teléfono */}
              <div className="text-sm text-right">{supplier.phone ?? "—"}</div>
              {/* Total comprado */}
              <div className="text-sm text-right text-blue-700 font-semibold">
                Bs {totalComprado}
              </div>
              {/* Deuda total */}
              <div className={`text-sm text-right font-semibold ${totalDeuda > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                Bs {totalDeuda}
              </div>
              {/* Última compra */}
              <div className={`text-sm text-right ${lastPurchaseStatus.color}`}>
                {lastPurchaseStatus.text}
              </div>
              {/* Lápiz (evita que abra el Kardex con e.stopPropagation()) */}
              <div className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditSupplier(supplier)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Añade los controles de paginación */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize">Mostrar</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="border px-2 py-1"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>proveedores</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {page} de {totalPages}
          </span>
          <Button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
      {/* Fin de los controles de paginación */}

      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => setShowNewSupplier(true)}
        >
          Agregar nuevo proveedor
        </Button>
      </div>

      {/* Overlay de proveedores */}
      <ProveedoresOverlay
        open={showOverlay}
        onOpenChange={setShowOverlay}
        suppliers={suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone || "—",
          initials: s.name.split(" ").map(n => n[0]).join("").toUpperCase(),
          hasDebt: s.hasDebt || false,
          debtAmount: s.debtAmount || 0,
        }))}
      />

      {editingSupplier && (
        <EditSupplierDialog
          supplierId={editingSupplier.id}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onEdit={onEdit}
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
            {showKardex && selectedSupplier && (() => {
              const filteredPurchases: Purchase[] = sampleSupplierPurchases.filter((purchase: Purchase) => {
                const pd = new Date(purchase.date)
                const ks = kardexStart ? new Date(kardexStart) : null
                const ke = kardexEnd   ? new Date(kardexEnd)   : null
                if (purchase.supplierId !== selectedSupplier.id) return false
                if (ks && pd < ks) return false
                if (ke && pd > ke) return false
                return true
              })
              const totalAmount: number = filteredPurchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0)
              const totalPurchases: number = filteredPurchases.length

              return (
                <div className="p-4 flex-1 overflow-auto">
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
                        const lastPurchase = supplierPurchases[0];
                        if (!lastPurchase) return "Sin información";
                        return lastPurchase.paymentType;
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
              )
            })()}
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
                onAdd={handleAddSupplier} // << usa la función padre
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
