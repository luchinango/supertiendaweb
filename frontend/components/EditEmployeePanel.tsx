"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, X } from "lucide-react"

import EmployeeDto from "@/types/EmployeeDto";

interface EditEmployeePanelProps {
  employee: EmployeeDto
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowPermissions: (employee: EmployeeDto) => void
}

export function EditEmployeePanel({ employee, open, onOpenChange, onShowPermissions }: EditEmployeePanelProps) {
  const [first_name, setFirstName] = useState(employee.first_name)
  const [phone, setPhone] = useState(employee.mobile_phone.replace("+591", ""))
  const [role, setRole] = useState(employee.position)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  useEffect(() => {
    if (employee) {
      setFirstName(employee.first_name)
      setPhone(employee.mobile_phone.replace("+591", ""))
      setRole(employee.position)
    }
  }, [employee])

  const handleSubmit = () => {
    const updatedEmployee: EmployeeDto = {
      ...employee,
      first_name,
      mobile_phone: `+591${phone}`,
      position: role,
    }
    onShowPermissions(updatedEmployee)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => onOpenChange(false)} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-lg z-50 flex flex-col">
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
          <h2 className="text-lg font-medium">Editar empleado</h2>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Escribe el nombre de tu empleado"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Número celular de tu empleado <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2 h-10 rounded-r-none border-r-0">
                  <img src="/flag-bolivia.svg" alt="Bolivia" className="w-5 h-3" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="76543212"
                className="rounded-l-none flex-1"
              />
            </div>
            <p className="text-xs text-red-500">El número debe tener mínimo 8 caracteres</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                {role}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRole("Propietario")
                      setShowRoleDropdown(false)
                    }}
                  >
                    Propietario
                  </div>
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRole("Administrador")
                      setShowRoleDropdown(false)
                    }}
                  >
                    Administrador
                  </div>
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRole("Vendedor")
                      setShowRoleDropdown(false)
                    }}
                  >
                    Vendedor
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button
            className="w-full bg-gray-900 hover:bg-gray-800"
            onClick={handleSubmit}
            disabled={!first_name || !phone || phone.length < 8}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </>
  )
}