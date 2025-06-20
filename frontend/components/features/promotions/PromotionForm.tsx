"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { X, CalendarIcon, AlertCircle, Tag, Percent } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { usePromotionForm } from '@/contexts/PromotionFormContext'

interface Product {
  id: number
  nombre: string
  precio: number
  costo: number
  stock: number
  categoria: string
  imagen?: string
  barcode?: string
  proveedor?: {
    id: number
    nombre: string
    telefono: string
  }
  ultimaCompra?: {
    fecha: Date
    precio: number
    cantidad: number
  }
}

// Datos de ejemplo
const productos: Product[] = [
  {
    id: 1,
    nombre: "ACT II Pipoca Man-tequilla 91g",
    precio: 14,
    costo: 9.5,
    stock: 7,
    categoria: "Snacks",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    barcode: "7501000611492",
    proveedor: {
      id: 1,
      nombre: "Distribuidora Nacional",
      telefono: "591-77712345",
    },
    ultimaCompra: {
      fecha: new Date(2023, 9, 15),
      precio: 9.5,
      cantidad: 24,
    },
  },
  {
    id: 2,
    nombre: "Aguai Azucar Blanca de 1kg",
    precio: 7,
    costo: 5.2,
    stock: 24,
    categoria: "Abarrotes",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    barcode: "7798036800053",
    proveedor: {
      id: 2,
      nombre: "Ingenio Azucarero Aguaí",
      telefono: "591-33452211",
    },
    ultimaCompra: {
      fecha: new Date(2023, 10, 5),
      precio: 5.2,
      cantidad: 50,
    },
  },
  {
    id: 3,
    nombre: "Coca-Cola 2L",
    precio: 12,
    costo: 8.5,
    stock: 15,
    categoria: "Bebidas",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    barcode: "7791813410235",
    proveedor: {
      id: 3,
      nombre: "Embol S.A.",
      telefono: "591-33336666",
    },
    ultimaCompra: {
      fecha: new Date(2023, 10, 10),
      precio: 8.5,
      cantidad: 30,
    },
  },
]

