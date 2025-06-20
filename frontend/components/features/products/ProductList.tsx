'use client'

import { useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import React from 'react'
import type { Product } from '@/types/Product'

interface ProductItemProps {
  product: Product
}

const ProductItem = React.memo(({ product }: ProductItemProps) => (
  <li className="p-2 border-b hover:bg-gray-50" role="listitem">
    <div className="flex items-center justify-between">
      <span className="font-medium">{product.name}</span>
      <span className="text-sm text-gray-500">Bs {product.price}</span>
    </div>
  </li>
))

ProductItem.displayName = 'ProductItem'

const LoadingState = React.memo(() => (
  <div className="p-4 text-center text-gray-500" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" aria-hidden="true"></div>
    Cargando productos...
  </div>
))

LoadingState.displayName = 'LoadingState'

const ErrorState = React.memo(({ error }: { error: string }) => (
  <div className="p-4 text-center text-red-500" role="alert" aria-live="assertive">
    <div className="mb-2" aria-hidden="true">⚠️</div>
    Error: {error}
  </div>
))

ErrorState.displayName = 'ErrorState'

export function ProductList() {
  const { products, isLoading, error } = useProducts()

  const productList = useMemo(() => {
    if (isLoading) return <LoadingState />
    if (error) return <ErrorState error={error.message || 'Error desconocido'} />

    return (
      <ul className="divide-y" role="list" aria-label="Lista de productos">
        {products.map(product => (
          <ProductItem key={product.id} product={product} />
        ))}
      </ul>
    )
  }, [products, isLoading, error])

  return (
    <section className="bg-white rounded-lg shadow" aria-labelledby="productos-titulo">
      <header className="p-4 border-b">
        <h2 id="productos-titulo" className="text-xl font-semibold">Productos</h2>
        <p className="text-sm text-gray-500" aria-live="polite">
          {products.length} productos disponibles
        </p>
      </header>
      <div className="max-h-96 overflow-y-auto">
        {productList}
      </div>
    </section>
  )
}
