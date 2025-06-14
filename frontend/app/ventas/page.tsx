"use client"

import {useState, useEffect} from "react"
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

export function useProducts(categoryId?: number) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let url = `/api/products?page=1&limit=17`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Asegúrate de que data.products exista y sea un arreglo
        setProducts(data.products || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [categoryId]);

  return { products, isLoading, error };
}

export default function VentasPage() {
  const { addItem } = useCart()
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const {products, isLoading: isLoadingProducts} = useProducts(selectedCategory?.id);
  const {categories, isLoading: isLoadingCategories, error, editCategory, mutate} = useCategories()
  // const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const {openProductForm} = useProductForm()

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

              {filteredProducts.map(product => {
                return (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 h-64 flex flex-col cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: Number(product.sellingPrice),
                        image: product.image || "/placeholder.png",
                        available: product.maxStock
                      })
                    }}
                  >
                    {/* Imagen y nombre */}
                    <img
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      className="mb-2 h-24 object-contain"
                    />
                    <p className="text-sm font-medium">{product.name}</p>

                    {/* Mostrar stock disponible */}
                    <div className="mt-auto text-sm text-gray-500">
                      {product.maxStock} disponibles
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