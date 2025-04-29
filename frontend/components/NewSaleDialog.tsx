"use client"

import { useState } from "react"
import { Calendar } from "@/app/components/ui/calendar"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { ShoppingCart, DollarSign } from "lucide-react"

export function NewSaleDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [saleType, setSaleType] = useState<"products" | "free" | null>(null)
  const [isDebt, setIsDebt] = useState(false)
  const [amount, setAmount] = useState("")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <Button className="bg-green-600 hover:bg-green-700">Nueva venta</Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setSaleType("products")
              setIsOpen(true)
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Venta de productos</span>
              <span className="text-xs text-muted-foreground">
                Registra una venta seleccionando los productos de tu inventario.
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSaleType("free")
              setIsOpen(true)
            }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Venta libre</span>
              <span className="text-xs text-muted-foreground">
                Registra un ingreso sin seleccionar productos de tu inventario.
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Venta</DialogTitle>
          <DialogDescription>Complete los detalles de la nueva venta a continuación.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Los campos marcados con asterisco (*) son obligatorios</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Button variant={!isDebt ? "default" : "outline"} onClick={() => setIsDebt(false)} className="w-full">
                Pagada
              </Button>
            </div>
            <div>
              <Button
                variant={isDebt ? "default" : "outline"}
                onClick={() => setIsDebt(true)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                A crédito
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha de la venta *</Label>
            <div className="space-y-2">
              <Input
                type="text"
                value={
                  selectedDate
                    ? selectedDate.toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""
                }
                readOnly
                placeholder="Selecciona una fecha"
              />
              <div className="border rounded-md p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor *</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-right"
            />
            <div className="bg-muted p-2 rounded-md">
              <div className="flex justify-between">
                <span>Valor total</span>
                <span className="text-green-600">= Bs {amount || "0"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Agrega un cliente a la venta</Label>
            <Input type="search" placeholder="Buscar cliente..." className="pl-8" />
          </div>

          <div>
            <Button className="w-full" type="submit">
              Crear venta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

