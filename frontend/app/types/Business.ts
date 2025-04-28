export interface Business {
  id: string
  name: string
  type: "minimercado" | "supermercado" | "tienda"
  address: string
  city: string
  phone: string
  email: string
  document: string
  logo?: string
}