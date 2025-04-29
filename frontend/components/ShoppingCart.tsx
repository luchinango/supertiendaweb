"use client"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useState } from "react"
import { PaymentPanel } from "./PaymentPanel"

export function ShoppingCart() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalAmount } = useCart()
  const [isPaymentPanelOpen, setIsPaymentPanelOpen] = useState(false)

  const handleContinue = () => {
    if (totalItems > 0) {
      setIsPaymentPanelOpen(true)
    }
  }

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Productos</h3>
          <Button variant="ghost" size="sm" onClick={clearCart} disabled={items.length === 0}>
            Vaciar canasta
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="mb-4">
              <img src="/images/retail-checkout.png" alt="Barcode Scanner" className="h-32 w-32 object-contain" />
            </div>
            <h3 className="text-lg font-medium text-center">
              Agrega productos rápidamente usando tu lector de código de barras
            </h3>
            <p className="text-sm text-center text-gray-500 mt-2">
              Si no está en tu inventario, lo buscaremos en nuestra base de datos.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium mb-4">Productos</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border-b pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg?height=40&width=40"}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.available} Disponibles</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-r-none"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-10 text-center">{item.quantity}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-l-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.available}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Bs {item.price}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Precio por {item.quantity} unidades: Bs {(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom section with total and continue button */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Productos: {totalItems}</span>
            <span className="font-medium">Bs {totalAmount}</span>
          </div>
          <Button
            className="w-full bg-black text-white hover:bg-gray-900"
            disabled={totalItems === 0}
            onClick={handleContinue}
          >
            {totalItems > 0 ? (
              <div className="flex items-center justify-between w-full">
                <span className="bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center text-sm">
                  {totalItems}
                </span>
                <span>Continuar</span>
                <span>Bs {totalAmount}</span>
              </div>
            ) : (
              "Continuar"
            )}
          </Button>
        </div>
      </div>

      {/* Payment Panel */}
      <PaymentPanel isOpen={isPaymentPanelOpen} onClose={() => setIsPaymentPanelOpen(false)} />
    </>
  )
}