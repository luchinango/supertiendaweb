"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { setTokens, getAuthToken, removeAuthToken } from "@/lib/auth-utils"
import type { User, AuthContextType, RegisterRequest } from "@/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth().then()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getAuthToken()

      if (!token) {
        console.log("No hay token, finalizando verificación")
        setIsLoading(false)
        return
      }

      const response = await authService.me()

      if (response.success && response.data) {
        const userData = response.data as any

        if (userData.role) {
          const mappedUser: User = {
            ...userData,
            businessId: userData.employee?.businessId
          }
          setUser(mappedUser)
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
        setTokens(response.data.token, response.data.refreshToken)

        const userData = response.data.user as any
        if (userData.role) {
          const mappedUser: User = {
            ...userData,
            email: userData.employee?.email || userData.email,
            name: userData.employee ? `${userData.employee.firstName} ${userData.employee.lastName}` : userData.name,
            businessId: userData.employee?.businessId || userData.businessId
          }
          setUser(mappedUser)
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
        setTokens(response.data.token, "")
        const userData = response.data.user as any
        if (userData.role) {
          const mappedUser: User = {
            ...userData,
            email: userData.employee?.email || userData.email,
            name: userData.employee ? `${userData.employee.firstName} ${userData.employee.lastName}` : userData.name,
            businessId: userData.employee?.businessId || userData.businessId
          }
          setUser(mappedUser)
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
