/**
 * Estrategia de sesión P0:
 * - Canónico: `auth_token` (middleware Next + api-client)
 * - Legado: `token` (páginas que aún lo leen)
 * Lectura: preferir auth_token, fallback a token y migrar.
 * Escritura: ambas claves para no romper callers existentes.
 */

const AUTH_TOKEN_KEY = "auth_token"
const LEGACY_TOKEN_KEY = "token"
const REFRESH_TOKEN_KEY = "refresh_token"
const BUSINESS_ID_KEY = "businessId"
/** Snapshot no sensible de perfil para arranque offline (P2-C1.F2). No incluye JWT. */
const AUTH_USER_SNAPSHOT_KEY = "supertienda_auth_user"

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(LEGACY_TOKEN_KEY, token)
    if (typeof document !== "undefined") {
      document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`
    }
  }
}

export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null
  }

  const canonical = localStorage.getItem(AUTH_TOKEN_KEY)
  if (canonical) {
    return canonical
  }

  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY)
  if (legacy) {
    // Migrar silenciosamente al canónico
    localStorage.setItem(AUTH_TOKEN_KEY, legacy)
    if (typeof document !== "undefined") {
      document.cookie = `${AUTH_TOKEN_KEY}=${legacy}; path=/; max-age=86400; SameSite=Lax`
    }
    return legacy
  }

  return null
}

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(BUSINESS_ID_KEY)
    localStorage.removeItem(AUTH_USER_SNAPSHOT_KEY)
    if (typeof document !== "undefined") {
      document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = "bypass_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }
}

export type AuthUserSnapshot = {
  id: number
  username: string
  role: string
  email?: string
  name?: string
  businessId?: number
}

export const setAuthUserSnapshot = (user: AuthUserSnapshot) => {
  if (typeof window === "undefined") return
  localStorage.setItem(
    AUTH_USER_SNAPSHOT_KEY,
    JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name,
      businessId: user.businessId,
    })
  )
}

export const getAuthUserSnapshot = (): AuthUserSnapshot | null => {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(AUTH_USER_SNAPSHOT_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthUserSnapshot
    if (!parsed?.id || !parsed?.username || !parsed?.role) return null
    return parsed
  } catch {
    return null
  }
}

export const clearAuthUserSnapshot = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_USER_SNAPSHOT_KEY)
}

export const setRefreshToken = (refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

export const setTokens = (token: string, refreshToken: string) => {
  setAuthToken(token)
  setRefreshToken(refreshToken)
}

export const setBusinessId = (businessId: number | string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(BUSINESS_ID_KEY, String(businessId))
  }
}

export const getBusinessId = (): number | null => {
  if (typeof window === "undefined") {
    return null
  }
  const raw = localStorage.getItem(BUSINESS_ID_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}
