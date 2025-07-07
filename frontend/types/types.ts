export interface Supplier {
  // Requeridos
  id: number
  code: string // <--- cambia aquí
  name: string
  documentType: string
  documentNumber: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  department: string
  country: string
  postalCode: string
  paymentTerms: number
  creditLimit: number
  status: string
  notes: string
  initials: string
  hasDebt: boolean
  debtAmount?: number
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

export interface NewSupplierPayload {
  businessId: string
  code: string
  name: string
  documentType: string
  documentNumber: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  department: string
  country: string
  postalCode: string
  paymentTerms: number
  creditLimit: number
  status: string
  notes: string
}