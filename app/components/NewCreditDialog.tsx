'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from 'lucide-react'

interface NewCreditDialogProps {
  onAddCredit: (credit: {
    supplier: string
    amount: number
    status: 'comision' | 'concesion' | 'pagado'
    dueDate?: string
    paidDate?: string
  }) => void
}

export function NewCreditDialog({ onAddCredit }: NewCreditDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'comision' | 'concesion' | 'pagado'>('comision')
  const [date, setDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCredit({
      supplier,
      amount: parseFloat(amount),
      status,
      ...(status === 'pagado' ? { paidDate: date } : { dueDate: date })
    })
    setIsOpen(false)
    setSupplier('')
    setAmount('')
    setStatus('comision')
    setDate('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo crédito
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo crédito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Proveedor</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(value: 'comision' | 'concesion' | 'pagado') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comision">Comisión</SelectItem>
                <SelectItem value="concesion">Concesión</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{status === 'pagado' ? 'Fecha de pago' : 'Fecha de vencimiento'}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Agregar crédito</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

