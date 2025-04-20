"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

interface SelectClientsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClients: string[]
  setSelectedClients: (clients: string[]) => void
}

export function SelectClientsModal({ isOpen, onClose, selectedClients, setSelectedClients }: SelectClientsModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(selectedClients)

  // Sample clients data
  const clients = [
    { id: "1", name: "Luis Alberto Martínez Barrientos" },
    { id: "2", name: "Mateo" },
    { id: "3", name: "SOCODEVI" },
    { id: "4", name: "Telma" },
    { id: "5", name: "TODITO" },
  ]

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleToggleClient = (name: string) => {
    if (tempSelected.includes(name)) {
      setTempSelected(tempSelected.filter((c) => c !== name))
    } else {
      setTempSelected([...tempSelected, name])
    }
  }

  const handleConfirm = () => {
    setSelectedClients(tempSelected)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">Seleccionar clientes</h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={`client-${client.id}`}
              checked={tempSelected.includes(client.name)}
              onCheckedChange={() => handleToggleClient(client.name)}
            />
            <label
              htmlFor={`client-${client.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {client.name}
            </label>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <Button onClick={handleConfirm} className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
          Confirmar
        </Button>
      </div>
    </div>
  )
}