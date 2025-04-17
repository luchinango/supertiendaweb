"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"

// Importamos la interfaz que ya creaste en NewBusinessDialog
import { NewBusinessDialog, BusinessFormData } from "../components/NewBusinessDialog"
// Si usas un BusinessSwitcher, impórtalo también:
import { BusinessSwitcher } from "../components/BusinessSwitcher"
import { Business } from "../types"

export default function Configuraciones() {
  // Ejemplo de lista de negocios con uno por defecto
  const [businesses, setBusinesses] = useState<Business[]>([{
    id: "1",
    name: "Todito",
    type: "minimercado",
    address: "Av. Hernando Siles 601",
    city: "Sucre",
    phone: "63349336",
    email: "jamil2.estrada@gmail.com",
    document: "5676916019",
  }])

  // Si quieres un selector (o switcher) de negocios actual:
  const [currentBusinessId, setCurrentBusinessId] = useState("1")

  const currentBusiness = businesses.find(b => b.id === currentBusinessId) || businesses[0]

  const [showNewBusiness, setShowNewBusiness] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
        // Actualiza el negocio actual con el nuevo logo
        setBusinesses(businesses.map(b =>
          b.id === currentBusinessId ? { ...b, logo: reader.result as string } : b
        ))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddBusiness = (formData: BusinessFormData) => {
    // Asegúrate de que formData tenga todos los campos (type, address, phone, etc)
    const newBusiness: Business = {
      id: (businesses.length + 1).toString(),
      ...formData,
    }
    setBusinesses([...businesses, newBusiness])
  }

  // Método para cambiar de negocio si tienes un BusinessSwitcher
  const handleBusinessChange = (business: Business) => {
    setCurrentBusinessId(business.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuraciones</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="impresion">Impresión</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-6">
              <div className="flex justify-center items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {logo ? (
                      <img src={logo || "/placeholder.svg"} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl font-bold text-gray-300">{currentBusiness.name.charAt(0)}</div>
                    )}
                  </div>
                  <label
                    htmlFor="logo-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
                <Button variant="outline" onClick={() => setShowNewBusiness(true)} className="h-10">
                  Agregar otro negocio
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-type">Tipo de negocio *</Label>
                  <Select value={currentBusiness.type} onValueChange={(value) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, type: value } : b))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de negocio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimercado">Minimercado (1 caja registradora)</SelectItem>
                      <SelectItem value="supermercado">Supermercado (múltiples cajas)</SelectItem>
                      <SelectItem value="tienda">Tienda de barrio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-auto">
                  <BusinessSwitcher
                    businesses={businesses}
                    currentBusiness={currentBusiness}
                    onBusinessChange={handleBusinessChange}
                    onAddBusiness={() => setShowNewBusiness(true)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-name">Nombre del negocio *</Label>
                  <Input id="business-name" value={currentBusiness.name} onChange={(e) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, name: e.target.value } : b))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección del negocio</Label>
                  <Input id="address" value={currentBusiness.address} onChange={(e) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, address: e.target.value } : b))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad donde se ubica el negocio</Label>
                  <Input id="city" value={currentBusiness.city} onChange={(e) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, city: e.target.value } : b))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Número de celular</Label>
                  <div className="flex">
                    <Select defaultValue="591">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Código" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="591">+591</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      value={currentBusiness.phone}
                      onChange={(e) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, phone: e.target.value } : b))}
                      className="flex-1 ml-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={currentBusiness.email} onChange={(e) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, email: e.target.value } : b))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <Input id="document" value={currentBusiness.document} onChange={(e) => setBusinesses(businesses.map(b => b.id === currentBusinessId ? { ...b, document: e.target.value } : b))} />
                </div>
              </div>

              <Button className="w-full md:w-auto md:ml-auto">Guardar cambios</Button>
            </div>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="impuestos">
              <AccordionTrigger>Impuestos</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IVA</Label>
                      <p className="text-sm text-muted-foreground">Impuesto al Valor Agregado (13%)</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IT</Label>
                      <p className="text-sm text-muted-foreground">Impuesto a las Transacciones (3%)</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="recordatorios">
              <AccordionTrigger>Recordatorios</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Productos por vencer</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar cuando los productos estén próximos a vencer
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stock bajo</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar cuando el stock esté por debajo del mínimo
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="configuraciones-adicionales">
              <AccordionTrigger>Configuraciones adicionales</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modo oscuro</Label>
                      <p className="text-sm text-muted-foreground">Cambiar la apariencia de la aplicación</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones por correo</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones por correo electrónico</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="impresion" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Configuración de impresión</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Imprimir logo en facturas</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir el logo del negocio en las facturas impresas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Imprimir código QR</Label>
                    <p className="text-sm text-muted-foreground">Incluir código QR en las facturas para verificación</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Imprimir copia de respaldo</Label>
                    <p className="text-sm text-muted-foreground">Imprimir una copia adicional para registros</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <NewBusinessDialog
        open={showNewBusiness}
        onOpenChange={setShowNewBusiness}
        onSubmit={handleAddBusiness}
      />
    </div>
  )
}