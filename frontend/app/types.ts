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