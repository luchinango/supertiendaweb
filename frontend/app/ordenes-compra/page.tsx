"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { OrderDetailPanel } from "@/components/features/inventory/OrderDetailPanel"
import { Badge } from "@/components/ui/badge"

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

const samplePurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    proveedor: "Proveedor A",
    fecha: "2023-06-01",
    total: 1500,
    estado: "pendiente",
    tipo: "manual",
    productos: [
      { id: 1, nombre: "Leche", cantidad: 50, precioUnitario: 10, subtotal: 500 },
      { id: 2, nombre: "Queso", cantidad: 20, precioUnitario: 50, subtotal: 1000 },
    ],
    formaPago: "contado",
  },
  {
    id: 2,
    proveedor: "Proveedor B",
    fecha: "2023-06-05",
    total: 2000,
    estado: "aprobada",
    tipo: "automatizada",
    productos: [
      { id: 3, nombre: "Pan", cantidad: 100, precioUnitario: 5, subtotal: 500 },
      { id: 4, nombre: "Yogurt", cantidad: 30, precioUnitario: 50, subtotal: 1500 },
    ],
    formaPago: "credito",
    plazoCredito: 30,
  },
  {
    id: 3,
    proveedor: "Proveedor C",
    fecha: "2023-06-10",
    total: 1800,
    estado: "recibida",
    tipo: "manual",
    productos: [{ id: 5, nombre: "Arroz", cantidad: 60, precioUnitario: 30, subtotal: 1800 }],
    formaPago: "contado",
  },
]

export default function OrdenesCompra() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePurchaseOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [typeFilter, setTypeFilter] = useState("todas")
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)

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

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setIsDetailPanelOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
      <Link href="/ordenes-compra/nueva">
        <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Nueva Orden de Compra
        </Button>
      </Link>
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
          <TableCell>Bs {order.total.toFixed(2)}</TableCell>
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
            onClick={() => handleViewDetails(order)}
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
        order={selectedOrder}
        onStatusChange={(newStatus: "pendiente" | "aprobada" | "recibida") => handleStatusChange(selectedOrder.id, newStatus)}
      />
      )}
    </div>
  )
}