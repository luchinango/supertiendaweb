"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { X, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type {Product} from "@/types/Product"

interface ProductDetailPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductDetailPanel({ open, onOpenChange, product, onEdit, onDelete }: ProductDetailPanelProps) {
  const [showInCatalog, setShowInCatalog] = useState(false)

  if (!product) return null

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
            <h2 className="text-xl font-semibold">Resumen del producto</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">t</span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white border shadow-sm"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <span>Cargar imagen</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="text-red-500">Eliminar imagen</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="text-lg font-medium mt-2">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.stock} Disponible</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-[24px_1fr_auto] items-center py-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-gray-500"
                >
                  <rect width="16" height="16" x="4" y="4" rx="1" />
                  <path d="M4 9h16" />
                  <path d="M9 4v16" />
                </svg>
                <span className="text-sm text-gray-600 ml-2">Código de barras</span>
                <span className="text-sm font-medium">{product.barcode || "PP-ACTIIPIMA -91"}</span>
              </div>

              <div className="grid grid-cols-[24px_1fr_auto] items-center py-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-gray-500"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm text-gray-600 ml-2">Precio</span>
                <span className="text-sm font-medium">Bs {product.price}</span>
              </div>

              <div className="grid grid-cols-[24px_1fr_auto] items-center py-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-gray-500"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm text-gray-600 ml-2">Costo</span>
                <span className="text-sm font-medium">Bs {product.cost}</span>
              </div>

              <div className="grid grid-cols-[24px_1fr_auto] items-center py-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-gray-500"
                >
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                <span className="text-sm text-gray-600 ml-2">Categoría</span>
                <span className="text-sm font-medium">{product.category.name || "Productos para cocina"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-center text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar producto
              </Button>

              <Button variant="outline" className="w-full justify-center" onClick={() => onEdit(product)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar producto
              </Button>
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mostrar producto en catálogo virtual</span>
                <Switch
                  checked={showInCatalog}
                  onCheckedChange={setShowInCatalog}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
