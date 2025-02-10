"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Search, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { NewClientDialog } from "../components/NewClientDialog"
import { EditClientDialog } from "../components/EditClientDialog"

interface Client {
  id: number
  name: string
  phone: string
}

const initialClients: Client[] = [
  { id: 1, name: "Luis Alberto Martínez Barrientos", phone: "+591 72944911" },
  { id: 2, name: "Mateo", phone: "+591 75454698" },
  { id: 3, name: "Telma", phone: "+591 70000000" },
  { id: 4, name: "TODITO", phone: "+591 71111111" },
]

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showNewClient, setShowNewClient] = useState(false)

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
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
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-muted-foreground">{client.phone}</div>
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
        ))}
      </div>

      <Button className="w-full" onClick={() => setShowNewClient(true)}>
        Crear cliente
      </Button>

      <NewClientDialog
        open={showNewClient}
        onOpenChange={setShowNewClient}
        onAdd={(newClient) => {
          setClients([...clients, { id: clients.length + 1, ...newClient }])
        }}
      />

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          open={true}
          onOpenChange={() => setEditingClient(null)}
          onEdit={(updatedClient) => {
            setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)))
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}

