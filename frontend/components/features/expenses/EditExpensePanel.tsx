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
import type {Expense} from "@/types/Expense"

interface EditExpensePanelProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense
}

export function EditExpensePanel({ isOpen, onClose, expense }: EditExpensePanelProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date(expense.date))
  const [status, setStatus] = useState<"paid" | "debt">(expense.is_debt ? "debt" : "paid")
  const [category, setCategory] = useState(expense.category)
  const [value, setValue] = useState(expense.amount.toString())
  const [name, setName] = useState(expense.name)
  const [supplier, setSupplier] = useState(expense.supplier_name || "")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "other">(
    (expense.payment_method as "cash" | "card" | "transfer" | "other") || "cash",
  )
  const [selectedProducts, setSelectedProducts] = useState(expense.products || [])

  const handleClose = () => {
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
    console.log("Saving expense:", {
      id: expense.id,
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
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="text-right"
            />
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre del gasto<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Compra de productos"
            />
          </div>

          {/* Supplier selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Proveedor</label>
            {supplier ? (
              <div className="flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>{supplier}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-6 w-6"
                  onClick={() => setSupplier("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  /* Open supplier selector */
                }}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Seleccionar proveedor
              </Button>
            )}
          </div>

          {/* Payment method selector */}
          {status === "paid" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Método de pago<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className={paymentMethod === "cash" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <BanknoteIcon className="mr-2 h-4 w-4" />
                  Efectivo
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className={paymentMethod === "card" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Tarjeta
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "transfer" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("transfer")}
                  className={paymentMethod === "transfer" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Transferencia
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "other" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("other")}
                  className={paymentMethod === "other" ? "bg-gray-600 hover:bg-gray-700" : ""}
                >
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Otro
                </Button>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="pt-4">
            <Button className="w-full" onClick={handleSave}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
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