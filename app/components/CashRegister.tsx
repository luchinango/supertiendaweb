'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CashRegisterProps {
  isOpen: boolean
  onClose: () => void
  status: string
  onStatusChange: (status: string) => void
}

export function CashRegister({ isOpen, onClose, status, onStatusChange }: CashRegisterProps) {
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para abrir o cerrar la caja
    onStatusChange(status === 'Cerrada' ? 'Abierta' : 'Cerrada')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{status === 'Cerrada' ? 'Abrir Caja' : 'Cerrar Caja'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto {status === 'Cerrada' ? 'Inicial' : 'Final'}
              </Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{status === 'Cerrada' ? 'Abrir Caja' : 'Cerrar Caja'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

