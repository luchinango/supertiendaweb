"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Client {
  id: number
  name: string
  phone: string
  hasDebt: boolean
  debtAmount?: number
}

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: Client) => void
}

export function EditClientDialog({ client, open, onOpenChange, onEdit }: EditClientDialogProps) {
  const [name, setName] = useState(client.name)
  const [phone, setPhone] = useState(client.phone)
  const [hasDebt, setHasDebt] = useState(client.hasDebt)
  const [debtAmount, setDebtAmount] = useState(client.debtAmount?.toString() || "0")

  useEffect(() => {
    setName(client.name)
    setPhone(client.phone)
    setHasDebt(client.hasDebt)
    setDebtAmount(client.debtAmount?.toString() || "0")
  }, [client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit({ ...client, name, phone })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

