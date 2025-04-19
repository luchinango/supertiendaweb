"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

export default function VentasPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [cartItems, setCartItems] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cashRegisterOpen, setCashRegisterOpen] = useState(false)
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState("")
  const [cashRegisterStatus, setCashRegisterStatus] = useState<null | "abierta" | "cerrada" | "pendiente">(null)
  const [pendingCashRegister, setPendingCashRegister] = useState<any>(null)
  // Simulación de usuario logueado
  const userId = 1 // Reemplaza esto por el ID real del usuario autenticado

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        setCategories([{ id: 0, name: "Todos" }, ...data])
      } catch (error) {
        setCategories([{ id: 0, name: "Todos" }])
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        setProducts([])
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // Verificar estado de caja al cargar
  useEffect(() => {
    async function checkCashRegisterStatus() {
      try {
        const res = await fetch("/api/cash-registers/check-status")
        const data = await res.json()
        if (data.cashRegister?.status === "pendiente") {
          setCashRegisterStatus("pendiente")
          setPendingCashRegister(data.cashRegister)
          setCashRegisterOpen(false)
        } else if (data.cashRegister?.status === "abierta") {
          setCashRegisterStatus("abierta")
          setCashRegisterOpen(true)
        } else {
          setCashRegisterStatus("cerrada")
          setCashRegisterOpen(false)
        }
      } catch {
        setCashRegisterStatus(null)
      }
    }
    checkCashRegisterStatus()
  }, [])

  async function refreshCashRegisterStatus() {
    try {
      const res = await fetch("/api/cash-registers/check-status")
      const data = await res.json()
      if (data.cashRegister?.status === "pendiente") {
        setCashRegisterStatus("pendiente")
        setPendingCashRegister(data.cashRegister)
        setCashRegisterOpen(false)
      } else if (data.cashRegister?.status === "abierta") {
        setCashRegisterStatus("abierta")
        setCashRegisterOpen(true)
      } else {
        setCashRegisterStatus("cerrada")
        setCashRegisterOpen(false)
      }
    } catch {
      setCashRegisterStatus(null)
      setCashRegisterOpen(false)
    }
  }

  // Función para abrir caja
  async function handleOpenCashRegister() {
    setOpening(true)
    setOpenError("")
    try {
      const body = {
        initialBalance: 0,
        userId: userId
      }
      console.log("Enviando a backend:", body)
      const res = await fetch("/api/movimientos/cash-register/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.status === "success") {
        await refreshCashRegisterStatus() // <-- Actualiza el estado real
      } else {
        setOpenError(data.message || "No se pudo abrir la caja")
      }
    } catch (err) {
      setOpenError("Error de conexión al abrir la caja")
    }
    setOpening(false)
  }

  // Cierre normal
  async function handleCloseCashRegister() {
    setOpening(true)
    setOpenError("")
    try {
      const body = {
        closing_amount: 1500.75, // Cambia este valor por el real de tu caja
        notes: "Cierre de turno con el botón"
      }
      const res = await fetch("/api/cash-registers/close", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.cashRegister?.status === "cerrada") {
        await refreshCashRegisterStatus()
      } else {
        setOpenError(data.message || "No se pudo cerrar la caja")
      }
    } catch (err) {
      setOpenError("Error de conexión al cerrar la caja")
    }
    setOpening(false)
  }

  // Cierre inesperado
  async function handleUnexpectedClose() {
    setOpening(true)
    setOpenError("")
    try {
      const body = {
        userId: userId,
        notes: " - Cierre inesperado"
      }
      const res = await fetch("/api/cash-registers/unexpected-close", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.cashRegister?.status === "pendiente") {
        setCashRegisterStatus("pendiente")
        setPendingCashRegister(data.cashRegister)
        setCashRegisterOpen(false)
      } else {
        setOpenError(data.message || "No se pudo marcar como pendiente")
      }
    } catch (err) {
      setOpenError("Error de conexión al marcar como pendiente")
    }
    setOpening(false)
  }

  // Auditar y cerrar caja pendiente
  async function handleAuditAndClose(closingAmount: number, notes: string) {
    setOpening(true)
    setOpenError("")
    try {
      const body = {
        closing_amount: closingAmount,
        notes: notes
      }
      const res = await fetch("/api/cash-registers/audit-and-close", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.cashRegister?.status === "cerrada") {
        setCashRegisterStatus("cerrada")
        setPendingCashRegister(null)
        setCashRegisterOpen(false)
      } else {
        setOpenError(data.message || "No se pudo cerrar tras auditoría")
      }
    } catch (err) {
      setOpenError("Error de conexión al cerrar tras auditoría")
    }
    setOpening(false)
  }

  return (
    <div className="flex h-full">
      {/* Área principal de contenido */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Encabezado con búsqueda y botones */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Nueva venta</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Buscar productos" className="pl-8 w-64" />
              </div>
              <Button
                variant="default"
                className="bg-gray-800 hover:bg-gray-700"
                onClick={cashRegisterOpen ? handleCloseCashRegister : handleOpenCashRegister}
                disabled={opening}
              >
                {opening
                  ? cashRegisterOpen
                    ? "Cerrando..."
                    : "Abriendo..."
                  : cashRegisterOpen
                    ? "Cerrar caja"
                    : "Abrir caja"}
              </Button>
              <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                Nueva venta libre
              </Button>
              <Button variant="default" className="bg-red-500 hover:bg-red-600">
                Nuevo gasto
              </Button>
            </div>
          </div>
          {openError && (
            <div className="text-red-500 text-sm mb-2">{openError}</div>
          )}

          {/* Categorías horizontales */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={category.name === selectedCategory ? "default" : "outline"}
                className={category.name === selectedCategory ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Mostrar advertencia si la caja no está abierta */}
        {!cashRegisterOpen && (
          <div className="w-full text-center text-yellow-600 bg-yellow-100 py-2 mb-2 rounded">
            Debes abrir la caja para registrar ventas, compras o gastos.
          </div>
        )}

        {cashRegisterStatus === "pendiente" && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
            <p>¡Caja pendiente detectada! Realiza auditoría y ciérrala antes de continuar.</p>
            <Button
              className="mt-2"
              onClick={() => handleAuditAndClose(1200, "Auditoría tras fallo eléctrico")}
            >
              Auditar y cerrar caja pendiente
            </Button>
          </div>
        )}

        {/* Contenido principal con productos y carrito */}
        <div className="flex flex-1 overflow-hidden">
          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">Productos</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Crear</p>
                  <p>producto</p>
                </div>
              </div>

              {loading ? (
                <div className="col-span-full text-center">Cargando productos...</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 h-64 flex flex-col">
                    <div className="flex justify-center mb-2">
                      <img
                        src={
                          product.image &&
                          product.image.startsWith("http") &&
                          !product.image.includes("loremflickr.")
                            ? product.image
                            : "/images/placeholder.svg"
                        }
                        alt={product.name}
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                    <div className="mt-auto">
                      <p className="font-bold text-center mb-1">Bs {product.sale_price}</p>
                      <p className="text-sm text-center mb-2">{product.name}</p>
                      <p className="text-xs text-center text-gray-500">
                        {product.actual_stock === 0 ? (
                          <span className="text-red-500">{product.actual_stock} disponibles</span>
                        ) : (
                          `${product.actual_stock} disponibles`
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel lateral derecho - Carrito */}
          <div className="w-80 border-l flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Productos</h3>
              <Button variant="ghost" size="sm">
                Vaciar canasta
              </Button>
            </div>

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

            {/* Botón de continuar */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Productos: {cartItems}</span>
                <span className="font-medium">Bs {cartTotal}</span>
              </div>
              <Button
                className="w-full"
                disabled={cartItems === 0 || !cashRegisterOpen}
                title={!cashRegisterOpen ? "Abre la caja para continuar" : ""}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}