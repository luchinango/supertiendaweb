"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CashRegisterManager } from '@/components/features/cash-register/CashRegisterManager'
import useSWR from "swr";

interface ReportData {
  totalCredits: number;
  totalDebts: number;
  salesThisMonth: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error } = useSWR<ReportData>("/api/reports", fetcher);

  if (error) return <div>Error al cargar datos</div>;
  if (!data) return <div>Cargando…</div>;

  return (
    <div className="p-6">
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar productos"
          className="pl-8 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="space-y-2">
        <li>Total Credits: {data.totalCredits}</li>
        <li>Total Debts: {data.totalDebts}</li>
        <li>Sales This Month: {data.salesThisMonth}</li>
      </ul>
      <CashRegisterManager />
    </div>
  );
}