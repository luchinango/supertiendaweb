export function mapOrderStatus(apiStatus: string): "pendiente" | "aprobada" | "recibida" {
  switch (apiStatus) {
    case "DRAFT":
      return "pendiente"
    case "APPROVED":
      return "aprobada"
    case "RECEIVED":
      return "recibida"
    default:
      return "pendiente"
  }
}