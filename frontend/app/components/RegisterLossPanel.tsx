"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface RegisterLossPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (loss: {
    producto: string
    cantidad: number
    tipo: "vencido" | "dañado" | "perdido"
    fecha: string
    valor: number
    responsable: string
    observaciones?: string
  }) => void
}

export function RegisterLossPanel({ open, onOpenChange, onRegister }: RegisterLossPanelProps) {
  const [producto, setProducto] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [tipo, setTipo] = useState<"vencido" | "dañado" | "perdido">("vencido")
  const [fecha, setFecha] = useState("")
  const [valor, setValor] = useState("")
  const [responsable, setResponsable] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegister({
      producto,
      cantidad: Number.parseInt(cantidad),
      tipo,
      fecha,
      valor: Number.parseFloat(valor),
      responsable,
      observaciones,
    })
    onOpenChange(false)
    // Reset form
    setProducto("")
    setCantidad("")
    setTipo("vencido")
    setFecha("")
    setValor("")
    setResponsable("")
    setObservaciones("")
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed top-[-23px] left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sliding panel */}
      <div
        className={`fixed top-[-23px] bottom-0 right-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col h-screen`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Registrar merma</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="producto">Producto</Label>
              <Select value={producto} onValueChange={setProducto} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACT II Pipoca Man-tequilla 91g">ACT II Pipoca Man-tequilla 91g</SelectItem>
                  <SelectItem value="Aguai Azucar Blanca de 1kg">Aguai Azucar Blanca de 1kg</SelectItem>
                  <SelectItem value="Ajinomen Sopa Instantanea">Ajinomen Sopa Instantanea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (Bs)</Label>
                <Input
                  id="valor"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de merma</Label>
              <Select value={tipo} onValueChange={(value: "vencido" | "dañado" | "perdido") => setTipo(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="dañado">Dañado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Select value={responsable} onValueChange={setResponsable} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
                  <SelectItem value="María García">María García</SelectItem>
                  <SelectItem value="Carlos López">Carlos López</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Detalles adicionales sobre la merma..."
                className="resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Registrar merma</Button>
          </div>
        </div>
      </div>
    </>
  )
}