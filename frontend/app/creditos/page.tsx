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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "app/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/components/ui/tabs"
import { Search, Plus, Pencil } from 'lucide-react'
import { NewCreditDialog } from '../components/NewCreditDialog'
import { EditCreditDialog } from '../components/EditCreditDialog'
import { Credit as CreditType } from "app/types/credit"

import { Credit } from "app/types/credit";

// This is sample data. In a real application, this would come from an API or database.
const sampleCredits: Credit[] = [
  { id: 1, supplier: 'Proveedor A', amount: 1000, status: 'comision', dueDate: '2023-12-31' },
  { id: 2, supplier: 'Proveedor B', amount: 1500, status: 'concesion', dueDate: '2023-11-30' },
  { id: 3, supplier: 'Proveedor C', amount: 2000, status: 'pagado', paidDate: '2023-10-15' },
]

export default function Creditos() {
  const [credits, setCredits] = useState(sampleCredits)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [editingCredit, setEditingCredit] = useState<typeof sampleCredits[0] | null>(null)

  const filteredCredits = credits.filter(credit =>
    credit.supplier.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'todos' || credit.status === statusFilter)
  )

  const totalCommission = credits.filter(c => c.status === 'comision').reduce((sum, c) => sum + c.amount, 0)
  const totalConcession = credits.filter(c => c.status === 'concesion').reduce((sum, c) => sum + c.amount, 0)
  const totalPaid = credits.filter(c => c.status === 'pagado').reduce((sum, c) => sum + c.amount, 0)

  const handleAddCredit = (newCredit: Omit<typeof sampleCredits[0], 'id'>) => {
    const creditWithId: Credit = newCredit.status === 'pagado'
      ? {
          id: credits.length + 1,
          supplier: newCredit.supplier,
          amount: newCredit.amount,
          status: 'pagado',
          paidDate: newCredit.paidDate as string
        }
      : {
          id: credits.length + 1,
          supplier: newCredit.supplier,
          amount: newCredit.amount,
          status: newCredit.status as 'comision' | 'concesion',
          dueDate: newCredit.dueDate as string
        }
    setCredits([...credits, creditWithId])
  }

  const handleEditCredit = (updatedCredit: Credit) => {
    setCredits(credits.map(credit => 
      credit.id === updatedCredit.id ? updatedCredit : credit
    ))
    setEditingCredit(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Créditos a Proveedores</h1>
        <NewCreditDialog onAddCredit={handleAddCredit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total en Comisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Bs {totalCommission}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total en Concesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Bs {totalConcession}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">Bs {totalPaid}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar crédito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="comision">Comisión</SelectItem>
            <SelectItem value="concesion">Concesión</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="comision">Comisión</TabsTrigger>
          <TabsTrigger value="concesion">Concesión</TabsTrigger>
          <TabsTrigger value="pagado">Pagado</TabsTrigger>
        </TabsList>
        {['todos', 'comision', 'concesion', 'pagado'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>{tab === 'pagado' ? 'Fecha de Pago' : 'Fecha de Vencimiento'}</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredits
                  .filter(credit => tab === 'todos' || credit.status === tab)
                  .map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>{credit.supplier}</TableCell>
                      <TableCell>Bs {credit.amount}</TableCell>
                      <TableCell>{credit.status}</TableCell>
                      <TableCell>{credit.status === 'pagado' ? credit.paidDate : credit.dueDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCredit(credit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>

      {editingCredit && (
        <EditCreditDialog
          credit={editingCredit}
          onEditCredit={handleEditCredit}
          onClose={() => setEditingCredit(null)}
        />
      )}
    </div>
  )
}