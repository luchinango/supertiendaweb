"use client";

import React, { useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { OptimizedLink } from '../ui/OptimizedLink';
import {
  LayoutDashboard,
  DollarSign,
  ArrowLeftRight,
  BarChart2,
  Package,
  Tags,
  Scale,
  Users2,
  UserCircle,
  Truck,
  CreditCard,
  Bell,
  ShoppingCart,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type NavItem = {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  href: string;
  /** Si true, solo ADMIN (y no EMPLOYEE). No cambia permisos server — solo visibilidad. */
  adminOnly?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Inicio',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.DASHBOARD }],
  },
  {
    id: 'caja',
    label: 'Caja',
    items: [{ icon: DollarSign, label: 'Ventas', href: ROUTES.SALES }],
  },
  {
    id: 'stock',
    label: 'Stock',
    items: [
      { icon: Tags, label: 'Catálogo', href: ROUTES.PRODUCTS },
      { icon: Package, label: 'Inventario', href: ROUTES.INVENTORY },
      { icon: ArrowLeftRight, label: 'Movimientos', href: ROUTES.MOVEMENTS, adminOnly: true },
      { icon: Scale, label: 'Mermas', href: ROUTES.LOSSES, adminOnly: true },
    ],
  },
  {
    id: 'personas',
    label: 'Personas',
    items: [
      { icon: UserCircle, label: 'Clientes', href: ROUTES.CUSTOMERS },
      { icon: Users2, label: 'Empleados', href: ROUTES.EMPLOYEES, adminOnly: true },
      { icon: Truck, label: 'Proveedores', href: ROUTES.SUPPLIERS, adminOnly: true },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestión',
    items: [
      { icon: CreditCard, label: 'Créditos', href: ROUTES.CREDITS, adminOnly: true },
      { icon: ShoppingCart, label: 'Órdenes de Compra', href: ROUTES.PURCHASE_ORDERS, adminOnly: true },
      { icon: BarChart2, label: 'Estadísticas', href: ROUTES.STATISTICS, adminOnly: true },
      { icon: Bell, label: 'Alertas', href: ROUTES.ALERTS, adminOnly: true },
      { icon: Settings, label: 'Configuraciones', href: ROUTES.SETTINGS, adminOnly: true },
    ],
  },
];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const MenuItem = React.memo(function MenuItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <li className="m-0 p-0">
      <OptimizedLink
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-white no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          isActive ? 'bg-[#222]' : 'bg-transparent hover:bg-[#222]'
        }`}
        {...(isActive ? { 'aria-current': 'page' as const } : {})}
        prefetch={true}
      >
        <item.icon className="h-5 w-5 shrink-0" aria-hidden={true} />
        <span>{item.label}</span>
      </OptimizedLink>
    </li>
  );
});

export function Sidebar({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role ?? '';
  const isAdmin = role === 'ADMIN';
  const isEmployee = role === 'EMPLOYEE';
  /** EMPLOYEE: menú reducido. ADMIN/otros: menú completo (PLATFORM_ADMIN ve todo lo listado). */
  const showAdminItems = !isEmployee || isAdmin;

  const groups = useMemo(() => {
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) => (item.adminOnly ? showAdminItems : true)),
    })).filter((g) => g.items.length > 0);
  }, [showAdminItems]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const getUserInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =
    user?.name ||
    user?.username ||
    (user?.employee
      ? `${user.employee.firstName ?? ''} ${user.employee.lastName ?? ''}`.trim()
      : '') ||
    'Usuario';

  return (
    <aside
      className={`flex flex-col bg-black text-white ${compact ? 'h-full w-full' : 'min-h-screen w-[250px]'}`}
      role="complementary"
      aria-label="Navegación principal"
      id={compact ? 'mobile-nav' : undefined}
      data-testid="app-sidebar"
    >
      <header className="border-b border-[#444] px-4 py-4">
        <h1 className="m-0 text-xl font-medium">
          <OptimizedLink
            href={ROUTES.DASHBOARD}
            className="text-white no-underline"
            prefetch={true}
          >
            SuperTienda
          </OptimizedLink>
        </h1>
      </header>

      <nav className="mt-3 flex-1 overflow-y-auto pb-3" role="navigation" aria-label="Menú principal">
        {groups.map((group) => (
          <div key={group.id} className="mb-3">
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#888]">
              {group.label}
            </p>
            <ul className="m-0 list-none p-0">
              {group.items.map((item) => (
                <MenuItem
                  key={item.href}
                  item={item}
                  isActive={isActivePath(pathname, item.href)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user ? (
        <div className="border-t border-[#444] bg-[#111] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-2 text-white hover:bg-[#222] hover:text-white"
                aria-label="Menú de cuenta"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#333] text-white text-xs">
                    {getUserInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">{displayName}</div>
                  {user.email ? (
                    <div className="truncate text-xs text-[#999]">{user.email}</div>
                  ) : null}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </aside>
  );
}
