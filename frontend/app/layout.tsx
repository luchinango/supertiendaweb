import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from './components/Sidebar';

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
      <head>
        <title>SuperTienda</title>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ 
            flex: 1, 
            backgroundColor: '#F8F9FB',
            padding: '32px'
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

