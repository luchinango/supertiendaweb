"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type {Transaction} from "@/types/Transaction"

interface EditSalePanelProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
  onSave?: (updatedTransaction: Transaction) => void
}

export function EditSalePanel({ isOpen, onClose, transaction, onSave }: EditSalePanelProps) {
  const [editedTransaction, setEditedTransaction] = useState<Transaction>(transaction)

  useEffect(() => {
    setEditedTransaction(transaction)
  }, [transaction])

  const handleSave = () => {
    onSave?.(editedTransaction)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 h-full overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button onClick={onClose} className="mr-2">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Editar Venta</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              type="number"
              value={editedTransaction.total}
              onChange={(e) => setEditedTransaction({
                ...editedTransaction,
                total: Number(e.target.value)
              })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              value={editedTransaction.notes || ""}
              onChange={(e) => setEditedTransaction({
                ...editedTransaction,
                notes: e.target.value
              })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}