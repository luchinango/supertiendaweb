'use client'

import { useState } from 'react'
import { api } from '@lib/api'

export default function ProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createProduct({ name, price: parseFloat(price) })
      setName('')
      setPrice('')
      // Puedes refrescar la lista de productos o mostrar un mensaje de éxito
    } catch (error) {
      console.error('Failed to create product:', error)
      // Mostrar mensaje de error al usuario
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre del producto"
        required
      />
      <input
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
        placeholder="Precio"
        required
      />
      <button type="submit">Agregar Producto</button>
    </form>
  )
}
