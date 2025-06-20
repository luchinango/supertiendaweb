"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Minus, Plus, Barcode } from "lucide-react"

interface AddProductPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProductPanel({ open, onOpenChange }: AddProductPanelProps) {
  const [name, setName] = useState("")
  const [barcode, setBarcode] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [cost, setCost] = useState("")
  const [quantity, setQuantity] = useState("0")
  const [category, setCategory] = useState("")
  const [useUnits, setUseUnits] = useState(false)
  const [image, setImage] = useState<File | null>(null)

  const handleQuantityChange = (type: "increase" | "decrease") => {
    const current = Number.parseInt(quantity) || 0
    if (type === "increase") {
      setQuantity((current + 1).toString())
    } else if (type === "decrease" && current > 0) {
      setQuantity((current - 1).toString())
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-modal={open}
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/15 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold">Agregar producto</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-blue-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-blue-200 mb-2">
                  {image ? (
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.png"}
                      alt="Product preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-blue-500 mb-2" />
                      <span className="text-blue-500 text-sm font-medium">Cargar imagen</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  Te recomendamos que la imagen tenga un tamaño de 500 × 500 px en formato PNG y pese máximo 2MB.
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setImage(file)
                  }}
                />
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-sm font-medium">
                  Nombre del producto*
                </Label>
                <p className="text-xs text-gray-500">Recuerda, este debe ser único en tu inventario</p>
                <Input
                  id="product-name"
                  placeholder="Escribe el nombre del producto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-sm font-medium">
                  Código de barras
                </Label>
                <p className="text-xs text-gray-500">Escríbelo o escanéalo</p>
                <div className="relative">
                  <Input
                    id="barcode"
                    placeholder="0000000000000"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400"
                  >
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Units Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use-units"
                  checked={useUnits}
                  onChange={(e) => setUseUnits(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="use-units" className="text-sm">
                  Agregar unidades de medida a este producto (Kilos, gramos, litros, etc)
                </Label>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Cantidad disponible*
                </Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={() => handleQuantityChange("decrease")}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="text"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setQuantity(value)
                    }}
                    className="h-10 rounded-none text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={() => handleQuantityChange("increase")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-sm font-medium">
                  Costo unitario
                </Label>
                <p className="text-xs text-gray-500">Valor que pagas al proveedor por el producto</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Bs</span>
                  <Input
                    id="cost"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={cost}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "")
                      setCost(value)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio*
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Bs</span>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "")
                      setPrice(value)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Categoría
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accesorios-plastico">Accesorios De Plastico Para Cocina</SelectItem>
                    <SelectItem value="accesorios-cocina">Accesorios Para Cocina</SelectItem>
                    <SelectItem value="accesorios-hogar">Accesorios Para El Hogar</SelectItem>
                    <SelectItem value="alcohol">Alcohol</SelectItem>
                    <SelectItem value="alimentos-basicos">Alimentos Basicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  placeholder="Agrega una descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Crear producto
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}