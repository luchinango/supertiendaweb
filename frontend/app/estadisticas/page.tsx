"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Info } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

const salesData = [
  { time: "12:00am-2:00am", previous: 0, current: 0 },
  { time: "2:00am-4:00am", previous: 0, current: 0 },
  { time: "4:00am-6:00am", previous: 0, current: 0 },
  { time: "6:00am-8:00am", previous: 0, current: 0 },
  { time: "8:00am-10:00am", previous: 30, current: 0 },
  { time: "10:00am-12:00pm", previous: 90, current: 0 },
  { time: "12:00pm-2:00pm", previous: 130, current: 150 },
  { time: "2:00pm-4:00pm", previous: 0, current: 0 },
  { time: "4:00pm-6:00pm", previous: 0, current: 0 },
  { time: "6:00pm-8:00pm", previous: 0, current: 0 },
  { time: "8:00pm-10:00pm", previous: 0, current: 0 },
  { time: "10:00pm-12:00am", previous: 0, current: 0 },
]

const productSalesData = [
  {
    id: 1,
    product: "Cariñosito Toalla Humeda de 100u",
    isStarProduct: true,
    totalSales: 44,
    percentChange: "+100%",
    totalProductsSold: 4,
  },
  {
    id: 2,
    product: "Ola Lavavajilla de 1L Sachet",
    isStarProduct: false,
    totalSales: 34,
    percentChange: "+100%",
    totalProductsSold: 2,
  },
  {
    id: 3,
    product: "Pacena lata de 440cc",
    isStarProduct: false,
    totalSales: 28.5,
    percentChange: "+100%",
    totalProductsSold: 3,
  },
  {
    id: 4,
    product: "Líder Papel Plancha sin regalo",
    isStarProduct: false,
    totalSales: 23,
    percentChange: "+100%",
    totalProductsSold: 1,
  },
  {
    id: 5,
    product: "Rev Cp Curly 250ml",
    isStarProduct: false,
    totalSales: 15,
    percentChange: "+100%",
    totalProductsSold: 1,
  },
  {
    id: 6,
    product: "Top Jabon de 5u",
    isStarProduct: false,
    totalSales: 14,
    percentChange: "+100%",
    totalProductsSold: 1,
  },
  {
    id: 7,
    product: "Todobrillo Matic de 700gr",
    isStarProduct: false,
    totalSales: 13,
    percentChange: "+100%",
    totalProductsSold: 1,
  },
  {
    id: 8,
    product: "Sapolio Limpiatodo Lavanda de 900ml",
    isStarProduct: false,
    totalSales: 12,
    percentChange: "+100%",
    totalProductsSold: 1,
  },
  {
    id: 9,
    product: "Nacional Papel Toalla de 2",
    isStarProduct: false,
    totalSales: 12,
    percentChange: "+100%",
    totalProductsSold: 1,
  },
]

const expensesData = [
  {
    id: 1,
    type: "Compra de productos e insumos",
    totalExpenses: 104900.01,
    percentChange: "+4.68%",
    percentage: "79.63",
  },
  { id: 2, type: "Gastos administrativos", totalExpenses: 24472.73, percentChange: "+86.68%", percentage: "18.58" },
  { id: 3, type: "Sin categoría", totalExpenses: 1143.43, percentChange: "-95.39%", percentage: "0.87" },
  { id: 4, type: "Mercadeo y publicidad", totalExpenses: 1064, percentChange: "-6.4%", percentage: "0.81" },
  { id: 5, type: "Nómina", totalExpenses: 115, percentChange: "+100%", percentage: "0.09" },
  { id: 6, type: "Otros", totalExpenses: 20, percentChange: "-78.84%", percentage: "0.02" },
  { id: 7, type: "Servicios públicos", totalExpenses: 18, percentChange: "-99.75%", percentage: "0.01" },
]

const employeesData = [
  { id: 1, name: "Jamil Abdul Estrada Cayara", isStarEmployee: true, totalSales: 106450.3, totalProductsSold: 13642 },
  { id: 2, name: "", totalSales: 19563.25, totalProductsSold: 2460 },
  { id: 3, name: "", totalSales: 415.5, totalProductsSold: 30 },
  { id: 4, name: "", totalSales: 0, totalProductsSold: 0 },
  { id: 5, name: "Jamil Abdul Estrada Cayara", totalSales: 0, totalProductsSold: 0 },
]

type DateRangeOption =
  | "Diario"
  | "Semanal"
  | "Quincenal"
  | "Mensual"
  | "Trimestral"
  | "Semestral"
  | "Rango personalizado"

