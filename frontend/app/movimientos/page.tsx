"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Search, Download, Filter, ChevronDown } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterPanel } from "../components/FilterPanel"
import { SelectEmployeesModal } from "../components/SelectEmployeesModal"
import { SelectClientsModal } from "../components/SelectClientsModal"
import { SelectSuppliersModal } from "../components/SelectSuppliersModal"
import { TransactionDetailPanel } from "../components/TransactionDetailPanel"
import { ExpenseDetailPanel } from "../components/ExpenseDetailPanel"
import { ReportBalancePanel } from "../components/ReportBalancePanel"
import { ReportDebtsPanel } from "../components/ReportDebtsPanel"
import { DownloadReportPanel } from "../components/DownloadReportPanel"
import { CashRegisterManager } from "../components/CashRegisterManager"
import { CashRegisterDetailPanel } from "../components/CashRegisterDetailPanel"

// Sample data for transactions
const transactions = [
  {
    id: 1,
    concept: "1 Nachos Extremos 56g, 1 Four Loko de 695ml, 2 Huari Miel Botellin 300cc",
    value: 62,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 9:52 PM",
    status: "Pagada",
    type: "income",
    transactionId: "17273",
    profit: 8.9,
    details: [
      { name: "Huari Miel Botellin 300cc", quantity: 2, unitPrice: 11, total: 22 },
      { name: "Four Loko de 695ml", quantity: 1, unitPrice: 35, total: 35 },
      { name: "Nachos Extremos 56g", quantity: 1, unitPrice: 5, total: 5 },
    ],
  },
  {
    id: 2,
    concept: "1 La Suprema Budin Chocolate220g",
    value: 12,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 9:42 PM",
    status: "Pagada",
    type: "income",
    transactionId: "17272",
    profit: 2.5,
    details: [{ name: "La Suprema Budin Chocolate220g", quantity: 1, unitPrice: 12, total: 12 }],
  },
  {
    id: 3,
    concept:
      "2 Nivea Rolon de 50ml, 2 Pepsi de 250cc, 1 Heno de Pravia Amarillo de 150g, 1 Dove Jabon Original de 90g, 1 Nacional Plancha Celeste, 1 Belen Bolsa Arrobera",
    value: 104,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 9:41 PM",
    status: "Pagada",
    type: "income",
    transactionId: "17271",
    profit: 15,
    details: [
      { name: "Nivea Rolon de 50ml", quantity: 2, unitPrice: 15, total: 30 },
      { name: "Pepsi de 250cc", quantity: 2, unitPrice: 8, total: 16 },
      { name: "Heno de Pravia Amarillo de 150g", quantity: 1, unitPrice: 18, total: 18 },
      { name: "Dove Jabon Original de 90g", quantity: 1, unitPrice: 12, total: 12 },
      { name: "Nacional Plancha Celeste", quantity: 1, unitPrice: 15, total: 15 },
      { name: "Belen Bolsa Arrobera", quantity: 1, unitPrice: 13, total: 13 },
    ],
  },
  {
    id: 4,
    concept: "1 Nacional Papel Toalla de 2",
    value: 12,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 9:28 PM",
    status: "Pagada",
    type: "income",
    transactionId: "17270",
    profit: 2,
    details: [{ name: "Nacional Papel Toalla de 2", quantity: 1, unitPrice: 12, total: 12 }],
  },
  {
    id: 5,
    concept: "1 Delizaurio Cherry Pina",
    value: 1.5,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 9:22 PM",
    status: "Pagada",
    type: "income",
    transactionId: "17269",
    profit: 0.3,
    details: [{ name: "Delizaurio Cherry Pina", quantity: 1, unitPrice: 1.5, total: 1.5 }],
  },
]

// Sample data for expenses
const expenses = [
  {
    id: 101,
    concept: "Pago Dama Brava",
    value: 120,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 5:12 PM",
    status: "Pagada",
    type: "expense",
    transactionId: "17721",
    details: [
      { name: "Pimienta negra molida 10 gr.", quantity: 10, unitPrice: 2, total: 20 },
      { name: "Pan duro molido 80gr.", quantity: 10, unitPrice: 2, total: 20 },
      { name: "Ajo Molido 30 gr.", quantity: 10, unitPrice: 2, total: 20 },
      { name: "Pipoca 90 gr.", quantity: 10, unitPrice: 2, total: 20 },
      { name: "Paprika 16 gr.", quantity: 10, unitPrice: 2, total: 20 },
      { name: "Canela en rama 5 gr.", quantity: 10, unitPrice: 2, total: 20 },
    ],
  },
  {
    id: 102,
    concept: "Gastos Jamil",
    value: 19,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 4:45 PM",
    status: "Pagada",
    type: "expense",
    transactionId: "17720",
    details: [],
  },
  {
    id: 103,
    concept: "Pago Salvietti",
    value: 162,
    paymentMethod: "Efectivo",
    date: "19/abr/2025 | 4:30 PM",
    status: "Pagada",
    type: "expense",
    transactionId: "17719",
    details: [],
  },
]