export function PromotionForm() {
  const { isPromotionFormOpen, closePromotionForm, selectedProductId } = usePromotionForm()
  const [product, setProduct] = useState<Product | null>(null)
  const [precioPromocion, setPrecioPromocion] = useState<string>("")
  const [descuento, setDescuento] = useState<string>("")
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date())
  const [fechaFin, setFechaFin] = useState<Date>(new Date())
  const [descripcion, setDescripcion] = useState<string>("")
  const [tipoPromocion, setTipoPromocion] = useState<string>("porcentaje")
  const [aplicarATodos, setAplicarATodos] = useState<boolean>(false)
  const [errorPrecio, setErrorPrecio] = useState<boolean>(false)

  useEffect(() => {
    if (selectedProductId) {
      const foundProduct = productos.find((p) => p.id === selectedProductId)
      if (foundProduct) {
        setProduct(foundProduct)
        // Inicializar con 10% de descuento por defecto
        const descuentoInicial = "10"
        setDescuento(descuentoInicial)
        const precioConDescuento = (foundProduct.precio * (1 - Number.parseInt(descuentoInicial) / 100)).toFixed(2)
        setPrecioPromocion(precioConDescuento)
      }
    }
  }, [selectedProductId])

  // Establecer fecha fin por defecto a 7 días después
  useEffect(() => {
    const endDate = new Date(fechaInicio)
    endDate.setDate(endDate.getDate() + 7)
    setFechaFin(endDate)
  }, [fechaInicio])

  const margenGanancia = useMemo(() => {
    if (!product) return 0
    return ((product.precio - product.costo) / product.costo) * 100
  }, [product])

  const gananciaPromocion = useMemo(() => {
    if (!product || !precioPromocion) return 0
    const precioNum = Number.parseFloat(precioPromocion)
    if (isNaN(precioNum) || precioNum < product.costo) return 0
    return ((precioNum - product.costo) / product.costo) * 100
  }, [product, precioPromocion])

  const isPrecioValido = useMemo(() => {
    if (!product || !precioPromocion) return true
    const precioNum = Number.parseFloat(precioPromocion)
    return !isNaN(precioNum) && precioNum >= product.costo
  }, [product, precioPromocion])

  useEffect(() => {
    if (!product) return

    if (tipoPromocion === "porcentaje" && descuento) {
      const descuentoNum = Number.parseFloat(descuento)
      if (!isNaN(descuentoNum)) {
        const precioCalculado = (product.precio * (1 - descuentoNum / 100)).toFixed(2)
        setPrecioPromocion(precioCalculado)
      }
    } else if (tipoPromocion === "precio" && precioPromocion) {
      const precioNum = Number.parseFloat(precioPromocion)
      if (!isNaN(precioNum)) {
        const descuentoCalculado = (((product.precio - precioNum) / product.precio) * 100).toFixed(2)
        // Solo actualizar si el cambio vino del input de precio
        if (Math.abs(Number.parseFloat(descuentoCalculado) - Number.parseFloat(descuento)) > 0.1) {
          setDescuento(descuentoCalculado)
        }
      }
    }
  }, [descuento, precioPromocion, product, tipoPromocion])

  const handleDescuentoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDescuento(e.target.value)
  }, [])

  const handlePrecioPromocionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPrecioPromocion(e.target.value)
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    // Aquí iría la lógica para guardar la promoción
    console.log({
      producto: product?.nombre,
      precioOriginal: product?.precio,
      precioPromocion,
      descuento,
      fechaInicio,
      fechaFin,
      descripcion,
      tipoPromocion,
      aplicarATodos,
      gananciaPromocion,
    })

    // Cerrar el formulario
    closePromotionForm()
  }, [product, precioPromocion, descuento, fechaInicio, fechaFin, descripcion, tipoPromocion, aplicarATodos, gananciaPromocion, closePromotionForm])

  if (!isPromotionFormOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[2px] flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Crear Promoción</h2>
          <Button variant="ghost" size="icon" onClick={closePromotionForm} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Información del producto */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              {product.imagen ? (
                <img
                  src={product.imagen || "/placeholder.png"}
                  alt={product.nombre}
                  className="w-12 h-12 object-contain bg-white rounded-md border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                  <Tag className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{product.nombre}</h3>
                <p className="text-sm text-gray-500">{product.categoria}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">Precio actual</p>
                <p className="font-medium">Bs {product.precio.toFixed(2)}</p>
              </div>
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">Costo</p>
                <p className="font-medium">Bs {product.costo.toFixed(2)}</p>
              </div>
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">Margen actual</p>
                <p className={`font-medium ${margenGanancia < 15 ? "text-orange-500" : "text-green-600"}`}>
                  {margenGanancia.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">Stock</p>
                <p className="font-medium">{product.stock} unidades</p>
              </div>
            </div>

            {product.proveedor && (
              <div className="bg-white p-2 rounded border text-sm">
                <p className="text-gray-500">Proveedor</p>
                <p className="font-medium">{product.proveedor.nombre}</p>
                <p className="text-xs text-gray-500">{product.proveedor.telefono}</p>
              </div>
            )}

            {product.ultimaCompra && (
              <div className="bg-white p-2 rounded border text-sm">
                <p className="text-gray-500">Última compra</p>
                <p className="font-medium">
                  {format(product.ultimaCompra.fecha, "dd/MM/yyyy")} - Bs {product.ultimaCompra.precio.toFixed(2)} x{" "}
                  {product.ultimaCompra.cantidad} unidades
                </p>
              </div>
            )}
          </div>

          {/* Tipo de promoción */}
          <div className="space-y-2">
            <Label>Tipo de promoción</Label>
            <Select value={tipoPromocion} onValueChange={setTipoPromocion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="porcentaje">Descuento por porcentaje</SelectItem>
                <SelectItem value="precio">Precio especial</SelectItem>
                <SelectItem value="2x1">2x1</SelectItem>
                <SelectItem value="3x2">3x2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Precio y descuento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descuento">Descuento (%)</Label>
              <div className="relative">
                <Input
                  id="descuento"
                  type="number"
                  min="0"
                  max="100"
                  value={descuento}
                  onChange={handleDescuentoChange}
                  className={errorPrecio ? "border-red-500 pr-10" : ""}
                />
                <Percent className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioPromocion">Precio promoción</Label>
              <div className="relative">
                <Input
                  id="precioPromocion"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioPromocion}
                  onChange={handlePrecioPromocionChange}
                  className={errorPrecio ? "border-red-500 pr-10" : ""}
                />
                {errorPrecio && <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />}
              </div>
            </div>
          </div>

          {/* Alerta de precio por debajo del costo */}
          {errorPrecio && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Precio por debajo del costo</p>
                <p className="text-sm">
                  El precio promocional es menor al costo del producto (Bs {product.costo.toFixed(2)})
                </p>
              </div>
            </div>
          )}

          {/* Ganancia con promoción */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Ganancia con promoción</p>
            <p
              className={`text-lg font-semibold ${gananciaPromocion < 0 ? "text-red-500" : gananciaPromocion < 10 ? "text-orange-500" : "text-green-600"}`}
            >
              {gananciaPromocion.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {gananciaPromocion < 0
                ? "Estás perdiendo dinero con esta promoción"
                : gananciaPromocion < 10
                  ? "Margen de ganancia bajo"
                  : "Buen margen de ganancia"}
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(fechaInicio, "dd/MM/yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={(date) => date && setFechaInicio(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(fechaFin, "dd/MM/yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={(date) => date && setFechaFin(date)}
                    initialFocus
                    disabled={(date) => date < fechaInicio}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la promoción</Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Oferta especial de fin de semana"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Aplicar a todos los productos de la categoría */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="aplicarATodos">Aplicar a toda la categoría</Label>
              <p className="text-sm text-gray-500">Aplicar a todos los productos de {product.categoria}</p>
            </div>
            <Switch id="aplicarATodos" checked={aplicarATodos} onCheckedChange={setAplicarATodos} />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={closePromotionForm}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#1e1e1e] hover:bg-[#2e2e2e]" disabled={errorPrecio}>
              Crear promoción
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
