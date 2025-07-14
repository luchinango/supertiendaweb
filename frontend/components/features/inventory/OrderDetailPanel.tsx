"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Printer, Save, Package, Barcode, Plus, Minus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext" // suponiendo que tienes un contexto de autenticación
import { Switch } from "@/components/ui/switch" // Asegúrate de importar el Switch
import { Checkbox } from "@/components/ui/checkbox"
import { mapOrderStatus } from "@/utils/orderStatus"

interface Product {
  id: number
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface PurchaseOrder {
  id: number
  proveedor: string
  fecha: string
  total: number
  estado: "pendiente" | "aprobada" | "recibida"
  tipo: "manual" | "automatizada"
  productos: Product[]
  formaPago: "contado" | "credito"
  plazoCredito?: number
}

interface OrderDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  orderId: number | null
  onStatusChange: (newStatus: "pendiente" | "aprobada" | "recibida") => void
}

export function OrderDetailPanel({ isOpen, onClose, orderId, onStatusChange }: OrderDetailPanelProps) {
  // Ajusta aquí según la estructura real de tu AuthContext
    const auth = useAuth() // extrae el contexto de autenticación
    const token = auth.token || "" // Usa el nombre correcto de la propiedad del token
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [calcularImpuestos, setCalcularImpuestos] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) return
    setLoading(true)
    fetch(`/api/purchase-orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setOrder(data.data)
          // Inicializa cantidades
          const q: Record<number, number> = {}
          data.data.items?.forEach((item: any) => {
            q[item.productId] = Number(item.quantity)
          })
          setQuantities(q)
        }
      })
      .finally(() => setLoading(false))
  }, [isOpen, orderId, token])

  useEffect(() => {
    if (!isOpen) return
    fetch(`/api/businesses/${order?.businessId || 1}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setCatalogProducts(data.data || []))
  }, [isOpen, order?.businessId, token])

  useEffect(() => {
    if (!showProductSelector) return
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    const timeout = setTimeout(() => {
      console.log("Buscando:", searchTerm)
      fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log("Resultados:", data)
          setSearchResults(data.data || [])
        })
        .finally(() => setSearchLoading(false))
    }, 350) // debounce para evitar demasiadas peticiones

    return () => clearTimeout(timeout)
  }, [searchTerm, showProductSelector, token])

  const handleProductSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setSearchResults(data.data || []))
      .finally(() => setSearchLoading(false))
  }

  if (!isOpen || !order) return null

  // Mapea los datos de la API al formato visual
  // Si tu API no lo tiene, déjalo fijo como string
  const tipo = "manual" // "manual" o "automatizada"
  const formaPago: "contado" | "credito" = order.paymentType === "CREDIT" ? "credito" : "contado" // Asume que order.paymentType existe
  const estado = mapOrderStatus(order.status)
  const plazoCredito = order.supplier?.paymentTerms ?? undefined
  const total = Number(order.totalAmount ?? 0)
  const productos = (order.items || []).map((item: any) => ({
    id: item.id,
    nombre: item.product?.name || "",
    cantidad: Number(item.quantity),
    precioUnitario: Number(item.unitCost ?? 0),
    subtotal: Number(item.quantity) * Number(item.unitCost ?? 0),
  }))

  const totalCantidad = productos.reduce((sum: number, p: Product) => sum + p.cantidad, 0)
  // Extrae el monto de impuestos del objeto de la orden
  const impuestos = Number(order.taxAmount ?? 0);
  const totalGeneral = productos.reduce((sum: number, p: Product) => sum + p.subtotal, 0);
  const totalCalculado = totalGeneral + impuestos;

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantities({ ...quantities, [productId]: newQuantity })
  }

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    setSearchLoading(true)
    try {
      const res = await fetch(`/products?search=${encodeURIComponent(barcodeInput)}&limit=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      })
      const data = await res.json()
      const found = data.data?.[0]
      if (found) {
        setQuantities(q => ({ ...q, [found.id]: 1 }))
        setOrder((prev: any) => ({
          ...prev,
          items: [
            ...(prev.items || []),
            {
              id: Math.random(),
              productId: found.id,
              quantity: 1,
              unitCost: found.costPrice || 0,
              product: found
            }
          ]
        }))
      } else {
        alert("Producto no encontrado")
      }
    } catch {
      alert("Error buscando producto")
    } finally {
      setSearchLoading(false)
      setBarcodeInput("")
    }
  }

  const handleSaveChanges = async () => {
    try {
      const token = auth.token || "";
      const itemsToUpdate = Object.entries(quantities).map(([productId, cantidad]) => {
        const item = order.items.find((i: any) => i.productId === Number(productId));
        return {
          productId: Number(productId),
          quantity: cantidad,
          unitCost: item ? item.unitCost : 0,
        };
      });

      const body = {
        supplierId: order.supplier?.id,
        poNumber: order.poNumber,
        status: order.status,
        orderDate: order.orderDate,
        expectedDate: order.expectedDate,
        notes: order.notes,
        items: itemsToUpdate,
      };

      await fetch(`/purchase-orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      alert("Cambios guardados correctamente");
    } catch (error) {
      alert("Error al guardar los cambios");
    }
  }

  const handleStatusChange = async (newStatus: "pendiente" | "aprobada" | "recibida") => {
    await fetch(`/purchase-orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoibWdvbnphbGVzIiwicm9sZSI6InN1cGVyX2FkbWluIiwiYnVzaW5lc3NJZCI6MSwiaWF0IjoxNzUwNjIwODE2LCJleHAiOjE3NTMyMTI4MTZ9.V3VNLCuSleU8ef4WY1SaYRNRSMAQBle1RlEx_qx008UaFEaCHfIv25HPEAwiHEek4kNvaIABGBhf2llMTB2Z0fRb2OQh47rBgTYVcnsarDHEunuF7_EnCgpyN6khnnSDtXqC-FIvir9O_2ejBOnOJvZ33B9x6fzQRXnfCbqoNJEwihUwbfyIKvKCkkTPVmEAD5E2jvf-A9Yo6MzOZYgZXvJVm45woHZJSK0WFHZNCYUTLugB-0NEMzDqpvmcmQXuoXr5dJgyeVJ-XnVcEDqMfSapeaGVP0Jae4_oqDOdM9-wRbWF7jZBhFKVO10xHEt96w2TKB-VkKMgb3rTmEpSX5DcMxi6Pl4kCeYhd7nLWVLnGWmLaSZrvqZBQe67l-j9ekg14kB3wN33XSVaAhEismxbK4GXhgO7fNkGy2ke6bW-EmIuvRJ86oS_MUv3d5M-o4ampGrXCS78ezRwdzy2uFhr0j9kFkFTwl7GTESr9noCNnZ_UnFd8JssAduMLte3j5qB8j4jqT4dONU-xLxKeMdN_EAQEEzzjIGU0tpnNBJC3WXp1IP_d5BPmGwci9t-rYzPV80-rO8KxpLWyUpUFFsCaP_ZOm3fUy3JVeEpGt7mmfWuHRZSLxDi_e8ugqxcbwD01KAZxfoiWq-8WZHrtmbgAk1QUorBtTuuBlQrMdM",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    // Actualiza el estado local para reflejar el cambio en el UI
    setOrder((prev: any) => ({ ...prev, status: newStatus }));
  };

  const esRecibida = estado === "recibida"
  const esEditable = estado === "pendiente";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel principal */}
      <div className="relative w-full max-w-4xl bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Detalle de Orden de Compra #{order.id}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-blue-500 -mx-6 mb-6"></div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Proveedor</h3>
                <p className="font-medium">{order.supplier?.name || ""}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha</h3>
                <p className="font-medium">{order.orderDate?.split("T")[0] || ""}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo</h3>
                <Badge variant="outline">
                  Manual
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estado</h3>
                <Select value={estado} onValueChange={handleStatusChange} disabled={esRecibida}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue>
                      <Badge
                        variant={
                          estado === "pendiente"
                            ? "outline"
                            : estado === "aprobada"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {estado === "pendiente"
                          ? "Pendiente"
                          : estado === "aprobada"
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
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Forma de Pago</h3>
                <p className="font-medium capitalize">{formaPago}</p>
              </div>
              {formaPago === "credito" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Plazo de Crédito</h3>
                  <p className="font-medium">{plazoCredito} días</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Valor total</div>
                  <div className="text-xl font-bold">
                    Bs {totalCalculado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Escanear código de barras</h3>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Escanear o ingresar código..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Productos</h3>
                <Button
                  onClick={() => setShowProductSelector(true)}
                  disabled={!esEditable}
                >
                  <Plus className="h-4 w-4" /> Agregar producto
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Producto</TableHead>
                    <TableHead className="text-center">Precio Unitario</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-center">Subtotal</TableHead>
                    {/* <TableHead className="text-right">Acciones</TableHead> <-- ELIMINADO */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-center">{product.nombre}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={product.precioUnitario}
                          onChange={e => {
                            const newPrice = Number(e.target.value)
                            setOrder((prev: any) => ({
                              ...prev,
                              items: prev.items.map((item: any) =>
                                item.id === product.id ? { ...item, unitCost: newPrice } : item
                              )
                            }))
                          }}
                          className="w-20 text-right"
                          disabled={!esEditable}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const newQty = Math.max(1, (quantities[product.id] ?? product.cantidad) - 1)
                              setQuantities(q => ({ ...q, [product.id]: newQty }))
                              setOrder((prev: any) => ({
                                ...prev,
                                items: prev.items.map((item: any) =>
                                  item.id === product.id ? { ...item, quantity: newQty } : item
                                )
                              }))
                            }}
                            disabled={!esEditable}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={quantities[product.id] ?? product.cantidad}
                            onChange={e => {
                              const newQty = Number(e.target.value)
                              setQuantities(q => ({ ...q, [product.id]: newQty }))
                              setOrder((prev: any) => ({
                                ...prev,
                                items: prev.items.map((item: any) =>
                                  item.id === product.id ? { ...item, quantity: newQty } : item
                                )
                              }))
                            }}
                            className="w-12 text-right"
                            disabled={!esEditable}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const newQty = (quantities[product.id] ?? product.cantidad) + 1
                              setQuantities(q => ({ ...q, [product.id]: newQty }))
                              setOrder((prev: any) => ({
                                ...prev,
                                items: prev.items.map((item: any) =>
                                  item.id === product.id ? { ...item, quantity: newQty } : item
                                )
                              }))
                            }}
                            disabled={!esEditable}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        Bs {(product.precioUnitario * (quantities[product.id] ?? product.cantidad)).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col items-end gap-1 mt-2">
                <div>
                  <span className="font-semibold">Subtotal productos:</span> Bs {totalGeneral.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </div>
                <div>
                  <span className="font-semibold">Impuestos:</span> Bs {impuestos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </div>
                <div>
                  <span className="font-semibold">Total Bs:</span> Bs {totalCalculado.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            {estado === "pendiente" && (
              <>
                <Button
                  className="flex items-center gap-1"
                  onClick={handleSaveChanges}
                  disabled={!esEditable}
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Modal aquí */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
            <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
              <h3 className="font-bold mb-2">Buscar producto</h3>
              <Input
                placeholder="Buscar por nombre, código, etc..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
              <ul>
                {searchLoading && <li className="text-gray-400 py-2">Buscando...</li>}
                {searchResults.map((item) => (
                  <li key={item.id} className="flex justify-between items-center py-1">
                    <span>{item.name}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setQuantities(q => ({ ...q, [item.id]: 1 }))
                        setOrder((prev: any) => ({
                          ...prev,
                          items: [
                            ...(prev.items || []),
                            {
                              id: Math.random(),
                              productId: item.id,
                              quantity: 1,
                              unitCost: item.costPrice || 0,
                              product: item
                            }
                          ]
                        }))
                        setShowProductSelector(false)
                        setSearchTerm("")
                        setSearchResults([])
                      }}
                    >
                      Agregar
                    </Button>
                  </li>
                ))}
                {!searchLoading && searchTerm && searchResults.length === 0 && (
                  <li className="text-gray-400 py-2">Sin resultados</li>
                )}
              </ul>
              <Button variant="outline" onClick={() => setShowProductSelector(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}