"use client"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from '@/contexts/CartContext'
import { useState, useCallback, useMemo } from "react"
import { PaymentPanel } from "./PaymentPanel"
import React from "react"
import type {CartItemProps} from "@/types/Cart"

const CartItemComponent = React.memo(({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) => {
  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }, [item.id, item.quantity, onUpdateQuantity])

  const handleDecrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1)
  }, [item.id, item.quantity, onUpdateQuantity])

  const handleRemove = useCallback(() => {
    onRemoveItem(item.id)
  }, [item.id, onRemoveItem])

  const totalPrice = useMemo(() => (item.price * item.quantity).toFixed(0), [item.price, item.quantity])

  return (
    <article className="border-b pb-4" aria-labelledby={`item-${item.id}-name`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-gray-100 rounded-md flex-shrink-0">
          <img
            src={item.image || "/placeholder.png?height=40&width=40"}
            alt={`Imagen de ${item.name}`}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h4 id={`item-${item.id}-name`} className="text-sm font-medium">{item.name}</h4>
          <p className="text-xs text-gray-500">{item.available} Disponibles</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500"
          onClick={handleRemove}
          aria-label={`Eliminar ${item.name} del carrito`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center border rounded-md" role="group" aria-label={`Cantidad de ${item.name}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            aria-label={`Reducir cantidad de ${item.name}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="w-10 text-center" aria-live="polite" aria-label={`Cantidad actual: ${item.quantity}`}>
            {item.quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={handleIncrease}
            disabled={item.quantity >= item.available}
            aria-label={`Aumentar cantidad de ${item.name}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="text-right">
          <p className="font-medium">Bs {item.price}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Precio por {item.quantity} unidades: Bs {totalPrice}
      </p>
    </article>
  )
})

CartItemComponent.displayName = 'CartItemComponent'

const EmptyCart = React.memo(() => (
  <section className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto" aria-label="Carrito vacío">
    <div className="mb-4">
      <img src="/images/retail-checkout.png" alt="Escáner de código de barras para agregar productos" className="h-32 w-32 object-contain" />
    </div>
    <h3 className="text-lg font-medium text-center">
      Agrega productos rápidamente usando tu lector de código de barras
    </h3>
    <p className="text-sm text-center text-gray-500 mt-2">
      Si no está en tu inventario, lo buscaremos en nuestra base de datos.
    </p>
  </section>
))

EmptyCart.displayName = 'EmptyCart'

export function ShoppingCart() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalAmount } = useCart()
  const [isPaymentPanelOpen, setIsPaymentPanelOpen] = useState(false)

  const handleContinue = useCallback(() => {
    if (totalItems > 0) {
      setIsPaymentPanelOpen(true)
    }
  }, [totalItems])

  const handleClosePaymentPanel = useCallback(() => {
    setIsPaymentPanelOpen(false)
  }, [])

  const handleClearCart = useCallback(() => {
    clearCart()
  }, [clearCart])

  const handleUpdateQuantity = useCallback((id: number, quantity: number) => {
    updateQuantity(id, quantity)
  }, [updateQuantity])

  const handleRemoveItem = useCallback((id: number) => {
    removeItem(id)
  }, [removeItem])

  const cartContent = useMemo(() => {
    if (items.length === 0) {
      return <EmptyCart />
    }

    return (
      <section className="flex-1 overflow-y-auto" aria-label="Lista de productos en el carrito">
        <div className="p-4">
          <h3 className="font-medium mb-4">Productos</h3>
          <div className="space-y-4" role="list" aria-label={`${items.length} productos en el carrito`}>
            {items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }, [items, handleUpdateQuantity, handleRemoveItem])

  return (
    <>
      <main className="w-full h-full flex flex-col" role="main" aria-label="Carrito de compras">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="font-medium">Productos</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            disabled={items.length === 0}
            aria-label="Vaciar carrito de compras"
          >
            Vaciar canasta
          </Button>
        </header>

        {cartContent}

        {/* Bottom section with total and continue button */}
        <footer className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Productos: {totalItems}</span>
            <span className="font-medium">Bs {totalAmount}</span>
          </div>
          <Button
            className="w-full bg-black text-white hover:bg-gray-900"
            disabled={totalItems === 0}
            onClick={handleContinue}
            aria-label={totalItems > 0 ? `Continuar con ${totalItems} productos por Bs ${totalAmount}` : "Continuar"}
          >
            {totalItems > 0 ? (
              <div className="flex items-center justify-between w-full">
                <span className="bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center text-sm" aria-hidden="true">
                  {totalItems}
                </span>
                <span>Continuar</span>
                <span>Bs {totalAmount}</span>
              </div>
            ) : (
              "Continuar"
            )}
          </Button>
        </footer>
      </main>

      {/* Payment Panel */}
      <PaymentPanel isOpen={isPaymentPanelOpen} onClose={handleClosePaymentPanel} />
    </>
  )
}
