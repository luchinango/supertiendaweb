"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Search, Plus} from "lucide-react"
import {ProductFormWrapper} from "@/components/ProductFormWrapper"
import {useProductForm} from "@/contexts/ProductFormContext"
import {CashRegisterManager} from "@/components/CashRegisterManager"
import {SalesFormManager} from "@/components/SalesFormManager"
import {ExpenseFormManager} from "@/components/ExpenseFormManager"
import {ShoppingCart} from "@/components/ShoppingCart"
import {useCart} from "@/contexts/CartContext"
import {Category} from "@/types/Category";
import {useCategories} from "@/hooks/useCategories";
import {SkeletonShimmer} from "@/components/ui/SkeletonShimmer";
import {useProducts} from "@/hooks/useProducts";

export default function VentasPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const {products, isLoading: isLoadingProducts} = useProducts(selectedCategory?.id);
  const {categories, isLoading: isLoadingCategories, error, editCategory, mutate} = useCategories()
  // const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const {openProductForm} = useProductForm()
  const {addItem, items} = useCart()

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full">
      {/* Área principal de contenido */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Encabezado con búsqueda y botones */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Nueva venta</h1>
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

              {filteredProducts.map((product) => {
                const inCart = items.find((item) => item.id === product.id)
                return (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 h-64 flex flex-col cursor-pointer hover:bg-gray-50 relative"
                    /*onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        available: product.stock,
                      })
                    }*/
                  >
                    {inCart && (
                      <div
                        className="absolute top-2 right-2 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {inCart.quantity}
                      </div>
                    )}
                    <div className="flex justify-center mb-2">
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                    <div className="mt-auto">
                      <p className="font-bold text-center mb-1">Bs {product.price}</p>
                      <p className="text-sm text-center mb-2">{product.name}</p>
                      <p className="text-xs text-center text-gray-500">
                        {product.stock === 0 ? (
                          <span className="text-red-500">{product.stock} disponibles</span>
                        ) : (
                          `${product.stock} disponibles`
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
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