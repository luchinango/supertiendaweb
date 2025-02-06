'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Supplier {
  id: number
  name: string
  contact: string
  phone: string
  email: string
}

interface EditSupplierDialogProps {
  supplier: Supplier
  onEditSupplier: (supplier: Supplier) => void
  onClose: () => void
}

export function EditSupplierDialog({ supplier, onEditSupplier, onClose }: EditSupplierDialogProps) {
  const [name, setName] = useState(supplier.name)
  const [contact, setContact] = useState(supplier.contact)
  const [phone, setPhone] = useState(supplier.phone)
  const [email, setEmail] = useState(supplier.email)

  useEffect(() => {
    setName(supplier.name)
    setContact(supplier.contact)
    setPhone(supplier.phone)
    setEmail(supplier.email)
  }, [supplier])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditSupplier({ ...supplier, name, contact, phone, email })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del proveedor</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contact">Nombre de contacto</Label>
            <Input
              id="edit-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

