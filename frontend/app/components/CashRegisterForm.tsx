"use client"

import type React from "react"

import { useState } from "react"
import { X, Info, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCashRegister } from "../context/CashRegisterContext"

interface Employee {
  id: string
  name: string
}

const employees: Employee[] = [
  { id: "1", name: "Jamil Abdul" },
  { id: "2", name: "Jamil Estrada" },
  { id: "3", name: "Marisol" },
  { id: "4", name: "Luis" },
  { id: "5", name: "Melvy" },
]

export function CashRegisterForm() {
  const { isFormOpen, closeCashRegisterForm, openCashRegister } = useCashRegister()
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(employees[0])
  const [initialAmount, setInitialAmount] = useState("0")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    openCashRegister(selectedEmployee.id, Number.parseFloat(initialAmount) || 0)
  }

  if (!isFormOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={closeCashRegisterForm} />

      {/* Form panel */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl animate-slide-in-from-right">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Abrir caja</h2>
            <Button variant="ghost" size="icon" onClick={closeCashRegisterForm} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="employee">Empleado encargado</Label>
                <Info className="h-4 w-4 text-gray-400 ml-2" />
              </div>

              <div className="relative">
                <div
                  className="flex items-center justify-between p-2 border rounded-md cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{selectedEmployee.name}</span>
                  {isDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-2 cursor-pointer hover:bg-gray-100 ${
                          employee.id === selectedEmployee.id ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsDropdownOpen(false)
                        }}
                      >
                        {employee.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="amount">
                  ¿Con cuánto dinero empiezas el turno?
                  <span className="text-red-500 ml-1">*</span>
                </Label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">Bs</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
                Empezar turno
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}