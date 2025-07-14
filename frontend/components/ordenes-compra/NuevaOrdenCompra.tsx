"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Save, Package, Plus, Trash2, Barcode, Minus } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useSuppliers } from "@/hooks/useSuppliers"
import { useProducts } from "@/hooks/useProducts"

type ProductWithPrice = {
  id: number;
  name: string;
  barcode?: string;
  costPrice?: number;
  sellingPrice?: number;
  price?: number;
};

export default function NuevaOrdenCompra({ onClose }: { onClose: () => void }) {
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers()
  const { products: allProducts, isLoading, searchProducts } = useProducts();
  const [supplierSearch, setSupplierSearch] = useState("")
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [supplierName, setSupplierName] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"pendiente" | "aprobada" | "recibida">("pendiente")
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("manual")
  const [paymentMethod, setPaymentMethod] = useState("contado")
  const [barcode, setBarcode] = useState("")
  const [products, setProducts] = useState<{ id: number, name: string, price: number, quantity: number }[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [open, setOpen] = useState(false);
  const router = useRouter()

  // Los productos ya se cargan con useProducts, no es necesario cargar aquí

  // Buscar proveedor por código de barras
  const handleBarcodeSearch = () => {
    if (!barcode) return
    const prod = allProducts.find(p => p.id === Number(barcode) || p.name.toLowerCase().includes(barcode.toLowerCase())) as ProductWithPrice
    if (prod) {
      if (!products.some(p => p.id === prod.id)) {
        setProducts([...products, { 
          id: prod.id, 
          name: prod.name, 
          price: prod.costPrice || prod.price || 0, // Usa costPrice o price, lo que esté disponible
          quantity: 1 
        }])
      }
      setBarcode("")
    } else {
      alert("Producto no encontrado")
    }
  }

  const handleAddProduct = () => {
    if (!selectedProductId) return
    const prod = allProducts.find(p => p.id === selectedProductId) as ProductWithPrice
    if (!prod) return
    if (products.some(p => p.id === prod.id)) return
    
    setProducts([...products, { 
      id: prod.id, 
      name: prod.name, 
      price: prod.costPrice || prod.price || 0, // Manejo seguro del precio
      quantity: selectedQuantity 
    }])
    
    setSelectedProductId(null)
    setProductSearch("")  // Limpia la búsqueda
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
      orderDate: new Date().toISOString(),
      expectedDate: new Date().toISOString(),
      notes,
      items: products.map(p => ({
        productId: p.id,
        quantity: p.quantity,
        unitCost: p.price // <--- Cambiado de price a unitCost
      }))
    }
    const token = localStorage.getItem("token")
    const res = await fetch("http://206.183.128.36:5500/purchase-orders", { // <--- Cambia la URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      alert("Orden creada con ID: " + data.data.id)
      router.push("/ordenes-compra")
    } else {
      const error = await res.json().catch(() => ({}))
      alert("Error al crear la orden: " + (error.message || res.status))
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const [productSearch, setProductSearch] = useState("");
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.barcode ?? "").toLowerCase().includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    searchProducts(productSearch);
  }, [productSearch]);

  interface NuevoProducto {
    name: string;
    barcode?: string;
    costPrice?: number;
    sellingPrice?: number;
    [key: string]: any; // Para campos adicionales si existen
  }

  interface BackendErrorResponse {
    message: string;
  }

  const handleCreateProduct = async (nuevoProducto: NuevoProducto): Promise<void> => {
    const token = localStorage.getItem("token");
    const res = await fetch("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      body: JSON.stringify(nuevoProducto)
    });

    if (res.status === 409) {
      const data: BackendErrorResponse = await res.json();
      alert(data.message); // Muestra el mensaje del backend
      return;
    }

    if (!res.ok) {
      alert("Error al crear el producto");
      return;
    }

    alert("Producto creado exitosamente");
    // Aquí puedes refrescar la lista de productos si lo necesitas
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Nueva Orden de Compra</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Proveedor</label>
                <Input
                  placeholder="Buscar proveedor..."
                  value={supplierSearch}
                  onChange={e => setSupplierSearch(e.target.value)}
                  className="mb-2"
                />
                {/* Ejemplo para proveedores */}
                {supplierSearch && !supplierId && (
                  <div className="border rounded bg-white shadow absolute z-10 w-full max-h-60 overflow-y-auto">
                    {isLoadingSuppliers ? (
                      <div className="p-2 text-gray-400 text-sm">Cargando proveedores...</div>
                    ) : filteredSuppliers.length === 0 ? (
                      <div className="p-2 text-gray-400 text-sm">No hay proveedores</div>
                    ) : (
                      filteredSuppliers.map(s => (
                        <div
                          key={s.id}
                          className="p-2 cursor-pointer hover:bg-blue-50"
                          onClick={() => {
                            setSupplierId(s.id);
                            setSupplierName(s.name);
                            setSupplierSearch(s.name);
                          }}
                        >
                          {s.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Estado</label>
                <Select value={status} onValueChange={v => setStatus(v as any)} disabled={status === "aprobada" || status === "recibida"}>
                  <SelectTrigger className="bg-white">
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
                  <SelectContent className="bg-white">
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
                  <SelectContent className="bg-white">
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Forma de Pago</label>
                <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Forma de Pago" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
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
                  onKeyDown={e => { if (e.key === "Enter") handleBarcodeSearch(); }}
                />
                <Button type="button" onClick={handleBarcodeSearch} variant="outline">
                  <Barcode className="h-4 w-4" /> Buscar
                </Button>
              </div>
            </div>
            {/* Productos */}
            <div>
              <label className="block mb-1 font-medium">Productos</label>
              
              <div className="flex gap-2 mb-4 relative">
                <div className="relative flex-1">
                  <Input
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full"
                  />
                  
                  {productSearch && !selectedProductId && (
                    <div className="border rounded bg-white shadow absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-2 text-gray-400 text-sm">Cargando productos...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-2 text-gray-400 text-sm">No se encontraron productos</div>
                      ) : (
                        filteredProducts.map(p => (
                          <div
                            key={p.id}
                            className="p-2 cursor-pointer hover:bg-blue-50 flex justify-between"
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setProductSearch(p.name);
                            }}
                          >
                            <span>{p.name}</span>
                            <span className="text-gray-500 text-xs">{p.barcode}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddProduct} 
                  variant="outline" 
                  className="flex items-center gap-1 whitespace-nowrap"
                >
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
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={p.price}
                            onChange={e => {
                              const newPrice = Number(e.target.value)
                              setProducts(prev => 
                                prev.map(item => 
                                  item.id === p.id ? { ...item, price: newPrice } : item
                                )
                              )
                            }}
                            className="w-20 text-right"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const newQty = Math.max(1, p.quantity - 1)
                                handleChangeQuantity(p.id, newQty)
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              value={p.quantity}
                              onChange={e => handleChangeQuantity(p.id, Number(e.target.value))}
                              className="w-12 text-right"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleChangeQuantity(p.id, p.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">Bs {(p.price * p.quantity).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                <div>Total Bs: <b>Bs {totalBs.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
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
  );
}