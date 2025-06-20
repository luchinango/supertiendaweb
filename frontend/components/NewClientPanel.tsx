"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface NewClientPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (client: { name: string; phone: string }) => void
}

export function NewClientPanel({ open, onOpenChange, onAdd }: NewClientPanelProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    company_name: "",
    tax_id: "",
    email: "",
    status: "",
    credit_balance: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ name: `${form.first_name} ${form.last_name}`.trim(), phone: form.phone })
    setForm({
      first_name: "",
      last_name: "",
      address: "",
      phone: "",
      company_name: "",
      tax_id: "",
      email: "",
      status: "",
      credit_balance: "",
    })
    onOpenChange(false)
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
            <h2 className="text-xl font-semibold">Crear cliente</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
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
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Input id="status" name="status" value={form.status} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_balance">Crédito</Label>
                <Input id="credit_balance" name="credit_balance" type="number" value={form.credit_balance} onChange={handleChange} />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-[#1e293b] text-white hover:bg-[#334155]">
                  Crear cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}