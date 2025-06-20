"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, AlertTriangle } from "lucide-react"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number
  stockMinimo: number
  categoria: string
  fechaVencimiento?: string
}

interface ProductRemovalPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

export function ProductRemovalPanel({ open, onOpenChange, product }: ProductRemovalPanelProps) {
  const [cantidad, setCantidad] = useState(product.stock.toString())
  const [motivo, setMotivo] = useState<"vencido" | "dañado" | "otro">("vencido")
  const [observaciones, setObservaciones] = useState("")
  const [fechaCompra, setFechaCompra] = useState("")
  const [costo, setCosto] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para registrar la merma
    alert(`Producto ${product.nombre} retirado del inventario: ${cantidad} unidades`)
    onOpenChange(false)
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/15 backdrop-blur-sm z-40" onClick={() => onOpenChange(false)} />}

      {/* Sliding panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col h-screen`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Retirar Producto Vencido</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-md">
              <h3 className="font-medium text-red-800 mb-2">Detalles del producto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{product.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoría</p>
                  <p className="font-medium">{product.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de vencimiento</p>
                  <p className="font-medium">{product.fechaVencimiento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock actual</p>
                  <p className="font-medium">{product.stock}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaCompra">Fecha de compra</Label>
              <Input
                id="fechaCompra"
                type="date"
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad a retirar</Label>
              <Input
                id="cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min="1"
                max={product.stock.toString()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costo">Costo de pérdida (Bs)</Label>
              <Input
                id="costo"
                type="number"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Select value={motivo} onValueChange={(value: "vencido" | "dañado" | "otro") => setMotivo(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="dañado">Dañado</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Detalles adicionales sobre el retiro del producto..."
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
            <Button variant="destructive" onClick={handleSubmit}>
              Confirmar retiro
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}