"use client"

import { Button } from "@/components/ui/button"
import { X, FileText, BarChart2, FileSpreadsheet } from "lucide-react"

interface DownloadReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectReport: (reportType: string) => void
}

export function DownloadReportModal({ isOpen, onClose, onSelectReport }: DownloadReportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Descargar reporte</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-500 mb-6">Elige el tipo de reporte que quieres descargar.</p>

          <div className="space-y-3">
            <div
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectReport("balance")}
            >
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Reporte de balance</div>
                <div className="text-sm text-gray-500">Ingresos y egresos</div>
              </div>
              <svg
                className="ml-auto h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            <div
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectReport("debts")}
            >
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <BarChart2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">Reporte de deudas</div>
                <div className="text-sm text-gray-500">Por cobrar y por pagar</div>
              </div>
              <svg
                className="ml-auto h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            <div className="flex items-center p-4 border rounded-lg bg-gray-50 cursor-not-allowed">
              <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                <FileSpreadsheet className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium text-gray-700">Reporte de datáfono Treinta</div>
                <div className="text-sm text-gray-500">Ventas con datáfono</div>
              </div>
              <svg
                className="ml-auto h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
            No es posible descargar reporte si no hay transacciones de datáfono.
          </div>
        </div>
      </div>
    </div>
  )
}