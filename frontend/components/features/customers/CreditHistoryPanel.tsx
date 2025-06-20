"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CreditHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  creditId: number
  creditType: "supplier" | "client"
  entityName: string
  payments: Array<{
    id: number
    date: string
    amount: number
    method: string
  }>
}

export function CreditHistoryPanel({ isOpen, onClose, creditType, entityName, payments }: CreditHistoryPanelProps) {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "efectivo":
        return "Efectivo"
      case "qr":
        return "QR"
      case "transferencia":
        return "Transferencia bancaria"
      default:
        return "Otro"
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/15 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Historial de Pagos</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">{creditType === "supplier" ? "Proveedor" : "Cliente"}</p>
            <p className="font-medium">{entityName}</p>
            <p className="text-sm text-gray-500 mt-2">Total pagado</p>
            <p className="font-medium">Bs {totalPaid}</p>
          </div>

          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>Bs {payment.amount}</TableCell>
                    <TableCell>{getMethodLabel(payment.method)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No hay pagos registrados</div>
          )}

          <div className="mt-6">
            <Button onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}