// Sample data for cash register closings
const cashRegisterClosings = [
  {
    id: 1,
    openingDate: "19/abr/2025 | 9:14 AM",
    openingResponsible: "Sergio",
    closingDate: "19/abr/2025 | 1:13 PM",
    closingResponsible: "Sergio",
    moneyInRegister: 1945,
    status: "Descuadre",
    details: {
      cash: {
        base: 1880,
        sales: 404,
        refunds: 0,
        expenses: 1817.98,
        total: 466.02,
      },
      card: 0,
      transfer: 0,
      other: 0,
      cashInRegister: 1945.84,
      difference: 1489.82,
      opening: {
        date: "16 Apr 2025 02:00 PM",
        responsible: "Sergio",
      },
      closing: {
        date: "16 Apr 2025 05:11 PM",
        responsible: "Sergio",
      },
      summary: {
        totalSales: 404,
        totalRefunds: 0,
        totalExpenses: 1817.98,
        balance: 75.84,
      },
    },
  },
  {
    id: 2,
    openingDate: "17/abr/2025 | 10:02 PM",
    openingResponsible: "Sergio",
    closingDate: "19/abr/2025 | 9:12 AM",
    closingResponsible: "Sergio",
    moneyInRegister: 2618,
    status: "Descuadre",
    details: {
      cash: {
        base: 2000,
        sales: 1200,
        refunds: 0,
        expenses: 582,
        total: 2618,
      },
      card: 0,
      transfer: 0,
      other: 0,
      cashInRegister: 2618,
      difference: 0,
      opening: {
        date: "17 Apr 2025 10:02 PM",
        responsible: "Sergio",
      },
      closing: {
        date: "19 Apr 2025 09:12 AM",
        responsible: "Sergio",
      },
      summary: {
        totalSales: 1200,
        totalRefunds: 0,
        totalExpenses: 582,
        balance: 618,
      },
    },
  },
  {
    id: 3,
    openingDate: "17/abr/2025 | 1:45 PM",
    openingResponsible: "Sergio",
    closingDate: "17/abr/2025 | 6:18 PM",
    closingResponsible: "Sergio",
    moneyInRegister: 3373,
    status: "Descuadre",
    details: {
      cash: {
        base: 3000,
        sales: 800,
        refunds: 0,
        expenses: 427,
        total: 3373,
      },
      card: 0,
      transfer: 0,
      other: 0,
      cashInRegister: 3373,
      difference: 0,
      opening: {
        date: "17 Apr 2025 01:45 PM",
        responsible: "Sergio",
      },
      closing: {
        date: "17 Apr 2025 06:18 PM",
        responsible: "Sergio",
      },
      summary: {
        totalSales: 800,
        totalRefunds: 0,
        totalExpenses: 427,
        balance: 373,
      },
    },
  },
  {
    id: 4,
    openingDate: "16/abr/2025 | 2:00 PM",
    openingResponsible: "Sergio",
    closingDate: "16/abr/2025 | 5:11 PM",
    closingResponsible: "Sergio",
    moneyInRegister: 1945.84,
    status: "Descuadre",
    details: {
      cash: {
        base: 1880,
        sales: 404,
        refunds: 0,
        expenses: 1817.98,
        total: 466.02,
      },
      card: 0,
      transfer: 0,
      other: 0,
      cashInRegister: 1945.84,
      difference: 1489.82,
      opening: {
        date: "16 Apr 2025 02:00 PM",
        responsible: "Sergio",
      },
      closing: {
        date: "16 Apr 2025 05:11 PM",
        responsible: "Sergio",
      },
      summary: {
        totalSales: 404,
        totalRefunds: 0,
        totalExpenses: 1817.98,
        balance: 75.84,
      },
    },
  },
  {
    id: 5,
    openingDate: "15/abr/2025 | 2:00 PM",
    openingResponsible: "Sergio",
    closingDate: "15/abr/2025 | 6:09 PM",
    closingResponsible: "Sergio",
    moneyInRegister: 1340,
    status: "Descuadre",
    details: {
      cash: {
        base: 1000,
        sales: 600,
        refunds: 0,
        expenses: 260,
        total: 1340,
      },
      card: 0,
      transfer: 0,
      other: 0,
      cashInRegister: 1340,
      difference: 0,
      opening: {
        date: "15 Apr 2025 02:00 PM",
        responsible: "Sergio",
      },
      closing: {
        date: "15 Apr 2025 06:09 PM",
        responsible: "Sergio",
      },
      summary: {
        totalSales: 600,
        totalRefunds: 0,
        totalExpenses: 260,
        balance: 340,
      },
    },
  },
  {
    id: 6,
    openingDate: "14/abr/2025 | 1:59 PM",
    openingResponsible: "Sergio",
    closingDate: "14/abr/2025 | 6:33 PM",
    closingResponsible: "Sergio",
    moneyInRegister: 2200,
    status: "Descuadre",
    details: {
      cash: {
        base: 2000,
        sales: 500,
        refunds: 0,
        expenses: 300,
        total: 2200,
      },
      card: 0,
      transfer: 0,
      other: 0,
      cashInRegister: 2200,
      difference: 0,
      opening: {
        date: "14 Apr 2025 01:59 PM",
        responsible: "Sergio",
      },
      closing: {
        date: "14 Apr 2025 06:33 PM",
        responsible: "Sergio",
      },
      summary: {
        totalSales: 500,
        totalRefunds: 0,
        totalExpenses: 300,
        balance: 200,
      },
    },
  },
]

