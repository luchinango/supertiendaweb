"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Pencil, Calendar, ArrowRight } from "lucide-react"
import { NewCreditDialog } from "../components/NewCreditDialog"
import { EditCreditDialog } from "../components/EditCreditDialog"
import { NewClientCreditPanel } from "../components/NewClientCreditPanel"
import { EditClientCreditPanel } from "../components/EditClientCreditPanel"
import { RegisterPaymentPanel } from "../components/RegisterPaymentPanel"
import { CreditHistoryPanel } from "../components/CreditHistoryPanel"

// Tipos estrictos para créditos a proveedores y clientes
type SupplierCreditStatus = "comision" | "concesion" | "pagado"
type SupplierCredit = {
  id: number
  supplier: string
  amount: number
  status: SupplierCreditStatus
  dueDate?: string
  paidDate?: string
  payments: {
    id: number
    date: string
    amount: number
    method: string
  }[]
}

type ClientCreditStatus = "pendiente" | "pagado"
type ClientCredit = {
  id: number
  client: string
  totalAmount: number
  remainingAmount: number
  status: ClientCreditStatus
  startDate: string
  payments: {
    id: number
    date: string
    amount: number
    method: string
  }[]
}

// Datos de ejemplo para créditos a proveedores
const sampleSupplierCredits: SupplierCredit[] = [
  { id: 1, supplier: "Proveedor A", amount: 1000, status: "comision", dueDate: "2023-12-31", payments: [] },
  { id: 2, supplier: "Proveedor B", amount: 1500, status: "concesion", dueDate: "2023-11-30", payments: [] },
  {
    id: 3,
    supplier: "Proveedor C",
    amount: 2000,
    status: "pagado",
    paidDate: "2023-10-15",
    payments: [{ id: 1, date: "2023-10-15", amount: 2000, method: "efectivo" }],
  },
]

// Datos de ejemplo para créditos de clientes
const sampleClientCredits: ClientCredit[] = [
  {
    id: 1,
    client: "Juan Pérez",
    totalAmount: 800,
    remainingAmount: 300,
    status: "pendiente",
    startDate: "2023-09-15",
    payments: [
      { id: 1, date: "2023-09-20", amount: 200, method: "efectivo" },
      { id: 2, date: "2023-10-05", amount: 300, method: "qr" },
    ],
  },
  {
    id: 2,
    client: "María López",
    totalAmount: 1200,
    remainingAmount: 0,
    status: "pagado",
    startDate: "2023-08-10",
    payments: [
      { id: 1, date: "2023-08-15", amount: 500, method: "transferencia" },
      { id: 2, date: "2023-09-01", amount: 700, method: "efectivo" },
    ],
  },
  {
    id: 3,
    client: "Carlos Rodríguez",
    totalAmount: 1500,
    remainingAmount: 1500,
    status: "pendiente",
    startDate: "2023-10-01",
    payments: [],
  },
]

