'use client'

import { useState, useEffect } from 'react'
import { Button } from "app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog"
import { Input } from "app/components/ui/input"
import { Label } from "app/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "app/components/ui/select"

export interface Credit {
  id: number
  supplier: string
  amount: number
  status: 'pagado' | 'comision' | 'concesion'
  dueDate?: string
  paidDate?: string
}

interface EditCreditDialogProps {
  credit: Credit
  onEditCredit: (credit: Credit) => void
  onClose: () => void
}

export function EditCreditDialog({ credit, onEditCredit, onClose }: EditCreditDialogProps) {
  const [supplier, setSupplier] = useState(credit.supplier)
  const [amount, setAmount] = useState(credit.amount.toString())
  const [status, setStatus] = useState(credit.status)
  const [date, setDate] = useState(credit.dueDate || credit.paidDate || '')

  useEffect(() => {
    setSupplier(credit.supplier)
    setAmount(credit.amount.toString())
    setStatus(credit.status)
    setDate(credit.dueDate || credit.paidDate || '')
  }, [credit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditCredit({
      ...credit,
      supplier,
      amount: parseFloat(amount),
      status,
      ...(status === 'pagado' ? { paidDate: date, dueDate: undefined } : { dueDate: date, paidDate: undefined })
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar crédito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-supplier">Proveedor</Label>
            <Input
              id="edit-supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Monto</Label>
            <Input
              id="edit-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Estado</Label>
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
            <Label htmlFor="edit-date">{status === 'pagado' ? 'Fecha de pago' : 'Fecha de vencimiento'}</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

