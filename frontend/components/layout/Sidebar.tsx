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
  const { user, logout } = useAuth();

  const menuItemsList = useMemo(() => {
    return menuItems.map((item) => ({
      ...item,
      isActive: pathname === item.href
    }));
  }, [pathname]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const getUserInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Usuario
    }

    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      style={{
        width: '250px',
        backgroundColor: '#000',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
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
        style={{ marginTop: '16px', flex: 1 }}
        role="navigation"
        aria-label="Menú principal"
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItemsList.map((item) => (
            <MenuItem key={item.href} item={item} isActive={item.isActive} />
          ))}
        </ul>
      </nav>

      {/* Sección de usuario */}
      {user && user.name && user.email && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #444',
          backgroundColor: '#111'
        }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px',
                  color: 'white',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Avatar style={{ width: '32px', height: '32px', marginRight: '8px' }}>
                  <AvatarFallback style={{ backgroundColor: '#333', color: 'white' }}>
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ minWidth: '200px' }}>
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}
