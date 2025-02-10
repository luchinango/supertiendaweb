"use client"

import { useState } from "react"
import { Button } from "app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "app/components/ui/dialog"
import { Input } from 'app/components/ui/input'; // changed from '@/components/ui/input'
import { Label } from 'app/components/ui/label'; // changed from '@/components/ui/label'
import { Pencil, Plus, ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  count: number
}

const initialCategories: Category[] = [
  { id: "accesorios-plastico", name: "Accesorios De Plastico Para Cocina", count: 45 },
  { id: "accesorios-cocina", name: "Accesorios Para Cocina", count: 32 },
  { id: "accesorios-hogar", name: "Accesorios Para El Hogar", count: 28 },
  { id: "alcohol", name: "Alcohol", count: 12 },
  { id: "alimentos-basicos", name: "Alimentos Basicos", count: 67 },
  { id: "alimentos-animales", name: "Alimentos Para Animales", count: 23 },
  { id: "ambientador", name: "Ambientador En Spray", count: 8 },
  { id: "articulos-hogar", name: "Articulos Para El Hogar", count: 54 },
]

interface CategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesDialog({ open, onOpenChange }: CategoriesDialogProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Categorías</DialogTitle>
          <DialogDescription>Gestione las categorías de productos de su inventario.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {showNewCategory ? (
            <div className="space-y-4">
              <Label htmlFor="category-name">Nombre de la categoría</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                placeholder="Escribe el nombre de la categoría"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewCategory(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Add new category logic here
                    setShowNewCategory(false)
                    setNewCategoryName("")
                  }}
                >
                  Crear categoría
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowNewCategory(true)}>
              <Plus className="h-4 w-4" />
              Crear Nueva Categoría
            </Button>
          )}

          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <Pencil className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({category.count})</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

