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

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("businessId");
    if (auth.logout) auth.logout(); // Si tienes lógica extra en el contexto
    router.push("/login");
  }, [auth, router]);

  return {
    ...auth,
    loginWithRedirect,
    registerWithRedirect,
    requireAuth,
    requireRole,
    logout,
  }
}

// En AuthContext o useAuth
async function login(username: string, password: string) {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return data; // <-- debe retornar { success, data, ... }
}
