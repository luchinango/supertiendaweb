"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, DollarSign, CreditCard, Building, ArrowLeft, Info, X } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useRouter } from "next/navigation"
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

export default function PaymentPage() {
  const { totalAmount, totalItems, clearCart } = useCart()
  const router = useRouter()

  const [isCredit, setIsCredit] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo")
  const [numberOfPayments, setNumberOfPayments] = useState<number>(1)
  const [showDiscount, setShowDiscount] = useState(false)
  const [discountPercent, setDiscountPercent] = useState("0")
  const [discountAmount, setDiscountAmount] = useState("0")
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDiscountPercentChange = (value: string) => {
    const percent = Math.min(Math.max(Number.parseFloat(value) || 0, 0), 100)
    setDiscountPercent(percent.toString())
    const amount = ((totalAmount * percent) / 100).toFixed(0)
    setDiscountAmount(amount)
  }

  const handleDiscountAmountChange = (value: string) => {
    const amount = Math.min(Math.max(Number.parseFloat(value) || 0, 0), totalAmount)
    setDiscountAmount(amount.toString())
    const percent = ((amount * 100) / totalAmount).toFixed(0)
    setDiscountPercent(percent)
  }

  const finalAmount = totalAmount - Number.parseFloat(discountAmount || "0")

  const handleCreateSale = () => {
    // Here you would typically send the sale data to your backend
    console.log({
      isCredit,
      selectedDate,
      selectedClient,
      paymentMethod: isCredit ? null : paymentMethod,
      numberOfPayments: isCredit ? null : numberOfPayments,
      discount: Number.parseFloat(discountAmount || "0"),
      totalAmount,
      finalAmount,
    })

    // Clear cart and redirect to sales page
    clearCart()
    router.push("/ventas")
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header buttons */}
      <div className="flex gap-2 p-4 border-b">
        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => router.push("/ventas/libre")}>
          Nueva venta libre
        </Button>
        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => router.push("/gastos/nuevo")}>
          Nuevo gasto
        </Button>
      </div>

      {/* Back button and title */}
      <div className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.push("/ventas")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Pago</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
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
            <div className="absolute z-10 bg-white border rounded-md shadow-lg p-3 mt-1 w-full">
              <div className="text-center font-medium mb-2">{format(selectedDate, "MMMM yyyy", { locale: es })}</div>
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

        {/* Client Selection */}
        <div className="space-y-2 relative">
          <Label htmlFor="client">Cliente{isCredit && <span className="text-red-500">*</span>}</Label>
          <div className="relative">
            <Input
              id="client"
              value={selectedClient ? selectedClient.name : ""}
              readOnly
              onClick={() => setShowClientDropdown(!showClientDropdown)}
              placeholder="Selecciona un cliente"
              className="cursor-pointer"
              required={isCredit}
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
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
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {showClientDropdown && (
            <div className="absolute z-10 bg-white border rounded-md shadow-lg w-full mt-1 max-h-60 overflow-y-auto">
              <div className="p-2 border-b">
                <div className="relative">
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
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente"
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-2 border-b uppercase text-xs font-semibold text-gray-500">Buscar cliente</div>

              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    setSelectedClient(client)
                    setShowClientDropdown(false)
                  }}
                >
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-xs">
                    👤
                  </div>
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
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                  <svg
                    className="h-4 w-4"
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
                </div>
                Crear nuevo Cliente
              </div>
            </div>
          )}
        </div>

        {/* Discount */}
        {!showDiscount ? (
          <button className="flex items-center text-green-600 font-medium" onClick={() => setShowDiscount(true)}>
            <svg
              className="h-5 w-5 mr-2"
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Agregar un descuento
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Descuento</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowDiscount(false)
                  setDiscountPercent("0")
                  setDiscountAmount("0")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center">
                <Input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => handleDiscountPercentChange(e.target.value)}
                  className="text-right"
                  min="0"
                  max="100"
                />
                <span className="ml-2">%</span>
              </div>
              <span className="text-lg">=</span>
              <Input
                type="number"
                value={discountAmount}
                onChange={(e) => handleDiscountAmountChange(e.target.value)}
                className="text-right"
                min="0"
                max={totalAmount.toString()}
              />
            </div>
          </div>
        )}

        {/* Number of Payments - Only show if not credit */}
        {!isCredit && (
          <div className="space-y-2">
            <Label>
              Selecciona el número de pagos que realizarás y el método de pago<span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={numberOfPayments === num ? "default" : "outline"}
                  onClick={() => setNumberOfPayments(num)}
                  className={`rounded-md min-w-[40px] ${numberOfPayments === num ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}`}
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant={numberOfPayments > 6 ? "default" : "outline"}
                onClick={() => setNumberOfPayments(7)}
                className={numberOfPayments > 6 ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}
              >
                Otro
              </Button>
            </div>
          </div>
        )}

        {/* Payment Method - Only show if not credit */}
        {!isCredit && (
          <div className="space-y-2">
            <Label>
              Selecciona el método de pago<span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
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
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="border-t pt-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowPaymentDetails(!showPaymentDetails)}
          >
            <span className="font-medium">Detalle del pago</span>
            <svg
              className={`h-5 w-5 transition-transform ${showPaymentDetails ? "transform rotate-180" : ""}`}
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
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showPaymentDetails && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>Bs {Number.parseFloat(discountAmount || "0").toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal sin impuestos</span>
                <span>Bs {totalAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span>Impuestos</span>
                  <Info className="h-4 w-4 text-gray-400 ml-1" />
                </div>
                <span>Bs 0</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal con impuestos</span>
                <span>Bs {totalAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Propina</span>
                <span>Bs 0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section with create sale button */}
      <div className="p-4 border-t mt-auto flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="2" width="12" height="20" rx="2" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
        </Button>
        <Button
          className="flex-1 bg-gray-800 hover:bg-gray-700"
          onClick={handleCreateSale}
          disabled={isCredit && !selectedClient}
        >
          <div className="flex items-center justify-between w-full">
            <span className="bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center text-sm">
              {totalItems}
            </span>
            <span>Crear venta</span>
            <span>Bs {finalAmount.toFixed(0)}</span>
          </div>
        </Button>
      </div>
    </div>
  )
}