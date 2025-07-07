"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Grid2X2, Plus, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CategoriesDialog } from '@/components/features/products/CategoriesDialog'
import { ProductFormWrapper } from '@/components/features/products/ProductFormWrapper'
import { useProductForm } from "@/contexts/ProductFormContext"
import { AddProductPanel } from '@/components/features/products/AddProductPanel'
import { DownloadReportPanel } from '@/components/features/reports/DownloadReportPanel'
import { ProductDetailPanel } from "@/components/features/products/ProductDetailPanel"
import { EditProductPanel } from "@/components/features/products/EditProductPanel"
import type {Product} from "@/types/Product"
import {useCategories} from "@/hooks/useCategories";
import {useProductsPaginated} from "@/hooks/useProducts";

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showCategories, setShowCategories] = useState(false)
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showDownloadReport, setShowDownloadReport] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const { openProductForm } = useProductForm()
  const [mounted, setMounted] = useState(false)

  const {categories, isLoading: isLoadingCategories} = useCategories();

  const categoryId = selectedCategory === "all" ? undefined : parseInt(selectedCategory)
  const {products, pagination, isLoading: isLoadingProducts} = useProductsPaginated({
    page: currentPage,
    limit: itemsPerPage,
    categoryId,
    search: debouncedSearchTerm || undefined,
    enabled: true
  });

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, debouncedSearchTerm])

  useEffect(() => {
    if (pagination?.limit && pagination.limit !== itemsPerPage) {
      setItemsPerPage(pagination.limit)
    }
  }, [pagination?.limit, itemsPerPage])

  useEffect(() => {
    if (pagination?.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page)
    }
  }, [pagination?.page, currentPage])

  const totalInventoryCost = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.cost || 0) * product.stock, 0)
  }, [products])

  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return "Ver todas las categorías"
    return categories.find(category => category.id.toString() === selectedCategory)?.name || "Seleccionar categoría"
  }, [selectedCategory, categories])

  const formatNumber = useCallback((num: number) => {
    return num.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [])

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }, [])

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(false)
    setShowEditProduct(true)
  }, [])

  const handleDeleteProduct = useCallback((product: Product) => {
    console.log("Delete product:", product)
    setShowProductDetail(false)
  }, [])

  const handleSaveProduct = useCallback((product: Product) => {
    console.log("Save product:", product)
  }, [])

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    setOpenCategoryPopover(false)
  }, [])

  const getCategoryName = useCallback((categoryId: number | undefined) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Sin categoría'
  }, [categories])

  const handlePageChange = useCallback((page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
    }
  }, [pagination])

  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
  }, [])

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
        <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategoryPopover}
              className="w-[240px] justify-between bg-white"
            >
              {selectedCategoryName}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0 bg-white">
            <Command key={openCategoryPopover ? 'open' : 'closed'}>
              <CommandInput placeholder="Buscar categoría..." />
              <CommandList>
                <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => handleCategorySelect("all")}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedCategory === "all" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    Ver todas las categorías
                  </CommandItem>
                  {isLoadingCategories ? (
                    <CommandItem disabled>Cargando categorías...</CommandItem>
                  ) : (
                    categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => handleCategorySelect(category.id.toString())}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedCategory === category.id.toString() ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {category.name}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
            <p className="text-sm text-gray-600">Total de productos</p>
            <p className="text-2xl font-semibold">{pagination?.total || 0}</p>
            {pagination?.totalPages && pagination.totalPages > 1 && (
              <p className="text-xs text-gray-500">{pagination.totalPages} páginas</p>
            )}
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
          {isLoadingProducts ? (
            <div className="p-8 text-center text-gray-500">
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No se encontraron productos con esa búsqueda' : 'No hay productos en esta categoría'}
            </div>
          ) : (
            products.map((product, idx) => {
              const key = product.id != null ? String(product.id) : `no-id-${idx}`
              const profit = (product.price || 0) - (product.cost || 0)
              const profitPercentage = product.cost ? ((profit / product.cost) * 100) : 0

              return (
                <div key={key} className="grid grid-cols-[1fr_200px_200px_200px_200px_160px] gap-4 p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleProductClick(product)}>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {getCategoryName(product.category_id)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Bs {formatNumber(product.price || 0)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Bs {formatNumber(product.cost || 0)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${product.stock <= (product.min_stock || 0) ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{product.min_stock || 0}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="relative flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            {isLoadingProducts && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-sm text-gray-500">Cargando...</div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
              </span>
              {pagination.totalPages > 1 && (
                <span className="text-gray-400">
                  • Página {pagination.page} de {pagination.totalPages} páginas
                </span>
              )}
            </div>

                        <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

                            <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = pagination.totalPages;
                  const currentPage = pagination.page;
                  const maxVisible = 7;

                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  const pages = [];

                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push('...');
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push('...');
                    }
                    pages.push(totalPages);
                  }

                  return pages.map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum as number)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  ));
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={pagination?.limit || itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
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
