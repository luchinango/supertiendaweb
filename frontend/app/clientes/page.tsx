"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NewClientPanel } from "../components/NewClientPanel"
import { EditClientPanel } from "../components/EditClientPanel"
import { ClientesOverlay } from "../components/ClientesOverlay"

interface Client {
  id: number
  name: string
  phone: string
  initials: string
  hasDebt: boolean
  debtAmount?: number
}

// Simulación de historial de compras con tipo de pago
const samplePurchases = [
  { id: 1, clientId: 1, date: "2024-04-01", amount: 120, items: 5, paymentType: "Contado" },
  { id: 2, clientId: 1, date: "2024-04-10", amount: 80, items: 3, paymentType: "Crédito" },
  { id: 3, clientId: 2, date: "2024-04-20", amount: 200, items: 8, paymentType: "Contado" },
  { id: 4, clientId: 1, date: "2024-05-02", amount: 150, items: 6, paymentType: "Contado" },
  { id: 5, clientId: 3, date: "2024-05-15", amount: 90, items: 2, paymentType: "Crédito" },
]

const initialClients: Client[] = [
  {
    id: 1,
    name: "Luis Alberto Martínez Barrientos",
    phone: "+591 72944911",
    initials: "LA",
    hasDebt: false,
    debtAmount: 0,
  },
  { id: 2, name: "Mateo", phone: "+591 75454698", initials: "M", hasDebt: false, debtAmount: 0 },
  { id: 3, name: "SOCODEVI", phone: "+591 69258592", initials: "S", hasDebt: false, debtAmount: 0 },
  { id: 4, name: "Telma", phone: "+591 70000000", initials: "T", hasDebt: false, debtAmount: 0 },
  { id: 5, name: "TODITO", phone: "+591 71111111", initials: "T", hasDebt: false, debtAmount: 0 },
]

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showNewClient, setShowNewClient] = useState(false)
  const [showClientsDialog, setShowClientsDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showKardex, setShowKardex] = useState(false)
  const [kardexStart, setKardexStart] = useState("")
  const [kardexEnd, setKardexEnd] = useState("")
  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  // Filtrar compras por fechas para la pantalla principal
  const filteredPurchasesMain = samplePurchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date)
    const start = filterStart ? new Date(filterStart) : null
    const end = filterEnd ? new Date(filterEnd) : null
    if (start && purchaseDate < start) return false
    if (end && purchaseDate > end) return false
    return true
  })

  // Filtrar compras por fechas
  const filteredPurchases = samplePurchases.filter((purchase) => {
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
          <Button onClick={() => setShowClientsDialog(true)}>Ver clientes</Button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredClients.map((client) => {
          // Total comprado por cliente en el rango de fechas
          const clientPurchases = filteredPurchasesMain.filter(p => p.clientId === client.id)
          const totalComprado = clientPurchases.reduce((sum, p) => sum + p.amount, 0)

          return (
            <div
              key={client.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedClient(client)
                setShowKardex(true)
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-gray-200">
                  <AvatarFallback>{client.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {/* Total comprado */}
                <div className="text-sm text-right">
                  <div className="font-medium">Total comprado</div>
                  <div className="text-blue-700 font-semibold">Bs {totalComprado}</div>
                </div>
                {/* Deuda */}
                <div className="text-sm text-right">
                  <div className="font-medium">Deuda total</div>
                  <div className="text-muted-foreground">
                    {client.hasDebt && client.debtAmount ? `Bs ${client.debtAmount}` : "Sin deuda"}
                  </div>
                </div>
                {/* Menú */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingClient(client)}>Editar cliente</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>

      <Button className="w-full" onClick={() => setShowNewClient(true)}>
        Crear cliente
      </Button>

      {/* Use the improved ClientesOverlay component */}
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
          setClients([...clients, { id: clients.length + 1, ...newClient, initials, hasDebt: false, debtAmount: 0 }])
        }}
      />

      {editingClient && (
        <EditClientPanel
          client={editingClient}
          open={true}
          onOpenChange={() => setEditingClient(null)}
          onEdit={(updatedClient) => {
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
            setEditingClient(null)
          }}
        />
      )}

      {selectedClient && showKardex && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
            onClick={() => setShowKardex(false)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 animate-slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Kardex de {selectedClient.name}</h2>
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
                  {selectedClient.hasDebt && selectedClient.debtAmount && selectedClient.debtAmount > 0 ? (
                    <span className="text-yellow-800 font-bold">Bs {selectedClient.debtAmount}</span>
                  ) : (
                    <span className="text-green-700 font-semibold">Sin deuda</span>
                  )}
                </div>
                {/* Tipo de la última compra */}
                <div className="text-xs text-gray-700">
                  Última compra:&nbsp;
                  {(() => {
                    const clientPurchases = samplePurchases
                      .filter(p => p.clientId === selectedClient.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    if (clientPurchases.length === 0) return "Sin compras"
                    return clientPurchases[0].paymentType
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
                Usa este historial para identificar clientes frecuentes y premiar su lealtad.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}