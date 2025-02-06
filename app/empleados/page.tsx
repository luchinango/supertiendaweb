'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Pencil } from 'lucide-react'
import { NewEmployeeDialog } from '../components/NewEmployeeDialog'
import { EditEmployeeDialog } from '../components/EditEmployeeDialog'

// Sample data for employees
const sampleEmployees = [
  { id: 1, name: 'Juan Pérez', position: 'Vendedor', salary: 3000, startDate: '2023-01-15' },
  { id: 2, name: 'María García', position: 'Cajera', salary: 2800, startDate: '2023-02-01' },
  { id: 3, name: 'Carlos Rodríguez', position: 'Gerente', salary: 5000, startDate: '2022-11-01' },
]

export default function Empleados() {
  const [employees, setEmployees] = useState(sampleEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<typeof sampleEmployees[0] | null>(null)

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddEmployee = (newEmployee: Omit<typeof sampleEmployees[0], 'id'>) => {
    setEmployees([...employees, { ...newEmployee, id: employees.length + 1 }])
  }

  const handleEditEmployee = (updatedEmployee: typeof sampleEmployees[0]) => {
    setEmployees(employees.map(employee => 
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    ))
    setEditingEmployee(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <NewEmployeeDialog onAddEmployee={handleAddEmployee} />
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Salario</TableHead>
            <TableHead>Fecha de Inicio</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>Bs {employee.salary.toLocaleString()}</TableCell>
              <TableCell>{new Date(employee.startDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingEmployee(employee)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          onEditEmployee={handleEditEmployee}
          onClose={() => setEditingEmployee(null)}
        />
      )}
    </div>
  )
}

