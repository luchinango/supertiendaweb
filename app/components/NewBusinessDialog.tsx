"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"

interface NewBusinessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewBusinessDialog({ open, onOpenChange }: NewBusinessDialogProps) {
  const [businessType, setBusinessType] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [document, setDocument] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here would go the logic to create the business
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Crear un nuevo negocio</DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Los campos marcados con asterisco (*) son obligatorios</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-type">
              Tipo de negocio<span className="text-red-500">*</span>
            </Label>
            <Select value={businessType} onValueChange={setBusinessType} required>
              <SelectTrigger>
                <SelectValue placeholder="Elige una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clothing">Ropa, zapatos y accesorios</SelectItem>
                <SelectItem value="hardware">Ferretería y construcción</SelectItem>
                <SelectItem value="electronics">Electrónica e informática</SelectItem>
                <SelectItem value="grocery">Minimercado</SelectItem>
                <SelectItem value="restaurant">Restaurante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-name">
              Nombre del negocio<span className="text-red-500">*</span>
            </Label>
            <Input
              id="business-name"
              placeholder="Escribe el nombre"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección del negocio</Label>
            <Input
              id="address"
              placeholder="Escribe la dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad donde se ubica el negocio</Label>
            <Input id="city" placeholder="Escribe la ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Número de celular</Label>
            <div className="flex">
              <Select defaultValue="591">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Código" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="591">+591</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                placeholder="Escribe el número"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 ml-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="Escribe el correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Documento</Label>
            <Input
              id="document"
              placeholder="Escribe el documento"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Crear negocio
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

