export interface Supplier {
  // Requeridos
  id: number
  name: string
  phone: string
  email: string
  // Campos que exigen tus endpoints
  code?: string
  documentType?: string
  documentNumber?: string
  contactPerson?: string
  address?: string
  city?: string
  department?: string
  country?: string
  postalCode?: string
  paymentTerms?: number
  creditLimit?: number | string
  currentBalance?: number | string
  status?: string
  notes?: string

  // Campos adicionales que usas en tu componente
  contact?: string
  initials?: string
  hasDebt?: boolean
  debtAmount?: number
  // ...agrega más si los usas en page.tsx
}

export interface Business {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  document: string;
  logo?: string;
}