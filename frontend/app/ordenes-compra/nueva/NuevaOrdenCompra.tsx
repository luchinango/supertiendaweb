"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSafeSearchParams } from "@/hooks/useSafeSearchParams"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number
  stockMinimo: number
  categoria: string
}

interface OrderItem {
  productId: number
  quantity: number
}

const sampleProducts: Product[] = [
  { id: 1, nombre: "Manzanas", precio: 2.5, stock: 100, stockMinimo: 50, categoria: "Frutas" },
  { id: 2, nombre: "Leche", precio: 3, stock: 10, stockMinimo: 20, categoria: "Lácteos" },
  { id: 3, nombre: "Pan", precio: 1.5, stock: 5, stockMinimo: 15, categoria: "Panadería" },
  { id: 4, nombre: "Queso", precio: 5, stock: 30, stockMinimo: 10, categoria: "Lácteos" },
  { id: 5, nombre: "Yogurt", precio: 2, stock: 40, stockMinimo: 25, categoria: "Lácteos" },
]

export default function NuevaOrdenCompra() {
  const router = useRouter()
  const { searchParams, isClient } = useSafeSearchParams()
  const [proveedor, setProveedor] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [quantity, setQuantity] = useState("")

  useEffect(() => {
    if (isClient && searchParams) {
      const productId = searchParams.get("productId")
      if (productId) {
        const product = sampleProducts.find((p) => p.id === Number.parseInt(productId))
        if (product) {
          setItems([{ productId: product.id, quantity: product.stockMinimo - product.stock }])
        }
      }
    }
  }, [searchParams, isClient])

  const addItem = () => {
    if (selectedProduct && quantity) {
      setItems([...items, { productId: selectedProduct, quantity: Number.parseInt(quantity) }])
      setSelectedProduct(null)
      setQuantity("")
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar la orden de compra
    console.log("Orden de compra creada:", { proveedor, items })
    router.push("/ordenes-compra")
  }

  const total = items.reduce((sum, item) => {
    const product = sampleProducts.find((p) => p.id === item.productId)
    return sum + (product ? product.precio * item.quantity : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva Orden de Compra</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="proveedor">Proveedor</Label>
          <Input id="proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="producto">Producto</Label>
            <Select
              value={selectedProduct?.toString() || ""}
              onValueChange={(value) => setSelectedProduct(Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {sampleProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input id="cantidad" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addItem}>
              Agregar
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unitario</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const product = sampleProducts.find((p) => p.id === item.productId)
              return (
                <TableRow key={index}>
                  <TableCell>{product?.nombre}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>Bs {product?.precio.toFixed(2)}</TableCell>
                  <TableCell>Bs {(product ? product.precio * item.quantity : 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => removeItem(index)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="text-right">
          <p className="text-lg font-semibold">Total: Bs {total.toFixed(2)}</p>
        </div>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/ordenes-compra")}>
            Cancelar
          </Button>
          <Button type="submit">Crear Orden de Compra</Button>
        </div>
      </form>
    </div>
  )
}