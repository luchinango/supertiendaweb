'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

const AUTH_PREFIXES = ['/login', '/register'];

function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Evita AppShell (sidebar) en pantallas de autenticación. */
export function AppShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
