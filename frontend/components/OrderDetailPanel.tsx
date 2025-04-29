"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Printer, Save, Package, Barcode, Plus, Minus } from "lucide-react"

interface Product {
  id: number
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface PurchaseOrder {
  id: number
  proveedor: string
  fecha: string
  total: number
  estado: "pendiente" | "aprobada" | "recibida"
  tipo: "manual" | "automatizada"
  productos: Product[]
  formaPago: "contado" | "credito"
  plazoCredito?: number
}

interface OrderDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  order: PurchaseOrder
  onStatusChange: (newStatus: "pendiente" | "aprobada" | "recibida") => void
}

export function OrderDetailPanel({ isOpen, onClose, order, onStatusChange }: OrderDetailPanelProps) {
  const [barcodeInput, setBarcodeInput] = useState("")
  const [quantities, setQuantities] = useState<Record<number, number>>(
    order.productos.reduce(
      (acc, product) => {
        acc[product.id] = product.cantidad
        return acc
      },
      {} as Record<number, number>,
    ),
  )

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantities({ ...quantities, [productId]: newQuantity })
  }

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would implement barcode scanning logic
    alert(`Código de barras escaneado: ${barcodeInput}`)
    setBarcodeInput("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Detail panel */}
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Detalle de Orden de Compra #{order.id}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-blue-500 -mx-6 mb-6"></div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Proveedor</h3>
                <p className="font-medium">{order.proveedor}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha</h3>
                <p className="font-medium">{order.fecha}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo</h3>
                <Badge variant={order.tipo === "automatizada" ? "secondary" : "outline"}>
                  {order.tipo === "automatizada" ? "Automatizada" : "Manual"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estado</h3>
                <Select value={order.estado} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue>
                      <Badge
                        variant={
                          order.estado === "pendiente"
                            ? "outline"
                            : order.estado === "aprobada"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {order.estado === "pendiente"
                          ? "Pendiente"
                          : order.estado === "aprobada"
                            ? "Aprobada"
                            : "Recibida"}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="recibida">Recibida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Forma de Pago</h3>
                <p className="font-medium capitalize">{order.formaPago}</p>
              </div>
              {order.formaPago === "credito" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Plazo de Crédito</h3>
                  <p className="font-medium">{order.plazoCredito} días</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Valor total</div>
                  <div className="text-xl font-bold">Bs {order.total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Escanear código de barras</h3>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Escanear o ingresar código..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>
            </div>

            <div>
              <h3 className="font-medium mb-3">Productos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.productos.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.nombre}</TableCell>
                      <TableCell>Bs {product.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(product.id, quantities[product.id] - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={quantities[product.id]}
                            onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(product.id, quantities[product.id] + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>Bs {(product.precioUnitario * quantities[product.id]).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}