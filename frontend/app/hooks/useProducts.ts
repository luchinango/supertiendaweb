"use client"
import { useState, useEffect } from "react"

export default function useProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        // data.products puede ser undefined o un objeto
        const list = Array.isArray(data.products) ? data.products : []
        setProducts(list)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  return { products, isLoading, error }
}