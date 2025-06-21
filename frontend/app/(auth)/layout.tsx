import React from "react"
import {AuthProvider} from "@/contexts/AuthContext"
import {ThemeProvider} from "@/components/layout/theme-provider"

export default function AuthLayout(
  {
    children,
  }: {
    children: React.ReactNode
  }
) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
