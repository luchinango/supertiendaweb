"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

export interface DownloadReportPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReport?: (reportType: string) => void;
}

export function DownloadReportPanel({ open, onOpenChange }: DownloadReportPanelProps) {
  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-modal={open}
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/15 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold">Reporte de inventario</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-3 py-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-red-500"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M9 17h6" />
                  <path d="M9 13h6" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">Descargar reporte de inventario en PDF</div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3 py-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-green-600"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M8 13h2" />
                  <path d="M8 17h2" />
                  <path d="M14 13h2" />
                  <path d="M14 17h2" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">Descargar reporte de inventario en Excel</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SafeNumber({ value }: { value: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return <>{mounted ? value.toLocaleString("es-BO") : value}</>
}