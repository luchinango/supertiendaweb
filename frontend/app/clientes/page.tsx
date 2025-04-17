"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NewClientDialog } from "../components/NewClientDialog"
import { EditClientDialog } from "../components/EditClientDialog"
import { ClientesOverlay } from "../components/ClientesOverlay"

interface Client {
  id: number
  name: string
  phone: string
  initials: string
  hasDebt: boolean
  debtAmount?: number
}

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

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setShowClientsDialog(true)}>Ver clientes</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredClients.map((client) => (
          <div key={client.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-gray-200">
                <AvatarFallback>{client.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-muted-foreground">{client.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-right">
                <div className="font-medium">Deuda total</div>
                <div className="text-muted-foreground">
                  {client.hasDebt && client.debtAmount ? `Bs ${client.debtAmount}` : "Sin deuda"}
                </div>
              </div>
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
        ))}
      </div>

      <Button className="w-full" onClick={() => setShowNewClient(true)}>
        Crear cliente
      </Button>

      {/* Use the improved ClientesOverlay component */}
      <ClientesOverlay open={showClientsDialog} onOpenChange={setShowClientsDialog} />

      <NewClientDialog
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
        <EditClientDialog
          client={editingClient}
          open={true}
          onOpenChange={() => setEditingClient(null)}
          onEdit={(updatedClient) => {
            setClients(clients.map((c) => (c.id === updatedClient.id ? { ...c, ...updatedClient } : c)))
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}