"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Calendar, DollarSign, CreditCard, Building, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSalesForm } from "../context/SalesFormContext"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Client {
  id: string
  name: string
}

const clients: Client[] = [
  { id: "1", name: "Luis Alberto Martínez Barrientos" },
  { id: "2", name: "Mateo" },
  { id: "3", name: "SOCODEVI" },
  { id: "4", name: "Telma" },
  { id: "5", name: "TODITO" },
]

export function SalesForm() {
  const { isSalesFormOpen, closeSalesForm } = useSalesForm()
  const [isCredit, setIsCredit] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [value, setValue] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string | null>("efectivo")
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const calendarRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({
      isCredit,
      selectedDate,
      value,
      paymentMethod: isCredit ? null : paymentMethod,
      selectedClient,
    })
    closeSalesForm()
  }

  if (!isSalesFormOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={closeSalesForm} />

      {/* Form panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Crear Venta</h2>
            <Button variant="ghost" size="icon" onClick={closeSalesForm} className="rounded-full h-8 w-8 ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-green-500 -mx-6 mb-6"></div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <p className="text-sm text-gray-500">Los campos marcados con asterisco (*) son obligatorios</p>

            {/* Payment Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={!isCredit ? "default" : "outline"}
                onClick={() => setIsCredit(false)}
                className={!isCredit ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Pagada
              </Button>
              <Button
                type="button"
                variant={isCredit ? "default" : "outline"}
                onClick={() => setIsCredit(true)}
                className={isCredit ? "bg-red-600 hover:bg-red-700" : ""}
              >
                A crédito
              </Button>
            </div>

            {/* Sale Date */}
            <div className="space-y-2 relative">
              <Label htmlFor="date">
                Fecha de la venta <span className="text-red-500">*</span>
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
                <div ref={calendarRef} className="absolute z-10 bg-white border rounded-md shadow-lg p-3 mt-1">
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
                <span className="text-green-600 font-medium">= Bs {value || "0"}</span>
              </div>
            </div>

            {/* Payment Method - Only show if not credit */}
            {!isCredit && (
              <div className="space-y-2">
                <Label>
                  Selecciona el método de pago <span className="text-red-500">*</span>
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

            {/* Client Selection */}
            <div className="space-y-2 relative">
              <Label htmlFor="client">
                Agrega un cliente a la venta{isCredit && <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id="client"
                  value={selectedClient ? selectedClient.name : searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedClient(null)
                    setShowClientDropdown(true)
                  }}
                  onClick={() => setShowClientDropdown(true)}
                  placeholder="Buscar cliente..."
                  required={isCredit}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
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
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              {showClientDropdown && (
                <div
                  ref={clientDropdownRef}
                  className="absolute z-10 bg-white border rounded-md shadow-lg w-full mt-1 max-h-60 overflow-y-auto"
                >
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedClient(client)
                        setShowClientDropdown(false)
                      }}
                    >
                      {client.name}
                    </div>
                  ))}
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer border-t flex items-center"
                    onClick={() => {
                      // Handle creating new client
                      console.log("Create new client")
                      setShowClientDropdown(false)
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
                    Crear un nuevo cliente
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              <Button
                type="submit"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                disabled={isCredit && !selectedClient}
              >
                Crear Venta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}