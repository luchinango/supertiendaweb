"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ChevronRight, Pencil, X } from "lucide-react"
import { useState } from "react"
import { useCategories } from "@/hooks/useCategories"

interface CategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesDialog({ open, onOpenChange }: CategoriesDialogProps) {
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const {categories, error, isLoading} = useCategories()

  if (isLoading) {
    return <div className="p-4">Loading categories...</div>
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
            <h2 className="text-xl font-semibold">Categorías</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-dashed border-2"
                onClick={() => setShowNewCategory(true)}
              >
                <Plus className="h-5 w-5" />
                Crear Nueva Categoría
              </Button>

              {showNewCategory && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nombre de la categoría"
                    className="w-full"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewCategory(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        /*
                        if (newCategoryName.trim()) {
                          setCategories([
                            ...categories,
                            {
                              id: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
                              name: newCategoryName,
                              count: 0,
                            },
                          ])
                          setNewCategoryName("")
                          setShowNewCategory(false)
                        }
                        */
                      }}
                    >
                      Crear categoría
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1 mt-4">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 group cursor-pointer"
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
          </div>
        </div>
      </div>
    </div>
  )
}
