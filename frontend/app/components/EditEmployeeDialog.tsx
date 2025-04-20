'use client'

import { useState } from 'react'
import { Button } from "app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog"
import { Input } from "app/components/ui/input"
import { Label } from "app/components/ui/label"
import EmployeeDto from '../types/EmployeeDto'

interface EditEmployeeDialogProps {
  employee: EmployeeDto
  onSave: (updated: EmployeeDto) => void;
  onClose: () => void;
}

export function EditEmployeeDialog({ employee, onSave, onClose }: EditEmployeeDialogProps) {
  const [formData, setFormData] = useState<EmployeeDto>({ ...employee });
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar empleado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-firstName">Nombres</Label>
            <Input
              id="edit-firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-lastName">Apellidos</Label>
            <Input
              id="edit-lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-position">Cargo</Label>
            <Input
              id="edit-position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-salary">Salario</Label>
            <Input
              id="edit-salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-startDate">Fecha de inicio</Label>
            <Input
              id="edit-startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
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
