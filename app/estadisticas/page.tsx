'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Calendar } from "@/app/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { BarChart, TrendingDown, TrendingUp, Info, Star } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Avatar } from "@/app/components/ui/avatar"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const salesData = [
  {
    hora: '8:00',
    'Viernes anterior': 240,
    'Hoy': 96,
  },
  {
    hora: '9:00',
    'Viernes anterior': 360,
    'Hoy': 120,
  },
  {
    hora: '10:00',
    'Viernes anterior': 240,
    'Hoy': 80,
  },
]

const productsData = [
  {
    id: 1,
    name: "Huggies Pañal Active Sec Mega XXG",
    image: "/placeholder.svg",
    totalSales: 328,
    percentageChange: 0,
    quantitySold: 2,
    bestSellingDates: ["Lunes", "Viernes"]
  },
  {
    id: 2,
    name: "Cariñosito XXG",
    image: "/placeholder.svg",
    totalSales: 300,
    percentageChange: 500,
    quantitySold: 6,
    bestSellingDates: ["Martes", "Sábado"]
  },
  {
    id: 3,
    name: "Blanquita Plancha Megarollo de 12",
    image: "/placeholder.svg",
    totalSales: 288,
    percentageChange: -32.79,
    quantitySold: 12,
    bestSellingDates: ["Domingo"]
  },
  {
    id: 4,
    name: "Nacional Celeste de 12 rollos",
    image: "/placeholder.svg",
    totalSales: 240,
    percentageChange: 100,
    quantitySold: 10,
    bestSellingDates: ["Jueves"]
  },
]

const expensesData = [
  {
    type: "Compra de productos e insumos",
    amount: 12756.76,
    percentageChange: -19.45,
    percentage: 62.09
  },
  {
    type: "Servicios públicos",
    amount: 1742,
    percentageChange: -48.51,
    percentage: 8.48
  },
]

const employeesData = [
  {
    name: "Jamil Abdul Estrada Cayara",
    isStar: true,
    totalSales: 19096.35,
    productsSold: 2324
  },
  {
    name: "María González",
    isStar: false,
    totalSales: 0,
    productsSold: 0
  },
]

export default function Estadisticas() {
  const [selectedTab, setSelectedTab] = useState('ventas')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
        </TabsList>

        {/* Pestaña de Ventas */}
        <TabsContent value="ventas" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select defaultValue="diario">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>

            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  29 nov
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Seleccionar fecha</DialogTitle>
                </DialogHeader>
                <Calendar
                  mode="single"
                  className="rounded-md border"
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* ... Resto del contenido de ventas ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border-green-200">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total ventas</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">Bs 96</div>
                  <div className="flex items-center text-red-500 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    -89.32%
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Comparado con el viernes de la semana anterior
                </div>
              </div>
            </Card>

            <Card className="p-6 border-green-200">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Ganancia de las ventas</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">Bs 24</div>
                  <div className="flex items-center text-red-500 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    -79.31%
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Comparado con el viernes de la semana anterior
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalle de ventas</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  Viernes anterior
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                  Hoy
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <Bar dataKey="Viernes anterior" fill="#dcfce7" />
                    <Bar dataKey="Hoy" fill="#16a34a" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalle de productos vendidos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Total ventas</TableHead>
                    <TableHead>Total de productos vendidos</TableHead>
                    <TableHead>Mejores días de venta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <img src={product.image || "/placeholder.svg"} alt={product.name} />
                        </Avatar>
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          Bs {product.totalSales}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            product.percentageChange > 0
                              ? 'bg-green-100 text-green-800'
                              : product.percentageChange < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.percentageChange > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                            {product.percentageChange < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                            {product.percentageChange === 0 ? '= 0%' :
                              `${product.percentageChange > 0 ? '+' : ''}${product.percentageChange}%`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.quantitySold}</TableCell>
                      <TableCell>{product.bestSellingDates.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Pestaña de Gastos */}
        <TabsContent value="gastos" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select defaultValue="quincenal">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quincenal">Quincenal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">15 nov - 30 nov</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Seleccionar rango de fechas</DialogTitle>
                </DialogHeader>
                <Calendar
                  mode="range"
                  className="rounded-md border"
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6 border-red-200">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total gastos</div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">Bs 17.293,47</div>
                <div className="flex items-center text-red-500 text-sm">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -22.32%
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Comparado con la quincena anterior
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalle de gastos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de gasto</TableHead>
                    <TableHead>Total gastos</TableHead>
                    <TableHead>Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesData.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>{expense.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          Bs {expense.amount.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {expense.percentageChange}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
                          % {expense.percentage}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Pestaña de Empleados */}
        <TabsContent value="empleados" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select defaultValue="quincenal">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quincenal">Quincenal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">15 nov - 30 nov</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Seleccionar rango de fechas</DialogTitle>
                </DialogHeader>
                <Calendar
                  mode="range"
                  className="rounded-md border"
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Promedio de ventas por empleado</div>
                <div className="text-3xl font-bold">Bs 6.365,45</div>
              </div>
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalle de ventas por empleado</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Total ventas</TableHead>
                    <TableHead>Total de productos vendidos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesData.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center gap-2">
                        {employee.name}
                        {employee.isStar && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                            <Star className="h-3 w-3 mr-1 fill-amber-500" />
                            Empleado estrella
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        Bs {employee.totalSales.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{employee.productsSold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

