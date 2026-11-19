import React from "react"

/**
 * Rutas de autenticación: sin AppShell (lo filtra AppShellGate en root).
 * Providers ya están en app/layout.tsx — no re-anidar AuthProvider.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
