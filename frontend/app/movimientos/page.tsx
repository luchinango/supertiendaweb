"use client"

import { useState } from "react"
import { Button } from "app/components/ui/button"
import { Card, CardContent } from "app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/components/ui/tabs"
import { Input } from "app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "app/components/ui/select"
import { Badge } from "app/components/ui/badge"
import { Search, Filter, Download, CalendarIcon, Printer, FileText, Edit, Trash, X, CreditCard, TrendingUp, Building } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "app/components/ui/dialog"
import { NewSaleDialog } from "../components/NewSaleDialog"
import { NewExpenseDialog } from "../components/NewExpenseDialog"
import { DateRangePicker } from "../components/DateRangePicker"
import type { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { es } from "date-fns/locale"
import useSWR from "swr"

interface Transaction {
  id: number
  concept: string
  value: number
  paymentMethod: string
  created_at: string
  status: string
  type: "income" | "expense"
  transactionId?: string
  profit?: number
  details?: Array<{ name: string; quantity: number; unitPrice: number; total: number }>
}

const sampleTransactions: Transaction[] = [
  {
    id: 1,
    concept: "1 Coca-Cola S/A 2l, 1 Pepsi Black de 1l, 2 Nacional Celeste de 12 rollos",
    value: 66,
    paymentMethod: "Efectivo",
    created_at: "24/ene/2025 | 9:23 PM",
    status: "pagada",
    type: "income",
  },
  {
    id: 2,
    concept: "4 YOGURELLO ESCOLAR FRUTILLA X 95 ML",
    value: 4,
    paymentMethod: "Efectivo",
    created_at: "24/ene/2025 | 9:14 PM",
    status: "pagada",
    type: "income",
  },
  // Add more sample transactions as needed
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function mapPeriod(value: string): string {
  switch (value) {
    case "diario":
      return "daily"
    case "semanal":
      return "weekly"
    case "mensual":
      return "monthly"
    case "anual":
      return "yearly"
    default:
      return ""
  }
}

export default function MovimientosPage() {
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [periodFilter, setPeriodFilter] = useState("semanal")
  const [date, setDate] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 6),
  })
  const [activeTab, setActiveTab] = useState("ingresos")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetails(true)
  }

  // SWR calls to endpoints
  const { data: balanceData, error: balanceError } = useSWR('http://localhost:5000/api/reports/balance', fetcher)
  const { data: salesData, error: salesError } = useSWR('http://localhost:5000/api/reports/sales', fetcher)
  const { data: expensesData, error: expensesError } = useSWR('http://localhost:5000/api/reports/expenses', fetcher)
  const { data: incomeData, error: incomeError } = useSWR('http://localhost:5000/api/reports/transactions/income', fetcher)
  const { data: egresoData, error: egresoError } = useSWR('http://localhost:5000/api/reports/transactions/expenses', fetcher)
  const { data: creditsData, error: creditsError } = useSWR('http://localhost:5000/api/reports/credits', fetcher)
  const { data: payableData, error: payableError } = useSWR('http://localhost:5000/api/reports/payable_credits', fetcher)
  const { data: cashRegisterData, error: cashRegisterError } = useSWR('http://localhost:5000/api/reports/cash_registers', fetcher)

  const buildTransactionsEndpoint = () => {
    const params: string[] = []

    if (date?.from && date?.to) {
      params.push(`startDate=${date.from.toISOString().split("T")[0]}`)
      params.push(`endDate=${date.to.toISOString().split("T")[0]}`)
    }

    const mappedPeriod = mapPeriod(periodFilter)
    if (mappedPeriod) {
      params.push(`period=${mappedPeriod}`)
    }

    return `http://localhost:5000/api/reports/transactions?${params.join("&")}`
  }

  const { data: transactionsData, error: transactionsError } = useSWR(
    buildTransactionsEndpoint,
    fetcher
  )

  if (balanceError || salesError || expensesError) return <div>Error al cargar los datos.</div>
  if (!balanceData || !salesData || !expensesData) return <div>Cargando...</div>

  // Convert to number using correct keys:
  const balance = Number(balanceData.balance)
  const totalSales = Number(salesData.total_sales)
  const totalExpenses = Number(expensesData.totalExpenses)

  function handleDateChange(date: DateRange): void {
    setDate({
      from: date.from,
      to: date.to
    });
  }

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
        {/* Balance */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {balance >= 0 ? "Bs " : "-Bs "}
                {Math.abs(balance).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ventas Totales */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ventas totales</p>
              <p className="text-2xl font-bold text-green-600">
                Bs {totalSales.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gastos Totales */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gastos totales</p>
              <p className="text-2xl font-bold text-red-600">
                Bs {totalExpenses.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
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

            <DateRangePicker date={date} onDateChange={handleDateChange} locale={es} />

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
                {/* Pestaña Ingresos */}
                <TabsContent value="ingresos" className="space-y-4">
                  {incomeError && <p>Error al cargar los ingresos</p>}
                  {!incomeData ? (
                    <p>Cargando ingresos...</p>
                  ) : (
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
                          {incomeData.map((transaction: any) => (
                            <tr key={transaction.id} className="border-b">
                              <td className="px-4 py-3">
                                {transaction.concept || transaction.reference || "N/a"}
                              </td>
                              <td className="px-4 py-3">
                                Bs {Number(transaction.amount ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3">{transaction.type || "N/a"}</td>
                              <td className="px-4 py-3">{transaction.created_at || "N/a"}</td>
                              <td className="px-4 py-3">
                                <Badge>
                                  {transaction.status || "Desconocido"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Pestaña Egresos */}
                <TabsContent value="egresos" className="space-y-4">
                  {egresoError && <p>Error al cargar los egresos</p>}
                  {!egresoData ? (
                    <p>Cargando egresos...</p>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase border-b">
                          <tr>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Valor</th>
                            <th className="px-4 py-3">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(egresoData) ? egresoData : []).map((transaction: any, index: number) => (
                            <tr key={`egreso-${transaction.type}-${transaction.id}-${index}`} className="border-b">
                              <td className="px-4 py-3">{transaction.type}</td>
                              <td className="px-4 py-3">
                                Bs {Number(transaction.amount || 0).toLocaleString('es-BO', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                              <td className="px-4 py-3">
                                {transaction.created_at
                                  ? new Date(transaction.created_at).toLocaleString('es-BO')
                                  : ""}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Pestaña Por cobrar */}
                <TabsContent value="por-cobrar" className="space-y-4">
                  {creditsError && <p>Error al cargar créditos por cobrar</p>}
                  {!creditsData ? (
                    <p>Cargando créditos por cobrar...</p>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase border-b">
                          <tr>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {creditsData.map((credit: any) => (
                            <tr key={credit.id} className="border-b">
                              <td className="px-4 py-3">
                                {credit.first_name} {credit.last_name}
                              </td>
                              <td className="px-4 py-3">
                                Bs {Number(credit.balance || 0).toLocaleString('es-BO', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Pestaña Por pagar */}
                <TabsContent value="por-pagar" className="space-y-4">
                  {payableError && <p>Error al cargar los créditos por pagar</p>}
                  {!payableData ? (
                    <p>Cargando créditos por pagar...</p>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase border-b">
                          <tr>
                            <th className="px-4 py-3">Empresa</th>
                            <th className="px-4 py-3">Monto pendiente</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(payableData) ? payableData : []).map((credit: any, index: number) => (
                            <tr key={`payable-${credit.id}-${index}`} className="border-b">
                              <td className="px-4 py-3">{credit.company_name}</td>
                              <td className="px-4 py-3">
                                Bs {Number(credit.remaining_amount || 0).toLocaleString('es-BO', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cierres" className="space-y-4">
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

            <DateRangePicker date={date} onDateChange={handleDateChange} locale={es} />

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

          {cashRegisterError && (
            <p>Error al cargar los cierres de caja</p>
          )}

          {!cashRegisterData ? (
            <p>Cargando cierres de caja...</p>
          ) : cashRegisterData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron cierres de caja con estos filtros
              </h3>
              <p className="text-gray-500">
                Intenta buscar usando otros criterios
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase border-b">
                  <tr>
                    <th className="px-4 py-3">Fecha de apertura</th>
                    <th className="px-4 py-3">Fecha de cierre</th>
                    <th className="px-4 py-3">Monto apertura</th>
                    <th className="px-4 py-3">Monto cierre</th>
                    <th className="px-4 py-3">Notas</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cashRegisterData.map((cierre: any, index: number) => (
                    <tr key={`cierre-${cierre.id}-${index}`} className="border-b">
                      <td className="px-4 py-3">
                        {cierre.opening_date
                          ? new Date(cierre.opening_date).toLocaleString('es-BO')
                          : "N/a"}
                      </td>
                      <td className="px-4 py-3">
                        {cierre.closing_date
                          ? new Date(cierre.closing_date).toLocaleString('es-BO')
                          : "N/a"}
                      </td>
                      <td className="px-4 py-3">
                        Bs {Number(cierre.opening_amount || 0).toLocaleString('es-BO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-4 py-3">
                        Bs {Number(cierre.closing_amount || 0).toLocaleString('es-BO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-4 py-3">{cierre.notes || "N/a"}</td>
                      <td className="px-4 py-3">
                        <Badge>
                          {cierre.status || "N/a"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="egresos">Egresos</TabsTrigger>
          <TabsTrigger value="por-cobrar">Por cobrar</TabsTrigger>
          <TabsTrigger value="por-pagar">Por pagar</TabsTrigger>
        </TabsList>

        {/* Pestaña Ingresos */}
        <TabsContent value="ingresos" className="mt-4">
          {incomeError && <p>Error al cargar ingresos</p>}
          {!incomeData ? (
            <p>Cargando ingresos...</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Concepto</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Medio de pago</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Fecha y hora</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {incomeData.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 text-xs">$</span>
                          </div>
                          {transaction.concept}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">Bs {transaction.value}</td>
                      <td className="px-4 py-3 text-sm text-right">{transaction.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-right">{transaction.created_at}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Pestaña Egresos */}
        <TabsContent value="egresos" className="mt-4">
          {egresoError && <p>Error al cargar egresos</p>}
          {!egresoData ? (
            <p>Cargando egresos...</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Concepto</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Medio de pago</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Fecha y hora</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {egresoData.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 text-xs">$</span>
                          </div>
                          {transaction.concept}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">Bs {transaction.value}</td>
                      <td className="px-4 py-3 text-sm text-right">{transaction.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-right">{transaction.created_at}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Pestañas de "por-cobrar" y "por-pagar" se muestran según el endpoint */}
        <TabsContent value="por-cobrar" className="mt-4">
          <div className="p-8 text-center text-gray-500">No hay transacciones por cobrar</div>
        </TabsContent>
        <TabsContent value="por-pagar" className="mt-4">
          <div className="p-8 text-center text-gray-500">No hay transacciones por pagar</div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles de transacción */}
      {selectedTransaction && (
        <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center">
                  <div className={`h-6 w-6 ${selectedTransaction.type === "income" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center mr-2`}>
                    <span className={`${selectedTransaction.type === "income" ? "text-green-600" : "text-red-600"} text-xs`}>
                      $
                    </span>
                  </div>
                  {selectedTransaction.type === "income" ? "Detalle de la venta" : "Detalle del gasto"}
                </div>
              </DialogTitle>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
                <X className="h-4 w-4" />
              </DialogClose>
            </DialogHeader>
            <div className="py-4">
              <h3 className="text-center font-medium mb-1">{selectedTransaction.concept}</h3>
              <p className="text-center text-sm text-gray-500 mb-4">Transacción #{selectedTransaction.transactionId}</p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Valor total</span>
                  <span className="font-bold">Bs {selectedTransaction.value}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-0.5 rounded">Pagada</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Fecha y hora</span>
                  <span className="ml-auto">{selectedTransaction.created_at}</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Método de pago</span>
                  <span className="ml-auto">{selectedTransaction.paymentMethod}</span>
                </div>
                {selectedTransaction.type === "income" && (
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">Ganancia</span>
                    <span className="ml-auto text-green-600">Bs {selectedTransaction.profit}</span>
                  </div>
                )}
                {selectedTransaction.type === "expense" && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">Proveedor</span>
                    <span className="ml-auto">-</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Listado de productos</h4>
                {selectedTransaction.details && selectedTransaction.details.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    {selectedTransaction.details.map((item, index) => (
                      <div key={index} className="flex items-center p-3 border-b last:border-b-0">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} Unidad</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Bs {item.total}</p>
                          <p className="text-xs text-gray-500">Bs {item.unitPrice} x Und</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay productos detallados</p>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  <span>Imprimir</span>
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Comprobante</span>
                </Button>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
                <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600">
                  <Trash className="h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

