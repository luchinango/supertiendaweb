"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Package, CreditCard, Calendar, ShoppingCart, XCircle, Check } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductRemovalPanel } from "@/components/features/products/ProductRemovalPanel"
import { CreatePromotionPanel } from "@/components/features/promotions/CreatePromotionPanel"
import { toast } from "@/hooks/useToast"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number
  stockMinimo: number
  categoria: string
  fechaVencimiento?: string
  ultimaVenta?: string
  fechaAgotamiento?: string
  costo: number
  historialCompras: any[]
  historialVentas: any[]
}

interface Credit {
  id: number
  cliente: string
  monto: number
  fechaEmision: string
  fechaVencimiento: string
  estado: "pendiente" | "pagado" | "vencido"
}

interface Debt {
  id: number
  proveedor: string
  monto: number
  fechaEmision: string
  fechaVencimiento: string
  estado: "pendiente" | "pagado" | "vencido"
}

interface User {
  id: number
  nombre: string
  apellido: string
  fechaNacimiento: string
  rol: string
  email: string
}

// Reemplaza la función getProducts para incluir productos por vencer y agotados
const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          nombre: "Manzanas",
          precio: 2.5,
          stock: 100,
          stockMinimo: 50,
          categoria: "Frutas",
          fechaVencimiento: "2025-05-05", // Por vencer (próximos 7 días)
          ultimaVenta: "2025-04-28",
          costo: 1.5,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 2,
          nombre: "Leche",
          precio: 3,
          stock: 10,
          stockMinimo: 20,
          categoria: "Lácteos",
          fechaVencimiento: "2025-04-20",
          ultimaVenta: "2025-04-15",
          costo: 2,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 3,
          nombre: "Pan",
          precio: 1.5,
          stock: 5,
          stockMinimo: 15,
          categoria: "Panadería",
          fechaVencimiento: "2025-04-10",
          ultimaVenta: "2025-03-25",
          costo: 1,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 4,
          nombre: "Queso",
          precio: 5,
          stock: 30,
          stockMinimo: 10,
          categoria: "Lácteos",
          fechaVencimiento: "2025-06-20",
          ultimaVenta: "2025-04-10",
          costo: 3.5,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 5,
          nombre: "Yogurt",
          precio: 2,
          stock: 40,
          stockMinimo: 25,
          categoria: "Lácteos",
          fechaVencimiento: "2025-06-10",
          ultimaVenta: "2025-03-05",
          costo: 1.2,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 6,
          nombre: "Arroz",
          precio: 4.5,
          stock: 0,
          stockMinimo: 30,
          categoria: "Granos",
          fechaAgotamiento: "2025-04-27", // Agotado este mes
          costo: 3,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 7,
          nombre: "Azúcar",
          precio: 3.8,
          stock: 0,
          stockMinimo: 25,
          categoria: "Endulzantes",
          fechaAgotamiento: "2025-04-15", // Agotado este mes
          costo: 2.5,
          historialCompras: [],
          historialVentas: [],
        },
        {
          id: 8,
          nombre: "Aceite de Oliva",
          precio: 12.5,
          stock: 0,
          stockMinimo: 15,
          categoria: "Aceites",
          fechaAgotamiento: "2025-03-28",
          costo: 10,
          historialCompras: [],
          historialVentas: [],
        },
      ])
    }, 1000)
  })
}

// Simular obtención de créditos de clientes
const getClientCredits = (): Promise<Credit[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          cliente: "Juan Pérez",
          monto: 500,
          fechaEmision: "2023-05-15",
          fechaVencimiento: "2023-06-15",
          estado: "vencido",
        },
        {
          id: 2,
          cliente: "María López",
          monto: 300,
          fechaEmision: "2023-06-01",
          fechaVencimiento: "2023-07-01",
          estado: "pendiente",
        },
        {
          id: 3,
          cliente: "Carlos Rodríguez",
          monto: 750,
          fechaEmision: "2023-05-10",
          fechaVencimiento: "2023-06-10",
          estado: "vencido",
        },
      ])
    }, 1000)
  })
}

// Simular obtención de deudas a proveedores
const getSupplierDebts = (): Promise<Debt[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          proveedor: "Proveedor A",
          monto: 1200,
          fechaEmision: "2023-05-05",
          fechaVencimiento: "2023-06-05",
          estado: "vencido",
        },
        {
          id: 2,
          proveedor: "Proveedor B",
          monto: 800,
          fechaEmision: "2023-06-10",
          fechaVencimiento: "2023-07-10",
          estado: "pendiente",
        },
      ])
    }, 1000)
  })
}

