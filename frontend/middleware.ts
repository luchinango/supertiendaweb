import {NextResponse} from "next/server"
import type {NextRequest} from "next/server"

const protectedRoutes = [
  "/dashboard",
  "/productos",
  "/ventas",
  "/clientes",
  "/empleados",
  "/inventario",
  "/movimientos",
  "/mermas",
  "/creditos",
  "/ordenes-compra",
  "/proveedores",
  "/estadisticas",
  "/configuraciones",
  "/alertas",
]

const publicRoutes = ["/login", "/register"]

/** Rutas de depuración solo permitidas en desarrollo local */
const debugRoutes = ["/debug-auth"]

function isDevelopment() {
  return process.env.NODE_ENV === "development"
}

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl
  const token = request.cookies.get("auth_token")?.value

  // Bloquear herramientas de debug fuera de desarrollo
  if (debugRoutes.some(route => pathname.startsWith(route)) && !isDevelopment()) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Bypass eliminado: query/cookie/env públicos ya no otorgan acceso
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Excluir assets PWA / SW / offline estático (arranque sin cookie)
    "/((?!api|_next/static|_next/image|favicon.ico|public|sw\\.js|manifest\\.webmanifest|offline\\.html|icons/).*)",
  ],
}
