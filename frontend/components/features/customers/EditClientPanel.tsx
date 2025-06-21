"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import type {Customer} from "@/types/Customer"

interface EditClientPanelProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: Customer) => void
}

export function EditClientPanel({ customer, open, onOpenChange, onEdit }: EditClientPanelProps) {
   const [firstName, setFirstName] = useState(customer.first_name || "")
  const [lastName, setLastName] = useState(customer.last_name || "")
  const [phone, setPhone] = useState(customer.phone || "")
  const [email, setEmail] = useState(customer.email || "")
  const [companyName, setCompanyName] = useState(customer.company_name || "")
  const [taxId, setTaxId] = useState(customer.tax_id || "")
  const [address, setAddress] = useState(customer.address || "")
  const [status, setStatus] = useState(customer.status || "Activo")
  const [hasDebt, setHasDebt] = useState(false)
  const [debtAmount, setDebtAmount] = useState(0)
  const [documentType, setDocumentType] = useState(customer.document_type || "CI")
  const [documentNumber, setDocumentNumber] = useState(customer.document_number || "")
  const [city, setCity] = useState(customer.city || "")
  const [department, setDepartment] = useState(customer.department || "LA_PAZ")
  const [country, setCountry] = useState(customer.country || "Bolivia")

    useEffect(() => {
    if (open) {
      setFirstName(customer.first_name)
      setLastName(customer.last_name)
      setPhone(customer.phone || "")
      setEmail(customer.email || "")
      setCompanyName(customer.company_name || "")
      setTaxId(customer.tax_id || "")
      setAddress(customer.address || "")
      setStatus(customer.status || "Activo")
      setDocumentType("CI")
      setDocumentNumber("")
      setCity("")
      setDepartment("LA_PAZ")
      setCountry("")
    }
  }, [customer, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit({
       ...customer,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      company_name: companyName,
      tax_id: taxId,
      address,
      status,
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
                <Label htmlFor="edit-firstName">Nombre</Label>
                <Input id="edit-firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Apellido</Label>
                <Input id="edit-lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-documentType">Tipo de documento</Label>
                <select
                  id="edit-documentType"
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="CI">CI</option>
                  <option value="NIT">NIT</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-documentNumber">Número de documento</Label>
                <Input id="edit-documentNumber" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input id="edit-address" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">Ciudad</Label>
                <Input id="edit-city" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Departamento</Label>
                <select
                  id="edit-department"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  required
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
                <Input id="edit-country" value={country} onChange={e => setCountry(e.target.value)} required />
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" type="button">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-[#1e293b] text-white hover:bg-[#334155]">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
