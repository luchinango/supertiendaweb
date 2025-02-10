"use client"

import { useState } from "react"
import { Button } from "app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "app/components/ui/dialog"
import { Input } from "app/components/ui/input"
import { Label } from "app/components/ui/label"

interface NewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (client: { name: string; phone: string }) => void
}

export function NewClientDialog({ open, onOpenChange, onAdd }: NewClientDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ name, phone })
    setName("")
    setPhone("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">
            Crear cliente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

