export interface Employee {
  id: number
  name: string
  phone: string
  role: "Propietario" | "Administrador" | "Vendedor"
  status: "Activo" | "Inactivo"
}