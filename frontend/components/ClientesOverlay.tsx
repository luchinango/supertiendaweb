"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NewClientPanel } from "./NewClientPanel"

interface Client {
  id: number
  name: string
  phone: string
  initials: string
  hasDebt: boolean
  debtAmount?: number
  address?: string
}

interface ClientesOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientesOverlay({ open, onOpenChange }: ClientesOverlayProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewClient, setShowNewClient] = useState(false)

  // Cargar clientes reales del endpoint
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((c: any) => ({
          id: c.id,
          name: `${c.firstName ?? c.first_name ?? ""} ${c.lastName ?? c.last_name ?? ""}`.trim(),
          phone: c.phone ?? "",
          initials: `${(c.firstName ?? c.first_name ?? "")[0] ?? ""}${(c.lastName ?? c.last_name ?? "")[0] ?? ""}`.toUpperCase(),
          hasDebt: false, // Ajusta si tienes campo real de deuda
          debtAmount: 0, // Ajusta si tienes campo real de deuda
          address: c.address ?? "",
        }))
        setClients(mapped)
      })
  }, [])

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  const handleAddClient = (newClient: { name: string; phone: string }) => {
    const initials = newClient.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    setClients([
      ...clients,
      {
        id: clients.length + 1,
        ...newClient,
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
            <h2 className="text-xl font-semibold">Clientes</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filteredClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-gray-200">
                    <AvatarFallback>{client.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.address || "Sin dirección"}</div>
                    <div className="text-sm text-muted-foreground">{client.phone}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium">Deuda total</div>
                  <div className="text-sm text-muted-foreground">
                    {client.hasDebt && client.debtAmount ? `Bs ${client.debtAmount}` : "Sin deuda"}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t mt-auto">
            <Button className="w-full bg-[#1e293b] text-white hover:bg-[#334155]" onClick={() => setShowNewClient(true)}>
              Crear cliente
            </Button>
          </div>
        </div>
      </div>

      <NewClientPanel open={showNewClient} onOpenChange={setShowNewClient} onAdd={handleAddClient} />
    </>
  )
}