// Reemplaza la función getUsers para incluir cumpleaños este mes
const getUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          nombre: "Juan",
          apellido: "Pérez",
          fechaNacimiento: "1990-04-29", // Cumpleaños este mes
          rol: "Administrador",
          email: "juan@example.com",
        },
        {
          id: 2,
          nombre: "María",
          apellido: "López",
          fechaNacimiento: "1985-07-20",
          rol: "Vendedor",
          email: "maria@example.com",
        },
        {
          id: 3,
          nombre: "Carlos",
          apellido: "Rodríguez",
          fechaNacimiento: "1992-04-30", // Cumpleaños este mes
          rol: "Almacén",
          email: "carlos@example.com",
        },
      ])
    }, 1000)
  })
}

export default function Alertas() {
  const [products, setProducts] = useState<Product[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRemovalPanelOpen, setIsRemovalPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("expiring");
  const [reviewedProducts, setReviewedProducts] = useState<number[]>([]);
  const [isPromotionPanelOpen, setIsPromotionPanelOpen] = useState(false)

  useEffect(() => {
    Promise.all([getProducts(), getClientCredits(), getSupplierDebts(), getUsers()]).then(
      ([productsData, creditsData, debtsData, usersData]) => {
        setProducts(productsData)
        setCredits(creditsData)
        setDebts(debtsData)
        setUsers(usersData)
        setLoading(false)
      },
    )
  }, [])

  const today = new Date()
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const currentMonth = today.getMonth()

  const expiringProducts = products.filter((product) => {
    if (!product.fechaVencimiento) return false
    const expirationDate = new Date(product.fechaVencimiento)
    return expirationDate <= sevenDaysFromNow && expirationDate >= today
  })

  const expiredProducts = products.filter((product) => {
    if (!product.fechaVencimiento) return false
    const expirationDate = new Date(product.fechaVencimiento)
    return expirationDate < today
  })

  const lowStockProducts = products.filter((product) => product.stock <= product.stockMinimo && product.stock > 0)

  const unsoldProducts = products.filter((product) => {
    if (!product.ultimaVenta) return false
    const lastSaleDate = new Date(product.ultimaVenta)
    return lastSaleDate < oneMonthAgo
  })

  const outOfStockProducts = products.filter((product) => {
    if (product.stock !== 0) return false
    if (!product.fechaAgotamiento) return false
    const stockOutDate = new Date(product.fechaAgotamiento)
    return stockOutDate >= firstDayOfMonth
  })

  const overdueCredits = credits.filter((credit) => credit.estado === "vencido")

  const overdueDebts = debts.filter((debt) => debt.estado === "vencido")

  const birthdaysThisMonth = users.filter((user) => {
    const birthDate = new Date(user.fechaNacimiento)
    return birthDate.getMonth() === currentMonth
  })

  const handleRemoveProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsRemovalPanelOpen(true)
  }

  const handleCreatePromotion = (product: Product) => {
    setSelectedProduct(product)
    setIsPromotionPanelOpen(true)
  }

  interface PromotionData {
    precioPromocion: number
    // Agrega aquí otros campos si son necesarios
  }

  const handleSavePromotion = (_productId: number, data: PromotionData) => {
    toast({
      title: "Promoción creada",
      description: `Se ha creado una promoción para ${selectedProduct?.nombre} con un precio de Bs ${data.precioPromocion.toFixed(2)}`,
    })
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alertas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card onClick={() => setActiveTab("expiring")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringProducts.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveTab("expired")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredProducts.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveTab("lowstock")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos con Bajo Stock</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveTab("outofstock")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Agotados</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveTab("unsold")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Sin Vender</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unsoldProducts.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveTab("credits")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Vencidos</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCredits.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveTab("birthdays")} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumpleaños del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{birthdaysThisMonth.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
          <TabsTrigger value="expiring">Por Vencer</TabsTrigger>
          <TabsTrigger value="expired">Vencidos</TabsTrigger>
          <TabsTrigger value="lowstock">Bajo Stock</TabsTrigger>
          <TabsTrigger value="outofstock">Agotados</TabsTrigger>
          <TabsTrigger value="unsold">Sin Vender</TabsTrigger>
          <TabsTrigger value="credits">Créditos</TabsTrigger>
          <TabsTrigger value="birthdays">Cumpleaños</TabsTrigger>
        </TabsList>

        <TabsContent value="expiring" className="space-y-6">
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
              {expiringProducts.map((product) => {
                const isReviewed = reviewedProducts.includes(product.id);
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell>{product.categoria}</TableCell>
                    <TableCell>{product.fechaVencimiento}</TableCell>
                    <TableCell>
                      <Button
                        className={
                          isReviewed
                            ? "bg-black text-white hover:bg-black"
                            : "bg-black text-white hover:bg-gray-900"
                        }
                        size="sm"
                        onClick={() => {
                          if (!isReviewed) {
                            setReviewedProducts((prev) => [...prev, product.id]);
                          }
                        }}
                        disabled={isReviewed}
                      >
                        {isReviewed ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Revisado
                          </>
                        ) : (
                          "Marcar como revisado"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {expiringProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No hay productos por vencer en los próximos 7 días
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <h2 className="text-xl font-semibold">Productos Vencidos</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead>Costo de pérdida (Bs)</TableHead> {/* Nueva columna */}
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
                    {/* Hardcode: precio * stock */}
                    {(product.precio * product.stock).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      className="bg-black text-white hover:bg-gray-900"
                      size="sm"
                      onClick={() => handleRemoveProduct(product)}
                    >
                      Retirar del inventario
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expiredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay productos vencidos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="lowstock" className="space-y-6">
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
                      <Button variant="outline" size="sm">
                        Crear Orden de Compra
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {lowStockProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay productos con bajo stock
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="outofstock" className="space-y-6">
          <h2 className="text-xl font-semibold">Productos Agotados este Mes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha de Agotamiento</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outOfStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>{product.categoria}</TableCell>
                  <TableCell>{product.fechaAgotamiento}</TableCell>
                  <TableCell>{product.stockMinimo}</TableCell>
                  <TableCell>
                    <Link href={`/ordenes-compra/nueva?productId=${product.id}&urgent=true`}>
                      <Button
                        className="bg-black text-white hover:bg-gray-900"
                        size="sm"
                      >
                        Crear Orden Urgente
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {outOfStockProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay productos agotados este mes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="unsold" className="space-y-6">
          <h2 className="text-xl font-semibold">Productos Sin Vender (más de 30 días)</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Última Venta</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unsoldProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>{product.categoria}</TableCell>
                  <TableCell>{product.ultimaVenta}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Button
                      className="bg-black text-white hover:bg-gray-900"
                      size="sm"
                      onClick={() => handleCreatePromotion(product)}
                    >
                      Crear Promoción
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {unsoldProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay productos sin vender por más de 30 días
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          <h2 className="text-xl font-semibold">Créditos Vencidos</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueCredits.map((credit) => (
                <TableRow key={credit.id}>
                  <TableCell>{credit.cliente}</TableCell>
                  <TableCell>Bs {credit.monto.toFixed(2)}</TableCell>
                  <TableCell>{credit.fechaEmision}</TableCell>
                  <TableCell>{credit.fechaVencimiento}</TableCell>
                  <TableCell>
                    <Link href={`/creditos?id=${credit.id}`}>
                      <Button
                        className="bg-black text-white hover:bg-gray-900"
                        size="sm"
                      >
                        Registrar Pago
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {overdueCredits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay créditos vencidos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <h2 className="text-xl font-semibold mt-8">Deudas a Proveedores Vencidas</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueDebts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{debt.proveedor}</TableCell>
                  <TableCell>Bs {debt.monto.toFixed(2)}</TableCell>
                  <TableCell>{debt.fechaEmision}</TableCell>
                  <TableCell>{debt.fechaVencimiento}</TableCell>
                  <TableCell>
                    <Button
                      className="bg-black text-white hover:bg-gray-900"
                      size="sm"
                    >
                      Registrar Pago
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {overdueDebts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay deudas vencidas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="birthdays" className="space-y-6">
          <h2 className="text-xl font-semibold">Cumpleaños del Mes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Fecha de Nacimiento</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {birthdaysThisMonth.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.apellido}</TableCell>
                  <TableCell>{user.fechaNacimiento}</TableCell>
                  <TableCell>{user.rol}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      className="bg-black text-white hover:bg-gray-900"
                      size="sm"
                      onClick={() => alert(`Registrar permiso laboral ${user.nombre}`)}
                    >
                      Registrar permiso laboral
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {birthdaysThisMonth.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No hay cumpleaños este mes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <>
          <ProductRemovalPanel
            open={isRemovalPanelOpen}
            onOpenChange={setIsRemovalPanelOpen}
            product={selectedProduct}
          />
          <CreatePromotionPanel
            open={isPromotionPanelOpen}
            onOpenChange={setIsPromotionPanelOpen}
            product={selectedProduct}
            onCreatePromotion={handleSavePromotion}
          />
        </>
      )}
    </div>
  )
}
