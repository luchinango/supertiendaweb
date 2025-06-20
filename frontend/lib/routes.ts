export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',

  SALES: '/ventas',

  INVENTORY: '/inventario',
  MOVEMENTS: '/movimientos',
  LOSSES: '/mermas',

  PRODUCTS: '/productos',

  CUSTOMERS: '/clientes',
  CREDITS: '/creditos',

  EMPLOYEES: '/empleados',

  SUPPLIERS: '/proveedores',
  PURCHASE_ORDERS: '/ordenes-compra',
  NEW_PURCHASE_ORDER: '/ordenes-compra/nueva',

  STATISTICS: '/estadisticas',
  REPORTS: '/reportes',

  SETTINGS: '/configuraciones',
  ALERTS: '/alertas',
} as const

export const ROUTE_GROUPS = {
  SALES: [ROUTES.SALES],
  INVENTORY: [ROUTES.INVENTORY, ROUTES.MOVEMENTS, ROUTES.LOSSES],
  PRODUCTS: [ROUTES.PRODUCTS],
  CUSTOMERS: [ROUTES.CUSTOMERS, ROUTES.CREDITS],
  EMPLOYEES: [ROUTES.EMPLOYEES],
  SUPPLIERS: [ROUTES.SUPPLIERS, ROUTES.PURCHASE_ORDERS],
  REPORTS: [ROUTES.STATISTICS, ROUTES.REPORTS],
  SETTINGS: [ROUTES.SETTINGS, ROUTES.ALERTS],
} as const
