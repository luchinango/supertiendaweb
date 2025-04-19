"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Grid2X2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoriesDialog } from "../components/CategoriesDialog"
import { AddProductDialog } from "../components/AddProductDialog"

interface Product {
  id: number
  nombre: string
  precio: number
  costo: number
  stock: number
  categoria: string
  imagen: string
  ganancia: number
  gananciaPercent: number
}

const productosFicticios: Product[] = [
  {
    id: 1,
    nombre: "ACT II Pipoca Mantequilla 91g",
    precio: 14,
    costo: 12.6,
    stock: 6,
    categoria: "Snacks",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 1.4,
    gananciaPercent: 10,
  },
  {
    id: 2,
    nombre: "ACT II Pipoca Mantequilla Extra 91g",
    precio: 14,
    costo: 12.6,
    stock: 7,
    categoria: "Snacks",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 1.4,
    gananciaPercent: 10,
  },
  {
    id: 3,
    nombre: "Adayo Acondicionador de 500ml",
    precio: 10,
    costo: 7.5,
    stock: 2,
    categoria: "Cuidado Personal",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 2.5,
    gananciaPercent: 25,
  },
  {
    id: 4,
    nombre: "Adayo Shampoo de 1l",
    precio: 16,
    costo: 13.5,
    stock: 7,
    categoria: "Cuidado Personal",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 2.5,
    gananciaPercent: 16,
  },
  {
    id: 5,
    nombre: "Agua Para Vida 2lt",
    precio: 6,
    costo: 4.5,
    stock: 3,
    categoria: "Bebidas",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 1.5,
    gananciaPercent: 25,
  },
  {
    id: 6,
    nombre: "Agua Para Vida S/G 3lt",
    precio: 7,
    costo: 6,
    stock: 3,
    categoria: "Bebidas",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 1,
    gananciaPercent: 14,
  },
  {
    id: 7,
    nombre: "Aguai Azucar Blanca de 1kg",
    precio: 7,
    costo: 5.87,
    stock: 42,
    categoria: "Abarrotes",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 1.13,
    gananciaPercent: 16,
  },
  {
    id: 8,
    nombre: "Aguai Azucar Blanca de 5kg",
    precio: 32,
    costo: 28.5,
    stock: 5,
    categoria: "Abarrotes",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 3.5,
    gananciaPercent: 11,
  },
  {
    id: 9,
    nombre: "Ají Amarillo Dulce 20 gr.",
    precio: 2.5,
    costo: 2,
    stock: 6,
    categoria: "Condimentos",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 0.5,
    gananciaPercent: 20,
  },
  {
    id: 10,
    nombre: "Ají Rojo Dulce 20 gr.",
    precio: 3,
    costo: 2.2,
    stock: 10,
    categoria: "Condimentos",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 0.8,
    gananciaPercent: 27,
  },
  {
    id: 11,
    nombre: "Ajinomen Sopa instantanea en sached 80g",
    precio: 6,
    costo: 5.04,
    stock: 72,
    categoria: "Abarrotes",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
    ganancia: 0.96,
    gananciaPercent: 16,
  },
]

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCategories, setShowCategories] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)

  const filteredProducts = productosFicticios.filter((product) =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate total inventory cost
  const totalInventoryCost = productosFicticios.reduce((sum, product) => sum + product.costo * product.stock, 0)

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Inventario</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowCategories(true)} className="gap-2">
            <Grid2X2 className="h-4 w-4" />
            Categorías
          </Button>
          <Button
            variant="default"
            onClick={() => setShowAddProduct(true)}
            className="gap-2 bg-[#1e1e1e] hover:bg-[#2e2e2e]"
          >
            Agregar productos
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Ver todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ver todas las categorías</SelectItem>
            <SelectItem value="snacks">Snacks</SelectItem>
            <SelectItem value="abarrotes">Abarrotes</SelectItem>
            <SelectItem value="electronica">Electrónica</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Descargar reporte
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
          <div className="p-3 bg-gray-100 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-500">
              <path
                d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de referencias</p>
            <p className="text-2xl font-semibold">1477</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
          <div className="p-3 bg-green-50 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path
                d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Costo total de inventario</p>
            <p className="text-2xl font-semibold text-green-600">Bs {formatNumber(totalInventoryCost)}</p>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_200px_200px_200px_200px] gap-4 p-4 border-b border-gray-200 bg-gray-50">
          <div className="font-medium text-gray-600">Producto</div>
          <div className="font-medium text-gray-600 text-right">Precio</div>
          <div className="font-medium text-gray-600 text-right">Costo</div>
          <div className="font-medium text-gray-600 text-right">Cantidad disponible</div>
          <div className="font-medium text-gray-600 text-right">Ganancia</div>
        </div>

        <div className="divide-y">
          {filteredProducts.map((product) => (
            <div key={product.id} className="grid grid-cols-[1fr_200px_200px_200px_200px] gap-4 p-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <span className="text-xs text-gray-500">P</span>
                </div>
                <span>{product.nombre}</span>
              </div>
              <div className="text-right">
                <Input value={`Bs. ${product.precio}`} className="text-right" readOnly />
              </div>
              <div className="text-right">
                <Input value={`Bs. ${product.costo}`} className="text-right" readOnly />
              </div>
              <div className="text-right">
                <Input value={product.stock.toString()} className="text-right" readOnly />
              </div>
              <div className="text-right flex items-center justify-end">
                <span className="mr-2">Bs {product.ganancia}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.gananciaPercent >= 25
                      ? "bg-green-100 text-green-800"
                      : product.gananciaPercent >= 15
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.gananciaPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CategoriesDialog open={showCategories} onOpenChange={setShowCategories} />
      <AddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} />
    </div>
  )
}
