export interface Credit {
  id: number
  supplier: string
  amount: number
  status: "pagado" | "comision" | "concesion"
  dueDate?: string
  paidDate?: string
}