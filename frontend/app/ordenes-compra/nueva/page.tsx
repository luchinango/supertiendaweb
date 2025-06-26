"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Save, Package, Plus, Trash2, Barcode } from "lucide-react"

export default function NuevaOrdenCompra() {
  const [suppliers, setSuppliers] = useState<{ id: number, name: string }[]>([])
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"pendiente" | "aprobada" | "recibida">("pendiente")
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("manual")
  const [paymentMethod, setPaymentMethod] = useState("contado")
  const [barcode, setBarcode] = useState("")
  const [products, setProducts] = useState<{ id: number, name: string, price: number, quantity: number }[]>([])
  const [allProducts, setAllProducts] = useState<{ id: number, name: string, price: number }[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const router = useRouter()

  // Cargar productos disponibles
  useEffect(() => {
    fetch("/api/products?page=1&limit=100", {
      headers: {
        Authorization: "Bearer TU_TOKEN_AQUI",
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
  }, [])

  useEffect(() => {
    fetch("/api/suppliers?page=1&limit=100", {
      headers: {
        Authorization: "Bearer TU_TOKEN_AQUI", // reemplaza por tu token real
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setSuppliers(data.suppliers || []))
  }, [])

  // Buscar producto por código de barras
  const handleBarcodeSearch = () => {
    if (!barcode) return
    const prod = allProducts.find(p => p.id === Number(barcode) || p.name.toLowerCase().includes(barcode.toLowerCase()))
    if (prod) {
      if (!products.some(p => p.id === prod.id)) {
        setProducts([...products, { ...prod, quantity: 1 }])
      }
      setBarcode("")
    } else {
      alert("Producto no encontrado")
    }
  }

  const handleAddProduct = () => {
    if (!selectedProductId) return
    const prod = allProducts.find(p => p.id === selectedProductId)
    if (!prod) return
    if (products.some(p => p.id === prod.id)) return
    setProducts([...products, { ...prod, quantity: selectedQuantity }])
    setSelectedProductId(null)
    setSelectedQuantity(1)
  }

  const handleRemoveProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleChangeQuantity = (id: number, quantity: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, quantity } : p))
  }

  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
  const totalBs = products.reduce((sum, p) => sum + p.quantity * p.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) {
      alert("Selecciona un proveedor")
      return
    }
    if (products.length === 0) {
      alert("Agrega al menos un producto")
      return
    }
    setLoading(true)
    const body = {
      businessId: 1,
      supplierId,
      poNumber: "",
      status: status === "pendiente" ? "DRAFT" : status.toUpperCase(),
      orderDate: new Date().toISOString(),
      expectedDate: new Date().toISOString(),
      receivedDate: null,
      notes,
      type,
      paymentMethod,
      products: products.map(p => ({
        productId: p.id,
        quantity: p.quantity,
        price: p.price
      }))
    }
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer TU_TOKEN_AQUI",
      },
      body: JSON.stringify(body)
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      alert("Orden creada con ID: " + data.id)
      router.push("/ordenes-compra")
    } else {
      alert("Error al crear la orden")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={() => router.push("/ordenes-compra")} />
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Nueva Orden de Compra</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.push("/ordenes-compra")} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Proveedor</label>
                <Select value={supplierId ? String(supplierId) : ""} onValueChange={v => setSupplierId(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Estado</label>
                <Select value={status} onValueChange={v => setStatus(v as any)} disabled={status === "aprobada" || status === "recibida"}>
                  <SelectTrigger>
                    <SelectValue>
                      <Badge
                        variant={
                          status === "pendiente"
                            ? "outline"
                            : status === "aprobada"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {status === "pendiente"
                          ? "Pendiente"
                          : status === "aprobada"
                            ? "Aprobada"
                            : "Recibida"}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="recibida">Recibida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Tipo y Forma de Pago */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Tipo</label>
                <Select value={type} onValueChange={v => setType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    {/* Puedes agregar más tipos si tu negocio lo requiere */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Forma de Pago</label>
                <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Forma de Pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    {/* Puedes agregar más formas de pago */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Escanear código de barras */}
            <div>
              <label className="block mb-1 font-medium">Escanear código de barras</label>
              <div className="flex gap-2">
                <Input
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  placeholder="Escanear o ingresar código..."
                  onKeyDown={e => e.key === "Enter" && handleBarcodeSearch()}
                />
                <Button type="button" onClick={handleBarcodeSearch} variant="outline">
                  <Barcode className="h-4 w-4" /> Buscar
                </Button>
              </div>
            </div>
            {/* Productos */}
            <div>
              <label className="block mb-1 font-medium">Productos</label>
              <div className="flex gap-2 mb-2">
                <Select value={selectedProductId ? String(selectedProductId) : ""} onValueChange={v => setSelectedProductId(Number(v))}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Selecciona producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={selectedQuantity}
                  onChange={e => setSelectedQuantity(Number(e.target.value))}
                  className="w-24"
                  placeholder="Cantidad"
                />
                <Button type="button" onClick={handleAddProduct} variant="outline" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Agregar
                </Button>
              </div>
              <div className="border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-left">Precio Unitario</th>
                      <th className="p-2 text-left">Cantidad</th>
                      <th className="p-2 text-left">Subtotal</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">Bs {p.price.toFixed(2)}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={1}
                            value={p.quantity}
                            onChange={e => handleChangeQuantity(p.id, Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-2">Bs {(p.price * p.quantity).toFixed(2)}</td>
                        <td className="p-2">
                          <Button type="button" variant="ghost" onClick={() => handleRemoveProduct(p.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-gray-400">No hay productos agregados</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between mt-2">
                <div>Total cantidad: <b>{totalQuantity}</b></div>
                <div>Total Bs: <b>Bs {totalBs.toFixed(2)}</b></div>
              </div>
            </div>
            {/* Notas */}
            <div>
              <label className="block mb-1 font-medium">Notas</label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas de la orden" />
            </div>
            <div className="flex-1" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.push("/ordenes-compra")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || status !== "pendiente"}>
                {loading ? "Creando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
