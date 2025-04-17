export interface Supplier {
  id: number;
  name: string;
  phone: string;
  contact: string;
  email: string;
  initials: string;
  hasDebt: boolean;
  debtAmount?: number;
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