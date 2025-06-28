"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { setAuthToken, getAuthToken, removeAuthToken } from "@/lib/auth-utils"
import type { User, AuthContextType, RegisterRequest } from "@/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth().then()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("🔍 Verificando autenticación...")
      const token = getAuthToken()
      console.log("📋 Token encontrado:", token ? "Sí" : "No")

      if (!token) {
        console.log("No hay token, finalizando verificación")
        setIsLoading(false)
        return
      }

      console.log("Llamando a /auth/me...")
      const response = await authService.me()
      console.log("Respuesta de /auth/me:", response)

      if (response.success && response.data && response.data.user) {
        const { user } = response.data
        const role = user.role

        console.log("Datos del usuario:", user)

        if (role) {
          console.log("Usuario autenticado correctamente")
          setUser(user as User)
        } else {
          console.log("Usuario sin rol válido, removiendo token")
          removeAuthToken()
        }
      } else {
        console.log("Error en respuesta de /auth/me, removiendo token")
        removeAuthToken()
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      removeAuthToken()
    } finally {
      setIsLoading(false)
      console.log("Verificación de autenticación completada")
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password })

      if (response.success && response.data) {
        setAuthToken(response.data.token)
        const userData = response.data.user as any
        console.log(userData)
        if (userData && userData.role) {
          setUser(userData as User)
          return { success: true }
        } else {
          removeAuthToken()
          return { success: false, error: "Rol de usuario inválido o usuario no encontrado" }
        }
      } else {
        return { success: false, error: response.error || "Error de autenticación" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Error de conexión" }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      removeAuthToken()
      setUser(null)
      router.push("/login")
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData)

      if (response.success && response.data) {
        setAuthToken(response.data.token)
        const userData = response.data.user as any
        if (userData.role) {
          setUser(userData as User)
          return { success: true }
        } else {
          removeAuthToken()
          return { success: false, error: "Rol de usuario inválido" }
        }
      } else {
        return { success: false, error: response.error || "Error en el registro" }
      }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, error: "Error de conexión" }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
