"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle2, CreditCard, BanknoteIcon, Building2, MoreHorizontal } from "lucide-react"

interface EditExpensePanelProps {
  isOpen: boolean
  onClose: () => void
  expense: any
}

export default function EditExpensePanel({ isOpen, onClose, expense }: EditExpensePanelProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState<"paid" | "debt">(expense?.status || "paid")
  const [category, setCategory] = useState(expense?.category || "Compra de productos e insumos")
  const [value, setValue] = useState(expense?.amount?.toString() || "")
  const [name, setName] = useState(expense?.name || "")
  const [supplier, setSupplier] = useState(expense?.supplier || "")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "other">(
    expense?.paymentMethod || "cash",
  )
  const [selectedProducts, setSelectedProducts] = useState(expense?.products || [])

  const handleClose = () => {
    // Check if there are unsaved changes
    setShowConfirmDialog(true)
  }

  const confirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  const continueEditing = () => {
    setShowConfirmDialog(false)
  }

  const handleSave = () => {
    // Here you would implement the logic to save the edited expense
    console.log("Saving expense:", {
      id: expense?.id,
      date,
      status,
      category,
      value,
      name,
      supplier,
      paymentMethod,
      selectedProducts,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/15 backdrop-blur-[2px]" onClick={handleClose} />
      <div
        className={`w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 h-full overflow-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button onClick={handleClose} className="mr-2">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Editar gasto</h2>
          </div>
          <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status selector */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={status === "paid" ? "default" : "outline"}
              className={status === "paid" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setStatus("paid")}
            >
              Pagada
            </Button>
            <Button
              variant={status === "debt" ? "default" : "outline"}
              className={status === "debt" ? "bg-amber-600 hover:bg-amber-700" : ""}
              onClick={() => setStatus("debt")}
            >
              En deuda
            </Button>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Fecha del gasto<span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd MMM yyyy", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Categoría del gasto<span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {category || "Selecciona una categoría"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="p-2">
                  <div
                    className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setCategory("Compra de productos e insumos")}
                  >
                    Compra de productos e insumos
                  </div>
                  <div
                    className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setCategory("Servicios")}
                  >
                    Servicios
                  </div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setCategory("Salarios")}>
                    Salarios
                  </div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setCategory("Alquiler")}>
                    Alquiler
                  </div>
                  <div
                    className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setCategory("Impuestos")}
                  >
                    Impuestos
                  </div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setCategory("Otros")}>
                    Otros
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Products info */}
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-700">
              Agregaremos los productos seleccionados a tu inventario automáticamente, al crear el gasto.
            </p>
          </div>

          {/* Products selector */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Productos comprados</label>
              <button className="text-sm text-blue-600" onClick={() => setSelectedProducts([])}>
                Limpiar
              </button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                /* Open product selector */
              }}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2">
                  <span className="text-gray-600">📦</span>
                </div>
                <span>{selectedProducts.length} productos seleccionados</span>
              </div>
              <span className="text-gray-400">❯</span>
            </Button>
          </div>

          {/* Value input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Valor<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="pl-10" />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">Bs</span>
              </div>
            </div>
            <div className="bg-gray-100 p-2 rounded-md flex justify-between">
              <span className="text-gray-600">Valor total</span>
              <span className="font-medium text-red-600">= Bs {value || "0"}</span>
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">¿Quieres darle un nombre a este gasto?</label>
            <Input type="text" placeholder="Pago Dispa" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Supplier input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Agrega un proveedor al gasto</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar proveedor..."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">🔍</span>
              </div>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Selecciona el método de pago<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${paymentMethod === "cash" ? "border-green-500 bg-green-50" : ""}`}
                onClick={() => setPaymentMethod("cash")}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "cash" ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <BanknoteIcon
                    className={`h-6 w-6 ${paymentMethod === "cash" ? "text-green-600" : "text-gray-600"}`}
                  />
                </div>
                <span className="mt-2 text-sm">Efectivo</span>
                {paymentMethod === "cash" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              <div
                className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${paymentMethod === "card" ? "border-green-500 bg-green-50" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "card" ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <CreditCard className={`h-6 w-6 ${paymentMethod === "card" ? "text-green-600" : "text-gray-600"}`} />
                </div>
                <span className="mt-2 text-sm">Tarjeta</span>
                {paymentMethod === "card" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              <div
                className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${paymentMethod === "transfer" ? "border-green-500 bg-green-50" : ""}`}
                onClick={() => setPaymentMethod("transfer")}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "transfer" ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <Building2
                    className={`h-6 w-6 ${paymentMethod === "transfer" ? "text-green-600" : "text-gray-600"}`}
                  />
                </div>
                <span className="mt-2 text-sm">Transferencia bancaria</span>
                {paymentMethod === "transfer" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              <div
                className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${paymentMethod === "other" ? "border-green-500 bg-green-50" : ""}`}
                onClick={() => setPaymentMethod("other")}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "other" ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <MoreHorizontal
                    className={`h-6 w-6 ${paymentMethod === "other" ? "text-green-600" : "text-gray-600"}`}
                  />
                </div>
                <span className="mt-2 text-sm">Otro</span>
                {paymentMethod === "other" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={handleSave}>
            Editar gasto
          </Button>
        </div>

        {/* Confirmation dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">
                Aún no has guardado los cambios que realizaste, ¿Estás seguro que deseas salir?
              </h3>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={confirmClose}>
                  Sí, salir
                </Button>
                <Button onClick={continueEditing}>No, seguir editando</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}