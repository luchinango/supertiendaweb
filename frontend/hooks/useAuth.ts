import {useAuth as useAuthContext} from "@/contexts/AuthContext"
import {useRouter} from "next/navigation"
import {useCallback} from "react"

export function useAuth() {
  const auth = useAuthContext()
  const router = useRouter()

  const loginWithRedirect = useCallback(async (username: string, password: string) => {
    const result = await auth.login(username, password)

    if (result.success) {
      console.log("Login exitoso, redirigiendo a dashboard...")
      router.push("/dashboard")
    } else {
      console.log("Login fallido:", result.error)
    }

    return result
  }, [auth, router])

  const registerWithRedirect = useCallback(async (userData: any) => {
    const result = await auth.register(userData)

    if (result.success) {
      router.push("/dashboard")
    }

    return result
  }, [auth, router])

  const requireAuth = useCallback((callback: () => void) => {
    if (!auth.user) {
      router.push("/login")
      return
    }
    callback()
  }, [auth.user, router])

  const requireRole = useCallback((role: "admin" | "employee" | "owner", callback: () => void) => {
    if (!auth.user) {
      router.push("/login")
      return
    }

    if (auth.user.role !== role) {
      router.push("/dashboard")
      return
    }

    callback()
  }, [auth.user, router])

  return {
    ...auth,
    loginWithRedirect,
    registerWithRedirect,
    requireAuth,
    requireRole,
  }
}
