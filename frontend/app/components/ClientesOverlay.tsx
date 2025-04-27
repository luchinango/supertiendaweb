"use client"

import { useState } from "react"
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
}

// Sample clients data matching the screenshot
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

interface ClientesOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientesOverlay({ open, onOpenChange }: ClientesOverlayProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewClient, setShowNewClient] = useState(false)

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
            <Button className="w-full bg-[#1e293b] hover:bg-[#334155]" onClick={() => setShowNewClient(true)}>
              Crear cliente
            </Button>
          </div>
        </div>
      </div>

      <NewClientPanel open={showNewClient} onOpenChange={setShowNewClient} onAdd={handleAddClient} />
    </>
  )
}