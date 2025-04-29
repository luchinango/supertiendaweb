"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import {Customer} from "@/types/Customer";

interface EditClientPanelProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: Customer) => void
}

export function EditClientPanel({ customer, open, onOpenChange, onEdit }: EditClientPanelProps) {
   const [firstName, setFirstName] = useState(customer.first_name)
  const [lastName, setLastName] = useState(customer.last_name)
  const [phone, setPhone] = useState(customer.phone || "")
  const [email, setEmail] = useState(customer.email || "")
  const [companyName, setCompanyName] = useState(customer.company_name || "")
  const [taxId, setTaxId] = useState(customer.tax_id || "")
  const [address, setAddress] = useState(customer.address || "")
  const [status, setStatus] = useState(customer.status || "Activo")
  const [hasDebt, setHasDebt] = useState(false)
  const [debtAmount, setDebtAmount] = useState(0)


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
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input id="edit-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
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
                    onChange={(e) => setDebtAmount(Number(e.target.value))}
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
