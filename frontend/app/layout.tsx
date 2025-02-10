import React from "react"; // Agrega esta línea si se requieren los imports explícitos
import "../app/globals.css";
import { Inter } from "next/font/google";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuperTienda Web",
  description: "Sistema e-grocery store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

