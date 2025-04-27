"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, ArrowLeft, Info, X, ChevronDown, ChevronUp } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useRouter } from "next/navigation"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Client {
  id: string
  name: string
}

interface PaymentPanelProps {
  isOpen: boolean
  onClose: () => void
}

const clients: Client[] = [
  { id: "1", name: "Luis Alberto Martínez Barrientos" },
  { id: "2", name: "Mateo" },
  { id: "3", name: "SOCODEVI" },
  { id: "4", name: "Telma" },
  { id: "5", name: "TODITO" },
]

export function PaymentPanel({ isOpen, onClose }: PaymentPanelProps) {
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
  const [showPaymentDetails, setShowPaymentDetails] = useState(true)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [clientPayment, setClientPayment] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<string[]>(Array(7).fill("efectivo"))
  const [paymentAmounts, setPaymentAmounts] = useState<number[]>([])

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
    if (paymentMethod === "efectivo" && numberOfPayments === 1) {
      setShowChangeModal(true)
    } else {
      // Aquí se procesaría la venta directamente
      completeTransaction()
    }
  }

  const completeTransaction = () => {
    // Aquí se procesaría la venta
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

    // Limpiar carrito y cerrar panel
    clearCart()
    onClose()
    // router.push("/ventas")
  }

  const changeToReturn = clientPayment ? Number(clientPayment) - finalAmount : 0

  // Calcular los montos de pago cuando cambia el número de pagos o el monto final
  useEffect(() => {
    if (numberOfPayments > 0) {
      const baseAmount = Math.floor(finalAmount / numberOfPayments)
      const remainder = finalAmount - baseAmount * numberOfPayments

      const newAmounts = Array(numberOfPayments).fill(baseAmount)
      // Agregar el residuo al primer pago
      if (remainder > 0) {
        newAmounts[0] += remainder
      }

      setPaymentAmounts(newAmounts)
    }
  }, [numberOfPayments, finalAmount])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Payment panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Pago</h1>
          </div>

          <div className="flex-1 space-y-6">
            {/* Payment Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={!isCredit ? "default" : "outline"}
                onClick={() => setIsCredit(false)}
                className={!isCredit ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                Pagada
              </Button>
              <Button
                type="button"
                variant={isCredit ? "default" : "outline"}
                onClick={() => setIsCredit(true)}
                className={isCredit ? "bg-red-600 hover:bg-red-700 text-white" : ""}
              >
                A crédito
              </Button>
            </div>

            {/* Sale Date */}
            <div className="space-y-2 relative">
              <label htmlFor="date" className="block text-sm font-medium">
                Fecha de la venta <span className="text-red-500">*</span>
              </label>
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

            {/* Client Selection */}
            <div className="space-y-2 relative">
              <label htmlFor="client" className="block text-sm font-medium">
                Cliente{isCredit && <span className="text-red-500">*</span>}
              </label>
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
            <div className="border-t pt-4">
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
                    <label className="block text-sm font-medium">Descuento</label>
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
                    <Input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="text-right"
                      min="0"
                      max="100"
                    />
                    <span className="text-lg">%</span>
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
            </div>

            {/* Number of Payments - Only show if not credit */}
            {!isCredit && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Selecciona el número de pagos que realizarás y el método de pago
                  <span className="text-red-500">*</span>
                </label>
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

            {/* Multiple Payment Fields - Only show if not credit */}
            {!isCredit && (
              <div className="space-y-4">
                {Array.from({ length: numberOfPayments }).map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Monto a pagar</label>
                      <Input value={`$${Math.floor(finalAmount / numberOfPayments)}`} className="text-left" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Método de pago</label>
                      <div className="relative">
                        <Input value="Efectivo" readOnly className="pr-10" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Payment confirmation message */}
                <div className="bg-green-100 border border-green-300 rounded-md p-3 flex items-center text-green-700">
                  <svg
                    className="h-5 w-5 mr-2 text-green-500"
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Los pagos suman el total de la orden: Bs {finalAmount.toFixed(0)}</span>
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
                {showPaymentDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
          <div className="mt-auto pt-4 border-t flex items-center gap-2">
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
              <div className="flex items-center justify-between w-full text-white">
                <span className="bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center text-sm">
                  {totalItems}
                </span>
                <span>Crear venta</span>
                <span>Bs {finalAmount.toFixed(0)}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Change calculation modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowChangeModal(false)} />
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-10">
            <button className="absolute top-4 right-4" onClick={() => setShowChangeModal(false)}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">Calcula el cambio de tu venta</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor de la venta</label>
                <Input value={`Bs ${finalAmount.toFixed(0)}`} readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valor a pagar en efectivo</label>
                <Input value={`Bs ${finalAmount.toFixed(0)}`} readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">¿Con cuánto paga tu cliente?</label>
                <Input
                  value={clientPayment}
                  onChange={(e) => setClientPayment(e.target.value)}
                  type="number"
                  min={finalAmount}
                  placeholder="Bs 0"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Valor a devolver</span>
                <span className="font-bold">Bs {changeToReturn.toFixed(0)}</span>
              </div>

              <Button
                className="w-full bg-gray-800 hover:bg-gray-700 mt-4"
                onClick={completeTransaction}
                disabled={!clientPayment || Number(clientPayment) < finalAmount}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}