"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Client {
  id: number
  businessId: number
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  email: string
  phone: string
  address: string
  city: string
  department: string
  country: string
  // Puedes agregar más campos si tu backend los devuelve
}

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: Client) => void
}

export function EditClientDialog({ client, open, onOpenChange, onEdit }: EditClientDialogProps) {
  const [form, setForm] = useState({
    businessId: client.businessId ?? 1,
    firstName: client.firstName ?? "",
    lastName: client.lastName ?? "",
    documentType: client.documentType ?? "CI",
    documentNumber: client.documentNumber ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    department: client.department ?? "LA_PAZ",
    country: client.country ?? "Bolivia",
  })

  useEffect(() => {
    setForm({
      businessId: client.businessId ?? 1,
      firstName: client.firstName ?? "",
      lastName: client.lastName ?? "",
      documentType: client.documentType ?? "CI",
      documentNumber: client.documentNumber ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      department: client.department ?? "LA_PAZ",
      country: client.country ?? "Bolivia",
    })
  }, [client])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit({ ...client, ...form })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-first-name">Nombre</Label>
            <Input
              id="edit-first-name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-last-name">Apellido</Label>
            <Input
              id="edit-last-name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-document-type">Tipo de documento</Label>
            <select
              id="edit-document-type"
              name="documentType"
              value={form.documentType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="CI">CI</option>
              <option value="NIT">NIT</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-document-number">Número de documento</Label>
            <Input
              id="edit-document-number"
              name="documentNumber"
              value={form.documentNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input
              id="edit-phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Dirección</Label>
            <Input
              id="edit-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-city">Ciudad</Label>
            <Input
              id="edit-city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-department">Departamento</Label>
            <select
              id="edit-department"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="LA_PAZ">La Paz</option>
              <option value="COCHABAMBA">Cochabamba</option>
              <option value="SANTA_CRUZ">Santa Cruz</option>
              <option value="ORURO">Oruro</option>
              <option value="POTOSI">Potosí</option>
              <option value="CHUQUISACA">Chuquisaca</option>
              <option value="TARIJA">Tarija</option>
              <option value="BENI">Beni</option>
              <option value="PANDO">Pando</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-country">País</Label>
            <Input
              id="edit-country"
              name="country"
              value={form.country}
              onChange={handleChange}
              required
            />
          </div>
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

