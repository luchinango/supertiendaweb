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

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch("/api/purchase-orders", {
        headers: {
          Authorization: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoibWdvbnphbGVzIiwicm9sZSI6InN1cGVyX2FkbWluIiwiYnVzaW5lc3NJZCI6MSwiaWF0IjoxNzUwNjIwODE2LCJleHAiOjE3NTMyMTI4MTZ9.V3VNLCuSleU8ef4WY1SaYRNRSMAQBle1RlEx_qx008UaFEaCHfIv25HPEAwiHEek4kNvaIABGBhf2llMTB2Z0fRb2OQh47rBgTYVcnsarDHEunuF7_EnCgpyN6khnnSDtXqC-FIvir9O_2ejBOnOJvZ33B9x6fzQRXnfCbqoNJEwihUwbfyIKvKCkkTPVmEAD5E2jvf-A9Yo6MzOZYgZXvJVm45woHZJSK0WFHZNCYUTLugB-0NEMzDqpvmcmQXuoXr5dJgyeVJ-XnVcEDqMfSapeaGVP0Jae4_oqDOdM9-wRbWF7jZBhFKVO10xHEt96w2TKB-VkKMgb3rTmEpSX5DcMxi6Pl4kCeYhd7nLWVLnGWmLaSZrvqZBQe67l-j9ekg14kB3wN33XSVaAhEismxbK4GXhgO7fNkGy2ke6bW-EmIuvRJ86oS_MUv3d5M-o4ampGrXCS78ezRwdzy2uFhr0j9kFkFTwl7GTESr9noCNnZ_UnFd8JssAduMLte3j5qB8j4jqT4dONU-xLxKeMdN_EAQEEzzjIGU0tpnNBJC3WXp1IP_d5BPmGwci9t-rYzPV80-rO8KxpLWyUpUFFsCaP_ZOm3fUy3JVeEpGt7mmfWuHRZSLxDi_e8ugqxcbwD01KAZxfoiWq-8WZHrtmbgAk1QUorBtTuuBlQrMdM", // Reemplaza con tu token real
        }, 
      })
      const data = await res.json()
      // Mapea los datos de la API al formato esperado por la tabla
      const mapped = data.map((order: any) => ({
        id: order.id,
        proveedor: order.supplier?.name || "",
        fecha: order.orderDate ? order.orderDate.split("T")[0] : "",
        total: Number(order.totalAmount ?? 0),
        estado: order.status === "DRAFT" ? "pendiente" : order.status,
        tipo: "manual", // Puedes ajustar esto si tienes el dato real
        productos: (order.items || []).map((item: any) => ({
          id: item.productId,
          nombre: item.product?.name || "",
          cantidad: item.quantity,
          precioUnitario: Number(item.unitCost ?? 0),
          subtotal: Number(item.quantity) * Number(item.unitCost ?? 0),
        })),
        formaPago: "contado", // Ajusta si tienes el dato real
        plazoCredito: undefined, // Ajusta si tienes el dato real
      }))
      setPurchaseOrders(mapped)
    }
    fetchOrders()
  }, [])

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

  const crearOrdenCompra = () => {
    // Lógica para crear una nueva orden de compra
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
          orderId={selectedOrder.id}
          onStatusChange={(newStatus: "pendiente" | "aprobada" | "recibida") =>
            handleStatusChange(selectedOrder.id, newStatus)
          }
        />
      )}

      <Button onClick={crearOrdenCompra}>Crear Orden de Compra</Button>
    </div>
  )
}