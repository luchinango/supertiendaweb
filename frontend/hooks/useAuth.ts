import { useAuth as useAuthContext } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

function safeRedirectTarget(fallback = "/dashboard"): string {
  if (typeof window === "undefined") return fallback
  const q = new URLSearchParams(window.location.search).get("redirect")
  if (q && q.startsWith("/") && !q.startsWith("//") && !q.startsWith("/login")) {
    return q
  }
  return fallback
}

export function useAuth() {
  const auth = useAuthContext()
  const router = useRouter()

  const loginWithRedirect = useCallback(
    async (username: string, password: string) => {
      const result = await auth.login(username, password)

      if (result.success) {
        const target = safeRedirectTarget("/dashboard")
        // Soft nav primero; si el middleware/RSC deja la URL en /login, hard assign.
        router.replace(target)
        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            if (window.location.pathname.includes("/login")) {
              window.location.assign(target)
            }
          }, 300)
        }
      }

      return result
    },
    [auth, router]
  )

  const registerWithRedirect = useCallback(
    async (userData: Parameters<typeof auth.register>[0]) => {
      const result = await auth.register(userData)

      if (result.success) {
        router.replace("/dashboard")
        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            if (window.location.pathname.includes("/login") || window.location.pathname.includes("/register")) {
              window.location.assign("/dashboard")
            }
          }, 300)
        }
      }

      return result
    },
    [auth, router]
  )

  const requireAuth = useCallback(
    (callback: () => void) => {
      if (!auth.user) {
        router.push("/login")
        return
      }
      callback()
    },
    [auth.user, router]
  )

  const requireRole = useCallback(
    (role: "admin" | "employee" | "owner", callback: () => void) => {
      if (!auth.user) {
        router.push("/login")
        return
      }

      if (auth.user.role !== role) {
        router.push("/dashboard")
        return
      }

      callback()
    },
    [auth.user, router]
  )

  const logout = useCallback(() => {
    if (auth.logout) {
      auth.logout()
    } else {
      router.push("/login")
    }
  }, [auth, router])

  return {
    ...auth,
    loginWithRedirect,
    registerWithRedirect,
    requireAuth,
    requireRole,
    logout,
  }
}
