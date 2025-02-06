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
import { NewSupplierDialog } from '../components/NewSupplierDialog'
import { EditSupplierDialog } from '../components/EditSupplierDialog'

// This is sample data. In a real application, this would come from an API or database.
const sampleSuppliers = [
  { id: 1, name: 'Proveedor A', contact: 'Juan Pérez', phone: '123-456-7890', email: 'juan@proveedora.com' },
  { id: 2, name: 'Proveedor B', contact: 'María García', phone: '098-765-4321', email: 'maria@proveedorb.com' },
  { id: 3, name: 'Proveedor C', contact: 'Carlos López', phone: '555-123-4567', email: 'carlos@proveedorc.com' },
]

export default function Proveedores() {
  const [suppliers, setSuppliers] = useState(sampleSuppliers)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingSupplier, setEditingSupplier] = useState<typeof sampleSuppliers[0] | null>(null)

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddSupplier = (newSupplier: Omit<typeof sampleSuppliers[0], 'id'>) => {
    setSuppliers([...suppliers, { ...newSupplier, id: suppliers.length + 1 }])
  }

  const handleEditSupplier = (updatedSupplier: typeof sampleSuppliers[0]) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.id === updatedSupplier.id ? updatedSupplier : supplier
    ))
    setEditingSupplier(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <NewSupplierDialog onAddSupplier={handleAddSupplier} />
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedor..."
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
            <TableHead>Contacto</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSuppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.contact}</TableCell>
              <TableCell>{supplier.phone}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingSupplier(supplier)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingSupplier && (
        <EditSupplierDialog
          supplier={editingSupplier}
          onEditSupplier={handleEditSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      )}
    </div>
  )
}

