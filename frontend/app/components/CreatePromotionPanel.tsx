"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Supplier {
  id: number
  nombre: string
  telefono: string
  email: string
}

interface PurchaseHistory {
  id: number
  fecha: string
  cantidad: number
  precioUnitario: number
  proveedor: Supplier
}

interface SaleHistory {
  id: number
  fecha: string
  cantidad: number
  precioUnitario: number
}

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number
  stockMinimo: number
  categoria: string
  fechaVencimiento?: string
  ultimaVenta?: string
  costo: number
  historialCompras: PurchaseHistory[]
  historialVentas: SaleHistory[]
}

interface CreatePromotionPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  onCreatePromotion?: (productId: number, data: PromotionData) => void
}

interface PromotionData {
  precioPromocion: number
  fechaInicio: Date
  fechaFin: Date
  descripcion: string
  tipoPromocion: string
  porcentajeDescuento: number
}

export function CreatePromotionPanel({
  open,
  onOpenChange,
  product,
  onCreatePromotion,
}: CreatePromotionPanelProps) {
  const [precioPromocion, setPrecioPromocion] = useState<number>(product.precio * 0.9) // 10% de descuento por defecto
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date())
  const [fechaFin, setFechaFin] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // 7 días por defecto
    return date
  })
  const [descripcion, setDescripcion] = useState<string>("")
  const [tipoPromocion, setTipoPromocion] = useState<string>("porcentaje")
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<number>(10)
  const [error, setError] = useState<string | null>(null)

  // Calcular el margen de ganancia actual
  const costoPromedio = product.historialCompras.reduce((sum, purchase) => sum + purchase.precioUnitario, 0) / 
                        (product.historialCompras.length || 1)
  const margenActual = ((product.precio - costoPromedio) / costoPromedio) * 100
  const margenPromocion = ((precioPromocion - costoPromedio) / costoPromedio) * 100

  // Actualizar precio promocional cuando cambia el porcentaje
  useEffect(() => {
    if (tipoPromocion === "porcentaje") {
      const nuevoPrecio = product.precio * (1 - porcentajeDescuento / 100)
      setPrecioPromocion(Number(nuevoPrecio.toFixed(2)))
    }
  }, [porcentajeDescuento, product.precio, tipoPromocion])

  // Actualizar porcentaje cuando cambia el precio promocional
  useEffect(() => {
    if (tipoPromocion === "precio") {
      const nuevoDescuento = ((product.precio - precioPromocion) / product.precio) * 100
      setPorcentajeDescuento(Number(nuevoDescuento.toFixed(2)))
    }
  }, [precioPromocion, product.precio, tipoPromocion])

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      if (value < costoPromedio) {
        setError("El precio no puede ser menor al costo de compra")
      } else {
        setError(null)
        setPrecioPromocion(value)
        setTipoPromocion("precio")
      }
    }
  }

  const handlePorcentajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      if (value > 0 && value < 100) {
        setTipoPromocion("porcentaje")
        setPorcentajeDescuento(value)
        const nuevoPrecio = product.precio * (1 - value / 100)
        if (nuevoPrecio < costoPromedio) {
          setError("El descuento genera un precio menor al costo de compra")
        } else {
          setError(null)
          setPrecioPromocion(Number(nuevoPrecio.toFixed(2)))
        }
      }
    }
  }

  const handleSubmit = () => {
    if (error) return

    if (onCreatePromotion) {
      onCreatePromotion(product.id, {
        precioPromocion,
        fechaInicio,
        fechaFin,
        descripcion,
        tipoPromocion,
        porcentajeDescuento,
      })
    }
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/15 flex justify-end">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md h-full overflow-y-auto p-6 shadow-lg animate-in slide-in-from-right">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Crear Promoción</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{product.nombre}</h3>
            <div className="flex items-center gap-2">
              <Badge>{product.categoria}</Badge>
              <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio Regular</Label>
              <div className="text-lg font-medium">Bs {product.precio.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label>Costo Promedio</Label>
              <div className="text-lg font-medium">Bs {costoPromedio.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Margen Actual</Label>
              <div className="text-lg font-medium">{margenActual.toFixed(2)}%</div>
            </div>
            <div className="space-y-2">
              <Label>Última Venta</Label>
              <div className="text-lg font-medium">{product.ultimaVenta || "N/A"}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoPromocion">Tipo de Promoción</Label>
            <Select value={tipoPromocion} onValueChange={setTipoPromocion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="porcentaje">Descuento por porcentaje</SelectItem>
                <SelectItem value="precio">Precio fijo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoPromocion === "porcentaje" ? (
            <div className="space-y-2">
              <Label htmlFor="porcentajeDescuento">Porcentaje de Descuento (%)</Label>
              <Input
                id="porcentajeDescuento"
                type="number"
                min="1"
                max="99"
                value={porcentajeDescuento}
                onChange={handlePorcentajeChange}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="precioPromocion">Precio Promocional (Bs)</Label>
            <Input
              id="precioPromocion"
              type="number"
              min={costoPromedio}
              step="0.01"
              value={precioPromocion}
              onChange={handlePrecioChange}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-sm text-muted-foreground">
              Margen con promoción: {margenPromocion.toFixed(2)}%
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !fechaInicio && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fechaInicio} onSelect={(date) => date && setFechaInicio(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !fechaFin && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fechaFin} onSelect={(date) => date && setFechaFin(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la Promoción</Label>
            <Textarea
              id="descripcion"
              placeholder="Detalles de la promoción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Historial de Compras</h4>
            <div className="border rounded-md divide-y">
              {product.historialCompras.map((purchase) => (
                <div key={purchase.id} className="p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fecha: {purchase.fecha}</span>
                    <span className="text-sm">Cantidad: {purchase.cantidad}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm">Precio: Bs {purchase.precioUnitario.toFixed(2)}</span>
                    <span className="text-sm">Proveedor: {purchase.proveedor.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Historial de Ventas</h4>
            <div className="border rounded-md divide-y">
              {product.historialVentas.length > 0 ? (
                product.historialVentas.map((sale) => (
                  <div key={sale.id} className="p-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fecha: {sale.fecha}</span>
                      <span className="text-sm">Cantidad: {sale.cantidad}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm">Precio: Bs {sale.precioUnitario.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-center text-muted-foreground">
                  No hay ventas recientes
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!!error}>
              Crear Promoción
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}