"use client";

import React from 'react';
import Link from "next/link";
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

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: DollarSign, label:"Ventas", href: "/ventas" },
  { icon: ArrowLeftRight, label: "Movimientos", href: "/movimientos" },
  { icon: BarChart2, label: "Estadísticas", href: "/estadisticas" },
  { icon: Package, label: "Productos", href: "/productos" },
  { icon: Scale, label: "Mermas", href: "/mermas" },
  { icon: Users2, label: "Empleados", href: "/empleados" },
  { icon: UserCircle, label: "Clientes", href: "/clientes" },
  { icon: Truck, label: "Proveedores", href: "/proveedores" },
  { icon: CreditCard, label: "Créditos", href: "/creditos" },
  { icon: Bell, label: "Alertas", href: "/alertas" },
  { icon: ShoppingCart, label: "Órdenes de Compra", href: "/ordenes" },
  { icon: Settings, label: "Configuraciones", href: "/configuraciones" },
];

export function Sidebar() {
  return (
    <div style={{ 
      width: '250px', 
      backgroundColor: '#000', // fondo negro
      color: 'white',
      minHeight: '100vh'
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #444' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>SuperTienda</h1>
      </div>
      <nav style={{ marginTop: '16px' }}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 24px',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#222')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <item.icon style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '14px' }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

