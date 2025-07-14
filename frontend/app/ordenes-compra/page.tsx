"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { OrderDetailPanel } from "@/components/features/inventory/OrderDetailPanel"
import { Badge } from "@/components/ui/badge"
import apiClient from "@/lib/api-client"
import { mapOrderStatus } from "@/utils/orderStatus"
import NuevaOrdenCompra from "@/components/ordenes-compra/NuevaOrdenCompra"

interface PurchaseOrder {
  id: number
  proveedor: string
  fecha: string
  total: number
  estado: "pendiente" | "aprobada" | "recibida"
  tipo: "manual" | "automatizada"
  productos: {
    id: number
    nombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }[]
  formaPago: "contado" | "credito"
  plazoCredito?: number
}

export default function OrdenesCompra() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [typeFilter, setTypeFilter] = useState("todas")
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showNuevaOrden, setShowNuevaOrden] = useState(false)

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("token") || ""
      const businessId = localStorage.getItem("businessId") || "1"
      const res = await apiClient.get(
        `/purchase-orders?businessId=${businessId}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const response = res.data
      // Mapear los datos según tu modelo
      const mapped = (response.data || []).map((order: any) => {
        const totalGeneral = (order.items || []).reduce(
          (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitCost ?? 0),
          0
        )
        const impuestos = Number(order.taxAmount ?? 0)
        return {
          id: order.id,
          proveedor: order.supplier?.name || "",
          fecha: order.orderDate ? order.orderDate.split("T")[0] : "",
          // Cambia aquí: suma de subtotales + impuestos
          total: totalGeneral + impuestos,
          estado:
            order.status === "DRAFT"
              ? "pendiente"
              : order.status === "APPROVED"
              ? "aprobada"
              : order.status === "RECEIVED"
              ? "recibida"
              : order.status?.toLowerCase() || "pendiente",
          tipo: "manual",
          productos: (order.items || []).map((item: any) => ({
            id: item.productId,
            nombre: item.product?.name || "",
            cantidad: item.quantity,
            precioUnitario: Number(item.unitCost ?? 0),
            subtotal: Number(item.quantity) * Number(item.unitCost ?? 0),
          })),
          formaPago: "contado",
          plazoCredito: undefined,
        }
      })
      setPurchaseOrders(mapped)
      setTotalPages(response.meta?.totalPages || 1)
    }
    fetchOrders()
  }, [page])

  const filteredOrders = purchaseOrders.filter(
    (order) =>
      (order.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toString().includes(searchTerm)) &&
      (statusFilter === "todas" || order.estado === statusFilter) &&
      (typeFilter === "todas" || order.tipo === typeFilter),
  )

  const handleStatusChange = (orderId: number, newStatus: "pendiente" | "aprobada" | "recibida") => {
    setPurchaseOrders((orders) =>
      orders.map((order) => (order.id === orderId ? { ...order, estado: newStatus } : order)),
    )
  }

  const handleViewDetails = async (order: PurchaseOrder) => {
    const token = localStorage.getItem("token") || ""
    try {
      const res = await apiClient.get(
        `/purchase-orders/${order.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = res.data.data
      // Mapear la orden recibida del backend al modelo de tu UI
      const mappedOrder: PurchaseOrder = {
        id: data.id,
        proveedor: data.supplier?.name || "",
        fecha: data.orderDate ? data.orderDate.split("T")[0] : "",
        total: Number(data.totalAmount ?? 0),
        estado:
          data.status === "DRAFT"
            ? "pendiente"
            : data.status === "APPROVED"
            ? "aprobada"
            : data.status === "RECEIVED"
            ? "recibida"
            : data.status?.toLowerCase() || "pendiente",
        tipo: "manual", // O ajusta según tu lógica
        productos: (data.items || []).map((item: any) => ({
          id: item.productId,
          nombre: item.product?.name || "",
          cantidad: item.quantity,
          precioUnitario: Number(item.unitCost ?? 0),
          subtotal: Number(item.quantity) * Number(item.unitCost ?? 0),
        })),
        formaPago: "contado",
        plazoCredito: undefined,
      }
      setSelectedOrder(mappedOrder)
      setIsDetailPanelOpen(true)
    } catch (error) {
      // Manejo de error opcional
      alert("No se pudo cargar la orden de compra.")
    }
  }

  const crearOrdenCompra = () => {
    // Lógica para crear una nueva orden de compra
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
        <Button className="gap-2" onClick={() => setShowNuevaOrden(true)}>
          <Plus className="h-4 w-4" />
          Nueva Orden de Compra
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
        placeholder="Buscar orden de compra..."
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        className="pl-8"
        />
      </div>
      <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
        <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="todas">Todos los estados</SelectItem>
        <SelectItem value="pendiente">Pendiente</SelectItem>
        <SelectItem value="pendiente">Pendiente</SelectItem>
        <SelectItem value="aprobada">Aprobada</SelectItem>
        <SelectItem value="recibida">Recibida</SelectItem>
        </SelectContent>
      </Select>
      <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value)}>
        <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="todas">Todos los tipos</SelectItem>
        <SelectItem value="manual">Manual</SelectItem>
        <SelectItem value="automatizada">Automatizada</SelectItem>
        </SelectContent>
      </Select>
      </div>

      <Table>
      <TableHeader>
        <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Proveedor</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.map((order: PurchaseOrder) => (
        <TableRow key={order.id}>
          <TableCell>{order.id}</TableCell>
          <TableCell>{order.proveedor}</TableCell>
          <TableCell>{order.fecha}</TableCell>
          <TableCell>
          <div className="text-xl font-bold">
            Bs {order.total.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          </TableCell>
          <TableCell>
          <Badge variant={order.tipo === "automatizada" ? "secondary" : "outline"}>
            {order.tipo === "automatizada" ? "Automatizada" : "Manual"}
          </Badge>
          </TableCell>
          <TableCell>
          <Select
            value={order.estado}
            onValueChange={(value: "pendiente" | "aprobada" | "recibida") => handleStatusChange(order.id, value)}
          >
            <SelectTrigger className="w-[130px]">
            <SelectValue>
              <Badge
              variant={
                order.estado === "pendiente"
                ? "outline"
                : order.estado === "aprobada"
                  ? "secondary"
                  : "default"
              }
              >
              {order.estado === "pendiente"
                ? "Pendiente"
                : order.estado === "aprobada"
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
          </TableCell>
          <TableCell>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              setSelectedOrder(order)
              setIsDetailPanelOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
            Ver detalles
          </Button>
          </TableCell>
        </TableRow>
        ))}
      </TableBody>
      </Table>

      {selectedOrder && (
        <OrderDetailPanel
          isOpen={isDetailPanelOpen}
          onClose={() => setIsDetailPanelOpen(false)}
          orderId={selectedOrder.id}
          onStatusChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
        />
      )}

      {showNuevaOrden && (
        <NuevaOrdenCompra
          onClose={() => setShowNuevaOrden(false)}
        />
      )}
    </div>
  )
}