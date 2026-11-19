"use client";

import Link from "next/link";
import useSWR from "swr";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReports, type ReportData } from "@/services/reportsService";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DashboardInner() {
  const { data, error, isLoading } = useSWR<ReportData>("reports", getReports);
  const { user } = useAuth();
  const displayName = user?.name || user?.username || "usuario";

  return (
    <div className="mx-auto max-w-3xl space-y-6" data-testid="dashboard-page">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1e1e1e]">
          Inicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Hola, {displayName}. Resumen del negocio con datos del servidor (si
          están disponibles).
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#1e1e1e]">Operación de caja</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Apertura, ventas, offline y cierre se gestionan en{" "}
          <strong>Ventas</strong> (no desde este panel).
        </p>
        <Button
          asChild
          className="mt-4 bg-[#1e1e1e] hover:bg-[#2e2e2e]"
          data-testid="dashboard-go-ventas"
        >
          <Link href={ROUTES.SALES}>
            Ir a Ventas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1e1e1e]">Indicadores</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Solo cifras ya expuestas por el API de reportes. Sin KPIs inventados.
        </p>

        {isLoading ? (
          <div className="mt-4 space-y-2" aria-busy="true">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">No se pudieron cargar los reportes</p>
              <p className="text-xs text-amber-900/80">
                El resto de la aplicación sigue disponible. Probá más tarde o
                usá Ventas / Catálogo.
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && data ? (
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-muted-foreground">Créditos totales</span>
              <span className="font-medium tabular-nums text-[#1e1e1e]">
                Bs {money(data.totalCredits)}
              </span>
            </li>
            <li className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-muted-foreground">Deudas totales</span>
              <span className="font-medium tabular-nums text-[#1e1e1e]">
                Bs {money(data.totalDebts)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Ventas del mes</span>
              <span className="font-medium tabular-nums text-[#1e1e1e]">
                Bs {money(data.salesThisMonth)}
              </span>
            </li>
          </ul>
        ) : null}

        {!isLoading && !error && !data ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Sin datos de reportes para mostrar.
          </p>
        ) : null}
      </section>

      {isLoading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Cargando indicadores…
        </p>
      ) : null}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}
