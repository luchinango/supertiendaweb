"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

interface SelectEmployeesModalProps {
  isOpen: boolean
  onClose: () => void
  selectedEmployees: string[]
  setSelectedEmployees: (employees: string[]) => void
}

export function SelectEmployeesModal({
  isOpen,
  onClose,
  selectedEmployees,
  setSelectedEmployees,
}: SelectEmployeesModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(selectedEmployees)

  // Sample employees data
  const employees = [
    { id: "1", name: "Jamil Abdul Estrada Cayara", role: "Administrador" },
    { id: "2", name: "Jamil Abdul Estrada Cayara", role: "Propietario" },
    { id: "3", name: "Luis", role: "Vendedor" },
    { id: "4", name: "Marisol", role: "Cajero" },
    { id: "5", name: "Melvy", role: "Vendedor" },
  ]

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleEmployee = (name: string) => {
    if (tempSelected.includes(name)) {
      setTempSelected(tempSelected.filter((e) => e !== name))
    } else {
      setTempSelected([...tempSelected, name])
    }
  }

  const handleConfirm = () => {
    setSelectedEmployees(tempSelected)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">Seleccionar empleados</h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={`employee-${employee.id}`}
              checked={tempSelected.includes(employee.name)}
              onCheckedChange={() => handleToggleEmployee(employee.name)}
            />
            <div className="flex flex-col">
              <label
                htmlFor={`employee-${employee.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {employee.name}
              </label>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <Button onClick={handleConfirm} className="w-full bg-gray-800 hover:bg-gray-700">
          Confirmar
        </Button>
      </div>
    </div>
  )
}