"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Grid2X2, Plus, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoriesDialog } from "@/components/CategoriesDialog"
import { ProductFormWrapper } from "@/components/ProductFormWrapper"
import { useProductForm } from "@/contexts/ProductFormContext"
import { AddProductPanel } from "@/components/AddProductPanel"
import { DownloadReportPanel } from "@/components/DownloadReportPanel"
import { ProductDetailPanel } from "@/components/ProductDetailPanel"
import { EditProductPanel } from "@/components/EditProductPanel"
import {SkeletonShimmer} from "@/components/ui/SkeletonShimmer";
import {Category} from "@/types/Category";
import {Product} from "@/types/Product";
import {useCategories} from "@/hooks/useCategories";
import {useProducts} from "@/hooks/useProducts";

interface ProductWithPrices extends Product {
  costPrice: number;
  sellingPrice: number;
}

export default function Inventario() {
  const [products, setProducts] = useState<ProductWithPrices[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCategories, setShowCategories] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showDownloadReport, setShowDownloadReport] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const { openProductForm } = useProductForm()
  const [mounted, setMounted] = useState(false)
  const {products: apiProducts, isLoading: isLoadingProducts} = useProducts();

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        // Asegúrate de usar sólo el array:
        const list = Array.isArray(data.products) ? data.products : []
        setProducts(list)
      })
      .catch(err => {
        console.error(err)
        setProducts([])
      })
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate total inventory cost
  const totalInventoryCost = products.reduce((sum, product) => sum + product.cost * product.stock, 0)

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(false)
    setShowEditProduct(true)
  }

  const handleDeleteProduct = (product: Product) => {
    // Implement delete functionality
    console.log("Delete product:", product)
    setShowProductDetail(false)
  }

  const handleSaveProduct = (product: Product) => {
    // Implement save functionality
    console.log("Save product:", product)
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
          <div className="relative">
            <Button
              variant="default"
              onClick={() => setShowAddProduct(true)}
              className="gap-2 bg-[#1e1e1e] hover:bg-[#2e2e2e] text-white"
            >
              <Plus className="h-4 w-4" />
              Agregar productos
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm bg-white">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[240px] bg-white">
            <SelectValue placeholder="Ver todas las categorías" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Ver todas las categorías</SelectItem>
            <SelectItem value="snacks">Snacks</SelectItem>
            <SelectItem value="abarrotes">Abarrotes</SelectItem>
            <SelectItem value="electronica">Electrónica</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" className="gap-2" onClick={() => setShowDownloadReport(true)}>
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
            <p className="text-2xl font-semibold text-green-600">
              Bs {mounted ? formatNumber(totalInventoryCost) : totalInventoryCost}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_200px_200px_200px_200px_160px] gap-4 p-4 border-b border-gray-200 bg-gray-50">
          <div className="font-medium text-gray-600">Producto</div>
          <div className="font-medium text-gray-600 text-right">Precio</div>
          <div className="font-medium text-gray-600 text-right">Costo</div>
          <div className="font-medium text-gray-600 text-right">Cantidad disponible</div>
          <div className="font-medium text-gray-600 text-right">Stock mínimo</div>
          <div className="font-medium text-gray-600 text-right">Ganancia</div>
        </div>

        <div className="divide-y">
          {filteredProducts.map((product, idx) => {
  const key = product.id != null ? String(product.id) : `no-id-${idx}`
  return (
    <tr key={key}>
      <td>{product.costPrice ?? "—"}</td>
      {/* …más celdas… */}
    </tr>
  )
})}
        </div>
      </div>

      {/* Sliding panels */}
      <CategoriesDialog open={showCategories} onOpenChange={setShowCategories} />
      <AddProductPanel open={showAddProduct} onOpenChange={setShowAddProduct} />
      <DownloadReportPanel open={showDownloadReport} onOpenChange={setShowDownloadReport} type="inventario" />
      <ProductDetailPanel
        open={showProductDetail}
        onOpenChange={setShowProductDetail}
        product={selectedProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
      <EditProductPanel
        open={showEditProduct}
        onOpenChange={setShowEditProduct}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
      <ProductFormWrapper />
    </div>
  )
}