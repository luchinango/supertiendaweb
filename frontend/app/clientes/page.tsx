"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewClientPanel } from "@/components/NewClientPanel"
import { EditClientPanel } from "@/components/EditClientPanel"
import { ClientesOverlay } from "@/components/ClientesOverlay"
import { MoreVertical } from "lucide-react"
import {Customer} from "@/types/Customer";
import {useCustomers} from "@/hooks/useCustomers";


const sampleClientPurchases = [
  { id: 1, clientId: 1, date: "2025-04-20", amount: 350, items: 5, paymentType: "Contado" }, // 7 días
  { id: 2, clientId: 2, date: "2025-03-01", amount: 200, items: 3, paymentType: "Crédito" }, // 2 meses
  { id: 3, clientId: 3, date: "2024-06-01", amount: 90, items: 2, paymentType: "Contado" }, // 11 meses
  // ...más compras
]

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

export default function Clientes() {
  const {customers, isLoading, error, editCustomer, mutate} = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null)
  const [editingClient, setEditingClient] = useState<Customer | null>(null)
  const [showKardex, setShowKardex] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [kardexStart, setKardexStart] = useState("")
  const [showClientsDialog, setShowClientsDialog] = useState(false)
  const [kardexEnd, setKardexEnd] = useState("")
  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")
  const [activeTab, setActiveTab] = useState<"clientes" | "proveedores">("clientes")

  const filteredClients = customers.filter(
    (customer) => customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone?.includes(searchTerm),
  )

  const filteredPurchasesMain = sampleClientPurchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date)
    const start = filterStart ? new Date(filterStart) : null
    const end = filterEnd ? new Date(filterEnd) : null
    if (start && purchaseDate < start) return false
    if (end && purchaseDate > end) return false
    return true
  })

  const filteredPurchases = sampleClientPurchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date)
    const start = kardexStart ? new Date(kardexStart) : null
    const end = kardexEnd ? new Date(kardexEnd) : null
    if (start && purchaseDate < start) return false
    if (end && purchaseDate > end) return false
    return true
  })

  const totalAmount = filteredPurchases.reduce((sum, p) => sum + p.amount, 0)
  const totalPurchases = filteredPurchases.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex gap-2 items-end">
          <Input
            placeholder="Buscar cliente..."
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
            className="bg-black text-white border border-gray-300 hover:bg-gray-100"
            onClick={() => setShowClientsDialog(true)}
          >
            Ver clientes
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3 pl-16 pr-4">
          <div className="flex-1" />
          <div className="grid grid-cols-3 gap-6 min-w-[420px] w-[420px]">
            <div className="text-sm text-right min-w-[120px] font-semibold">Total comprado</div>
            <div className="text-sm text-right min-w-[120px] font-semibold">Deuda total</div>
            <div className="text-sm text-right min-w-[120px] font-semibold">Última compra</div>
          </div>
        </div>
        {filteredClients.map((client) => {
          const clientPurchases = filteredPurchasesMain.filter(p => p.clientId === client.id)
          const totalComprado = clientPurchases.reduce((sum, p) => sum + p.amount, 0)
          const lastPurchase = clientPurchases
            .map(p => p.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null
          const lastPurchaseStatus = getLastPurchaseStatus(lastPurchase)

          return (
            <div
              key={client.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedClient(client)
                setShowKardex(true)
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8 bg-gray-200">
                  <AvatarFallback>{client.first_name}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{client.first_name}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </div>
              </div>
              {/* Botón de editar alineado a la derecha del nombre */}
              <div className="flex items-center justify-end min-w-[48px] mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={e => {
                    e.stopPropagation();
                    setEditingClient(client);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" />
                  </svg>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 min-w-[420px] w-[420px]">
                <div className="text-sm text-right min-w-[120px]">
                  <div className="text-blue-700 font-semibold">Bs {totalComprado}</div>
                </div>
                <div className="text-sm text-right min-w-[120px]">
                  <div className="text-muted-foreground">
                    Sin Deuda
                    {/*{client.hasDebt && client.debtAmount ? `Bs ${client.debtAmount}` : "Sin deuda"}*/}
                  </div>
                </div>
                <div className="text-sm text-right min-w-[120px]">
                  <div className={lastPurchaseStatus.color}>{lastPurchaseStatus.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Button
        className="bg-black text-white border"
        onClick={() => setShowNewClient(true)}
      >
        Crear cliente
      </Button>

      <ClientesOverlay open={showClientsDialog} onOpenChange={setShowClientsDialog} />

      <NewClientPanel
        open={showNewClient}
        onOpenChange={setShowNewClient}
        onAdd={(newClient) => {
          const initials = newClient.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          // setClients([...clients, { id: clients.length + 1, ...newClient, initials, hasDebt: false, debtAmount: 0 }])
        }}
      />

      {editingClient && (
        <EditClientPanel
          customer={editingClient}
          open={true}
          onOpenChange={() => setEditingClient(null)}
          onEdit={(updatedClient) => {
            /*
            setClients(
              clients.map((c) =>
                c.id === updatedClient.id
                  ? {
                      ...c,
                      ...updatedClient,
                      initials: updatedClient.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2),
                      hasDebt: updatedClient.hasDebt !== undefined ? updatedClient.hasDebt : c.hasDebt,
                      debtAmount: updatedClient.debtAmount !== undefined ? updatedClient.debtAmount : c.debtAmount,
                    }
                  : c
              )
            )
            */
            setEditingClient(null)
          }}
        />
      )}

      {selectedClient && showKardex && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
            onClick={() => setShowKardex(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 animate-slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Kardex de {selectedClient.first_name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowKardex(false)}>
                <span className="sr-only">Cerrar</span>
                ×
              </Button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
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
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
                <div className="font-medium">
                  Total de compras: <span className="text-blue-700">{totalPurchases}</span>
                </div>
                <div className="font-medium">
                  Monto total: <span className="text-green-700">Bs {totalAmount}</span>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 flex flex-col gap-2 border border-yellow-200">
                <div className="font-medium flex items-center gap-2">
                  Deuda actual:
                    <span className="text-green-700 font-semibold">Sin deuda</span>
                  {/*{selectedClient.hasDebt && selectedClient.debtAmount && selectedClient.debtAmount > 0 ? (
                    <span className="text-yellow-800 font-bold">Bs {selectedClient.debtAmount}</span>
                  ) : (
                    <span className="text-green-700 font-semibold">Sin deuda</span>
                  )}*/}
                </div>
                <div className="text-xs text-gray-700">
                  Última compra:&nbsp;
                  {(() => {
                    const clientPurchases = sampleClientPurchases
                      .filter(p => p.clientId === selectedClient.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    if (clientPurchases.length === 0) return "Sin compras"
                    return clientPurchases[0].paymentType
                  })()}
                </div>
              </div>
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
                Usa este historial para identificar clientes frecuentes y premiar su lealtad.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}