"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, X } from "lucide-react"
import type {Employee} from "@/types/Employee"

interface EditEmployeePanelProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowPermissions: (employee: Employee) => void
}

export function EditEmployeePanel({ employee, open, onOpenChange, onShowPermissions }: EditEmployeePanelProps) {
  const [firstName, setFirstName] = useState(employee.firstName ?? employee.first_name ?? "")
  const [lastName, setLastName] = useState(employee.lastName ?? employee.last_name ?? "")
  const [phone, setPhone] = useState((employee.phone ?? employee.mobile_phone ?? "").replace("+591", ""))
  const [email, setEmail] = useState(employee.email ?? "")
  const [address, setAddress] = useState(employee.address ?? "")
  const [salary, setSalary] = useState<number>(Number(employee.salary) || 0)
  const [position, setPosition] = useState(employee.position ?? "")
  const [status, setStatus] = useState(employee.status ?? "")
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName ?? employee.first_name ?? "")
      setLastName(employee.lastName ?? employee.last_name ?? "")
      setPhone((employee.phone ?? employee.mobile_phone ?? "").replace("+591", ""))
      setEmail(employee.email ?? "")
      setAddress(employee.address ?? "")
      setSalary(Number(employee.salary) || 0)
      setPosition(employee.position ?? "")
      setStatus(employee.status ?? "")
    }
  }, [employee])

  const handleSubmit = () => {
    const updatedEmployee: Employee = {
      ...employee,
      first_name: firstName,
      last_name: lastName,
      phone: `+591${phone}`,
      email: email,
      address,
      salary,
      position,
      status,
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
          {/* Nombre */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              className="w-full"
            />
          </div>
          {/* Apellido */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              className="w-full"
            />
          </div>
          {/* Celular */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Número celular <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2 h-10 rounded-r-none border-r-0">
                  <img src="/images/flag-bolivia.svg" alt="Bolivia" className="w-5 h-3" />
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
          </div>
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full"
            />
          </div>
          {/* Dirección */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección"
              className="w-full"
            />
          </div>
          {/* Salario */}
          <div className="space-y-2">
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
              Salario
            </label>
            <Input
              id="salary"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              placeholder="Salario"
              className="w-full"
            />
          </div>
          {/* Cargo */}
          <div className="space-y-2">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Cargo
            </label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Cargo"
              className="w-full"
            />
          </div>
          {/* Rol */}
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
                {position}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPosition("Propietario")
                      setShowRoleDropdown(false)
                    }}
                  >
                    Propietario
                  </div>
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPosition("Administrador")
                      setShowRoleDropdown(false)
                    }}
                  >
                    Administrador
                  </div>
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPosition("Vendedor")
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
            disabled={!firstName || !lastName || !phone || phone.length < 8}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </>
  )
}