export default function Creditos() {
  // Estados para créditos a proveedores
  const [supplierCredits, setSupplierCredits] = useState<SupplierCredit[]>(sampleSupplierCredits)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [supplierStatusFilter, setSupplierStatusFilter] = useState<"todos" | SupplierCreditStatus>("todos")
  const [editingSupplierCredit, setEditingSupplierCredit] = useState<SupplierCredit | null>(null)

  // Estados para créditos de clientes
  const [clientCredits, setClientCredits] = useState<ClientCredit[]>(sampleClientCredits)
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [clientStatusFilter, setClientStatusFilter] = useState<"todos" | ClientCreditStatus>("todos")
  const [clientPaymentMethodFilter, setClientPaymentMethodFilter] = useState("todos")

  // Estados para paneles deslizantes
  const [isNewClientCreditOpen, setIsNewClientCreditOpen] = useState(false)
  const [editingClientCredit, setEditingClientCredit] = useState<ClientCredit | null>(null)
  const [registeringPayment, setRegisteringPayment] = useState<{
    creditId: number
    creditType: "supplier" | "client"
    currentAmount: number
    entityName: string
  } | null>(null)
  const [viewingHistory, setViewingHistory] = useState<{
    creditId: number
    creditType: "supplier" | "client"
    entityName: string
    payments: {
      id: number
      date: string
      amount: number
      method: string
    }[]
  } | null>(null)

  // Filtrado de créditos a proveedores
  const filteredSupplierCredits = supplierCredits.filter(
    (credit) =>
      (credit.supplier.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        credit.amount.toString().includes(supplierSearchTerm)) &&
      (supplierStatusFilter === "todos" || credit.status === supplierStatusFilter),
  )

  // Filtrado de créditos de clientes
  const filteredClientCredits = clientCredits.filter(
    (credit) =>
      (credit.client.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        credit.totalAmount.toString().includes(clientSearchTerm)) &&
      (clientStatusFilter === "todos" || credit.status === clientStatusFilter),
  )

  // Cálculos para créditos a proveedores
  const totalCommission = supplierCredits.filter((c) => c.status === "comision").reduce((sum, c) => sum + c.amount, 0)
  const totalConcession = supplierCredits.filter((c) => c.status === "concesion").reduce((sum, c) => sum + c.amount, 0)
  const totalPaidSupplier = supplierCredits.filter((c) => c.status === "pagado").reduce((sum, c) => sum + c.amount, 0)

  // Cálculos para créditos de clientes
  const totalClientCredits = clientCredits.reduce((sum, c) => sum + c.totalAmount, 0)
  const totalPendingClientCredits = clientCredits.reduce((sum, c) => sum + c.remainingAmount, 0)
  const totalPaidClientCredits = clientCredits.reduce((sum, c) => sum + (c.totalAmount - c.remainingAmount), 0)

  // Funciones para créditos a proveedores
  const handleAddSupplierCredit = (newCredit: Omit<SupplierCredit, "id" | "payments" | "paidDate">) => {
    setSupplierCredits([
      ...supplierCredits,
      { ...newCredit, id: supplierCredits.length + 1, payments: [] },
    ])
  }

  const handleEditSupplierCredit = (updatedCredit: SupplierCredit) => {
    setSupplierCredits(supplierCredits.map((credit) => (credit.id === updatedCredit.id ? updatedCredit : credit)))
    setEditingSupplierCredit(null)
  }

  // Funciones para créditos de clientes
  const handleAddClientCredit = (newCredit: Omit<ClientCredit, "id" | "payments">) => {
    setClientCredits([
      ...clientCredits,
      { ...newCredit, id: clientCredits.length + 1, payments: [] },
    ])
    setIsNewClientCreditOpen(false)
  }

  const handleEditClientCredit = (updatedCredit: ClientCredit) => {
    setClientCredits(clientCredits.map((credit) => (credit.id === updatedCredit.id ? updatedCredit : credit)))
    setEditingClientCredit(null)
  }

  // Función para registrar un pago
  const handleRegisterPayment = (
    creditId: number,
    creditType: "supplier" | "client",
    payment: { date: string; amount: number; method: string },
  ) => {
    if (creditType === "supplier") {
      setSupplierCredits(
        supplierCredits.map((credit) => {
          if (credit.id === creditId) {
            const newPayments = [...(credit.payments || []), { id: (credit.payments?.length || 0) + 1, ...payment }]
            const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0)
            return {
              ...credit,
              payments: newPayments,
              status: totalPaid >= credit.amount ? "pagado" : credit.status,
              paidDate: totalPaid >= credit.amount ? payment.date : undefined,
            }
          }
          return credit
        }),
      )
    } else {
      setClientCredits(
        clientCredits.map((credit) => {
          if (credit.id === creditId) {
            const newPayments = [...(credit.payments || []), { id: (credit.payments?.length || 0) + 1, ...payment }]
            const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0)
            const remaining = Math.max(0, credit.totalAmount - totalPaid)
            return {
              ...credit,
              payments: newPayments,
              remainingAmount: remaining,
              status: remaining === 0 ? "pagado" : "pendiente",
            }
          }
          return credit
        }),
      )
    }
    setRegisteringPayment(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="suppliers" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Créditos</h1>
          <TabsList>
            <TabsTrigger
              value="suppliers"
              className="data-[state=active]:bg-black data-[state=active]:text-white bg-white text-black border border-gray-300 data-[state=active]:border-black"
            >
              Proveedores
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-black data-[state=active]:text-white bg-white text-black border border-gray-300 data-[state=active]:border-black"
            >
              Clientes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenido de Créditos a Proveedores */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Créditos a Proveedores</h2>
            <Button className="gap-2 bg-black text-white hover:bg-gray-900">
              <Plus className="h-4 w-4" />
              Nuevo crédito de proveedor
            </Button>
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
                <div className="text-2xl font-bold text-gray-600">Bs {totalPaidSupplier}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar crédito..."
                value={supplierSearchTerm}
                onChange={(e) => setSupplierSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={supplierStatusFilter} onValueChange={v => setSupplierStatusFilter(v as "todos" | SupplierCreditStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="comision">Comisión</SelectItem>
                <SelectItem value="concesion">Concesión</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="todos" className="w-full">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="comision">Comisión</TabsTrigger>
              <TabsTrigger value="concesion">Concesión</TabsTrigger>
              <TabsTrigger value="pagado">Pagado</TabsTrigger>
            </TabsList>
            {["todos", "comision", "concesion", "pagado"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>{tab === "pagado" ? "Fecha de Pago" : "Fecha de Vencimiento"}</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupplierCredits
                      .filter((credit) => tab === "todos" || credit.status === tab)
                      .map((credit) => (
                        <TableRow key={credit.id}>
                          <TableCell>{credit.supplier}</TableCell>
                          <TableCell>Bs {credit.amount}</TableCell>
                          <TableCell>{credit.status}</TableCell>
                          <TableCell>{credit.status === "pagado" ? credit.paidDate : credit.dueDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingSupplierCredit(credit)}
                                title="Editar crédito"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setRegisteringPayment({
                                    creditId: credit.id,
                                    creditType: "supplier",
                                    currentAmount: credit.amount,
                                    entityName: credit.supplier,
                                  })
                                }
                                title="Registrar pago"
                                disabled={credit.status === "pagado"}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setViewingHistory({
                                    creditId: credit.id,
                                    creditType: "supplier",
                                    entityName: credit.supplier,
                                    payments: credit.payments || [],
                                  })
                                }
                                title="Ver historial de pagos"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Contenido de Créditos de Clientes */}
        <TabsContent value="clients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Créditos a Clientes</h2>
            <Button
              className="gap-2 bg-black text-white hover:bg-gray-900"
              onClick={() => setIsNewClientCreditOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nuevo crédito para cliente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Total en Créditos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Bs {totalClientCredits}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">Bs {totalPendingClientCredits}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Bs {totalPaidClientCredits}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar crédito..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={clientStatusFilter} onValueChange={v => setClientStatusFilter(v as "todos" | ClientCreditStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientPaymentMethodFilter} onValueChange={setClientPaymentMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por método" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="todos" className="w-full">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="pagado">Pagados</TabsTrigger>
            </TabsList>
            {["todos", "pendiente", "pagado"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Monto Pendiente</TableHead>
                      <TableHead>Fecha de Inicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientCredits
                      .filter((credit) => tab === "todos" || credit.status === tab)
                      .map((credit) => (
                        <TableRow key={credit.id}>
                          <TableCell>{credit.client}</TableCell>
                          <TableCell>Bs {credit.totalAmount}</TableCell>
                          <TableCell>Bs {credit.remainingAmount}</TableCell>
                          <TableCell>{credit.startDate}</TableCell>
                          <TableCell>{credit.status === "pagado" ? "Pagado" : "Pendiente"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingClientCredit(credit)}
                                title="Editar crédito"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setRegisteringPayment({
                                    creditId: credit.id,
                                    creditType: "client",
                                    currentAmount: credit.remainingAmount,
                                    entityName: credit.client,
                                  })
                                }
                                title="Registrar pago"
                                disabled={credit.status === "pagado"}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setViewingHistory({
                                    creditId: credit.id,
                                    creditType: "client",
                                    entityName: credit.client,
                                    payments: credit.payments || [],
                                  })
                                }
                                title="Ver historial de pagos"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Diálogos y paneles */}
      {editingSupplierCredit && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
            onClick={() => setEditingSupplierCredit(null)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 animate-slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Editar crédito de proveedor</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingSupplierCredit(null)}>
                <span className="sr-only">Cerrar</span>
                ×
              </Button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
              <EditCreditDialog
                credit={editingSupplierCredit}
                onEditCredit={(credit) => handleEditSupplierCredit(credit as SupplierCredit)}
                onClose={() => setEditingSupplierCredit(null)}
              />
            </div>
          </div>
        </>
      )}

      {/* Panel para nuevo crédito de cliente */}
      <NewClientCreditPanel
        isOpen={isNewClientCreditOpen}
        onClose={() => setIsNewClientCreditOpen(false)}
        onAddCredit={handleAddClientCredit}
      />

      {/* Panel para editar crédito de cliente */}
      {editingClientCredit && (
        <EditClientCreditPanel
          credit={editingClientCredit}
          isOpen={!!editingClientCredit}
          onClose={() => setEditingClientCredit(null)}
          onEditCredit={handleEditClientCredit}
        />
      )}

      {/* Panel para registrar pago */}
      {registeringPayment && (
        <RegisterPaymentPanel
          isOpen={!!registeringPayment}
          onClose={() => setRegisteringPayment(null)}
          creditId={registeringPayment.creditId}
          creditType={registeringPayment.creditType}
          currentAmount={registeringPayment.currentAmount}
          entityName={registeringPayment.entityName}
          onRegisterPayment={handleRegisterPayment}
        />
      )}

      {/* Panel para ver historial de pagos */}
      {viewingHistory && (
        <CreditHistoryPanel
          isOpen={!!viewingHistory}
          onClose={() => setViewingHistory(null)}
          creditId={viewingHistory.creditId}
          creditType={viewingHistory.creditType}
          entityName={viewingHistory.entityName}
          payments={viewingHistory.payments}
        />
      )}
    </div>
  )
}