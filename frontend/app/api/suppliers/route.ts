import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL!   // p.ej. "http://206.183.128.36:5500/api"

async function proxy(req: NextRequest, method: string) {
  const url = `${API_BASE}/suppliers${req.nextUrl.search}`
  const upstream = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ADMIN_TOKEN}` // tu token de servidor
    },
    body: method === "GET" ? undefined : await req.text(),
  })
  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}

export const GET  = (req: NextRequest) => proxy(req, "GET")
export const POST = (req: NextRequest) => proxy(req, "POST")