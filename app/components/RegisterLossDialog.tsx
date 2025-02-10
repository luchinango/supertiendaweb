"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Textarea } from "@/app/components/ui/textarea"

interface RegisterLossDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (loss: {
    producto: string
    cantidad: number
    tipo: "vencido" | "dañado" | "perdido"
    fecha: string
    valor: number
    responsable: string
  }) => void
}

export function RegisterLossDialog({ open, onOpenChange, onRegister }: RegisterLossDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar merma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="producto">Producto</Label>
            <Select value={producto} onValueChange={setProducto}>
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
            <Select value={responsable} onValueChange={setResponsable}>
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

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar merma</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

