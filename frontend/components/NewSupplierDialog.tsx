"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

interface NewSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (supplier: { name: string; phone: string; contact: string; email: string }) => void
}

export function NewSupplierDialog({ open, onOpenChange, onAdd }: NewSupplierDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ name, phone, contact, email })
    setName("")
    setPhone("")
    setContact("")
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del proveedor</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contacto</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#334155] text-white">
            Crear proveedor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

