'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoria: string;
  fechaVencimiento?: string;
}

// Esta función simula la obtención de productos desde una API
const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, nombre: 'Manzanas', precio: 2.5, stock: 100, stockMinimo: 50, categoria: 'Frutas', fechaVencimiento: '2023-12-31' },
        { id: 2, nombre: 'Leche', precio: 3, stock: 10, stockMinimo: 20, categoria: 'Lácteos', fechaVencimiento: '2023-07-15' },
        { id: 3, nombre: 'Pan', precio: 1.5, stock: 5, stockMinimo: 15, categoria: 'Panadería', fechaVencimiento: '2023-06-30' },
        { id: 4, nombre: 'Queso', precio: 5, stock: 30, stockMinimo: 10, categoria: 'Lácteos', fechaVencimiento: '2023-07-20' },
        { id: 5, nombre: 'Yogurt', precio: 2, stock: 40, stockMinimo: 25, categoria: 'Lácteos', fechaVencimiento: '2023-07-10' },
      ]);
    }, 1000);
  });
};

export default function Alertas() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringProducts = products.filter((product) => {
    if (!product.fechaVencimiento) return false;
    const expirationDate = new Date(product.fechaVencimiento);
    return expirationDate <= sevenDaysFromNow && expirationDate >= today;
  });

  const expiredProducts = products.filter((product) => {
    if (!product.fechaVencimiento) return false;
    const expirationDate = new Date(product.fechaVencimiento);
    return expirationDate < today;
  });

  const lowStockProducts = products.filter((product) => product.stock <= product.stockMinimo);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alertas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos por Vencer
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Vencidos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos con Bajo Stock
            </CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Productos por Vencer (próximos 7 días)</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha de Vencimiento</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiringProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.nombre}</TableCell>
                <TableCell>{product.categoria}</TableCell>
                <TableCell>{product.fechaVencimiento}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Marcar como revisado</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Productos Vencidos</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha de Vencimiento</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.nombre}</TableCell>
                <TableCell>{product.categoria}</TableCell>
                <TableCell>{product.fechaVencimiento}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm">Retirar del inventario</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Productos con Bajo Stock</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.nombre}</TableCell>
                <TableCell>{product.categoria}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.stockMinimo}</TableCell>
                <TableCell>
                  <Link href={`/ordenes-compra/nueva?productId=${product.id}`}>
                    <Button variant="outline" size="sm">Crear Orden de Compra</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

