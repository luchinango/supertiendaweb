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
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t mt-auto">
            <Button onClick={handleSubmit} className="w-full bg-[#1e293b] hover:bg-[#334155]">
              Crear cliente
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}