export default function MovimientosPage() {
  // --- Opciones de periodo ---
  const timePeriods = [
    { id: "diario", name: "Diario" },
    { id: "semanal", name: "Semanal" },
    { id: "mensual", name: "Mensual" },
    { id: "personalizado", name: "Rango personalizado" },
  ]

  // --- Estados ---
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(timePeriods[1])
  const [showTimePeriodDropdown, setShowTimePeriodDropdown] = useState(false)
  const [date, setDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("ingresos")
  const [activeMainTab, setActiveMainTab] = useState("transacciones")

  // Detail panels states
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [showTransactionDetail, setShowTransactionDetail] = useState(false)
  const [showExpenseDetail, setShowExpenseDetail] = useState(false)
  const [selectedCashRegister, setSelectedCashRegister] = useState<any | null>(null)
  const [showCashRegisterDetail, setShowCashRegisterDetail] = useState(false)

  // Report states
  const [showDownloadReportPanel, setShowDownloadReportPanel] = useState(false)
  const [showBalanceReport, setShowBalanceReport] = useState(false)
  const [showDebtsReport, setShowDebtsReport] = useState(false)

  // Filter states
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(["Efectivo"])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  // Modal states
  const [showEmployeesModal, setShowEmployeesModal] = useState(false)
  const [showClientsModal, setShowClientsModal] = useState(false)
  const [showSuppliersModal, setShowSuppliersModal] = useState(false)

  // Estado para saber si ya está montado en el cliente
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate week range based on selected date
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Start on Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }) // End on Sunday

  // Format date range for display
  const formattedDateRange = `${format(weekStart, "dd MMM", { locale: es })} | ${format(weekEnd, "dd MMM", {
    locale: es,
  })}`

  // Calculate totals
  const totalSales = transactions.reduce((sum, t) => sum + t.value, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0)
  const balance = totalSales - totalExpenses

  // Handle transaction click
  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction)
    if (transaction.type === "income") {
      setShowTransactionDetail(true)
    } else if (transaction.type === "expense") {
      setShowExpenseDetail(true)
    }
  }

  // Handle cash register click
  const handleCashRegisterClick = (cashRegister: any) => {
    setSelectedCashRegister(cashRegister)
    setShowCashRegisterDetail(true)
  }

  // Filter transactions based on search term and active tab
  const filteredTransactions = transactions
    .filter((transaction) => transaction.concept.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((transaction) => activeTab === "ingresos")

  // Filter expenses based on search term and active tab
  const filteredExpenses = expenses
    .filter((expense) => expense.concept.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((expense) => activeTab === "egresos")

  // Handle download report click
  const handleDownloadReportClick = () => {
    setShowDownloadReportPanel(true)
  }

  // Handle report selection
  const handleReportSelection = (reportType: string) => {
    setShowDownloadReportPanel(false)

    setTimeout(() => {
      if (reportType === "balance") {
        setShowBalanceReport(true)
      } else if (reportType === "debts") {
        setShowDebtsReport(true)
      }
    }, 300) // Wait for the panel to slide out before showing the new panel
  }

  // Usa este condicional para evitar renderizar el calendario y fechas hasta que esté montado
  if (!mounted) return null

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <div className="flex gap-2">
          <CashRegisterManager />
          <Button variant="outline" className="gap-2" onClick={handleDownloadReportClick}>
            <Download className="h-4 w-4" />
            Descargar reporte
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transacciones" value={activeMainTab} onValueChange={setActiveMainTab} className="mb-6">
        <TabsList className="bg-gray-800 text-white w-full">
          <TabsTrigger value="transacciones" className="flex-1 data-[state=active]:bg-gray-700">
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="cierres" className="flex-1 data-[state=active]:bg-gray-700">
            Cierres de caja
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeMainTab === "transacciones" ? (
        <>
          <div className="flex gap-4 mb-6">
            <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(true)}>
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>

            <Popover open={showTimePeriodDropdown} onOpenChange={setShowTimePeriodDropdown}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {selectedTimePeriod.name}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="py-1">
                  {timePeriods.map((period) => (
                    <div
                      key={period.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedTimePeriod(period)
                        setShowTimePeriodDropdown(false)
                      }}
                    >
                      {period.name}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formattedDateRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      className="p-1"
                      onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                    >
                      &lt;
                    </button>
                    <div className="font-medium">{format(date, "MMMM yyyy", { locale: es })}</div>
                    <button
                      className="p-1"
                      onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                    >
                      &gt;
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                    <div>L</div>
                    <div>M</div>
                    <div>M</div>
                    <div>J</div>
                    <div>V</div>
                    <div>S</div>
                    <div>D</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
                      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                      const startDate = new Date(monthStart)
                      const day = startDate.getDay()
                      startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1))

                      const days = []
                      const currentDate = new Date()
                      const selectedWeekStart = startOfWeek(date, { weekStartsOn: 1 })
                      const selectedWeekEnd = endOfWeek(date, { weekStartsOn: 1 })

                      for (let i = 0; i < 42; i++) {
                        const cloneDate = new Date(startDate)
                        cloneDate.setDate(startDate.getDate() + i)

                        // Check if date is in current month
                        const isCurrentMonth = cloneDate.getMonth() === date.getMonth()

                        // Check if date is today
                        const isToday = cloneDate.toDateString() === currentDate.toDateString()

                        // Check if date is in selected week
                        const isInSelectedWeek = cloneDate >= selectedWeekStart && cloneDate <= selectedWeekEnd

                        // Check if date is the selected date
                        const isSelected = cloneDate.toDateString() === date.toDateString()

                        // If we've gone past the end of the month and completed a week, break
                        if (cloneDate > monthEnd && cloneDate.getDay() === 0) {
                          break
                        }

                        days.push(
                          <button
                            key={i}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm 
                              ${!isCurrentMonth ? "text-gray-300" : ""} 
                              ${isToday ? "bg-blue-100 text-blue-600" : ""} 
                              ${isInSelectedWeek ? "bg-blue-50" : ""}
                              ${isSelected ? "bg-blue-600 text-white" : ""}`}
                            onClick={() => {
                              // When clicking a date, select the whole week
                              const newWeekStart = startOfWeek(cloneDate, { weekStartsOn: 1 })
                              setDate(newWeekStart)
                            }}
                            disabled={!isCurrentMonth}
                          >
                            {format(cloneDate, "d")}
                          </button>,
                        )
                      }

                      return days
                    })()}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button className="bg-gray-800 hover:bg-gray-700">Aplicar</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar concepto..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Balance</div>
              <div className="text-xl font-bold text-gray-800">
                {balance < 0 ? "-" : ""}Bs{" "}
                {mounted
                  ? Math.abs(balance).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : Math.abs(balance)}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Ventas totales</div>
              <div className="text-xl font-bold text-green-600">
                Bs {mounted
                  ? totalSales.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : totalSales}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="text-sm text-gray-600 mb-1">Gastos totales</div>
              <div className="text-xl font-bold text-red-600">
                Bs {mounted
                  ? totalExpenses.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : totalExpenses}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
              <TabsTrigger value="egresos">Egresos</TabsTrigger>
              <TabsTrigger value="por-cobrar">Por cobrar</TabsTrigger>
              <TabsTrigger value="por-pagar">Por pagar</TabsTrigger>
            </TabsList>

            <TabsContent value="ingresos" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_150px_150px_200px_100px] gap-4 p-4 border-b border-gray-200 bg-gray-50">
                  <div className="font-medium text-gray-600">Concepto</div>
                  <div className="font-medium text-gray-600 text-right">Valor</div>
                  <div className="font-medium text-gray-600">Medio de pago</div>
                  <div className="font-medium text-gray-600">Fecha y hora</div>
                  <div className="font-medium text-gray-600 text-center">Estado</div>
                </div>
                <div className="divide-y">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-[1fr_150px_150px_200px_100px] gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 text-xs">$</span>
                        </div>
                        <span className="line-clamp-1">{transaction.concept}</span>
                      </div>
                      <div className="text-right">Bs {transaction.value}</div>
                      <div>{transaction.paymentMethod}</div>
                      <div>{transaction.date}</div>
                      <div className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="egresos" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_150px_150px_200px_100px] gap-4 p-4 border-b border-gray-200 bg-gray-50">
                  <div className="font-medium text-gray-600">Concepto</div>
                  <div className="font-medium text-gray-600 text-right">Valor</div>
                  <div className="font-medium text-gray-600">Medio de pago</div>
                  <div className="font-medium text-gray-600">Fecha y hora</div>
                  <div className="font-medium text-gray-600 text-center">Estado</div>
                </div>
                <div className="divide-y">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="grid grid-cols-[1fr_150px_150px_200px_100px] gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTransactionClick(expense)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-red-600 text-xs">$</span>
                        </div>
                        <span className="line-clamp-1">{expense.concept}</span>
                      </div>
                      <div className="text-right">Bs {expense.value}</div>
                      <div>{expense.paymentMethod}</div>
                      <div>{expense.date}</div>
                      <div className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {expense.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="por-cobrar" className="mt-4">
              <div className="p-8 text-center text-gray-500">No hay transacciones por cobrar</div>
            </TabsContent>

            <TabsContent value="por-pagar" className="mt-4">
              <div className="p-8 text-center text-gray-500">No hay transacciones por pagar</div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {selectedTimePeriod.name}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="py-1">
                  {timePeriods.map((period) => (
                    <div
                      key={period.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedTimePeriod(period)
                      }}
                    >
                      {period.name}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formattedDateRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      className="p-1"
                      onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                    >
                      &lt;
                    </button>
                    <div className="font-medium">{format(date, "MMMM yyyy", { locale: es })}</div>
                    <button
                      className="p-1"
                      onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                    >
                      &gt;
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                    <div>L</div>
                    <div>M</div>
                    <div>M</div>
                    <div>J</div>
                    <div>V</div>
                    <div>S</div>
                    <div>D</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
                      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                      const startDate = new Date(monthStart)
                      const day = startDate.getDay()
                      startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1))

                      const days = []
                      const currentDate = new Date()
                      const selectedWeekStart = startOfWeek(date, { weekStartsOn: 1 })
                      const selectedWeekEnd = endOfWeek(date, { weekStartsOn: 1 })

                      for (let i = 0; i < 42; i++) {
                        const cloneDate = new Date(startDate)
                        cloneDate.setDate(startDate.getDate() + i)

                        // Check if date is in current month
                        const isCurrentMonth = cloneDate.getMonth() === date.getMonth()

                        // Check if date is today
                        const isToday = cloneDate.toDateString() === currentDate.toDateString()

                        // Check if date is in selected week
                        const isInSelectedWeek = cloneDate >= selectedWeekStart && cloneDate <= selectedWeekEnd

                        // Check if date is the selected date
                        const isSelected = cloneDate.toDateString() === date.toDateString()

                        // If we've gone past the end of the month and completed a week, break
                        if (cloneDate > monthEnd && cloneDate.getDay() === 0) {
                          break
                        }

                        days.push(
                          <button
                            key={i}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm 
                              ${!isCurrentMonth ? "text-gray-300" : ""} 
                              ${isToday ? "bg-blue-100 text-blue-600" : ""} 
                              ${isInSelectedWeek ? "bg-blue-50" : ""}
                              ${isSelected ? "bg-blue-600 text-white" : ""}`}
                            onClick={() => {
                              // When clicking a date, select the whole week
                              const newWeekStart = startOfWeek(cloneDate, { weekStartsOn: 1 })
                              setDate(newWeekStart)
                            }}
                            disabled={!isCurrentMonth}
                          >
                            {format(cloneDate, "d")}
                          </button>,
                        )
                      }

                      return days
                    })()}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button className="bg-gray-800 hover:bg-gray-700">Aplicar</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[200px_200px_200px_200px_150px_100px] gap-4 p-4 border-b border-gray-200 bg-gray-50">
              <div className="font-medium text-gray-600">Fecha de apertura</div>
              <div className="font-medium text-gray-600">Responsable de apertura</div>
              <div className="font-medium text-gray-600">Fecha de cierre</div>
              <div className="font-medium text-gray-600">Responsable de cierre</div>
              <div className="font-medium text-gray-600">Dinero en caja</div>
              <div className="font-medium text-gray-600 text-center">Estado</div>
            </div>
            <div className="divide-y">
              {cashRegisterClosings.map((cashRegister) => (
                <div
                  key={cashRegister.id}
                  className="grid grid-cols-[200px_200px_200px_200px_150px_100px] gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCashRegisterClick(cashRegister)}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 text-xs">🔒</span>
                    </div>
                    <span>{cashRegister.openingDate}</span>
                  </div>
                  <div>{cashRegister.openingResponsible}</div>
                  <div>{cashRegister.closingDate}</div>
                  <div>{cashRegister.closingResponsible}</div>
                  <div>Bs {cashRegister.moneyInRegister}</div>
                  <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {cashRegister.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedPaymentMethods={selectedPaymentMethods}
        setSelectedPaymentMethods={setSelectedPaymentMethods}
        selectedEmployees={selectedEmployees}
        onSelectEmployees={() => setShowEmployeesModal(true)}
        clearEmployees={() => setSelectedEmployees([])}
        selectedClients={selectedClients}
        onSelectClients={() => setShowClientsModal(true)}
        clearClients={() => setSelectedClients([])}
        selectedSuppliers={selectedSuppliers}
        onSelectSuppliers={() => setShowSuppliersModal(true)}
        clearSuppliers={() => setSelectedSuppliers([])}
        clearAllFilters={() => {
          setSelectedPaymentMethods(["Efectivo"])
          setSelectedEmployees([])
          setSelectedClients([])
          setSelectedSuppliers([])
        }}
        applyFilters={() => setIsFilterOpen(false)}
      />

      {/* Selection Modals */}
      <SelectEmployeesModal
        isOpen={showEmployeesModal}
        onClose={() => setShowEmployeesModal(false)}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
      />

      <SelectClientsModal
        isOpen={showClientsModal}
        onClose={() => setShowClientsModal(false)}
        selectedClients={selectedClients}
        setSelectedClients={setSelectedClients}
      />

      <SelectSuppliersModal
        isOpen={showSuppliersModal}
        onClose={() => setShowSuppliersModal(false)}
        selectedSuppliers={selectedSuppliers}
        setSelectedSuppliers={setSelectedSuppliers}
      />

      {/* Transaction Detail Panel */}
      {selectedTransaction && (
        <TransactionDetailPanel
          isOpen={showTransactionDetail}
          onClose={() => setShowTransactionDetail(false)}
          transaction={selectedTransaction}
        />
      )}

      {/* Expense Detail Panel */}
      {selectedTransaction && (
        <ExpenseDetailPanel
          isOpen={showExpenseDetail}
          onClose={() => setShowExpenseDetail(false)}
          expense={selectedTransaction}
        />
      )}

      {/* Cash Register Detail Panel */}
      {selectedCashRegister && (
        <CashRegisterDetailPanel
          isOpen={showCashRegisterDetail}
          onClose={() => setShowCashRegisterDetail(false)}
          cashRegister={selectedCashRegister}
        />
      )}

      {/* Download Report Panel */}
      <DownloadReportPanel
        open={showDownloadReportPanel}
        onOpenChange={setShowDownloadReportPanel}
        onSelectReport={handleReportSelection}
      />

      {/* Report Panels */}
      <ReportBalancePanel isOpen={showBalanceReport} onClose={() => setShowBalanceReport(false)} />

      <ReportDebtsPanel isOpen={showDebtsReport} onClose={() => setShowDebtsReport(false)} />
    </div>
  )
}

export interface DownloadReportPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReport?: (reportType: string) => void; // Added this property
}