"use client"
import React, { FormEvent, useState, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface NewSupplierPayload {
  code: string
  name: string
  documentType: string
  documentNumber: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  department: string
  country: string
  postalCode: string
  paymentTerms: number
  creditLimit: number
  status: string
  notes: string
}

interface NewSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: NewSupplierPayload) => Promise<void>
}

export function NewSupplierDialog({ open, onOpenChange, onAdd }: NewSupplierDialogProps) {
  const [formData, setFormData] = useState<NewSupplierPayload>({
    code: "",
    name: "",
    documentType: "NIT",
    documentNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    country: "",
    postalCode: "",
    paymentTerms: 30,
    creditLimit: 0,
    status: "ACTIVE",
    notes: "",
  })
  const [error, setError] = useState<string | null>(null)

  // Aceptamos eventos de <input>, <select> o <textarea>
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await onAdd(formData)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear proveedor</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>

            {/* Tipo Documento */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo Documento</Label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="NIT">NIT</option>
                <option value="CI">CI</option>
                <option value="RUC">RUC</option>
              </select>
            </div>

            {/* Número Documento */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número Documento</Label>
              <Input
                id="documentNumber"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contacto</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="">— Selecciona —</option>
                <option value="CHUQUISACA">Chuquisaca</option>
                <option value="LA_PAZ">La Paz</option>
                <option value="ORURO">Oruro</option>
                <option value="COCHABAMBA">Cochabamba</option>
                <option value="PANDO">Pando</option>
                <option value="POTOSI">Potosí</option>
                <option value="TARIJA">Tarija</option>
                <option value="SANTA_CRUZ">Santa Cruz</option>
              </select>
            </div>

            {/* País */}
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            {/* Código Postal */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
              />
            </div>

            {/* Plazo de Pago */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Plazo de Pago (días)</Label>
              <Input
                id="paymentTerms"
                name="paymentTerms"
                type="number"
                value={formData.paymentTerms}
                onChange={handleChange}
              />
            </div>

            {/* Límite de Crédito */}
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Límite de Crédito</Label>
              <Input
                id="creditLimit"
                name="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={handleChange}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>

            {/* Notas */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-[#1e293b] hover:bg-[#334155] text-white"
          >
            Crear proveedor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

