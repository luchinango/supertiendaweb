'use client'

import { useState, useEffect } from 'react'
import { api } from '@lib/api'

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        const data = await api.getProducts()
        setProducts(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (isLoading) return <div>Cargando productos...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
