import React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Roboto } from "next/font/google"
import { Sidebar } from "./components/Sidebar"
import { ProductFormProvider } from "./context/ProductFormContext"
import { CashRegisterProvider } from "./context/CashRegisterContext"
import { SalesFormProvider } from "./context/SalesFormContext"
import { CartProvider } from "./context/CartContext"
import { ExpenseFormProvider } from "./context/ExpenseFormContext"
import { GlobalProductForm } from "./components/GlobalProductForm"

const inter = Inter({ subsets: ["latin"] })
const roboto = Roboto({ subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "eGrocery System",
  description: "Online grocery store management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 m-0 p-0`}>
        <ProductFormProvider>
          <CashRegisterProvider>
            <SalesFormProvider>
              <CartProvider>
                <ExpenseFormProvider>
                  <div className="flex h-screen bg-gray-100">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                        {children}
                      </main>
                    </div>
                    <GlobalProductForm />
                  </div>
                </ExpenseFormProvider>
              </CartProvider>
            </SalesFormProvider>
          </CashRegisterProvider>
        </ProductFormProvider>
      </body>
    </html>
  )
}