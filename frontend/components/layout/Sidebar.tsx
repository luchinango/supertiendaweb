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
  Scale,
  Users2,
  UserCircle,
  Truck,
  CreditCard,
  Bell,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { ROUTES } from '@/lib/routes';

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: ROUTES.DASHBOARD },
  { icon: DollarSign, label: "Ventas", href: ROUTES.SALES },
  { icon: ArrowLeftRight, label: "Movimientos", href: ROUTES.MOVEMENTS },
  { icon: BarChart2, label: "Estadísticas", href: ROUTES.STATISTICS },
  { icon: Package, label: "Inventario", href: ROUTES.INVENTORY },
  { icon: Scale, label: "Mermas", href: ROUTES.LOSSES },
  { icon: Users2, label: "Empleados", href: ROUTES.EMPLOYEES },
  { icon: UserCircle, label: "Clientes", href: ROUTES.CUSTOMERS },
  { icon: Truck, label: "Proveedores", href: ROUTES.SUPPLIERS },
  { icon: CreditCard, label: "Créditos", href: ROUTES.CREDITS },
  { icon: Bell, label: "Alertas", href: ROUTES.ALERTS },
  { icon: ShoppingCart, label: "Órdenes de Compra", href: ROUTES.PURCHASE_ORDERS },
  { icon: Settings, label: "Configuraciones", href: ROUTES.SETTINGS },
];

const MenuItem = React.memo(({ item, isActive }: { item: typeof menuItems[0], isActive: boolean }) => {
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = '#222';
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = isActive ? '#222' : 'transparent';
  }, [isActive]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = '#222';
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = isActive ? '#222' : 'transparent';
  }, [isActive]);

  return (
    <li style={{ margin: 0, padding: 0 }}>
      <OptimizedLink
        href={item.href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 24px',
          borderRadius: '8px',
          color: 'white',
          textDecoration: 'none',
          transition: 'background-color 0.2s',
          backgroundColor: isActive ? '#222' : 'transparent'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...(isActive ? { 'aria-current': 'page' as const } : {})}
        prefetch={true}
      >
        <item.icon
          style={{ width: '20px', height: '20px' }}
          aria-hidden="true"
        />
        <span style={{ fontSize: '14px' }}>{item.label}</span>
      </OptimizedLink>
    </li>
  );
});

MenuItem.displayName = 'MenuItem';

export function Sidebar() {
  const pathname = usePathname();

  const menuItemsList = useMemo(() => {
    return menuItems.map((item) => ({
      ...item,
      isActive: pathname === item.href
    }));
  }, [pathname]);

  return (
    <aside
      style={{
        width: '250px',
        backgroundColor: '#000',
        color: 'white',
        minHeight: '100vh'
      }}
      role="complementary"
      aria-label="Navegación principal"
    >
      <header style={{ padding: '16px', borderBottom: '1px solid #444' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>
          <OptimizedLink href={ROUTES.DASHBOARD} style={{ color: 'white', textDecoration: 'none' }} prefetch={true}>
            SuperTienda
          </OptimizedLink>
        </h1>
      </header>
      <nav
        style={{ marginTop: '16px' }}
        role="navigation"
        aria-label="Menú principal"
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItemsList.map((item) => (
            <MenuItem key={item.href} item={item} isActive={item.isActive} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
