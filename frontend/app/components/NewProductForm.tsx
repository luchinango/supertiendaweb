"use client"

import type React from "react"

import { useState } from "react"
import { X, Barcode, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: any) => void
}

export function NewProductForm({ isOpen, onClose, onSubmit }: NewProductFormProps) {
  const [productData, setProductData] = useState({
    barcode: "",
    name: "",
    price: "",
    unit: "Unidades",
  })

  const handleChange = (field: string, value: string) => {
    setProductData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(productData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Form panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Nuevo Producto</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Barcode className="h-5 w-5" />
                </div>
                <Input
                  id="barcode"
                  placeholder="Escanea o escribe el código del producto"
                  className="pl-10"
                  value={productData.barcode}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                required
                value={productData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Precio por unidad <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">Bs</span>
                </div>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="pl-10"
                  required
                  value={productData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidad de venta</Label>
              <Select value={productData.unit} onValueChange={(value) => handleChange("unit", value)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unidades">Unidades</SelectItem>
                  <SelectItem value="Kilogramos">Kilogramos</SelectItem>
                  <SelectItem value="Litros">Litros</SelectItem>
                  <SelectItem value="Paquetes">Paquetes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Podrás llenar cantidades y costos en la sección <span className="font-medium">&quot;Inventario&quot;</span>
              </p>
            </div>

            <div className="mt-auto pt-6">
              <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
                Agregar producto
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}