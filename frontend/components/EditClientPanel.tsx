"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { CustomerForm } from "@/types/CustomerForm"

interface EditClientPanelProps {
  client: CustomerForm
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: CustomerForm) => void
}

export function EditClientPanel({ client, open, onOpenChange, onEdit }: EditClientPanelProps) {
  const [form, setForm] = useState<CustomerForm>({
    id: client.id ?? 0,
    first_name: client.first_name ?? "",
    last_name: client.last_name ?? "",
    address: client.address ?? "",
    phone: client.phone ?? "",
    company_name: client.company_name ?? "",
    tax_id: client.tax_id ?? "",
    email: client.email ?? "",
    status: client.status ?? "",
    credit_balance: client.credit_balance ?? 0,
    document_type: client.document_type ?? "CI",
    document_number: client.document_number ?? "",
    city: client.city ?? "",
    department: client.department ?? "LA_PAZ",
    country: client.country ?? "Bolivia",
  })

  useEffect(() => {
    setForm({
      id: client.id ?? 0,
      first_name: client.first_name ?? "",
      last_name: client.last_name ?? "",
      address: client.address ?? "",
      phone: client.phone ?? "",
      company_name: client.company_name ?? "",
      tax_id: client.tax_id ?? "",
      email: client.email ?? "",
      status: client.status ?? "",
      credit_balance: client.credit_balance ?? 0,
      document_type: client.document_type ?? "CI",
      document_number: client.document_number ?? "",
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
    onEdit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white fixed right-0 top-0 bottom-0 w-full max-w-md shadow-xl z-50 transition-transform duration-300 animate-slide-in-from-right flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document_type">Tipo de documento</Label>
            <select id="document_type" name="document_type" value={form.document_type} onChange={handleChange} className="w-full border rounded px-2 py-1">
              <option value="CI">CI</option>
              <option value="NIT">NIT</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="document_number">Número de documento</Label>
            <Input id="document_number" name="document_number" value={form.document_number} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" value={form.city} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <select id="department" name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-2 py-1">
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
            <Label htmlFor="country">País</Label>
            <Input id="country" name="country" value={form.country} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Empresa</Label>
            <Input id="company_name" name="company_name" value={form.company_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">NIT</Label>
            <Input id="tax_id" name="tax_id" value={form.tax_id} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Input id="status" name="status" value={form.status} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credit_balance">Crédito</Label>
            <Input id="credit_balance" name="credit_balance" type="number" value={form.credit_balance} onChange={handleChange} />
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

export function ClientComponent() {
  // Dummy data for demonstration; replace with your actual data source or state
  const [clients, setClients] = useState<CustomerForm[]>([])
  const [editingClient, setEditingClient] = useState<CustomerForm | null>(null)

  const handleEditClient = (client: CustomerForm) => {
    setEditingClient(client)
  }

  return (
    <div>
      {/* Aquí tu código existente para mostrar la lista de clientes */}
      {clients.map((client) => (
        <div key={client.id}>
          {/* Información del cliente */}
          <Button onClick={() => handleEditClient(client)}>Editar</Button>
        </div>
      ))}

      {editingClient && (
        <EditClientPanel
          client={editingClient}
          open={true}
          onOpenChange={() => setEditingClient(null)}
          onEdit={(updatedClient) => {
            // Aquí puedes actualizar el cliente en tu estado o backend
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}

