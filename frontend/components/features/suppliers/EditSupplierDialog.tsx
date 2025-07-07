"use client"
import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {Supplier} from "@/types/types"
import apiClient from "@/lib/api-client"

export interface EditSupplierDialogProps {
  supplierId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (updatedSupplier: Supplier) => void
}

export function EditSupplierDialog({
  supplierId,
  open,
  onOpenChange,
  onEdit,
}: EditSupplierDialogProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Dialog open:", open, "supplierId:", supplierId)
    if (!open || !supplierId) return

    setLoading(true)
    setError(null)
    apiClient.get(`/suppliers/${supplierId}`)
      .then((response: any) => {
        // El proveedor está en response.data.data
        const supplierData = response.data?.data
        if (supplierData && supplierData.id) {
          setSupplier(supplierData)
        } else {
          setError("No se encontraron datos para el proveedor.")
        }
        setLoading(false)
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || err.message || 'Error loading supplier')
        setLoading(false)
      })
  }, [open, supplierId])

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    if (!supplier) return
    const { name, value } = e.target
    setSupplier({ ...supplier, [name]: value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supplier) return
    setError(null)
    try {
      // Obtén token y businessId del localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
      const businessId = typeof window !== "undefined" ? (localStorage.getItem("businessId") || "1") : "1"
      await apiClient.put(
        `/suppliers/${supplierId}?businessId=${businessId}`,
        {
          code: supplier.code?.trim(),
          name: supplier.name?.trim(),
          documentType: supplier.documentType || "NIT",
          documentNumber: supplier.documentNumber?.trim(),
          contactPerson: supplier.contactPerson?.trim(),
          email: supplier.email?.trim(),
          phone: supplier.phone?.trim(),
          address: supplier.address?.trim(),
          city: supplier.city?.trim(),
          department: supplier.department || "LA_PAZ",
          country: supplier.country?.trim(),
          postalCode: supplier.postalCode?.trim(),
          paymentTerms: Number(supplier.paymentTerms) || 0,
          creditLimit: Number(supplier.creditLimit) || 0,
          status: supplier.status || "ACTIVE",
          notes: supplier.notes?.trim() || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      onOpenChange(false)
      onEdit?.(supplier)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error updating supplier')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white p-6 rounded-lg shadow-lg"
        aria-describedby="edit-supplier-description"
      >
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
          <DialogDescription id="edit-supplier-description">
            Modifica los datos del proveedor.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {loading ? (
          <p>Cargando proveedor...</p>
        ) : supplier ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Código y Nombre */}
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  name="code"
                  value={supplier.code || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={supplier.name || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Tipo y Número de Documento */}
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo Documento</Label>
                <select
                  id="documentType"
                  name="documentType"
                  value={supplier.documentType || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="NIT">NIT</option>
                  <option value="CI">CI</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número Documento</Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={supplier.documentNumber || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Contacto */}
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contacto</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={supplier.contactPerson || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={supplier.email || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={supplier.phone || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Dirección y Ciudad */}
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={supplier.address || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={supplier.city || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Departamento y País */}
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <select
                  id="department"
                  name="department"
                  value={supplier.department || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">— Selecciona —</option>
                  <option value="CHUQUISACA">Chuquisaca</option>
                  <option value="LA_PAZ">La Paz</option>
                  <option value="ORURO">Oruro</option>
                  <option value="COCHABAMBA">Cochabamba</option>
                  <option value="PANDO">Pando</option>
                  <option value="POTOSI">Potosí</option>
                  <option value="TARIJA">Tarija</option>
                  <option value="SANTA_CRUZ">Santa Cruz</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  value={supplier.country || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Código Postal */}
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={supplier.postalCode || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Plazo de Pago, Límite, Saldo Actual */}
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Plazo de Pago (días)</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  type="number"
                  value={supplier.paymentTerms || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Límite de Crédito</Label>
                <Input
                  id="creditLimit"
                  name="creditLimit"
                  type="number"
                  value={supplier.creditLimit || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Si 'currentBalance' no existe en Supplier, elimina este campo o reemplázalo por uno válido */}
              {/* Estado y Notas */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  value={supplier.status || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={supplier.notes || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Guardar cambios
              </Button>
            </div>
          </form>
        ) : (
          <p>No se encontraron datos para el proveedor.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
