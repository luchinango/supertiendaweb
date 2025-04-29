"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { SelectClientsModal } from "./SelectClientsModal"

interface Credit {
  id: number
  client: string
  totalAmount: number
  remainingAmount: number
  status: "pendiente" | "pagado"
  startDate: string
  payments: any[]
}

interface EditClientCreditPanelProps {
  credit: Credit
  isOpen: boolean
  onClose: () => void
  onEditCredit: (credit: Credit) => void
}

export function EditClientCreditPanel({ credit, isOpen, onClose, onEditCredit }: EditClientCreditPanelProps) {
  const [client, setClient] = useState(credit.client)
  const [totalAmount, setTotalAmount] = useState(credit.totalAmount.toString())
  const [remainingAmount, setRemainingAmount] = useState(credit.remainingAmount.toString())
  const [startDate, setStartDate] = useState(credit.startDate)
  const [isSelectClientOpen, setIsSelectClientOpen] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    setClient(credit.client)
    setTotalAmount(credit.totalAmount.toString())
    setRemainingAmount(credit.remainingAmount.toString())
    setStartDate(credit.startDate)
    setUnsavedChanges(false)
  }, [credit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditCredit({
      ...credit,
      client,
      totalAmount: Number.parseFloat(totalAmount),
      remainingAmount: Number.parseFloat(remainingAmount),
      status: Number.parseFloat(remainingAmount) > 0 ? "pendiente" : "pagado",
    })
  }

  const handleClose = () => {
    if (unsavedChanges) {
      if (confirm("Aún no has guardado los cambios. ¿Estás seguro que deseas salir?")) {
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
          <h2 className="text-lg font-semibold">Editar Crédito a Cliente</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <div className="flex gap-2">
              <Input id="client" value={client} onChange={handleInputChange(setClient)} className="flex-1" required />
              <Button type="button" variant="outline" onClick={() => setIsSelectClientOpen(true)}>
                Buscar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Monto Total</Label>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={handleInputChange(setTotalAmount)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remainingAmount">Monto Pendiente</Label>
            <Input
              id="remainingAmount"
              type="number"
              value={remainingAmount}
              onChange={handleInputChange(setRemainingAmount)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input id="startDate" type="date" value={startDate} onChange={handleInputChange(setStartDate)} required />
          </div>

          <div className="pt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar Cambios
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