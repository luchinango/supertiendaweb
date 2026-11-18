import React from "react"
import "../styles/globals.css"
import type {Metadata, Viewport} from "next"
import {Inter, Roboto} from "next/font/google"
import {AppShell} from "@/components/layout/AppShell"
import {ProductFormProvider} from "@/contexts/ProductFormContext"
import {CashRegisterProvider} from "@/contexts/CashRegisterContext"
import {SalesFormProvider} from "@/contexts/SalesFormContext"
import {CartProvider} from "@/contexts/CartContext"
import {ExpenseFormProvider} from "@/contexts/ExpenseFormContext"
import {AuthProvider} from "@/contexts/AuthContext"
import {GlobalProductForm} from "@/components/features/products/GlobalProductForm"
import {ThemeProvider} from "@/components/layout/theme-provider"
import {OfflineStatusHost} from "@/components/offline/OfflineStatusHost"
import {PwaProvider} from "@/components/pwa/PwaProvider"

const inter = Inter({subsets: ["latin"]})
const roboto = Roboto({subsets: ["latin"], weight: "400"})

export const viewport: Viewport = {
  themeColor: "#0f766e",
}

export const metadata: Metadata = {
  title: {
    default: "SuperTienda | CODEMEDIIA",
    template: "%s | SuperTienda",
  },
  description:
    "Sistema de gestión comercial para tiendas y minimercados: ventas, inventario, caja y operación multiempresa en un solo lugar.",
  applicationName: "SuperTienda",
  authors: [{ name: "CODEMEDIIA" }],
  creator: "CODEMEDIIA",
  keywords: [
    "SuperTienda",
    "POS",
    "punto de venta",
    "inventario",
    "minimercado",
    "gestión comercial",
    "CODEMEDIIA",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SuperTienda",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_BO",
    siteName: "SuperTienda",
    title: "SuperTienda | CODEMEDIIA",
    description:
      "Gestiona ventas, inventario y caja de tu negocio con SuperTienda. Solución multiempresa de CODEMEDIIA.",
  },
  twitter: {
    card: "summary",
    title: "SuperTienda | CODEMEDIIA",
    description:
      "Gestiona ventas, inventario y caja de tu negocio con SuperTienda. Solución multiempresa de CODEMEDIIA.",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
    <head>
      <link rel="icon" href="/favicon.ico"/>
      <link rel="manifest" href="/manifest.webmanifest"/>
    </head>
    <body className={`${inter.className} bg-gray-100 m-0 p-0`} suppressHydrationWarning>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
    >
      <AuthProvider>
        <PwaProvider>
          <ProductFormProvider>
            <CashRegisterProvider>
              <SalesFormProvider>
                <CartProvider>
                  <ExpenseFormProvider>
                    <AppShell>
                      {children}
                    </AppShell>
                    <GlobalProductForm/>
                    <OfflineStatusHost/>
                  </ExpenseFormProvider>
                </CartProvider>
              </SalesFormProvider>
            </CashRegisterProvider>
          </ProductFormProvider>
        </PwaProvider>
      </AuthProvider>
    </ThemeProvider>
    </body>
    </html>
  )
}
