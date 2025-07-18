"use client"

import {useState, useMemo, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Search, Plus} from "lucide-react"
import {ProductFormWrapper} from "@/components/features/products/ProductFormWrapper"
import {useProductForm} from "@/contexts/ProductFormContext"
import {CashRegisterManager} from "@/components/features/cash-register/CashRegisterManager"
import {SalesFormManager} from "@/components/features/sales/SalesFormManager"
import {ExpenseFormManager} from "@/components/features/expenses/ExpenseFormManager"
import {ShoppingCart} from "@/components/features/sales/ShoppingCart"
import {useCart} from "@/contexts/CartContext"
import type {Category} from "@/types/Category"
import {useCategories} from "@/hooks/useCategories";
import {useCatalog} from "@/hooks/useCatalog";
import {SkeletonShimmer} from "@/components/ui/SkeletonShimmer";
import {useDebounce} from "@/hooks/useDebounce"
import {OptimizedImage} from "@/components/ui/optimized-image"

export default function VentasPage() {
  const { addItem } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const {openProductForm} = useProductForm()
  const {categories, isLoading: isLoadingCategories} = useCategories()

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const todosCategory = categories.find(cat => cat.id === 0);
      if (todosCategory) {
        setSelectedCategory(todosCategory);
      }
    }
  }, [categories, selectedCategory]);

  const catalogFilters = useMemo(() => {
    const baseFilters = {
      stockStatus: 'IN_STOCK' as const,
      isActive: true,
      limit: 50
    };

    if (!selectedCategory || selectedCategory.id === 0) {
      return baseFilters;
    }

    return {
      ...baseFilters,
      categoryId: selectedCategory.id
    };
  }, [selectedCategory]);

  const { products, isLoading: isLoadingProducts } = useCatalog(catalogFilters);

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) => product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [products, debouncedSearchTerm])

  return (
    <div className="flex h-full">
      {/* Área principal de contenido */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Encabezado con búsqueda y botones */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">Nueva venta</h1>
              {selectedCategory && (
                <p className="text-sm text-gray-600">
                  Categoría: <span className="font-medium">{selectedCategory.name}</span>
                  {selectedCategory.id === 0 && <span className="text-green-600"> (mostrando todos los productos)</span>}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
                <Input
                  type="search"
                  placeholder="Buscar productos"
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CashRegisterManager/>
              <SalesFormManager/>
              <ExpenseFormManager/>
            </div>
          </div>

          {/* Categorías horizontales */}
          {isLoadingCategories ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({length: 10}).map((_, i) => (
                <SkeletonShimmer key={i} className="h-9 w-24"/>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={category.name === selectedCategory?.name ? "default" : "outline"}
                  className={category.name === selectedCategory?.name ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

        </div>

        {/* Contenido principal con productos y carrito */}
        <div className="flex flex-1 overflow-hidden">
          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({length: 12}).map((_, i) => (
                  <SkeletonShimmer key={i} className="h-64 rounded-lg"/>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <div
                  className="border rounded-lg p-4 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50"
                  onClick={openProductForm}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6"/>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Crear</p>
                    <p>producto</p>
                  </div>
                </div>

              {filteredProducts.map(product => {
                return (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 h-64 flex flex-col cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: Number(product.effectivePrice),
                        image: "/placeholder.png", // Usar placeholder por defecto hasta que se agregue imagen
                        available: product.effectiveStock
                      })
                    }}
                  >
                    {/* Imagen y nombre */}
                    <OptimizedImage
                      src="/placeholder.png"
                      alt={product.name}
                      width={96}
                      height={96}
                      className="mb-2 h-24 object-contain"
                      fallbackSrc="/placeholder.png"
                    />
                    <p className="text-sm font-medium">{product.name}</p>

                    {/* Mostrar stock disponible */}
                    <div className="mt-auto text-sm text-gray-500">
                      {product.effectiveStock} disponibles
                    </div>
                  </div>
                )
              })}
              </div>
            )}
          </div>

          {/* Panel lateral derecho - Carrito */}
          <div className="w-80 border-l">
            <ShoppingCart/>
          </div>
        </div>
      </div>

      {/* Include the product form */}
      <ProductFormWrapper/>
    </div>
  )
}
