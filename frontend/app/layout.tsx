import React from "react"
import "../styles/globals.css"
import type {Metadata} from "next"
import {Inter, Roboto} from "next/font/google"
import {Sidebar} from "@/components/layout/Sidebar"
import {ProductFormProvider} from "@/contexts/ProductFormContext"
import {CashRegisterProvider} from "@/contexts/CashRegisterContext"
import {SalesFormProvider} from "@/contexts/SalesFormContext"
import {CartProvider} from "@/contexts/CartContext"
import {ExpenseFormProvider} from "@/contexts/ExpenseFormContext"
import {GlobalProductForm} from "@/components/features/products/GlobalProductForm"
import {ThemeProvider} from "@/components/layout/theme-provider"
import {SkipLink} from "@/components/ui/SkipLink"

const inter = Inter({subsets: ["latin"]})
const roboto = Roboto({subsets: ["latin"], weight: "400"})

export const metadata: Metadata = {
  title: "eGrocery System",
  description: "Online grocery store management system",
}

const MainContent = React.memo(({ children }: { children: React.ReactNode }) => (
  <main
    id="main-content"
    className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6"
    role="main"
    tabIndex={-1}
  >
    {children}
  </main>
))

MainContent.displayName = 'MainContent'

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
    <head>
      <link rel="icon" href="/favicon.ico"/>
      <title></title>
    </head>
    <body className={`${inter.className} bg-gray-100 m-0 p-0`} suppressHydrationWarning>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
    >
      <ProductFormProvider>
        <CashRegisterProvider>
          <SalesFormProvider>
            <CartProvider>
              <ExpenseFormProvider>
                <div className="flex h-screen bg-gray-100">
                  <SkipLink href="#main-content">
                    Saltar al contenido principal
                  </SkipLink>
                  <Sidebar/>
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <MainContent>
                      {children}
                    </MainContent>
                  </div>
                  <GlobalProductForm/>
                </div>
              </ExpenseFormProvider>
            </CartProvider>
          </SalesFormProvider>
        </CashRegisterProvider>
      </ProductFormProvider>
    </ThemeProvider>
    </body>
    </html>
  )
}
