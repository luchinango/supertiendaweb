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

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl
  const token = request.cookies.get("auth_token")?.value

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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
