"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CashRegisterManager } from '@/components/features/cash-register/CashRegisterManager'
import useSWR from "swr";
import { getReports, type ReportData } from "@/services/reportsService";
import { useAuth } from "@/hooks/useAuth"

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error } = useSWR<ReportData>("reports", getReports);
  const { logout } = useAuth();

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
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </div>
  );
}