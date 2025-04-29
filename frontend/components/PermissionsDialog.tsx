"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import {Employee} from "@/types/Employee";

interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}

interface PermissionSection {
  id: string
  title: string
  expanded: boolean
  permissions: {
    id: string
    label: string
    checked: boolean
  }[]
}

export function PermissionsDialog({ open, onOpenChange, employee }: PermissionsDialogProps) {
  const [sections, setSections] = useState<PermissionSection[]>([
    {
      id: "ventas",
      title: "Ventas y gastos",
      expanded: true,
      permissions: [
        { id: "register-sales", label: "Registrar ventas y gastos", checked: true },
        { id: "edit-sales", label: "Editar o eliminar ventas y gastos", checked: true },
        { id: "view-movements", label: "Visualizar movimientos (Ventas y gastos)", checked: true },
        {
          id: "view-summary",
          label: "Ver resumen de movimientos (Total ventas, total gastos y balance)",
          checked: true,
        },
      ],
    },
    {
      id: "caja",
      title: "Caja",
      expanded: false,
      permissions: [
        { id: "open-register", label: "Abrir caja", checked: true },
        { id: "close-register", label: "Cerrar caja", checked: true },
        { id: "register-report", label: "Reporte de caja", checked: true },
        { id: "delete-closing", label: "Eliminar un cierre de caja", checked: false },
        { id: "view-register", label: "Ver resumen de caja durante el turno", checked: true },
      ],
    },
    {
      id: "inventario",
      title: "Inventario",
      expanded: false,
      permissions: [
        { id: "create-items", label: "Crear items del inventario", checked: true },
        { id: "edit-items", label: "Editar o eliminar items del inventario", checked: true },
        { id: "view-inventory", label: "Ver inventario", checked: true },
      ],
    },
    {
      id: "reportes",
      title: "Reportes",
      expanded: false,
      permissions: [
        { id: "download-inventory", label: "Descargar reportes de inventario", checked: true },
        { id: "download-movements", label: "Descargar reportes de movimientos", checked: true },
        { id: "use-filters", label: "Utilizar filtros en movimientos", checked: true },
      ],
    },
    {
      id: "clientes",
      title: "Clientes y proveedores",
      expanded: false,
      permissions: [
        { id: "create-clients", label: "Crear clientes y proveedores", checked: true },
        { id: "edit-clients", label: "Editar o eliminar clientes y proveedores", checked: true },
      ],
    },
    {
      id: "configuraciones",
      title: "Configuraciones",
      expanded: false,
      permissions: [{ id: "view-business", label: "Ver información del negocio", checked: true }],
    },
  ])

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) => (section.id === sectionId ? { ...section, expanded: !section.expanded } : section)),
    )
  }

  const togglePermission = (sectionId: string, permissionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              permissions: section.permissions.map((permission) =>
                permission.id === permissionId ? { ...permission, checked: !permission.checked } : permission,
              ),
            }
          : section,
      ),
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden z-50 relative">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Permisos de administrador</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        <div className="p-4 border-b">
          <p className="text-sm text-gray-600">
            Tu empleado podrá <strong>registrarse</strong> en Treinta con su número celular y tendrá acceso a las
            secciones que elijas.
          </p>
        </div>

        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 rounded border-gray-300 mr-3"
                    checked={section.permissions.every((p) => p.checked)}
                    onChange={() => {
                      const allChecked = section.permissions.every((p) => p.checked)
                      setSections(
                        sections.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                permissions: s.permissions.map((p) => ({
                                  ...p,
                                  checked: !allChecked,
                                })),
                              }
                            : s,
                        ),
                      )
                    }}
                  />
                  <span className="font-medium">{section.title}</span>
                </div>
                {section.expanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>

              {section.expanded && (
                <div className="border-t px-4 py-2 space-y-2">
                  {section.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission.id}
                        className="h-4 w-4 text-green-600 rounded border-gray-300 mr-3"
                        checked={permission.checked}
                        onChange={() => togglePermission(section.id, permission.id)}
                      />
                      <label htmlFor={permission.id} className="text-sm">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800">Modificar permisos</Button>
        </div>
      </div>
    </div>
  )
}