import {NextResponse} from "next/server"

/**
 * Endpoint de depuración de cookies.
 * Solo disponible en NODE_ENV=development.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({error: "Not found"}, {status: 404})
  }

  const url = new URL(request.url)
  const cookieHeader = request.headers.get("cookie") || ""

  const parseCookies = (cookieStr: string) => {
    if (!cookieStr) return {}
    const entries: [string, string][] = []
    for (const part of cookieStr.split(";")) {
      const [rawKey, ...rest] = part.split("=")
      const key = rawKey?.trim()
      if (!key) continue
      entries.push([key, decodeURIComponent(rest.join("=").trim())])
    }
    return Object.fromEntries(entries)
  }

  const cookies = parseCookies(cookieHeader)

  return NextResponse.json({
    url: request.url,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    cookieHeader,
    cookies,
  })
}
