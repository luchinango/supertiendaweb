import Link from "next/link"
import {
  Home,
  DollarSign,
  BarChart2,
  Package,
  Users,
  UserCircle,
  Truck,
  Settings,
  AlertTriangle,
  CreditCard,
  ShoppingCart,
  PackageX,
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Movimientos", icon: DollarSign, href: "/movimientos" },
  { name: "Estadísticas", icon: BarChart2, href: "/estadisticas" },
  { name: "Productos", icon: Package, href: "/productos" },
  { name: "Mermas", icon: PackageX, href: "/mermas" },
  { name: "Empleados", icon: Users, href: "/empleados" },
  { name: "Clientes", icon: UserCircle, href: "/clientes" },
  { name: "Proveedores", icon: Truck, href: "/proveedores" },
  { name: "Créditos", icon: CreditCard, href: "/creditos" },
  { name: "Alertas", icon: AlertTriangle, href: "/alertas" },
  { name: "Órdenes de Compra", icon: ShoppingCart, href: "/ordenes-compra" },
  { name: "Configuraciones", icon: Settings, href: "/configuraciones" },
]

export default function Sidebar() {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <h2 className="text-2xl font-semibold text-center">SuperTienda</h2>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
          >
            <item.icon className="inline-block mr-2 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}

