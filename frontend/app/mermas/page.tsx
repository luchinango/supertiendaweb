"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Plus, AlertTriangle, Ban, PackageX } from "lucide-react"
import { RegisterLossPanel } from "../components/RegisterLossPanel"
import { DownloadReportPanel } from "../components/DownloadReportPanel"

interface ProductLoss {
  id: number
  producto: string
  cantidad: number
  tipo: "vencido" | "dañado" | "perdido"
  fecha: string
  valor: number
  responsable: string
}

const sampleLosses: ProductLoss[] = [
  {
    id: 1,
    producto: "ACT II Pipoca Man-tequilla 91g",
    cantidad: 3,
    tipo: "vencido",
    fecha: "2024-01-20",
    valor: 42,
    responsable: "Juan Pérez",
  },
  {
    id: 2,
    producto: "Aguai Azucar Blanca de 1kg",
    cantidad: 2,
    tipo: "dañado",
    fecha: "2024-01-19",
    valor: 14,
    responsable: "María García",
  },
  {
    id: 3,
    producto: "Ajinomen Sopa Instantanea",
    cantidad: 5,
    tipo: "perdido",
    fecha: "2024-01-18",
    valor: 25,
    responsable: "Carlos López",
  },
]

export default function Mermas() {
  const [losses, setLosses] = useState<ProductLoss[]>(sampleLosses)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("todos")
  const [showRegisterLoss, setShowRegisterLoss] = useState(false)
  const [showDownloadReport, setShowDownloadReport] = useState(false)

  const filteredLosses = losses.filter(
    (loss) =>
      (loss.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loss.responsable.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "todos" || loss.tipo === filterType),
  )

  const totalLosses = losses.reduce((sum, loss) => sum + loss.valor, 0)
  const expiredLosses = losses.filter((loss) => loss.tipo === "vencido").reduce((sum, loss) => sum + loss.valor, 0)
  const damagedLosses = losses.filter((loss) => loss.tipo === "dañado").reduce((sum, loss) => sum + loss.valor, 0)
  const lostLosses = losses.filter((loss) => loss.tipo === "perdido").reduce((sum, loss) => sum + loss.valor, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mermas</h1>
        <Button
          onClick={() => setShowRegisterLoss(true)}
          className="gap-2 bg-black text-white hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" />
          Registrar merma
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mermas</CardTitle>
            <PackageX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Bs {totalLosses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Bs {expiredLosses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Dañados</CardTitle>
            <Ban className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Bs {damagedLosses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Perdidos</CardTitle>
            <PackageX className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">Bs {lostLosses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
            <SelectItem value="dañado">Dañados</SelectItem>
            <SelectItem value="perdido">Perdidos</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowDownloadReport(true)}
        >
          <Download className="h-4 w-4" />
          Descargar reporte
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Responsable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLosses.map((loss) => (
            <TableRow key={loss.id}>
              <TableCell>{loss.producto}</TableCell>
              <TableCell>{loss.cantidad}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    loss.tipo === "vencido"
                      ? "bg-yellow-100 text-yellow-700"
                      : loss.tipo === "dañado"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {loss.tipo === "vencido" && <AlertTriangle className="h-3 w-3" />}
                  {loss.tipo === "dañado" && <Ban className="h-3 w-3" />}
                  {loss.tipo === "perdido" && <PackageX className="h-3 w-3" />}
                  {loss.tipo.charAt(0).toUpperCase() + loss.tipo.slice(1)}
                </span>
              </TableCell>
              <TableCell>{new Date(loss.fecha).toLocaleDateString()}</TableCell>
              <TableCell>Bs {loss.valor}</TableCell>
              <TableCell>{loss.responsable}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RegisterLossPanel
        open={showRegisterLoss}
        onOpenChange={setShowRegisterLoss}
        onRegister={(newLoss) => {
          setLosses([...losses, { id: losses.length + 1, ...newLoss }])
        }}
      />

      <DownloadReportPanel open={showDownloadReport} onOpenChange={setShowDownloadReport} type="mermas" />
    </div>
  )
}