import { fetcher } from "@/lib/fetcher";

const BASE_URL = "/reports";

export interface ReportData {
  totalCredits: number;
  totalDebts: number;
  salesThisMonth: number;
  totalSales?: number;
  productsSold?: number;
  activeCustomers?: number;
  totalInventory?: number;
}

export const getReports = () => fetcher<ReportData>(BASE_URL);