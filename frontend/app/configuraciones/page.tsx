"use client"

import { useState } from "react"
import { Button } from "app/components/ui/button"
import { Input } from "app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "app/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "app/components/ui/accordion"
import { Label } from "app/components/ui/label"
import { Switch } from "app/components/ui/switch"
import { Card } from "app/components/ui/card"
import { Link2, Upload } from "lucide-react"
import { NewBusinessDialog } from "../components/NewBusinessDialog"

export default function Configuraciones() {
  const [businessType, setBusinessType] = useState("minimercado")
  const [businessName, setBusinessName] = useState("Todito")
  const [address, setAddress] = useState("Av. Hernando Siles 601")
  const [city, setCity] = useState("Sucre")
  const [phone, setPhone] = useState("63349336")
  const [email, setEmail] = useState("jamil2.estrada@gmail.com")
  const [document, setDocument] = useState("5676916019")
  const [logo, setLogo] = useState<string | null>(null)
  const [showNewBusiness, setShowNewBusiness] = useState(false)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
                      <div className="text-6xl font-bold text-gray-300">{businessName.charAt(0)}</div>
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
                  <Select value={businessType} onValueChange={setBusinessType}>
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
                  <Input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección del negocio</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad donde se ubica el negocio</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 ml-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <Input id="document" value={document} onChange={(e) => setDocument(e.target.value)} />
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
      <NewBusinessDialog open={showNewBusiness} onOpenChange={setShowNewBusiness} />
    </div>
  )
}