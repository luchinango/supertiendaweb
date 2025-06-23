"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Printer, Save, Package, Barcode, Plus, Minus } from "lucide-react"

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
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!isOpen || !orderId) return
    setLoading(true)
    fetch(`/api/purchase-orders/${orderId}`, {
      headers: {
        Authorization: "Bearer TU_TOKEN_AQUI", // pon tu token real aquí
        Accept: "*/*"
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data)
        // Inicializa cantidades
        const q: Record<number, number> = {}
        data.items?.forEach((item: any) => {
          q[item.productId] = Number(item.quantity)
        })
        setQuantities(q)
      })
      .finally(() => setLoading(false))
  }, [isOpen, orderId])

  if (!isOpen || !order) return null

  // Mapea los datos de la API al formato visual
  // Si tu API no tiene tipo y formaPago, puedes dejarlo fijo y eliminar las comparaciones
  // const tipo: "manual" | "automatizada" = "manual"
  // const formaPago: "contado" | "credito" = "contado"
  const tipo: "manual" | "automatizada" = order.tipo ?? "manual" // Usa order.tipo si existe en la API
  const formaPago: "contado" | "credito" = order.formaPago ?? "contado" // Usa order.formaPago si existe en la API
  const estado = order.status === "DRAFT" ? "pendiente" : order.status
  const plazoCredito = undefined // Ajusta si tienes el dato real
  const total = Number(order.totalAmount ?? 0)
  const productos = (order.items || []).map((item: any) => ({
    id: item.id, // Usa el id del ítem, no del producto
    nombre: item.product?.name || "",
    cantidad: Number(item.quantity),
    precioUnitario: Number(item.unitCost ?? 0),
    subtotal: Number(item.quantity) * Number(item.unitCost ?? 0),
  }))

  const totalCantidad = productos.reduce((sum: number, p: Product) => sum + p.cantidad, 0)
  const totalGeneral = productos.reduce((sum: number, p: Product) => sum + p.subtotal, 0)

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantities({ ...quantities, [productId]: newQuantity })
  }

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would implement barcode scanning logic
    alert(`Código de barras escaneado: ${barcodeInput}`)
    setBarcodeInput("")
  }

  const handleSaveChanges = async () => {
    try {
      // Prepara los datos a enviar (solo cantidades modificadas)
      const itemsToUpdate = Object.entries(quantities).map(([productId, cantidad]) => ({
        productId: Number(productId),
        quantity: cantidad,
      }));

      await fetch(`/api/purchase-orders/${orderId}/items`, {
        method: "PUT", // o PATCH según tu API
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer TU_TOKEN_AQUI", // pon tu token real aquí
        },
        body: JSON.stringify({ items: itemsToUpdate }),
      });

      alert("Cambios guardados correctamente");
      // Opcional: recargar la orden para ver los cambios reflejados
    } catch (error) {
      alert("Error al guardar los cambios");
    }
  }

  const handleStatusChange = async (newStatus: "pendiente" | "aprobada" | "recibida") => {
    await fetch(`/api/purchase-orders/${orderId}/status`, {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Detail panel */}
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
                <Badge variant={tipo === "automatizada" ? "secondary" : "outline"}>
                  {tipo === "automatizada" ? "Automatizada" : "Manual"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estado</h3>
                <Select value={estado} onValueChange={handleStatusChange}>
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
                    Bs {totalGeneral.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <h3 className="font-medium mb-3">Productos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.nombre}</TableCell>
                      <TableCell className="text-right">
                        Bs {product.precioUnitario.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.cantidad.toLocaleString("es-BO")}
                      </TableCell>
                      <TableCell className="text-right">
                        Bs {product.subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-2 gap-8">
                <div>
                  <span className="font-semibold">Total cantidad:</span> {totalCantidad.toLocaleString("es-BO")}
                </div>
                <div>
                  <span className="font-semibold">Total Bs:</span> {totalGeneral.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}