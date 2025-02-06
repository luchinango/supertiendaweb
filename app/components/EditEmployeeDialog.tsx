'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Employee {
  id: number
  name: string
  position: string
  salary: number
  startDate: string
}

interface EditEmployeeDialogProps {
  employee: Employee
  onEditEmployee: (employee: Employee) => void
  onClose: () => void
}

export function EditEmployeeDialog({ employee, onEditEmployee, onClose }: EditEmployeeDialogProps) {
  const [name, setName] = useState(employee.name)
  const [position, setPosition] = useState(employee.position)
  const [salary, setSalary] = useState(employee.salary.toString())
  const [startDate, setStartDate] = useState(employee.startDate)

  useEffect(() => {
    setName(employee.name)
    setPosition(employee.position)
    setSalary(employee.salary.toString())
    setStartDate(employee.startDate)
  }, [employee])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditEmployee({
      ...employee,
      name,
      position,
      salary: parseFloat(salary),
      startDate,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar empleado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre completo</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-position">Cargo</Label>
            <Input
              id="edit-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-salary">Salario</Label>
            <Input
              id="edit-salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-startDate">Fecha de inicio</Label>
            <Input
              id="edit-startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

