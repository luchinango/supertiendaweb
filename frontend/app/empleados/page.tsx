"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {ChevronRight} from "lucide-react"
import {NewEmployeePanel} from "../../components/NewEmployeePanel"
import {EditEmployeePanel} from "../../components/EditEmployeePanel"
import {PermissionsDialog} from "../../components/PermissionsDialog"
import {useEmployees} from "../../hooks/useEmployees"
import EmployeeDto from "@/types/EmployeeDto";

export default function Empleados() {
  const {employees, isLoading, error, editEmployee, mutate} = useEmployees()
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null)
  const [showNewEmployee, setShowNewEmployee] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeDto | null>(null)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Propietario":
        return "bg-blue-100 text-blue-800"
      case "Administrador":
        return "bg-green-100 text-green-800"
      case "Vendedor":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditClick = (employee: EmployeeDto) => {
    setEditingEmployee(employee)
  }

  const handleNewEmployee = () => {
    setShowNewEmployee(true)
  }

  if (isLoading) {
    return <div className="p-4">Cargando empleados...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error cargando empleados.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center ">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <Button onClick={handleNewEmployee} className="bg-gray-900 hover:bg-gray-800 text-white ">
          + Crear empleado
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-gray-50">
          <div className="font-medium text-gray-600">Nombre del empleador</div>
          <div className="font-medium text-gray-600">Celular</div>
          <div className="font-medium text-gray-600">Rol</div>
          <div className="font-medium text-gray-600">Estado</div>
          <div className="font-medium text-gray-600">Acciones</div>
        </div>

        <div className="divide-y">
          {employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-5 gap-4 p-4 items-center">
              <div>{employee.first_name} {employee.last_name}</div>
              <div>{employee.mobile_phone}</div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    employee.position,
                  )}`}
                >
                  {employee.position}
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  {employee.status}
                </span>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleEditClick(employee)}
                >
                  Editar
                  <ChevronRight className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNewEmployee && (
        <NewEmployeePanel
          open={showNewEmployee}
          onOpenChange={setShowNewEmployee}
          onShowPermissions={(employee: EmployeeDto) => {
            setCurrentEmployee(employee)
            setShowPermissions(true)
          }}
        />
      )}

      {editingEmployee && (
        <EditEmployeePanel
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={() => setEditingEmployee(null)}
          onShowPermissions={(employee: EmployeeDto) => {
            setCurrentEmployee(employee)
            setShowPermissions(true)
          }}
        />
      )}

      {showPermissions && currentEmployee && (
        <PermissionsDialog open={showPermissions} onOpenChange={setShowPermissions} employee={currentEmployee}/>
      )}
    </div>
  )
}