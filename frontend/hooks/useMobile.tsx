import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isClient, setIsClient] = React.useState(false)

  const handleResize = React.useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }, [])

  React.useEffect(() => {
    setIsClient(true)

    handleResize()

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    window.addEventListener("resize", handleResize, { passive: true })
    mql.addEventListener("change", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      mql.removeEventListener("change", handleResize)
    }
  }, [handleResize])

  return isClient ? isMobile : false
}
