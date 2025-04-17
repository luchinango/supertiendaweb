"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

const categories = [
  "Todos",
  "Accesorios de Plástico para Cocina",
  "Accesorios para Cocina",
  "Accesorios para el Hogar",
  "Alcohol",
  "Alimentos Básicos",
  "Alimentos para Animales",
  "Ambientador en Spray",
  "Artículos para",
]

const products = [
  {
    id: 1,
    price: 14,
    name: "ACT II Pipoca Mantequilla 91g",
    stock: 6,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    price: 14,
    name: "ACT II Pipoca Mantequilla Extra 91g",
    stock: 7,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    price: 10,
    name: "Adayo Acondicionador de 500ml",
    stock: 3,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    price: 16,
    name: "Adayo Shampoo de 1L",
    stock: 7,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    price: 6,
    name: "Agua Para Vida 2lt",
    stock: 3,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 6,
    price: 7,
    name: "Agua Para Vida S/G 3lt",
    stock: 3,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 7,
    price: 7,
    name: "Aguai Azucar Blanca de 1kg",
    stock: 42,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 8,
    price: 32,
    name: "Aguai Azucar Blanca de 5kg",
    stock: 5,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 9,
    price: 2.5,
    name: "Ají Amarillo Dulce 20 gr.",
    stock: 6,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 10,
    price: 3,
    name: "Ají Rojo Dulce 20 gr.",
    stock: 10,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 11,
    price: 6,
    name: "Ajinomen Sopa instantanea en sached 80g",
    stock: 72,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 12,
    price: 9,
    name: "Ajinomen Sopa Instantanea en vaso de 51g",
    stock: 23,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 13,
    price: 6,
    name: "Ajinosillao 150ml",
    stock: 3,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 14,
    price: 2.5,
    name: "Ajo Molido 30 gr.",
    stock: 4,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 15,
    price: 35,
    name: "Alargador de 10m",
    stock: 1,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 16,
    price: 15,
    name: "Alargador de 3m",
    stock: 0,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 17,
    price: 20,
    name: "Alargador de 5m",
    stock: 0,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function VentasPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [cartItems, setCartItems] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)

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
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Buscar productos" className="pl-8 w-64" />
              </div>
              <Button variant="default" className="bg-gray-800 hover:bg-gray-700">
                Abrir caja
              </Button>
              <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                Nueva venta libre
              </Button>
              <Button variant="default" className="bg-red-500 hover:bg-red-600">
                Nuevo gasto
              </Button>
            </div>
          </div>

          {/* Categorías horizontales */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={category === selectedCategory ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Contenido principal con productos y carrito */}
        <div className="flex flex-1 overflow-hidden">
          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">Productos</div>
              <Button variant="outline">Vaciar canasta</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Crear</p>
                  <p>producto</p>
                </div>
              </div>

              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 h-64 flex flex-col">
                  <div className="flex justify-center mb-2">
                    <img
                      src={product.image || "/placeholder.svg"}
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
              ))}
            </div>
          </div>

          {/* Panel lateral derecho - Carrito */}
          <div className="w-80 border-l flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Productos</h3>
              <Button variant="ghost" size="sm">
                Vaciar canasta
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
              <div className="mb-4">
                <img src="/retail-checkout.png" alt="Barcode Scanner" className="h-32 w-32 object-contain" />
              </div>
              <h3 className="text-lg font-medium text-center">
                Agrega productos rápidamente usando tu lector de código de barras
              </h3>
              <p className="text-sm text-center text-gray-500 mt-2">
                Si no está en tu inventario, lo buscaremos en nuestra base de datos.
              </p>
            </div>

            {/* Botón de continuar */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Productos: {cartItems}</span>
                <span className="font-medium">Bs {cartTotal}</span>
              </div>
              <Button className="w-full" disabled={cartItems === 0}>
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}