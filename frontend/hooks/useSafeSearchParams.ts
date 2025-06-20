"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function useSafeSearchParams() {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const [safeSearchParams, setSafeSearchParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    setIsClient(true)
    setSafeSearchParams(searchParams)
  }, [searchParams])

  return {
    searchParams: isClient ? searchParams : null,
    isClient
  }
}