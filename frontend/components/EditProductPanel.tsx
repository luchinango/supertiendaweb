"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { X, ArrowLeft, Minus, Plus, Search, Pencil } from "lucide-react"
import {Product} from "@/types/Product";
import {Category} from "@/types/Category";
import {useCategories} from "@/hooks/useCategories";
import {SkeletonShimmer} from "@/components/ui/SkeletonShimmer";

interface EditProductPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product) => void
}


export function EditProductPanel({ open, onOpenChange, product, onSave }: EditProductPanelProps) {
  const {categories, isLoading: isLoadingCategories, error, editCategory, mutate} = useCategories()
  if (!product) return null // <-- Soluciona el error

  const [editedProduct, setEditedProduct] = useState<Product | null>(null)
  const [useUnits, setUseUnits] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    if (product) {
      setEditedProduct({ ...product })
    }
  }, [product])

  if (!editedProduct) return null

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setEditedProduct({
        ...editedProduct,
        stock: editedProduct.stock + 1,
      })
    } else if (type === "decrease" && editedProduct.stock > 0) {
      setEditedProduct({
        ...editedProduct,
        stock: editedProduct.stock - 1,
      })
    }
  }

  const handleSave = () => {
    onSave(editedProduct)
    onOpenChange(false)
  }

  const filteredCategories = categories.filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">Editar producto</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              {/* Image */}
              {product.image && (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white border shadow-sm"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-sm font-medium">
                  Nombre del producto*
                </Label>
                <p className="text-xs text-gray-500">Recuerda, este debe ser único en tu inventario</p>
                <Input
                  id="product-name"
                  value={editedProduct.name}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-sm font-medium">
                  Código de barras
                </Label>
                <p className="text-xs text-gray-500">Escríbelo o escanéalo</p>
                <Input
                  id="barcode"
                  value={editedProduct.barcode || "PP-ACTIIPIMA -91"}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      barcode: e.target.value,
                    })
                  }
                />
              </div>

              {/* Units Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-units"
                  checked={useUnits}
                  onCheckedChange={(checked) => setUseUnits(checked as boolean)}
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
                    value={editedProduct.stock.toString()}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0
                      setEditedProduct({
                        ...editedProduct,
                        stock: value,
                      })
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
                    value={editedProduct.cost.toString()}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0
                      setEditedProduct({
                        ...editedProduct,
                        cost: value,
                      })
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
                    value={editedProduct.price.toString()}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0
                      setEditedProduct({
                        ...editedProduct,
                        price: value,
                      })
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
                <div className="relative">
                  <div
                    className="border rounded-md p-3 flex justify-between items-center cursor-pointer"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span>{editedProduct.category.name || "Productos para cocina"}</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform ${showCategoryDropdown ? "transform rotate-180" : ""}`}
                    >
                      <path
                        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>

                  {showCategoryDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-8"
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                              onClick={() => setSearchTerm("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {filteredCategories.map((category) => (
                          <div
                            key={category.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setEditedProduct({
                                ...editedProduct,
                                category: category,
                              })
                              setShowCategoryDropdown(false)
                            }}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>

                      <div className="p-2 border-t">
                        <Button variant="ghost" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear una nueva categoría
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea id="description" placeholder="Agrega una descripción" rows={4} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <Button className="w-full bg-gray-900 hover:bg-gray-800" onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}