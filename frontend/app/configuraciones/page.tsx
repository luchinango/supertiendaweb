"use client"

import type React from "react"
import type { Business } from "../types/Business"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { PenLine } from "lucide-react"
import { NewBusinessDialog, type BusinessFormData } from "../components/NewBusinessDialog"
import { BusinessSwitcher } from "../components/BusinessSwitcher"

export default function Configuraciones() {
  const [businesses, setBusinesses] = useState<Business[]>([
    {
      id: "1",
      name: "Todito",
      type: "minimercado", // debe ser uno de los valores permitidos
      address: "Av. Hernando Siles 601",
      city: "Sucre",
      phone: "63349336",
      email: "jamil2.estrada@gmail.com",
      document: "5676916019",
    },
  ])

  const [currentBusinessId, setCurrentBusinessId] = useState<string>("1")
  const [showNewBusiness, setShowNewBusiness] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)

  const currentBusiness = businesses.find((b) => b.id === currentBusinessId) || businesses[0]

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
        // Update the current business with the new logo
        setBusinesses(
          businesses.map((business) =>
            business.id === currentBusinessId ? { ...business, logo: reader.result as string } : business,
          ),
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddBusiness = (formData: BusinessFormData) => {
    const newBusiness: Business = {
      id: (businesses.length + 1).toString(),
      ...formData,
      type: formData.type as "minimercado" | "supermercado" | "tienda",
    }
    setBusinesses([...businesses, newBusiness])
  }

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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {currentBusiness.logo ? (
                        <img
                          src={currentBusiness.logo || "/placeholder.svg"}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-5xl font-bold text-gray-300">{currentBusiness.name.charAt(0)}</div>
                      )}
                    </div>
                    <label
                      htmlFor="logo-upload"
                      className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90"
                    >
                      <PenLine className="h-4 w-4" />
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{currentBusiness.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentBusiness.type === "minimercado"
                        ? "Minimercado (1 caja registradora)"
                        : currentBusiness.type}
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <BusinessSwitcher
                    businesses={businesses}
                    currentBusiness={currentBusiness}
                    onBusinessChange={handleBusinessChange}
                    onAddBusiness={() => setShowNewBusiness(true)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-type">Tipo de negocio *</Label>
                  <Select value={currentBusiness.type} disabled>
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

                <div className="space-y-2">
                  <Label htmlFor="business-name">Nombre del negocio *</Label>
                  <Input id="business-name" value={currentBusiness.name} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección del negocio</Label>
                  <Input id="address" value={currentBusiness.address} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad donde se ubica el negocio</Label>
                  <Input id="city" value={currentBusiness.city} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Número de celular</Label>
                  <div className="flex">
                    <div className="flex items-center justify-center w-[100px] border border-input rounded-l-md bg-background px-3">
                      <div className="flex items-center gap-2">
                        <img src="/flag-bolivia.svg" alt="Bolivia" className="h-4 w-6" />
                        <span className="text-sm">+591</span>
                      </div>
                    </div>
                    <Input id="phone" value={currentBusiness.phone} readOnly className="flex-1 rounded-l-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={currentBusiness.email} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <Input id="document" value={currentBusiness.document} readOnly />
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

      <NewBusinessDialog open={showNewBusiness} onOpenChange={setShowNewBusiness} onSubmit={handleAddBusiness} />
    </div>
  )
}
