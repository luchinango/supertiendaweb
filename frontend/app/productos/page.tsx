"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Grid2X2, Plus } from "lucide-react"
import { CategoriesDialog } from '@/components/features/products/CategoriesDialog'
import { ProductFormWrapper } from '@/components/features/products/ProductFormWrapper'
import { useProductForm } from "@/contexts/ProductFormContext"
import { useDebounce } from "@/hooks/useDebounce"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number
  categoria: string
  imagen: string
}

const productosFicticios: Product[] = [
  {
    id: 1,
    nombre: "ACT II Pipoca Man-tequilla 91g",
    precio: 14,
    stock: 7,
    categoria: "Snacks",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
  },
  {
    id: 2,
    nombre: "ACT II Pipoca Man-tequilla Extra 91g",
    precio: 14,
    stock: 8,
    categoria: "Snacks",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
  },
  {
    id: 3,
    nombre: "Aguai Azucar Blanca de 1kg",
    precio: 7,
    stock: 24,
    categoria: "Abarrotes",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
  },
  {
    id: 4,
    nombre: "Aguai Azucar Blanca de 5kg",
    precio: 31,
    stock: 3,
    categoria: "Abarrotes",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3Z72FIBg9b29fubQ6UHbceF9yUJJ3y.png",
  },
  // Add more sample products as needed
]

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCategories, setShowCategories] = useState(false)
  const { openProductForm } = useProductForm()

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredProducts = useMemo(() => {
    return productosFicticios.filter((product) =>
      product.nombre.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    )
  }, [debouncedSearchTerm])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[#1e1e1e]">Inventario</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowCategories(true)} className="gap-2">
            <Grid2X2 className="h-4 w-4" />
            Categorías
          </Button>
          <Button variant="default" onClick={openProductForm} className="gap-2 bg-[#1e1e1e] hover:bg-[#2e2e2e]">
            <Plus className="h-4 w-4" />
            Agregar productos
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-[360px]">
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
            <p className="text-2xl font-semibold">1244</p>
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
            <p className="text-2xl font-semibold text-green-600">Bs 63.804,77</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square relative bg-gray-50">
                <OptimizedImage
                  src={product.imagen || "/placeholder.png"}
                  alt={product.nombre}
                  width={200}
                  height={200}
                  className="absolute inset-0 w-full h-full object-contain p-4"
                  fallbackSrc="/placeholder.png"
                />
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.nombre}</h3>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Bs {product.precio}</p>
                  <p className="text-sm text-gray-500">
                    {product.stock === 0 ? (
                      <span className="text-red-500">{product.stock} disponibles</span>
                    ) : (
                      `${product.stock} disponibles`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div
          className="border rounded-lg p-4 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50"
          onClick={openProductForm}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-medium">Crear</p>
            <p>producto</p>
          </div>
        </div>
      </div>

      <CategoriesDialog open={showCategories} onOpenChange={setShowCategories} />
      <ProductFormWrapper />
    </div>
  )
}
