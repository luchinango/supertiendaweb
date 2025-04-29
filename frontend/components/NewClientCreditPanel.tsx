"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { SelectClientsModal } from "./SelectClientsModal"

interface NewClientCreditPanelProps {
  isOpen: boolean
  onClose: () => void
  onAddCredit: (credit: {
    client: string
    totalAmount: number
    remainingAmount: number
    status: "pendiente" | "pagado"
    startDate: string
  }) => void
}

export function NewClientCreditPanel({ isOpen, onClose, onAddCredit }: NewClientCreditPanelProps) {
  const [client, setClient] = useState("")
  const [amount, setAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [isSelectClientOpen, setIsSelectClientOpen] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCredit({
      client,
      totalAmount: Number.parseFloat(amount),
      remainingAmount: Number.parseFloat(amount),
      status: "pendiente",
      startDate,
    })
    resetForm()
  }

  const resetForm = () => {
    setClient("")
    setAmount("")
    setStartDate("")
    setUnsavedChanges(false)
  }

  const handleClose = () => {
    if (unsavedChanges) {
      if (confirm("Aún no has guardado los cambios. ¿Estás seguro que deseas salir?")) {
        resetForm()
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleSelectClient = (selectedClient: { name: string }) => {
    setClient(selectedClient.name)
    setIsSelectClientOpen(false)
    setUnsavedChanges(true)
  }

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setUnsavedChanges(true)
    }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/15 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Nuevo Crédito a Cliente</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <div className="flex gap-2">
              <Input
                id="client"
                value={client}
                onChange={handleInputChange(setClient)}
                className="flex-1"
                placeholder="Nombre del cliente"
                required
              />
              <Button type="button" variant="outline" onClick={() => setIsSelectClientOpen(true)}>
                Buscar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto Total</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={handleInputChange(setAmount)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input id="startDate" type="date" value={startDate} onChange={handleInputChange(setStartDate)} required />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Crear Crédito
            </Button>
          </div>
        </form>
      </div>

      <SelectClientsModal
        isOpen={isSelectClientOpen}
        onClose={() => setIsSelectClientOpen(false)}
        selectedClients={client ? [client] : []}
        setSelectedClients={(clients: string[]) => {
          setClient(clients[0] || "");
          setUnsavedChanges(true);
        }}
      />
    </>
  )
}