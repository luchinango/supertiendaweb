import type { Customer } from "./Customer"

export type CustomerForm = Customer & {
  document_type: string
  document_number: string
  city: string
  department: string
  country: string
}