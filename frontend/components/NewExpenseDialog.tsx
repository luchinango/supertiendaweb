"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const expenseCategories = [
  { id: "servicios", name: "Servicios públicos" },
  { id: "productos", name: "Compra de productos e insumos" },
  { id: "arriendo", name: "Arriendo" },
  { id: "nomina", name: "Nómina" },
]

export function NewExpenseDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDebt, setIsDebt] = useState(false)
  const [amount, setAmount] = useState("")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">Nuevo gasto</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogDescription>Ingrese los detalles del nuevo gasto a continuación.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Los campos marcados con asterisco (*) son obligatorios</p>

          <div className="grid grid-cols-2 gap-2">
            <Button variant={!isDebt ? "default" : "outline"} onClick={() => setIsDebt(false)} className="w-full">
              Pagada
            </Button>
            <Button
              variant={isDebt ? "default" : "outline"}
              onClick={() => setIsDebt(true)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              En deuda
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Fecha del gasto *</Label>
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
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoría del gasto *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <span className="text-red-600">= Bs {amount || "0"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>¿Quieres darle un nombre a este gasto?</Label>
            <Input placeholder="Escríbelo aquí" />
          </div>

          <div className="space-y-2">
            <Label>Agrega un proveedor al gasto *</Label>
            <Input type="search" placeholder="Buscar proveedor..." className="pl-8" />
          </div>

          <Button className="w-full" type="submit">
            Crear gasto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

