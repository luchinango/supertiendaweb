"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface Client {
  id: number
  name: string
  phone: string
  hasDebt: boolean
  debtAmount?: number
}

interface EditClientPanelProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: Client) => void
}

export function EditClientPanel({ client, open, onOpenChange, onEdit }: EditClientPanelProps) {
  const [name, setName] = useState(client.name)
  const [phone, setPhone] = useState(client.phone)
  const [hasDebt, setHasDebt] = useState(client.hasDebt)
  const [debtAmount, setDebtAmount] = useState(client.debtAmount?.toString() || "0")

  useEffect(() => {
    if (open) {
      setName(client.name)
      setPhone(client.phone)
      setHasDebt(client.hasDebt)
      setDebtAmount(client.debtAmount?.toString() || "0")
    }
  }, [client, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit({
      ...client,
      name,
      phone,
      hasDebt,
      debtAmount: hasDebt ? Number.parseFloat(debtAmount) : 0,
    })
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
        className={`fixed top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out h-screen ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Editar cliente</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="has-debt">Tiene deuda</Label>
                  <Switch id="has-debt" checked={hasDebt} onCheckedChange={setHasDebt} />
                </div>
              </div>

              {hasDebt && (
                <div className="space-y-2">
                  <Label htmlFor="debt-amount">Monto de deuda (Bs)</Label>
                  <Input
                    id="debt-amount"
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    required
                  />
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t mt-auto">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-[#1e293b] hover:bg-[#334155]">
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}