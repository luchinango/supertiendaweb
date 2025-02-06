"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, CalendarIcon } from "lucide-react"
import { NewSaleDialog } from "../components/NewSaleDialog"
import { NewExpenseDialog } from "../components/NewExpenseDialog"
import { DateRangePicker } from "../components/DateRangePicker"
import { addDays } from "date-fns"
import { es } from "date-fns/locale"

interface Transaction {
  id: number
  concept: string
  value: number
  paymentMethod: string
  dateTime: string
  status: "pagada" | "pendiente"
  type: "ingreso" | "egreso"
}

const sampleTransactions: Transaction[] = [
  {
    id: 1,
    concept: "1 Coca-Cola S/A 2l Nr, 1 Pepsi Black de 1l, 2 Nacional Celeste de 12 rollos",
    value: 66,
    paymentMethod: "Efectivo",
    dateTime: "24/ene/2025 | 9:23 PM",
    status: "pagada",
    type: "ingreso",
  },
  {
    id: 2,
    concept: "4 YOGURELLO ESCOLAR FRUTILLA X 95 ML",
    value: 4,
    paymentMethod: "Efectivo",
    dateTime: "24/ene/2025 | 9:14 PM",
    status: "pagada",
    type: "ingreso",
  },
  // Add more sample transactions as needed
]

export default function Movimientos() {
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [periodFilter, setPeriodFilter] = useState("semanal")
  const [date, setDate] = useState<{
    from: Date
    to: Date | undefined
  }>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 6),
  })

  const totalSales = sampleTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.value, 0)

  const totalExpenses = sampleTransactions.filter((t) => t.type === "egreso").reduce((sum, t) => sum + t.value, 0)

  const balance = totalSales - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsCashRegisterOpen(!isCashRegisterOpen)}>
            {isCashRegisterOpen ? "Cerrar caja" : "Abrir caja"}
          </Button>
          <NewSaleDialog />
          <NewExpenseDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {balance >= 0 ? "Bs " : "-Bs "}
                {Math.abs(balance).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ventas totales</p>
              <p className="text-2xl font-bold text-green-600">Bs {totalSales.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gastos totales</p>
              <p className="text-2xl font-bold text-red-600">Bs {totalExpenses.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transacciones" className="w-full">
        <TabsList>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="cierres">Cierres de caja</TabsTrigger>
        </TabsList>

        <TabsContent value="transacciones" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker date={date} onDateChange={setDate} locale={es} />

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Button variant="outline" className="gap-2 ml-auto">
              <Download className="h-4 w-4" />
              Descargar reporte
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <Tabs defaultValue="ingresos" className="w-full">
                <TabsList>
                  <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
                  <TabsTrigger value="egresos">Egresos</TabsTrigger>
                  <TabsTrigger value="por-cobrar">Por cobrar</TabsTrigger>
                  <TabsTrigger value="por-pagar">Por pagar</TabsTrigger>
                </TabsList>
                <TabsContent value="ingresos">
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase border-b">
                        <tr>
                          <th className="px-4 py-3">Concepto</th>
                          <th className="px-4 py-3">Valor</th>
                          <th className="px-4 py-3">Medio de pago</th>
                          <th className="px-4 py-3">Fecha y hora</th>
                          <th className="px-4 py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleTransactions
                          .filter((transaction) => transaction.type === "ingreso")
                          .map((transaction) => (
                            <tr key={transaction.id} className="border-b">
                              <td className="px-4 py-3">{transaction.concept}</td>
                              <td className="px-4 py-3">Bs {transaction.value}</td>
                              <td className="px-4 py-3">{transaction.paymentMethod}</td>
                              <td className="px-4 py-3">{transaction.dateTime}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {transaction.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cierres">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker date={date} onDateChange={setDate} locale={es} />

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cierre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Button variant="outline" className="gap-2 ml-auto">
              <Download className="h-4 w-4" />
              Descargar reporte
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron cierres de caja con estos filtros</h3>
            <p className="text-gray-500">Intenta buscar usando otros criterios</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

