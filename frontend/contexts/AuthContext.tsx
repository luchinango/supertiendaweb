"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import {
  setTokens,
  getAuthToken,
  getRefreshToken,
  removeAuthToken,
  setBusinessId,
  setAuthUserSnapshot,
  getAuthUserSnapshot,
  clearAuthUserSnapshot,
} from "@/lib/auth-utils"
import {
  clearSessionExpirations,
  getSessionGateState,
  readJwtExpMs,
  readJwtPayload,
  setSessionExpirations,
} from "@/lib/offline/sessionGate"
import { clearNavCache } from "@/lib/pwa/registerServiceWorker"
import type { User, AuthContextType, RegisterRequest } from "@/types"

function applySessionExpirationsFromStorage() {
  setSessionExpirations({
    accessExpiresAt: readJwtExpMs(getAuthToken()),
    refreshExpiresAt: readJwtExpMs(getRefreshToken()),
  })
}

/** Login entrega role string; /auth/verify entrega { code }. */
function normalizeRole(role: unknown): string | null {
  if (typeof role === 'string' && role.length > 0) return role
  if (role && typeof role === 'object' && 'code' in role) {
    const code = (role as { code?: unknown }).code
    if (typeof code === 'string' && code.length > 0) return code
  }
  return null
}

function mapAuthUser(userData: any): User | null {
  const role = normalizeRole(userData?.role)
  if (!role) return null
  return {
    ...userData,
    role,
    email: userData.employee?.email || userData.email,
    name: userData.employee
      ? `${userData.employee.firstName} ${userData.employee.lastName}`
      : userData.name || userData.username,
    businessId: userData.employee?.businessId ?? userData.businessId ?? undefined,
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth().then()
  }, [])

  const restoreOfflineUser = (): boolean => {
    applySessionExpirationsFromStorage()
    const gate = getSessionGateState()
    // Si el refresh ya venció, no restaurar operación offline.
    if (gate.refreshExpiresAt != null && !gate.mutationsAllowed) {
      return false
    }
    const access = getAuthToken()
    const accessExp = readJwtExpMs(access)
    // Access vencido y sin refresh usable: no restaurar UI operativa
    if (accessExp != null && accessExp < Date.now() && !gate.mutationsAllowed) {
      return false
    }

    let snap = getAuthUserSnapshot()
    if (!snap) {
      const claims = readJwtPayload(access)
      const userId = claims?.['userId'] != null ? Number(claims['userId']) : NaN
      const businessIdRaw = claims?.['businessId']
      const businessId =
        businessIdRaw != null && Number.isFinite(Number(businessIdRaw))
          ? Number(businessIdRaw)
          : undefined
      if (
        claims &&
        Number.isFinite(userId) &&
        typeof claims['username'] === "string" &&
        typeof claims['role'] === "string"
      ) {
        snap = {
          id: userId,
          username: claims['username'] as string,
          role: claims['role'] as string,
          businessId,
        }
        setAuthUserSnapshot(snap)
      }
    }
    if (!snap) return false
    if (snap.role !== "PLATFORM_ADMIN" && snap.businessId == null) return false
    if (snap.businessId != null) setBusinessId(snap.businessId)
    setUser(snap as User)
    return true
  }

  const checkAuth = async () => {
    try {
      const token = getAuthToken()

      if (!token) {
        console.log("No hay token, finalizando verificación")
        setIsLoading(false)
        return
      }

      applySessionExpirationsFromStorage()

      try {
        const response = await authService.me()

        if (response.success && response.data) {
          const mappedUser = mapAuthUser(response.data)

          if (mappedUser) {
            // PLATFORM_ADMIN no tiene empresa; ADMIN/EMPLOYEE sí
            if (mappedUser.role !== "PLATFORM_ADMIN" && mappedUser.businessId == null) {
              removeAuthToken()
              clearAuthUserSnapshot()
              return
            }
            if (mappedUser.businessId != null) {
              setBusinessId(mappedUser.businessId)
            }
            setUser(mappedUser)
            setAuthUserSnapshot(mappedUser)
            applySessionExpirationsFromStorage()
          } else {
            console.log("Usuario sin rol válido, removiendo token")
            removeAuthToken()
            clearSessionExpirations()
          }
        } else {
          // Si el navegador ya está offline, preferir restauración local antes de borrar.
          if (typeof navigator !== "undefined" && !navigator.onLine && restoreOfflineUser()) {
            return
          }
          // 401/403 u otro rechazo de API: no restaurar snapshot (sesión inválida)
          console.log("Error en respuesta de /auth/me, removiendo token")
          removeAuthToken()
          clearSessionExpirations()
        }
      } catch (error) {
        // Arranque offline: conservar sesión local si refresh vigente + snapshot
        console.warn("Auth online falló; intentando restauración offline", error)
        if (!restoreOfflineUser()) {
          removeAuthToken()
          clearSessionExpirations()
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      if (!restoreOfflineUser()) {
        removeAuthToken()
        clearSessionExpirations()
      }
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

        const mappedUser = mapAuthUser(response.data.user)
        if (mappedUser) {
          const isPlatform = mappedUser.role === "PLATFORM_ADMIN"
          if (!isPlatform && mappedUser.businessId == null) {
            removeAuthToken()
            return { success: false, error: "Usuario sin empresa asignada" }
          }
          if (mappedUser.businessId != null) {
            setBusinessId(mappedUser.businessId)
          }
          setUser(mappedUser)
          setAuthUserSnapshot(mappedUser)
          applySessionExpirationsFromStorage()
          // Evitar HTML de navegación de otro usuario/empresa en Cache Storage
          void clearNavCache()
          return { success: true, data: response.data }
        } else {
          removeAuthToken()
          clearSessionExpirations()
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
      // Conservar IndexedDB / outbox del scope; limpia tokens, snapshot y caché de navegación HTML.
      removeAuthToken()
      clearAuthUserSnapshot()
      clearSessionExpirations()
      void clearNavCache()
      setUser(null)
      router.push("/login")
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData)

      if (response.success && response.data) {
        setTokens(response.data.token, "")
        const mappedUser = mapAuthUser(response.data.user)
        if (mappedUser) {
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

  const token = getAuthToken()

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, checkAuth, token }}>
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
