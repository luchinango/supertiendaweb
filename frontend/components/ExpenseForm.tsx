"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Calendar, Search, DollarSign, CreditCard, Building, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useExpenseForm } from "../contexts/ExpenseFormContext"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Supplier {
  id: string
  name: string
}

interface ExpenseCategory {
  id: string
  name: string
  icon: React.ReactNode
}

const suppliers: Supplier[] = [
  { id: "1", name: "Ariana Hipermaxi paneton" },
  { id: "2", name: "Cobolde" },
  { id: "3", name: "Delizia" },
  { id: "4", name: "Diana" },
  { id: "5", name: "Entel" },
]

const expenseCategories: ExpenseCategory[] = [
  {
    id: "servicios",
    name: "Servicios públicos",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.5 14.5L5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 16L12 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M18.5 13.5L22 15.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M2 10.5L5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 4L12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 8L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "productos",
    name: "Compra de productos e insumos",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "arriendo",
    name: "Arriendo",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M5 21V7L13 3V21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M19 21V10L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9V9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12V12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 15V15.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 18V18.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "nomina",
    name: "Nómina",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 4H8C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V6C18 4.89543 17.1046 4 16 4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 14H8V18H16V14Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "administrativos",
    name: "Gastos administrativos",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 16H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "marketing",
    name: "Mercadeo y publicidad",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 8.71429L19 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15.4286L12 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 10.8571L5 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5 4L5 5.42857" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M12 4L12 9.57143"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 4L19 4.71429"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "logistica",
    name: "Transporte, domicilios y logística",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 16V8H3V16H16Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 8L19.2929 4.70711C19.6834 4.31658 20.3166 4.31658 20.7071 4.70711L21 5C21.5523 5.55228 21.5523 6.44772 21 7L19 9V16H16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 16H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 16H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6 20C7.10457 20 8 19.1046 8 18C8 16.8954 7.10457 16 6 16C4.89543 16 4 16.8954 4 18C4 19.1046 4.89543 20 6 20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 20C17.1046 20 18 19.1046 18 18C18 16.8954 17.1046 16 16 16C14.8954 16 14 16.8954 14 18C14 19.1046 14.8954 20 16 20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "mantenimiento",
    name: "Mantenimiento y reparaciones",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.7 6.3C14.3 5.9 13.7 5.9 13.3 6.3L6.3 13.3C5.9 13.7 5.9 14.3 6.3 14.7C6.7 15.1 7.3 15.1 7.7 14.7L14.7 7.7C15.1 7.3 15.1 6.7 14.7 6.3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "muebles",
    name: "Muebles, equipos o maquinaria",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 19V5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 19H18C19.1046 19 20 19.8954 20 21H4C4 19.8954 4.89543 19 6 19Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "otros",
    name: "Otros",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 8V12M12 16V16.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function ExpenseForm() {
  const { isExpenseFormOpen, closeExpenseForm } = useExpenseForm()
  const [isDebt, setIsDebt] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [value, setValue] = useState("")
  const [expenseName, setExpenseName] = useState("")
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo")

  const calendarRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const supplierDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()),
  )

  const handleCreateExpense = () => {
    // Here you would typically send the expense data to your backend
    console.log({
      isDebt,
      selectedDate,
      selectedCategory,
      value: Number.parseFloat(value) || 0,
      expenseName,
      selectedSupplier,
      paymentMethod: isDebt ? null : paymentMethod,
    })

    // Close the form
    closeExpenseForm()
  }

  if (!isExpenseFormOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={closeExpenseForm} />

      {/* Form panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 bg-red-100 rounded-md flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">Nuevo gasto</h2>
            <Button variant="ghost" size="icon" onClick={closeExpenseForm} className="rounded-full h-8 w-8 ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-green-500 -mx-6 mb-6"></div>

          <div className="flex-1 space-y-6">
            <p className="text-sm text-gray-500 ">Los campos marcados con asterisco (*) son obligatorios</p>

            {/* Payment Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={!isDebt ? "default" : "outline"}
                onClick={() => setIsDebt(false)}
                className={!isDebt ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                Pagada
              </Button>
              <Button
                type="button"
                variant={isDebt ? "default" : "outline"}
                onClick={() => setIsDebt(true)}
                className={isDebt ? "bg-red-600 hover:bg-red-700 text-white" : ""}
              >
                En deuda
              </Button>
            </div>

            {/* Expense Date */}
            <div className="space-y-2 relative">
              <Label htmlFor="date">
                Fecha del gasto <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  value={format(selectedDate, "dd MMM yyyy", { locale: es })}
                  readOnly
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>

              {showCalendar && (
                <div ref={calendarRef} className="absolute z-10 bg-white border rounded-md shadow-lg p-3 mt-1 w-full">
                  <div className="text-center font-medium mb-2">
                    {format(selectedDate, "MMMM yyyy", { locale: es })}
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date)
                        setShowCalendar(false)
                      }
                    }}
                    locale={es}
                  />
                </div>
              )}
            </div>

            {/* Expense Category */}
            <div className="space-y-2 relative">
              <Label htmlFor="category">
                Categoría del gasto <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div
                  className="flex items-center border rounded-md p-2 cursor-pointer"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <div className="text-gray-600">{selectedCategory.icon}</div>
                      <span>{selectedCategory.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 8V12M12 16V16.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Selecciona una categoría</span>
                    </div>
                  )}
                  <svg
                    className={`ml-auto h-5 w-5 text-gray-500 transition-transform ${showCategoryDropdown ? "transform rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {showCategoryDropdown && (
                <div
                  ref={categoryDropdownRef}
                  className="absolute z-10 bg-white border rounded-md shadow-lg w-full mt-1 max-h-60 overflow-y-auto"
                >
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedCategory(category)
                        setShowCategoryDropdown(false)
                      }}
                    >
                      <div className="text-gray-600">{category.icon}</div>
                      <span>{category.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="text-right"
                placeholder="0"
                required
              />
              <div className="bg-gray-100 p-3 rounded-md flex justify-between">
                <span>Valor total</span>
                <span className="text-red-600 font-medium">= Bs {value || "0"}</span>
              </div>
            </div>

            {/* Expense Name */}
            <div className="space-y-2">
              <Label htmlFor="name">¿Quieres darle un nombre a este gasto?</Label>
              <Input
                id="name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Escríbelo aquí"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-2 relative">
              <Label htmlFor="supplier">
                Agrega un proveedor al gasto{isDebt && <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                {selectedSupplier ? (
                  <div className="flex items-center border rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{selectedSupplier.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={() => setSelectedSupplier(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative" onClick={() => setShowSupplierDropdown(true)}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="supplier"
                      value={supplierSearchTerm}
                      onChange={(e) => {
                        setSupplierSearchTerm(e.target.value)
                        setShowSupplierDropdown(true)
                      }}
                      placeholder="Buscar proveedor..."
                      className="pl-9"
                      required={isDebt}
                    />
                  </div>
                )}
              </div>

              {showSupplierDropdown && !selectedSupplier && (
                <div
                  ref={supplierDropdownRef}
                  className="absolute z-10 bg-white border rounded-md shadow-lg w-full mt-1 max-h-60 overflow-y-auto"
                >
                  {filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedSupplier(supplier)
                        setShowSupplierDropdown(false)
                        setSupplierSearchTerm("")
                      }}
                    >
                      {supplier.name}
                    </div>
                  ))}
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer border-t flex items-center"
                    onClick={() => {
                      // Handle creating new supplier
                      console.log("Create new supplier")
                      setShowSupplierDropdown(false)
                    }}
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Crear un nuevo proveedor
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method - Only show if not debt */}
            {!isDebt && (
              <div className="space-y-2">
                <Label>
                  Selecciona el método de pago<span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer ${
                      paymentMethod === "efectivo" ? "border-green-500 bg-green-50 relative" : ""
                    }`}
                    onClick={() => setPaymentMethod("efectivo")}
                  >
                    <DollarSign className="h-6 w-6 text-gray-600" />
                    <span>Efectivo</span>
                    {paymentMethod === "efectivo" && (
                      <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div
                    className={`border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer ${
                      paymentMethod === "tarjeta" ? "border-green-500 bg-green-50 relative" : ""
                    }`}
                    onClick={() => setPaymentMethod("tarjeta")}
                  >
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <span>Tarjeta</span>
                    {paymentMethod === "tarjeta" && (
                      <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div
                    className={`border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer ${
                      paymentMethod === "transferencia" ? "border-green-500 bg-green-50 relative" : ""
                    }`}
                    onClick={() => setPaymentMethod("transferencia")}
                  >
                    <Building className="h-6 w-6 text-gray-600" />
                    <span>Transferencia bancaria</span>
                    {paymentMethod === "transferencia" && (
                      <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div
                    className={`border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer ${
                      paymentMethod === "otro" ? "border-green-500 bg-green-50 relative" : ""
                    }`}
                    onClick={() => setPaymentMethod("otro")}
                  >
                    <Grid className="h-6 w-6 text-gray-600" />
                    <span>Otro</span>
                    {paymentMethod === "otro" && (
                      <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom section with create expense button */}
          <div className="mt-6">
            <Button
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
              onClick={handleCreateExpense}
              disabled={!selectedCategory || !value || (isDebt && !selectedSupplier)}
            >
              Crear gasto
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
