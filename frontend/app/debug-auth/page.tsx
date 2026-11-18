"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Página de depuración de auth.
 * Deshabilitada fuera de desarrollo (también bloqueada por middleware).
 */
export default function DebugAuthPage() {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      router.replace("/login")
      return
    }
    router.replace("/login")
  }, [router])

  return (
    <div className="p-6 text-sm text-gray-600">
      Herramienta de depuración de autenticación deshabilitada en P0.
    </div>
  )
}
