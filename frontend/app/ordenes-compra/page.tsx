'use client'

import { useState, useEffect } from 'react'
import { Button } from "app/components/ui/button"
import { Input } from "app/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "app/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "app/components/ui/select"
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'

interface PurchaseOrder {
  id: number;
  proveedor: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'aprobada' | 'recibida';
}

const samplePurchaseOrders: PurchaseOrder[] = [
  { id: 1, proveedor: 'Proveedor A', fecha: '2023-06-01', total: 1500, estado: 'pendiente' },
  { id: 2, proveedor: 'Proveedor B', fecha: '2023-06-05', total: 2000, estado: 'aprobada' },
  { id: 3, proveedor: 'Proveedor C', fecha: '2023-06-10', total: 1800, estado: 'recibida' },
]

export default function OrdenesCompra() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePurchaseOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')

  const filteredOrders = purchaseOrders.filter(order =>
    (order.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)) &&
    (statusFilter === 'todas' || order.estado === statusFilter)
  )

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

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar orden de compra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="recibida">Recibida</SelectItem>
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
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.proveedor}</TableCell>
              <TableCell>{order.fecha}</TableCell>
              <TableCell>Bs {order.total.toFixed(2)}</TableCell>
              <TableCell>{order.estado}</TableCell>
              <TableCell>
                <Link href={`/ordenes-compra/${order.id}`}>
                  <Button variant="outline" size="sm">Ver detalles</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