export default function EstadisticasPage() {
  const [activeTab, setActiveTab] = useState<"Ventas" | "Gastos" | "Empleados">("Ventas")
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>("Diario")
  const [dateRange, setDateRange] = useState("20 abr")
  const [showDateRangeOptions, setShowDateRangeOptions] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const dateRangeOptions: DateRangeOption[] = [
    "Diario",
    "Semanal",
    "Quincenal",
    "Mensual",
    "Trimestral",
    "Semestral",
    "Rango personalizado",
  ]

  const handleTabChange = (tab: "Ventas" | "Gastos" | "Empleados") => {
    setActiveTab(tab)
  }

  const handleDateRangeOptionChange = (option: DateRangeOption) => {
    setDateRangeOption(option)
    setShowDateRangeOptions(false)

    if (option === "Trimestral") {
      setDateRange("01 feb - 30 abr")
    }
  }

  const toggleDateRangeOptions = () => {
    setShowDateRangeOptions(!showDateRangeOptions)
    setShowCalendar(false)
  }

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar)
    setShowDateRangeOptions(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Estadísticas</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "Ventas" && "border-b-2 border-green-600 text-green-600",
          )}
          onClick={() => handleTabChange("Ventas")}
        >
          Ventas
        </button>
        <button
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "Gastos" && "border-b-2 border-green-600 text-green-600",
          )}
          onClick={() => handleTabChange("Gastos")}
        >
          Gastos
        </button>
        <button
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "Empleados" && "border-b-2 border-green-600 text-green-600",
          )}
          onClick={() => handleTabChange("Empleados")}
        >
          Empleados
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-4 mb-6 relative">
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md" onClick={toggleDateRangeOptions}>
            {dateRangeOption}
            <ChevronDown className="h-4 w-4" />
          </button>

          {showDateRangeOptions && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-10">
              {dateRangeOptions.map((option) => (
                <button
                  key={option}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleDateRangeOptionChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md" onClick={toggleCalendar}>
            <Calendar className="h-4 w-4" />
            {dateRange}
          </button>

          {showCalendar && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-[340px]">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <button className="p-1">&lt;</button>
                  <div className="font-medium">Abril 2025</div>
                  <button className="p-1">&gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  <div className="text-xs">L</div>
                  <div className="text-xs">M</div>
                  <div className="text-xs">M</div>
                  <div className="text-xs">J</div>
                  <div className="text-xs">V</div>
                  <div className="text-xs">S</div>
                  <div className="text-xs">D</div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                        day === 20 && "bg-green-600 text-white",
                        day >= 14 && day <= 20 && day !== 20 && "bg-green-100",
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <button
                  className="mt-4 w-full bg-gray-900 text-white py-2 rounded-md"
                  onClick={() => setShowCalendar(false)}
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "Ventas" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-gray-500">Total ventas</div>
              </div>
              <div className="flex items-center mt-2">
                <div className="text-2xl font-bold">Bs 287</div>
                <div className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center">
                  <span className="mr-1">+12.55%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Comparado con el domingo de la semana anterior</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-gray-500">Ganancia de las ventas</div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center mt-2">
                <div className="text-2xl font-bold">Bs 45,66</div>
                <div className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center">
                  <span className="mr-1">+46.52%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Comparado con el domingo de la semana anterior</div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Detalle de ventas</h2>

            <div className="flex items-center mb-4">
              <div className="flex items-center mr-6">
                <div className="w-3 h-3 bg-green-200 rounded-full mr-2"></div>
                <span className="text-sm">Domingo anterior</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <span className="text-sm">Hoy</span>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => `Bs ${value}`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => [`Bs ${value}`, ""]} labelFormatter={(label) => `Hora: ${label}`} />
                  <Bar dataKey="previous" fill="#D1FAE5" radius={[4, 4, 0, 0]} barSize={20} name="Domingo anterior" />
                  <Bar dataKey="current" fill="#059669" radius={[4, 4, 0, 0]} barSize={20} name="Hoy" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <h2 className="text-lg font-medium mb-4">Detalle de productos vendidos</h2>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total ventas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total de productos vendidos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productSalesData.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                            P
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {product.product}
                              {product.isStarProduct && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Producto estrella
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm text-gray-900">Bs {product.totalSales}</span>
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                            {product.percentChange}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {product.totalProductsSold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "Gastos" && (
        <>
          {/* Expenses Summary Card */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="text-sm font-medium text-gray-500">Total gastos</div>
            <div className="flex items-center mt-2">
              <div className="text-2xl font-bold">Bs 131.733,17</div>
              <div className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full flex items-center">
                <span className="mr-1">-11.34%</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Comparado con el trimestre anterior</div>
          </div>

          {/* Expenses Table */}
          <div>
            <h2 className="text-lg font-medium mb-4">Detalle de gastos</h2>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de gasto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total gastos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expensesData.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm text-gray-900">
                            Bs{" "}
                            {expense.totalExpenses.toLocaleString("es-BO", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span
                            className={cn(
                              "ml-2 px-2 py-0.5 text-xs rounded-full",
                              expense.percentChange.startsWith("+")
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600",
                            )}
                          >
                            {expense.percentChange}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            Number.parseFloat(expense.percentage) > 50
                              ? "bg-red-100 text-red-600"
                              : "bg-red-50 text-red-500",
                          )}
                        >
                          % {expense.percentage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "Empleados" && (
        <>
          {/* Employee Average Sales Card */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <div className="text-sm font-medium text-gray-500">Promedio de ventas por empleado</div>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mt-2">Bs 25.285,81</div>
          </div>

          {/* Employees Table */}
          <div>
            <h2 className="text-lg font-medium mb-4">Detalle de ventas por empleado</h2>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total ventas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total de productos vendidos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeesData.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.name ? (
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                              {employee.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {employee.name}
                                {employee.isStarEmployee && (
                                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Empleado estrella
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        Bs{" "}
                        {employee.totalSales.toLocaleString("es-BO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {employee.totalProductsSold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}