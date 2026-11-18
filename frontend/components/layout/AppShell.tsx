'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkipLink } from '@/components/ui/SkipLink';
import { Button } from '@/components/ui/button';

const MainContent = React.memo(({ children }: { children: React.ReactNode }) => (
  <main
    id="main-content"
    className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 sm:p-6"
    role="main"
    tabIndex={-1}
  >
    {children}
  </main>
));

MainContent.displayName = 'MainContent';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-screen bg-gray-100">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0" data-testid="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" data-testid="sidebar-mobile-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
            onClick={closeMobile}
          />
          <div className="relative z-10 flex h-full w-[min(280px,85vw)] flex-col bg-black shadow-xl">
            <div className="flex items-center justify-between border-b border-[#444] px-3 py-2">
              <span className="text-sm font-medium text-white">Menú</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white hover:bg-[#222]"
                onClick={closeMobile}
                aria-label="Cerrar navegación"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto" onClick={closeMobile}>
              <Sidebar compact />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b bg-white px-3 py-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-4 w-4" />
            Menú
          </Button>
          <span className="text-sm font-semibold text-[#1e1e1e]">SuperTienda</span>
        </header>
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
