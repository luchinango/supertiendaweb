'use client'

import { useState } from 'react'
import { Button } from "app/components/ui/button"
import { Input } from "app/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "app/components/ui/table"
import { Search, Plus, Pencil, Eye, Trash2, UserPlus } from 'lucide-react'
import { NewEmployeeDialog } from '../components/NewEmployeeDialog'
import { EditEmployeeDialog } from '../components/EditEmployeeDialog'
import useSWR from "swr"
import EmployeeDto from '../types/EmployeeDto'
import { useEmployees } from "../hooks/useEmployees";
import toast from 'react-hot-toast';

export default function Empleados() {
  const { employees, error, isLoading, mutate , editEmployee } = useEmployees()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null);

  const filteredEmployees: EmployeeDto[] = employees.filter((employee: EmployeeDto) =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddEmployee = (newEmployee: EmployeeDto) => {
    mutate();
  }

  const handleSaveEdit = async (updatedEmployee: EmployeeDto) => {
    await editEmployee(updatedEmployee.id, updatedEmployee);
    setEditingEmployee(null);
  };

  const handleCreateUser = async (employee: EmployeeDto) => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee.id,
          email: `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@empresa.com`,
          initialPassword: 'TempPassword123',
          role: 'employee'
        })
      });
  
      if (!response.ok) throw new Error('Error al crear usuario');
      
      mutate(employees.map(emp => 
        emp.id === employee.id ? { ...emp, hasUser: true } : emp
      ));
  
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      toast.error('Error al crear usuario');
      console.error(error);
    }
  };


  const handleDelete = async (id: Number) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;
    
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      mutate(employees.filter(emp => emp.id !== id));
      toast.success('Empleado eliminado');
    } catch (error) {
      toast.error('Error al eliminar empleado');
      console.error(error);
    }
  };

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
              <TableCell>{employee.firstName}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>Bs {employee.salary}</TableCell>
              <TableCell>{new Date(employee.startDate).toLocaleDateString()}</TableCell>
              <TableCell className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setEditingEmployee(employee)}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCreateUser(employee)}
                  title="Crear usuario"
                  //</TableCell>disabled={employee.hasUser}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  //onClick={() => viewEmployeeDetails(employee.id)}
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(employee.id)}
                  title="Eliminar"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {
      editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          onSave={handleSaveEdit}
          onClose={() => setEditingEmployee(null)}
        />
      )
      }
    </div>
  )
}

